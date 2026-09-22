package com.skillforge.assessment.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillforge.assessment.dto.McqDto;
import com.skillforge.assessment.entity.QuestionBank;
import com.skillforge.assessment.entity.StudentAnswer;
import com.skillforge.assessment.entity.StudentTestAttempt;
import com.skillforge.assessment.entity.Test;
import com.skillforge.assessment.repository.QuestionBankRepository;
import com.skillforge.assessment.repository.StudentAnswerRepository;
import com.skillforge.assessment.repository.StudentTestAttemptRepository;
import com.skillforge.assessment.repository.TestRepository;
import com.skillforge.student.entity.StudentProfile;
import com.skillforge.student.repository.StudentProfileRepository;
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
public class McqService {

    private final QuestionBankRepository questionBankRepository;
    private final StudentTestAttemptRepository attemptRepository;
    private final StudentAnswerRepository answerRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final TestRepository testRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<McqDto.TopicSummaryItem> getTopics() {
        List<QuestionBank> allQuestions = questionBankRepository.findAll();

        Map<String, Map<String, List<QuestionBank>>> grouped = allQuestions.stream()
                .collect(Collectors.groupingBy(
                        QuestionBank::getCategory,
                        Collectors.groupingBy(QuestionBank::getTopic)
                ));

        List<McqDto.TopicSummaryItem> result = new ArrayList<>();

        for (Map.Entry<String, Map<String, List<QuestionBank>>> catEntry : grouped.entrySet()) {
            String category = catEntry.getKey();
            for (Map.Entry<String, List<QuestionBank>> topEntry : catEntry.getValue().entrySet()) {
                String topic = topEntry.getKey();
                List<QuestionBank> qList = topEntry.getValue();

                List<String> subtopics = qList.stream()
                        .map(QuestionBank::getSubtopic)
                        .filter(Objects::nonNull)
                        .distinct()
                        .collect(Collectors.toList());

                result.add(McqDto.TopicSummaryItem.builder()
                        .category(category)
                        .topic(topic)
                        .questionCount(qList.size())
                        .subtopics(subtopics)
                        .build());
            }
        }

        result.sort(Comparator.comparing(McqDto.TopicSummaryItem::getCategory)
                .thenComparing(McqDto.TopicSummaryItem::getTopic));

        return result;
    }

    @Transactional
    public McqDto.StartTestResponse startTest(UUID studentId, McqDto.StartTestRequest request) {
        List<String> requestedTopics = (request != null && request.getTopics() != null && !request.getTopics().isEmpty())
                ? request.getTopics() : null;
        String difficulty = (request != null && request.getDifficulty() != null && !request.getDifficulty().isBlank())
                ? request.getDifficulty() : null;
        int requestedCount = (request != null && request.getQuestionCount() != null && request.getQuestionCount() > 0)
                ? request.getQuestionCount() : 10;
        int timerMinutes = (request != null && request.getTimerMinutes() != null && request.getTimerMinutes() > 0)
                ? request.getTimerMinutes() : (requestedCount * 2);

        List<QuestionBank> available = new ArrayList<>();
        if (requestedTopics != null && !requestedTopics.isEmpty()) {
            for (String t : requestedTopics) {
                List<QuestionBank> topicMatches = questionBankRepository.findAll().stream()
                        .filter(q -> q.getTopic() != null && (
                                q.getTopic().equalsIgnoreCase(t) ||
                                q.getTopic().toLowerCase().contains(t.toLowerCase()) ||
                                t.toLowerCase().contains(q.getTopic().toLowerCase()) ||
                                (q.getCategory() != null && q.getCategory().equalsIgnoreCase(t))
                        ))
                        .collect(Collectors.toList());
                available.addAll(topicMatches);
            }
        }

        if (available.isEmpty()) {
            available = questionBankRepository.findMatchingQuestions(requestedTopics, difficulty);
        }

        if (available.isEmpty()) {
            // Fallback to all questions in repository if topic filter yields no matches
            available = questionBankRepository.findAll();
        }

        // Additional hardcoded safety fallback if database is unseeded
        if (available.isEmpty()) {
            available = generateDefaultFallbackQuestions(requestedTopics);
        }

        // Shuffle questions to ensure randomization per attempt
        List<QuestionBank> shuffled = new ArrayList<>(new HashSet<>(available));
        Collections.shuffle(shuffled);

        int count = Math.min(requestedCount, shuffled.size());
        List<QuestionBank> selected = shuffled.subList(0, Math.max(1, count));

        // Find or create a generic MCQ Test entity for foreign key constraints
        Test dummyTest = testRepository.findAll().stream()
                .filter(t -> "MCQ".equalsIgnoreCase(t.getType()))
                .findFirst()
                .orElseGet(() -> testRepository.save(Test.builder()
                        .title("SkillForge IndiaBix MCQ Assessment")
                        .description("Dynamic aptitude & technical MCQ assessment")
                        .type("MCQ")
                        .durationMinutes(timerMinutes)
                        .passingScore(60)
                        .build()));

        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student profile not found: " + studentId));

        // Store question order IDs as JSONB for tracking
        List<String> questionIds = selected.stream().map(q -> q.getId().toString()).collect(Collectors.toList());
        String questionOrderJson;
        try {
            questionOrderJson = objectMapper.writeValueAsString(questionIds);
        } catch (Exception ex) {
            questionOrderJson = "[]";
        }

        StudentTestAttempt attempt = StudentTestAttempt.builder()
                .student(student)
                .test(dummyTest)
                .status("IN_PROGRESS")
                .questionOrder(questionOrderJson)
                .score(0)
                .totalPoints(count * 10)
                .percentage(0.0)
                .startedAt(ZonedDateTime.now())
                .isPractice(true)
                .build();

        attempt = attemptRepository.save(attempt);

        List<McqDto.QuestionItem> questionItems = new ArrayList<>();
        for (QuestionBank q : selected) {
            questionItems.add(McqDto.QuestionItem.builder()
                    .id(q.getId())
                    .category(q.getCategory())
                    .topic(q.getTopic())
                    .subtopic(q.getSubtopic())
                    .difficulty(q.getDifficulty())
                    .questionText(q.getQuestionText())
                    .options(List.of(q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD()))
                    .build());
        }

        return McqDto.StartTestResponse.builder()
                .testAttemptId(attempt.getId())
                .topics(requestedTopics != null ? requestedTopics : List.of("All Topics"))
                .questionCount(count)
                .timerMinutes(timerMinutes)
                .questions(questionItems)
                .build();
    }

    @Transactional
    public McqDto.TestResultResponse submitTest(UUID studentId, McqDto.SubmitTestRequest request) {
        if (request == null || request.getTestAttemptId() == null) {
            throw new IllegalArgumentException("Test attempt ID cannot be null");
        }

        StudentTestAttempt attempt = attemptRepository.findById(request.getTestAttemptId())
                .orElseThrow(() -> new RuntimeException("Test attempt not found: " + request.getTestAttemptId()));

        Map<UUID, Integer> studentAnswersMap = new HashMap<>();
        if (request.getAnswers() != null) {
            for (McqDto.SubmitAnswerItem ans : request.getAnswers()) {
                if (ans.getQuestionId() != null) {
                    studentAnswersMap.put(ans.getQuestionId(), ans.getSelectedOption());
                }
            }
        }

        List<String> questionIds = new ArrayList<>();
        try {
            if (attempt.getQuestionOrder() != null && attempt.getQuestionOrder().startsWith("[")) {
                questionIds = objectMapper.readValue(attempt.getQuestionOrder(), new TypeReference<List<String>>() {});
            }
        } catch (Exception ex) {
            log.warn("Failed to parse question order JSON: {}", ex.getMessage());
        }

        List<QuestionBank> questions = new ArrayList<>();
        if (!questionIds.isEmpty()) {
            for (String qIdStr : questionIds) {
                try {
                    UUID qId = UUID.fromString(qIdStr);
                    questionBankRepository.findById(qId).ifPresent(questions::add);
                } catch (Exception ignored) {}
            }
        }

        if (questions.isEmpty()) {
            questions = questionBankRepository.findAll();
        }

        int score = 0;
        int totalQuestions = questions.size();
        List<McqDto.QuestionReviewItem> reviewItems = new ArrayList<>();
        Set<String> topicsSet = new HashSet<>();

        for (QuestionBank q : questions) {
            topicsSet.add(q.getTopic());
            Integer selectedOpt = studentAnswersMap.get(q.getId());
            boolean isCorrect = (selectedOpt != null && selectedOpt.equals(q.getCorrectOption()));

            if (isCorrect) {
                score += 10;
            }

            reviewItems.add(McqDto.QuestionReviewItem.builder()
                    .questionId(q.getId())
                    .category(q.getCategory())
                    .topic(q.getTopic())
                    .questionText(q.getQuestionText())
                    .options(List.of(q.getOptionA(), q.getOptionB(), q.getOptionC(), q.getOptionD()))
                    .selectedOption(selectedOpt)
                    .correctOption(q.getCorrectOption())
                    .isCorrect(isCorrect)
                    .explanation(q.getExplanation()) // IndiaBix core explanation
                    .build());
        }

        int totalPossible = totalQuestions * 10;
        double percentage = totalPossible > 0 ? ((double) score / totalPossible) * 100.0 : 0.0;
        boolean passed = percentage >= 60.0;
        int timeTaken = request.getTimeTakenSeconds() != null ? request.getTimeTakenSeconds() : 120;

        attempt.setStatus("COMPLETED");
        attempt.setScore(score);
        attempt.setTotalPoints(totalPossible);
        attempt.setPercentage(percentage);
        attempt.setSubmittedAt(ZonedDateTime.now());
        attempt.setTimeTakenSeconds(timeTaken);

        attemptRepository.save(attempt);

        return McqDto.TestResultResponse.builder()
                .testAttemptId(attempt.getId())
                .score(score)
                .totalQuestions(totalQuestions)
                .percentage(Math.round(percentage * 10.0) / 10.0)
                .passed(passed)
                .timeTakenSeconds(timeTaken)
                .topics(new ArrayList<>(topicsSet))
                .review(reviewItems)
                .build();
    }

    @Transactional(readOnly = true)
    public List<McqDto.AttemptHistoryItem> getStudentHistory(UUID studentId) {
        List<StudentTestAttempt> attempts = attemptRepository.findByStudentUserIdOrderByStartedAtDesc(studentId);
        List<McqDto.AttemptHistoryItem> history = new ArrayList<>();

        for (StudentTestAttempt a : attempts) {
            String topicName = "General Aptitude & Tech MCQ";
            if (a.getTest() != null && a.getTest().getTitle() != null) {
                topicName = a.getTest().getTitle();
            }

            history.add(McqDto.AttemptHistoryItem.builder()
                    .attemptId(a.getId())
                    .topic(topicName)
                    .score(a.getScore())
                    .totalPoints(a.getTotalPoints())
                    .percentage(a.getPercentage())
                    .status(a.getStatus())
                    .startedAt(a.getStartedAt())
                    .submittedAt(a.getSubmittedAt())
                    .build());
        }

        return history;
    }

    private List<QuestionBank> generateDefaultFallbackQuestions(List<String> requestedTopics) {
        String topicName = (requestedTopics != null && !requestedTopics.isEmpty()) ? requestedTopics.get(0) : "General Aptitude";
        return List.of(
            QuestionBank.builder()
                .id(UUID.randomUUID())
                .category("Aptitude")
                .topic(topicName)
                .subtopic("Fundamentals")
                .difficulty("EASY")
                .questionText("If a number is increased by 20% and then decreased by 20%, what is the net percentage change?")
                .optionA("No change (0%)")
                .optionB("4% decrease")
                .optionC("4% increase")
                .optionD("2% decrease")
                .correctOption(1)
                .explanation("Net change = [-(20 * 20) / 100] % = -4% (a 4% decrease).")
                .build(),
            QuestionBank.builder()
                .id(UUID.randomUUID())
                .category("Technical")
                .topic(topicName)
                .subtopic("Core Concepts")
                .difficulty("MEDIUM")
                .questionText("Which of the following data structures handles Function Call Stacks in recursion?")
                .optionA("Queue")
                .optionB("Stack")
                .optionC("Binary Search Tree")
                .optionD("Hash Table")
                .correctOption(1)
                .explanation("Function execution frames are pushed and popped from the system Call Stack using LIFO ordering.")
                .build(),
            QuestionBank.builder()
                .id(UUID.randomUUID())
                .category("Technical")
                .topic(topicName)
                .subtopic("Object Oriented Programming")
                .difficulty("EASY")
                .questionText("What is the main advantage of Encapsulation in Software Architecture?")
                .optionA("Allows code to run multithreaded automatically")
                .optionB("Hides internal implementation details and restricts direct state access")
                .optionC("Increases compile time efficiency")
                .optionD("Reduces database storage size")
                .correctOption(1)
                .explanation("Encapsulation bundles data with methods and restricts direct outside modification, enhancing security and modularity.")
                .build()
        );
    }
}
