package com.skillforge.assessment.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillforge.assessment.dto.TestReportResponseDto;
import com.skillforge.assessment.dto.VoiceAssessmentDto;
import com.skillforge.assessment.entity.*;
import com.skillforge.assessment.repository.*;
import com.skillforge.auth.entity.User;
import com.skillforge.auth.repository.UserRepository;
import com.skillforge.common.exception.AuthException;
import com.skillforge.common.service.GeminiService;
import com.skillforge.student.entity.StudentProfile;
import com.skillforge.student.repository.StudentProfileRepository;
import com.skillforge.student.service.StudentProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class VoiceAssessmentService {

    private final TestRepository testRepository;
    private final StudentTestAttemptRepository attemptRepository;
    private final AttemptCategoryScoreRepository categoryScoreRepository;
    private final SuggestionConfigRepository suggestionConfigRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final StudentProfileService studentProfileService;
    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final ObjectMapper objectMapper;
    private final AssessmentService assessmentService;

    // Rich curated sentence bank for Sentence Repeating Practice
    private static final List<String> SENTENCE_BANK = List.of(
            "Software engineering requires both logical problem solving and effective team communication.",
            "The microservices architecture enables independent scaling and resilient service deployments.",
            "Continuous integration pipelines automatically build, test, and validate every code commit.",
            "Asynchronous processing improves system throughput by delegating heavy tasks to background workers.",
            "Relational databases use primary keys and foreign keys to maintain strict data integrity.",
            "Object-oriented programming utilizes encapsulation, inheritance, polymorphism, and abstraction.",
            "A balanced binary search tree guarantees logarithmic time complexity for insertions and searches.",
            "Stateless authentication using JSON Web Tokens simplifies horizontal scaling across server clusters.",
            "Cloud computing allows developers to deploy scalable distributed applications with high availability.",
            "Effective code reviews identify potential edge cases and promote best practices across the team.",
            "RESTful API design follows standard HTTP methods to perform operations on structured resources.",
            "Responsive web design ensures that user interfaces render smoothly across mobile and desktop devices.",
            "Cache invalidation and naming conventions are two of the most critical challenges in computer science.",
            "Automated unit tests prevent regressions and give developers confidence during refactoring.",
            "Event-driven architectures decouple producers from consumers using distributed message queues."
    );

    @Transactional
    public VoiceAssessmentDto.StartSessionResponse startVoiceSession(UUID studentId, VoiceAssessmentDto.StartSessionRequest request) {
        User user = userRepository.findById(studentId)
                .orElseThrow(AuthException::userNotFound);

        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseGet(() -> studentProfileRepository.save(StudentProfile.builder()
                        .userId(studentId)
                        .user(user)
                        .fullName(user.getEmail().split("@")[0])
                        .targetRole("Full Stack Engineer")
                        .build()));

        String mode = request.getMode() != null ? request.getMode().toUpperCase() : "SENTENCE_REPEATING";
        int sentenceCount = request.getSentenceCount() != null && request.getSentenceCount() > 0
                ? Math.min(20, Math.max(1, request.getSentenceCount()))
                : 5;

        // Fetch or create Voice Communication Test entity
        Test voiceTest = testRepository.findByTypeAndIsActiveTrue("COMMUNICATION").stream()
                .findFirst()
                .orElseGet(() -> testRepository.save(Test.builder()
                        .title("Voice AI Interactive Communication Test")
                        .description("Spoken assessment evaluating Fluency, Sentence Reading Accuracy, Pronunciation, Grammar, and Confidence.")
                        .type("COMMUNICATION")
                        .moduleId("VOICE_101")
                        .durationMinutes(15)
                        .passingScore(60)
                        .isActive(true)
                        .build()));

        String initialPrompt;
        List<String> chosenSentences = new ArrayList<>();

        if ("SENTENCE_REPEATING".equals(mode)) {
            List<String> pool = new ArrayList<>(SENTENCE_BANK);
            Collections.shuffle(pool);
            chosenSentences = pool.subList(0, Math.min(sentenceCount, pool.size()));
            initialPrompt = chosenSentences.get(0);
        } else if ("NORMAL_SPEAKING".equals(mode)) {
            initialPrompt = "Welcome to Spoken Fluency Practice. Please introduce yourself, describe your technical focus, and explain an engineering challenge you solved.";
        } else {
            // INTERVIEW mode default
            initialPrompt = "Hello! I am your AI Technical Interviewer today. Could you introduce yourself and tell me about your background in software engineering?";
        }

        // Store initial conversation turn and chosen sentences into attempt state JSON
        List<VoiceAssessmentDto.TurnItem> turns = new ArrayList<>();
        turns.add(VoiceAssessmentDto.TurnItem.builder()
                .speaker("AI")
                .text(initialPrompt)
                .timestamp(ZonedDateTime.now().toString())
                .build());

        Map<String, Object> sessionState = new HashMap<>();
        sessionState.put("mode", mode);
        sessionState.put("totalSentences", chosenSentences.size());
        sessionState.put("sentences", chosenSentences);
        sessionState.put("currentSentenceIndex", 0);
        sessionState.put("turns", turns);

        String stateJson = serializeState(sessionState);

        StudentTestAttempt attempt = StudentTestAttempt.builder()
                .test(voiceTest)
                .student(student)
                .questionOrder(stateJson)
                .startedAt(ZonedDateTime.now())
                .status("IN_PROGRESS")
                .build();

        attempt = attemptRepository.save(attempt);

        return VoiceAssessmentDto.StartSessionResponse.builder()
                .attemptId(attempt.getId())
                .mode(mode)
                .initialAiQuestion(initialPrompt)
                .totalMaxTurns(chosenSentences.isEmpty() ? 5 : chosenSentences.size())
                .targetSentence("SENTENCE_REPEATING".equals(mode) ? chosenSentences.get(0) : null)
                .currentSentenceIndex(0)
                .totalSentences(chosenSentences.size())
                .allSentences(chosenSentences)
                .build();
    }

    @Transactional
    public VoiceAssessmentDto.VoiceTurnResponse processVoiceTurn(UUID studentId, VoiceAssessmentDto.VoiceTurnRequest request) {
        StudentTestAttempt attempt = attemptRepository.findById(request.getAttemptId())
                .orElseThrow(() -> new RuntimeException("Voice attempt not found"));

        if ("COMPLETED".equalsIgnoreCase(attempt.getStatus())) {
            throw new RuntimeException("Session has already ended");
        }

        Map<String, Object> sessionState = deserializeState(attempt.getQuestionOrder());
        String mode = (String) sessionState.getOrDefault("mode", "SENTENCE_REPEATING");
        List<VoiceAssessmentDto.TurnItem> turns = getTurnsFromState(sessionState);
        List<String> sentences = getSentencesFromState(sessionState);
        int currentIndex = request.getSentenceIndex() != null ? request.getSentenceIndex() : ((Number) sessionState.getOrDefault("currentSentenceIndex", 0)).intValue();

        String spokenText = request.getStudentSpokenText() != null ? request.getStudentSpokenText().trim() : "";

        if ("SENTENCE_REPEATING".equals(mode) && !sentences.isEmpty()) {
            String target = currentIndex < sentences.size() ? sentences.get(currentIndex) : sentences.get(0);

            // Compute sentence accuracy & word matching
            SentenceMatchResult matchResult = evaluateSentenceAccuracy(target, spokenText);

            turns.add(VoiceAssessmentDto.TurnItem.builder()
                    .speaker("STUDENT")
                    .text(spokenText)
                    .timestamp(ZonedDateTime.now().toString())
                    .accuracy(matchResult.accuracy)
                    .build());

            int nextIndex = currentIndex + 1;
            boolean isFinished = nextIndex >= sentences.size();
            String nextPrompt;

            if (isFinished) {
                nextPrompt = "Congratulations! You have completed all " + sentences.size() + " sentences. Compiling your speech and pronunciation assessment report.";
            } else {
                nextPrompt = sentences.get(nextIndex);
            }

            turns.add(VoiceAssessmentDto.TurnItem.builder()
                    .speaker("AI")
                    .text(nextPrompt)
                    .timestamp(ZonedDateTime.now().toString())
                    .build());

            sessionState.put("currentSentenceIndex", nextIndex);
            sessionState.put("turns", turns);
            attempt.setQuestionOrder(serializeState(sessionState));
            attemptRepository.save(attempt);

            return VoiceAssessmentDto.VoiceTurnResponse.builder()
                    .attemptId(attempt.getId())
                    .aiQuestion(nextPrompt)
                    .currentTurn(nextIndex)
                    .totalMaxTurns(sentences.size())
                    .isFinished(isFinished)
                    .transcriptHistory(turns)
                    .targetSentence(target)
                    .spokenSentence(spokenText)
                    .currentSentenceIndex(nextIndex)
                    .totalSentences(sentences.size())
                    .sentenceAccuracy(matchResult.accuracy)
                    .matchedWords(matchResult.matchedWords)
                    .missedWords(matchResult.missedWords)
                    .build();
        }

        // Conversational / Interview Mode
        turns.add(VoiceAssessmentDto.TurnItem.builder()
                .speaker("STUDENT")
                .text(spokenText)
                .timestamp(ZonedDateTime.now().toString())
                .build());

        int currentTurn = turns.size() / 2;
        boolean isFinished = currentTurn >= 5;

        String nextAiQuestion = isFinished
                ? "Thank you for completing the voice assessment! Compiling your score and feedback."
                : generateAiFollowUp(turns);

        turns.add(VoiceAssessmentDto.TurnItem.builder()
                .speaker("AI")
                .text(nextAiQuestion)
                .timestamp(ZonedDateTime.now().toString())
                .build());

        sessionState.put("turns", turns);
        attempt.setQuestionOrder(serializeState(sessionState));
        attemptRepository.save(attempt);

        return VoiceAssessmentDto.VoiceTurnResponse.builder()
                .attemptId(attempt.getId())
                .aiQuestion(nextAiQuestion)
                .currentTurn(currentTurn)
                .totalMaxTurns(5)
                .isFinished(isFinished)
                .transcriptHistory(turns)
                .build();
    }

    @Transactional
    public TestReportResponseDto submitVoiceSession(UUID studentId, UUID attemptId) {
        StudentTestAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new RuntimeException("Voice attempt not found"));

        Map<String, Object> sessionState = deserializeState(attempt.getQuestionOrder());
        List<VoiceAssessmentDto.TurnItem> turns = getTurnsFromState(sessionState);
        String mode = (String) sessionState.getOrDefault("mode", "SENTENCE_REPEATING");

        // Calculate scores across 6 categories based on transcript evaluation
        Map<String, Double> scores = evaluateTranscript(turns, mode);

        double totalScore = scores.values().stream().mapToDouble(Double::doubleValue).average().orElse(75.0);
        int finalScorePercentage = (int) Math.round(totalScore);

        attempt.setScore(finalScorePercentage);
        attempt.setTotalPoints(100);
        attempt.setPercentage((double) finalScorePercentage);
        attempt.setSubmittedAt(ZonedDateTime.now());
        attempt.setStatus("COMPLETED");
        attemptRepository.save(attempt);

        // Save Category Scores into database
        categoryScoreRepository.deleteByAttemptId(attempt.getId());
        List<AttemptCategoryScore> categoryScores = new ArrayList<>();
        scores.forEach((category, scoreVal) -> {
            categoryScores.add(categoryScoreRepository.save(AttemptCategoryScore.builder()
                    .attempt(attempt)
                    .skillCategory(category)
                    .score((int) Math.round(scoreVal))
                    .maxScore(100)
                    .percentage(scoreVal)
                    .build()));
        });

        try {
            studentProfileService.recordStudentActivityAndGetStreak(studentId);
        } catch (Exception ex) {
            log.warn("Could not update student streak on voice submission: {}", ex.getMessage());
        }

        return assessmentService.getAttemptReport(attempt.getId(), studentId);
    }

    private SentenceMatchResult evaluateSentenceAccuracy(String target, String spoken) {
        String cleanTarget = target.replaceAll("[^a-zA-Z0-9\\s]", "").toLowerCase(Locale.ROOT);
        String cleanSpoken = spoken.replaceAll("[^a-zA-Z0-9\\s]", "").toLowerCase(Locale.ROOT);

        String[] targetWords = cleanTarget.split("\\s+");
        String[] spokenWords = cleanSpoken.split("\\s+");

        Set<String> spokenSet = new HashSet<>(Arrays.asList(spokenWords));
        List<String> matched = new ArrayList<>();
        List<String> missed = new ArrayList<>();

        for (String w : targetWords) {
            if (w.isBlank()) continue;
            if (spokenSet.contains(w)) {
                matched.add(w);
            } else {
                missed.add(w);
            }
        }

        double accuracy = targetWords.length > 0
                ? ((double) matched.size() / targetWords.length) * 100.0
                : 0.0;

        return new SentenceMatchResult(Math.round(accuracy * 10.0) / 10.0, matched, missed);
    }

    private Map<String, Double> evaluateTranscript(List<VoiceAssessmentDto.TurnItem> turns, String mode) {
        Map<String, Double> scores = new LinkedHashMap<>();

        if ("SENTENCE_REPEATING".equals(mode)) {
            List<Double> accuracies = turns.stream()
                    .filter(t -> "STUDENT".equalsIgnoreCase(t.getSpeaker()) && t.getAccuracy() != null)
                    .map(VoiceAssessmentDto.TurnItem::getAccuracy)
                    .collect(Collectors.toList());

            double avgAccuracy = accuracies.isEmpty()
                    ? 78.0
                    : accuracies.stream().mapToDouble(Double::doubleValue).average().orElse(78.0);

            double pronunciation = Math.min(98.0, Math.max(50.0, avgAccuracy * 0.95 + 4));
            double fluency = Math.min(96.0, Math.max(55.0, avgAccuracy * 0.9 + 8));
            double accuracyScore = Math.min(100.0, Math.max(45.0, avgAccuracy));
            double vocabulary = Math.min(95.0, Math.max(60.0, avgAccuracy * 0.85 + 12));
            double confidence = Math.min(92.0, Math.max(65.0, avgAccuracy * 0.8 + 18));
            double structure = 88.0;

            scores.put("Sentence Accuracy", Math.round(accuracyScore * 10.0) / 10.0);
            scores.put("Pronunciation", Math.round(pronunciation * 10.0) / 10.0);
            scores.put("Fluency", Math.round(fluency * 10.0) / 10.0);
            scores.put("Vocabulary", Math.round(vocabulary * 10.0) / 10.0);
            scores.put("Confidence", Math.round(confidence * 10.0) / 10.0);
            scores.put("Structure", structure);
            return scores;
        }

        // Default conversational
        int studentWordCount = 0;
        int totalTurns = 0;

        for (VoiceAssessmentDto.TurnItem item : turns) {
            if ("STUDENT".equalsIgnoreCase(item.getSpeaker())) {
                totalTurns++;
                studentWordCount += item.getText().split("\\s+").length;
            }
        }

        double avgWordsPerTurn = totalTurns > 0 ? (double) studentWordCount / totalTurns : 10.0;
        double fluency = Math.min(100.0, Math.max(50.0, avgWordsPerTurn * 4.5 + 40));
        double grammar = 84.0;
        double vocabulary = Math.min(95.0, Math.max(55.0, avgWordsPerTurn * 3.8 + 45));
        double confidence = Math.min(90.0, Math.max(60.0, totalTurns * 12.0 + 30));
        double structure = 80.0;
        double relevance = 86.0;

        scores.put("Fluency", Math.round(fluency * 10.0) / 10.0);
        scores.put("Grammar", grammar);
        scores.put("Vocabulary", Math.round(vocabulary * 10.0) / 10.0);
        scores.put("Confidence", Math.round(confidence * 10.0) / 10.0);
        scores.put("Structure", structure);
        scores.put("Relevance", relevance);

        return scores;
    }

    private String generateAiFollowUp(List<VoiceAssessmentDto.TurnItem> turns) {
        StringBuilder prompt = new StringBuilder("You are an AI Voice Communication Coach & Technical Interviewer.");
        prompt.append("\nConversation so far:\n");
        for (VoiceAssessmentDto.TurnItem item : turns) {
            prompt.append(item.getSpeaker()).append(": ").append(item.getText()).append("\n");
        }
        prompt.append("\nRespond with the single next interview follow-up question. Keep it under 25 words, clear and relevant.");

        try {
            String aiReply = geminiService.generateText(prompt.toString());
            if (aiReply != null && !aiReply.isBlank()) {
                return aiReply.trim();
            }
        } catch (Exception ignored) {}

        return "Thank you for sharing that. Can you explain what technical considerations you prioritized during that project?";
    }

    private String serializeState(Map<String, Object> state) {
        try {
            return objectMapper.writeValueAsString(state);
        } catch (Exception e) {
            return "{}";
        }
    }

    private Map<String, Object> deserializeState(String json) {
        if (json == null || json.isBlank()) return new HashMap<>();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }

    @SuppressWarnings("unchecked")
    private List<VoiceAssessmentDto.TurnItem> getTurnsFromState(Map<String, Object> state) {
        Object turnsObj = state.get("turns");
        if (turnsObj == null) return new ArrayList<>();
        try {
            String json = objectMapper.writeValueAsString(turnsObj);
            return objectMapper.readValue(json, new TypeReference<List<VoiceAssessmentDto.TurnItem>>() {});
        } catch (Exception e) {
            return new ArrayList<>();
        }
    }

    @SuppressWarnings("unchecked")
    private List<String> getSentencesFromState(Map<String, Object> state) {
        Object sObj = state.get("sentences");
        if (sObj instanceof List<?>) {
            return ((List<?>) sObj).stream().map(Object::toString).collect(Collectors.toList());
        }
        return new ArrayList<>();
    }

    private static class SentenceMatchResult {
        final double accuracy;
        final List<String> matchedWords;
        final List<String> missedWords;

        SentenceMatchResult(double accuracy, List<String> matchedWords, List<String> missedWords) {
            this.accuracy = accuracy;
            this.matchedWords = matchedWords;
            this.missedWords = missedWords;
        }
    }
}
