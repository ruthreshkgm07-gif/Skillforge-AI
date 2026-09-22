package com.skillforge.ai.assistant;

import com.skillforge.common.service.LlmService;
import com.skillforge.auth.entity.User;
import com.skillforge.auth.repository.UserRepository;
import com.skillforge.common.exception.AuthException;
import com.skillforge.common.service.RateLimiterService;
import com.skillforge.recruiter.entity.RecruiterProfile;
import com.skillforge.recruiter.repository.RecruiterProfileRepository;
import com.skillforge.resume.entity.Resume;
import com.skillforge.resume.repository.ResumeRepository;
import com.skillforge.student.entity.StudentProfile;
import com.skillforge.student.entity.StudentSkill;
import com.skillforge.student.repository.StudentProfileRepository;
import com.skillforge.student.repository.StudentSkillRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AssistantService {

    private final AssistantSessionRepository sessionRepository;
    private final AssistantMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final ResumeRepository resumeRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final LlmService llmService;
    private final RateLimiterService rateLimiterService;

    @Transactional
    public AssistantChatDto.ChatResponse chat(UUID userId, AssistantChatDto.ChatRequest request) {
        if (request == null || request.getMessage() == null || request.getMessage().isBlank()) {
            throw new IllegalArgumentException("Chat message content cannot be empty");
        }

        // 1. Redis Rate Limit: max 30 AI chat requests per 10 minutes per user
        rateLimiterService.checkRateLimit("ai_chat:" + userId, 30, 10);

        User user = userRepository.findById(userId)
                .orElseThrow(AuthException::userNotFound);

        // 2. Get or Create Assistant Session
        boolean isNewSession = false;
        AssistantSession session;
        if (request.getSessionId() != null) {
            session = sessionRepository.findById(request.getSessionId())
                    .orElseGet(() -> createSession(user, request.getMessage()));
        } else {
            session = createSession(user, request.getMessage());
            isNewSession = true;
        }

        // 3. Save User Message
        AssistantMessage userMessage = AssistantMessage.builder()
                .session(session)
                .sender("user")
                .content(request.getMessage().trim())
                .build();
        messageRepository.save(userMessage);

        // Update session title if default
        if (isNewSession || "SkillForge Assistant Session".equals(session.getTitle())) {
            String title = request.getMessage().trim();
            if (title.length() > 40) {
                title = title.substring(0, 37) + "...";
            }
            session.setTitle(title);
        }

        // 4. Assemble Context & System Prompt based on User Role
        String systemPrompt = buildSystemPrompt(user);

        // 5. Fetch Session Conversation History with older turns compression
        List<AssistantMessage> history = messageRepository.findBySessionIdOrderByCreatedAtAsc(session.getId());

        List<LlmService.ChatMessage> llmMessages = new ArrayList<>();
        llmMessages.add(new LlmService.ChatMessage("system", systemPrompt));

        if (history.size() > 10) {
            int oldestCount = history.size() - 10;
            List<AssistantMessage> olderTurns = history.subList(0, oldestCount);
            StringBuilder summaryBuilder = new StringBuilder("SUMMARY OF EARLIER CONVERSATION TURNS IN THIS SESSION:\n");
            for (AssistantMessage m : olderTurns) {
                String sender = "user".equalsIgnoreCase(m.getSender()) ? "User" : "Assistant";
                String snippet = m.getContent().length() > 100 ? m.getContent().substring(0, 97) + "..." : m.getContent();
                summaryBuilder.append("- ").append(sender).append(": ").append(snippet.replaceAll("\n", " ")).append("\n");
            }
            llmMessages.add(new LlmService.ChatMessage("system", summaryBuilder.toString()));
        }

        int startIdx = Math.max(0, history.size() - 10);
        List<AssistantMessage> recentHistory = history.subList(startIdx, history.size());

        for (AssistantMessage m : recentHistory) {
            String role = "user".equalsIgnoreCase(m.getSender()) ? "user" : "assistant";
            llmMessages.add(new LlmService.ChatMessage(role, m.getContent()));
        }

        // 6. Generate AI Response via LlmService (supporting OpenAI & Gemini & Fallback)
        String assistantReply;
        try {
            assistantReply = llmService.generateChatCompletion(llmMessages, 0.7, 1500);
            if (assistantReply == null || assistantReply.isBlank()) {
                assistantReply = llmService.generateFallbackResponse(llmMessages);
            }
        } catch (Exception ex) {
            log.warn("AI Assistant provider call failed: {}. Generating comprehensive response.", ex.getMessage());
            assistantReply = llmService.generateFallbackResponse(llmMessages);
        }

        // 7. Save Assistant Message
        AssistantMessage assistantMessage = AssistantMessage.builder()
                .session(session)
                .sender("assistant")
                .content(assistantReply)
                .build();
        messageRepository.save(assistantMessage);

        session.setUpdatedAt(ZonedDateTime.now());
        sessionRepository.save(session);

        return AssistantChatDto.ChatResponse.builder()
                .sessionId(session.getId())
                .reply(assistantReply)
                .timestamp(assistantMessage.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public List<AssistantChatDto.SessionSummary> getUserSessions(UUID userId) {
        return sessionRepository.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                .map(s -> AssistantChatDto.SessionSummary.builder()
                        .id(s.getId())
                        .title(s.getTitle())
                        .updatedAt(s.getUpdatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AssistantChatDto.MessageItem> getSessionMessages(UUID sessionId) {
        return messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId).stream()
                .map(m -> AssistantChatDto.MessageItem.builder()
                        .id(m.getId())
                        .sender(m.getSender())
                        .content(m.getContent())
                        .createdAt(m.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private AssistantSession createSession(User user, String initialMessage) {
        String title = "SkillForge Assistant Session";
        if (initialMessage != null && !initialMessage.isBlank()) {
            title = initialMessage.trim();
            if (title.length() > 40) {
                title = title.substring(0, 37) + "...";
            }
        }

        AssistantSession s = AssistantSession.builder()
                .user(user)
                .title(title)
                .build();
        return sessionRepository.save(s);
    }

    private String buildSystemPrompt(User user) {
        StringBuilder sb = new StringBuilder();
        sb.append("You are SkillForge AI Assistant, an expert dual-role technical, study, and career mentor.\n");
        sb.append("YOUR DUAL OPERATING BEHAVIORS:\n");
        sb.append("1. PLATFORM GUIDE MODE: When asked about SkillForge AI features ('how do I use resume scoring', 'how does MCQ test work', 'what is coding practice platform', 'how placement prediction works', 'how mock interview works'), provide precise, step-by-step guidance grounded strictly in the SkillForge AI Knowledge Base below. Never invent non-existent features.\n");
        sb.append("2. GENERAL ASSISTANT MODE: For all other queries (coding questions, algorithms, data structures, system design, web development, frameworks, debugging, computer science concepts, career advice, interview tips, casual conversation), act as an expert AI conversational assistant. Answer directly with well-formatted markdown, clear explanations, and code snippets where relevant.\n\n");
        
        sb.append("### SKILLFORGE AI MAINTAINED KNOWLEDGE BASE ###\n");
        sb.append("- Resume Analyzer: Parses PDF resumes, computes ATS Match Score (0-100), provides keyword gap analysis against target role, and gives section feedback (Summary, Experience, Education, Skills, Projects).\n");
        sb.append("- Skill Gap & Suggestions: Analyzes candidate skills against market demand benchmarks, highlights weak/missing skills, and suggests targeted learning resources.\n");
        sb.append("- Mock Interview (AI Interviewer): Real-time audio/text simulated technical & HR interviews, providing radar chart metrics (technical accuracy, communication, problem-solving, code quality, depth) and sample answers.\n");
        sb.append("- MCQ Test Module (IndiaBix Style): Aptitude (Quantitative, Logical, Verbal, Data Interpretation) & Technical (Java, Python, JS, React, Spring Boot, SQL, Data Structures, OOP, OS, Networks) tests, topic selection, 10/20/30/50 question count selection, timer, and detailed review with 'why' explanations for every question.\n");
        sb.append("- Coding Practice Platform: Topic-based coding problems (Queues, SQL Queries, Bit Manipulation, Greedy, System Design) with in-browser code editor, safe test case execution, standard stdout and error console output, line-by-line AI explanations, and follow-up Q&A.\n");
        sb.append("- Placement Prediction Engine: ML engine predicting student placement readiness percentage by aggregating ATS score, coding problems solved, and MCQ test scores.\n\n");

        if (user.getRole() == User.Role.STUDENT) {
            Optional<StudentProfile> profileOpt = studentProfileRepository.findById(user.getId());
            String targetRole = profileOpt.map(StudentProfile::getTargetRole).orElse("Software Engineer");
            Optional<Resume> resumeOpt = resumeRepository.findFirstByStudentUserIdOrderByUploadedAtDesc(user.getId());
            int atsScore = resumeOpt.map(r -> r.getAtsScore() != null ? r.getAtsScore() : 0).orElse(0);

            List<StudentSkill> skills = studentSkillRepository.findByStudentUserId(user.getId());
            String skillGapsStr = skills.stream()
                    .filter(s -> s.getProficiencyLevel() < 4)
                    .map(s -> s.getSkill().getName())
                    .limit(4)
                    .collect(Collectors.joining(", "));

            sb.append("### CANDIDATE STUDENT CONTEXT ###")
              .append("\n- User Role: STUDENT Candidate")
              .append("\n- Target Role: ").append(targetRole)
              .append("\n- Resume ATS Score: ").append(atsScore > 0 ? atsScore + "/100" : "Not yet uploaded")
              .append("\n- Priority Skill Gaps: ").append(!skillGapsStr.isEmpty() ? skillGapsStr : "System Design, Docker, Microservices");
        } else if (user.getRole() == User.Role.RECRUITER) {
            Optional<RecruiterProfile> recProfile = recruiterProfileRepository.findById(user.getId());
            String company = recProfile.map(r -> r.getCompany().getName()).orElse("Enterprise Talent Org");

            sb.append("### RECRUITER CONTEXT ###")
              .append("\n- User Role: ENTERPRISE RECRUITER")
              .append("\n- Company: ").append(company);
        }

        return sb.toString();
    }
}

