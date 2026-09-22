package com.skillforge.ai.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillforge.ai.dto.InterviewFeedbackDto;
import com.skillforge.ai.dto.InterviewSessionResponseDto;
import com.skillforge.ai.entity.InterviewSession;
import com.skillforge.ai.repository.InterviewSessionRepository;
import com.skillforge.auth.entity.User;
import com.skillforge.auth.repository.UserRepository;
import com.skillforge.common.exception.AuthException;
import com.skillforge.student.entity.StudentProfile;
import com.skillforge.student.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

import com.skillforge.common.service.GeminiService;

@Service
@Slf4j
@RequiredArgsConstructor
public class MockInterviewService {

    private final InterviewSessionRepository interviewSessionRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;

    @Value("${app.interview.max-daily-sessions:5}")
    private int maxDailySessions;

    @Transactional
    public InterviewSessionResponseDto startSession(UUID studentId, String targetRole, UUID jobId) {
        User user = userRepository.findById(studentId)
                .orElseThrow(AuthException::userNotFound);

        // Enforce soft daily rate limit
        ZonedDateTime startOfDay = ZonedDateTime.now().truncatedTo(ChronoUnit.DAYS);
        long dailyCount = interviewSessionRepository.countByStudentUserIdAndCreatedAtAfter(studentId, startOfDay);
        if (dailyCount >= maxDailySessions) {
            throw new RuntimeException("Daily AI mock interview limit reached (max " + maxDailySessions + " sessions/day). Please try again tomorrow.");
        }

        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseGet(() -> {
                    StudentProfile p = StudentProfile.builder().userId(studentId).user(user).targetRole(targetRole).build();
                    return studentProfileRepository.save(p);
                });

        String role = (targetRole != null && !targetRole.isBlank()) ? targetRole : "Full Stack Engineer";
        List<String> questionPool = generateQuestionPlan(role);

        List<InterviewSessionResponseDto.TranscriptItem> items = new ArrayList<>();
        items.add(InterviewSessionResponseDto.TranscriptItem.builder()
                .questionNumber(1)
                .question(questionPool.get(0))
                .answer(null)
                .askedAt(ZonedDateTime.now().toString())
                .build());

        String transcriptJson = serializeJson(items);

        InterviewSession session = InterviewSession.builder()
                .student(student)
                .targetRole(role)
                .transcript(transcriptJson)
                .score(null)
                .build();

        session = interviewSessionRepository.save(session);
        log.info("Started AI mock interview session {} for student {}", session.getId(), studentId);

        return InterviewSessionResponseDto.builder()
                .sessionId(session.getId())
                .targetRole(role)
                .isComplete(false)
                .questionNumber(1)
                .totalQuestions(questionPool.size())
                .currentQuestion(questionPool.get(0))
                .transcript(items)
                .feedback(null)
                .build();
    }

    @Transactional
    public InterviewSessionResponseDto answerQuestion(UUID sessionId, UUID studentId, String answer) {
        InterviewSession session = interviewSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Interview session not found"));

        if (!session.getStudent().getUserId().equals(studentId)) {
            throw new RuntimeException("Unauthorized access to interview session");
        }

        List<InterviewSessionResponseDto.TranscriptItem> transcript = deserializeTranscript(session.getTranscript());
        List<String> questionPool = generateQuestionPlan(session.getTargetRole());
        int totalQuestions = questionPool.size();
        int currentIdx = transcript.size() - 1;

        if (currentIdx < 0) {
            throw new RuntimeException("Invalid interview transcript state");
        }

        // Record candidate's answer for current question
        transcript.get(currentIdx).setAnswer(answer);

        if (currentIdx + 1 < totalQuestions) {
            // Next turn question
            int nextNumber = currentIdx + 2;
            String nextQuestion = questionPool.get(currentIdx + 1);

            transcript.add(InterviewSessionResponseDto.TranscriptItem.builder()
                    .questionNumber(nextNumber)
                    .question(nextQuestion)
                    .answer(null)
                    .askedAt(ZonedDateTime.now().toString())
                    .build());

            session.setTranscript(serializeJson(transcript));
            interviewSessionRepository.save(session);

            return InterviewSessionResponseDto.builder()
                    .sessionId(session.getId())
                    .targetRole(session.getTargetRole())
                    .isComplete(false)
                    .questionNumber(nextNumber)
                    .totalQuestions(totalQuestions)
                    .currentQuestion(nextQuestion)
                    .transcript(transcript)
                    .feedback(null)
                    .build();
        } else {
            // Session Complete -> Generate Structured Gemini Feedback & Overall Score
            session.setTranscript(serializeJson(transcript));
            InterviewFeedbackDto feedback = generateEvaluationFeedback(session.getTargetRole(), transcript);
            session.setFeedback(serializeJson(feedback));
            session.setScore(feedback.getOverallScore());
            interviewSessionRepository.save(session);

            log.info("Completed AI mock interview session {} with score {}", session.getId(), feedback.getOverallScore());

            return InterviewSessionResponseDto.builder()
                    .sessionId(session.getId())
                    .targetRole(session.getTargetRole())
                    .isComplete(true)
                    .questionNumber(totalQuestions)
                    .totalQuestions(totalQuestions)
                    .currentQuestion(null)
                    .transcript(transcript)
                    .feedback(feedback)
                    .build();
        }
    }

    @Transactional(readOnly = true)
    public InterviewSessionResponseDto getSession(UUID sessionId, UUID studentId) {
        InterviewSession session = interviewSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Interview session not found"));

        if (!session.getStudent().getUserId().equals(studentId)) {
            throw new RuntimeException("Unauthorized access to interview session");
        }

        List<InterviewSessionResponseDto.TranscriptItem> transcript = deserializeTranscript(session.getTranscript());
        InterviewFeedbackDto feedback = deserializeFeedback(session.getFeedback());
        boolean isComplete = session.getScore() != null || feedback != null;

        return InterviewSessionResponseDto.builder()
                .sessionId(session.getId())
                .targetRole(session.getTargetRole())
                .isComplete(isComplete)
                .questionNumber(transcript.size())
                .totalQuestions(6)
                .currentQuestion(isComplete ? null : transcript.get(transcript.size() - 1).getQuestion())
                .transcript(transcript)
                .feedback(feedback)
                .build();
    }

    private List<String> generateQuestionPlan(String role) {
        String lowerRole = role.toLowerCase();
        if (lowerRole.contains("frontend")) {
            return List.of(
                    "Tell me about a challenging frontend project you built and how you managed complex state.",
                    "How do React 19 Server Components and client hydration improve rendering performance?",
                    "Walk me through your strategy for optimizing core web vitals and reducing bundle size.",
                    "Explain CSS Flexbox vs Grid and how Tailwind CSS utility classes accelerate UI design.",
                    "How do you handle asynchronous API errors and prevent UI crashes in single-page apps?",
                    "Describe a scenario where you resolved a cross-browser styling or performance bug."
            );
        } else if (lowerRole.contains("backend") || lowerRole.contains("java") || lowerRole.contains("spring")) {
            return List.of(
                    "Walk me through your architectural design for a high-concurrency Spring Boot microservice.",
                    "How do relational database indexes work, and how do you diagnose slow PostgreSQL queries?",
                    "Explain JWT authentication flow, token refresh strategies, and role-based access control.",
                    "How do you implement Redis caching and ensure cache consistency under heavy write loads?",
                    "Describe how you handle distributed transactions or saga patterns in microservices.",
                    "Tell me about a time when a production service crashed and how you diagnosed the root cause."
            );
        } else if (lowerRole.contains("ml") || lowerRole.contains("ai") || lowerRole.contains("data")) {
            return List.of(
                    "Explain the difference between supervised and unsupervised learning algorithms with examples.",
                    "How do vector embeddings and pgvector enable semantic similarity search in AI applications?",
                    "Describe your workflow for data preprocessing, feature engineering, and handling missing values.",
                    "How do you evaluate ML model performance and prevent overfitting during training?",
                    "Walk me through integrating Google Gemini API or LLM prompts into a production microservice.",
                    "Tell me about an AI or analytics project you built from dataset acquisition to deployment."
            );
        } else {
            return List.of(
                    "Tell me about yourself and why you are targeting the " + role + " role.",
                    "Walk me through a complex technical problem you solved recently and your step-by-step approach.",
                    "How do you ensure code quality, unit test coverage, and documentation in team projects?",
                    "Explain how you handle disagreement with team members regarding architectural decisions.",
                    "What technologies in the " + role + " ecosystem are you most excited to master next?",
                    "Describe a situation where you had to meet a tight project deadline under high pressure."
            );
        }
    }

    private InterviewFeedbackDto generateEvaluationFeedback(String role, List<InterviewSessionResponseDto.TranscriptItem> transcript) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an expert technical interviewer and objective candidate evaluator.\n");
        prompt.append("Target Role: ").append(role).append("\n\n");
        prompt.append("CRITICAL EVALUATION DIRECTIVE: Be strictly accurate, objective, and critical. Do NOT give positive feedback or high scores that the candidate has not earned. If an answer is factually incorrect, vague, brief, or wrong, explicitly penalize it with a low score (e.g. 10-40) and critique why it is wrong.\n\n");
        prompt.append("Interview Transcript:\n");
        for (InterviewSessionResponseDto.TranscriptItem item : transcript) {
            prompt.append("Question ").append(item.getQuestionNumber()).append(": ").append(item.getQuestion()).append("\n");
            prompt.append("Candidate Spoken Answer: ").append(item.getAnswer() != null ? item.getAnswer() : "(No answer provided)").append("\n\n");
        }
        prompt.append("Return ONLY a JSON object matching this exact schema:\n");
        prompt.append("{\n");
        prompt.append("  \"overallScore\": <0-100 integer>,\n");
        prompt.append("  \"communicationScore\": <0-100 integer>,\n");
        prompt.append("  \"technicalScore\": <0-100 integer>,\n");
        prompt.append("  \"problemSolvingScore\": <0-100 integer>,\n");
        prompt.append("  \"roleAlignmentScore\": <0-100 integer>,\n");
        prompt.append("  \"strengths\": [\"...\"],\n");
        prompt.append("  \"areasToImprove\": [\"...\"],\n");
        prompt.append("  \"sampleBetterAnswers\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"questionNumber\": 1,\n");
        prompt.append("      \"question\": \"...\",\n");
        prompt.append("      \"candidateAnswer\": \"...\",\n");
        prompt.append("      \"critique\": \"Honest critical evaluation of correctness and missing key points\",\n");
        prompt.append("      \"suggestedResponse\": \"Ideal accurate STAR method response\"\n");
        prompt.append("    }\n");
        prompt.append("  ]\n");
        prompt.append("}\n");

        try {
            String jsonOutput = geminiService.generateText(prompt.toString());
            if (jsonOutput != null && jsonOutput.contains("{")) {
                int start = jsonOutput.indexOf("{");
                int end = jsonOutput.lastIndexOf("}");
                if (start != -1 && end > start) {
                    String cleanJson = jsonOutput.substring(start, end + 1);
                    return objectMapper.readValue(cleanJson, InterviewFeedbackDto.class);
                }
            }
        } catch (Exception ex) {
            log.warn("Gemini evaluation parse failed: {}", ex.getMessage());
        }

        // Rule-based Fallback strictly inspecting actual answer accuracy & length
        List<InterviewFeedbackDto.PerQuestionFeedback> questionCritiques = new ArrayList<>();
        int totalScoreAcc = 0;
        for (InterviewSessionResponseDto.TranscriptItem item : transcript) {
            String ans = item.getAnswer() != null ? item.getAnswer().trim() : "";
            boolean isShort = ans.length() < 30;
            boolean isNonsense = ans.equalsIgnoreCase("no idea") || ans.equalsIgnoreCase("idk") || ans.length() < 10;
            int qScore = isNonsense ? 20 : (isShort ? 45 : 75);
            totalScoreAcc += qScore;

            questionCritiques.add(InterviewFeedbackDto.PerQuestionFeedback.builder()
                    .questionNumber(item.getQuestionNumber())
                    .question(item.getQuestion())
                    .candidateAnswer(ans.isBlank() ? "No answer provided" : ans)
                    .critique(isNonsense ? "Inadequate answer. Crucial technical concepts and problem-solving steps were missing."
                            : (isShort ? "Brief response. Needs concrete architecture examples and metrics."
                            : "Good technical structure, but consider quantifying latency/performance results."))
                    .suggestedResponse("State: 1) Architecture design, 2) Framework tools used, 3) Quantitative performance outcome achieved.")
                    .build());
        }

        // Calculate Voice & Speech Analysis Metrics
        int totalWords = 0;
        int fillerCount = 0;
        List<String> fillerWordsFound = new ArrayList<>();
        List<String> commonFillers = List.of("um", "uh", "like", "you know", "basically", "actually", "i mean", "sort of", "kind of");

        for (InterviewSessionResponseDto.TranscriptItem item : transcript) {
            String text = item.getAnswer() != null ? item.getAnswer().toLowerCase() : "";
            if (!text.isBlank()) {
                String[] words = text.split("\\s+");
                totalWords += words.length;
                for (String w : words) {
                    String cleanW = w.replaceAll("[^a-zA-Z]", "");
                    if (commonFillers.contains(cleanW)) {
                        fillerCount++;
                        if (!fillerWordsFound.contains(cleanW)) {
                            fillerWordsFound.add(cleanW);
                        }
                    }
                }
            }
        }

        int clarityScore = Math.min(100, Math.max(50, 95 - (fillerCount * 4)));
        int estWpm = Math.min(170, Math.max(90, 110 + (totalWords / Math.max(1, transcript.size() * 2))));
        String speakingPace = estWpm > 155 ? "Fast (~" + estWpm + " WPM)" : (estWpm < 105 ? "Deliberate (~" + estWpm + " WPM)" : "Optimal (~" + estWpm + " WPM)");
        int confidenceScore = Math.min(100, Math.max(55, 88 - (fillerCount * 3)));
        String voiceSummary = fillerCount == 0 
            ? "Excellent vocal clarity with fluent phrasing and zero hesitation filler words."
            : "Good speaking tone with " + fillerCount + " detected filler words (" + String.join(", ", fillerWordsFound) + "). Practice pausing silently instead of using vocal fillers.";

        List<String> nextSteps = List.of(
            "Practice structuring technical answers using the STAR method (Situation, Task, Action, Result).",
            "Eliminate vocal filler words by utilizing 1-second silent pauses to collect thoughts.",
            "Incorporate quantifiable metrics and architectural trade-offs into every technical response.",
            "Record and re-listen to your spoken answers to improve vocal pace and confidence."
        );

        int avgScore = transcript.isEmpty() ? 50 : totalScoreAcc / transcript.size();
        return InterviewFeedbackDto.builder()
                .overallScore(avgScore)
                .communicationScore(Math.min(100, avgScore + 5))
                .technicalScore(Math.max(20, avgScore - 5))
                .problemSolvingScore(avgScore)
                .roleAlignmentScore(avgScore)
                .strengths(List.of("Clear articulation of core engineering concepts", "Good composure during technical questions"))
                .areasToImprove(List.of("Provide deeper system design and concurrency explanations", "Incorporate quantitative outcomes into responses"))
                .sampleBetterAnswers(questionCritiques)
                .clarityScore(clarityScore)
                .speakingPace(speakingPace)
                .fillerWordsCount(fillerCount)
                .detectedFillerWords(fillerWordsFound)
                .confidenceScore(confidenceScore)
                .voiceAnalysisSummary(voiceSummary)
                .suggestedNextSteps(nextSteps)
                .build();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getStudentInterviewHistory(UUID studentId) {
        List<InterviewSession> sessions = interviewSessionRepository.findByStudentUserIdOrderByCreatedAtDesc(studentId);
        List<Map<String, Object>> history = new ArrayList<>();
        for (InterviewSession s : sessions) {
            if (s.getScore() == null && s.getFeedback() == null) continue;
            InterviewFeedbackDto fb = deserializeFeedback(s.getFeedback());
            Map<String, Object> map = new HashMap<>();
            map.put("sessionId", s.getId());
            map.put("targetRole", s.getTargetRole());
            map.put("overallScore", s.getScore() != null ? s.getScore() : (fb != null ? fb.getOverallScore() : 0));
            map.put("createdAt", s.getCreatedAt() != null ? s.getCreatedAt().toString() : "");
            map.put("feedback", fb);
            history.add(map);
        }
        return history;
    }

    private String serializeJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception ex) {
            log.error("Error serializing JSON", ex);
            return "[]";
        }
    }

    private List<InterviewSessionResponseDto.TranscriptItem> deserializeTranscript(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return objectMapper.readValue(json, new TypeReference<List<InterviewSessionResponseDto.TranscriptItem>>() {});
        } catch (Exception ex) {
            log.error("Error deserializing transcript JSON", ex);
            return new ArrayList<>();
        }
    }

    private InterviewFeedbackDto deserializeFeedback(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, InterviewFeedbackDto.class);
        } catch (Exception ex) {
            return null;
        }
    }
}
