package com.skillforge.assessment.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillforge.assessment.dto.*;
import com.skillforge.assessment.entity.*;
import com.skillforge.assessment.repository.*;
import com.skillforge.auth.entity.User;
import com.skillforge.auth.repository.UserRepository;
import com.skillforge.student.entity.StudentProfile;
import com.skillforge.student.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AssessmentService {

    private final TestRepository testRepository;
    private final QuestionRepository questionRepository;
    private final StudentTestAttemptRepository attemptRepository;
    private final StudentAnswerRepository answerRepository;
    private final AttemptCategoryScoreRepository categoryScoreRepository;
    private final SuggestionConfigRepository suggestionConfigRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    /**
     * Retrieve active tests, optionally filtered by type (COMMUNICATION / MCQ) or module.
     */
    @Transactional(readOnly = true)
    public List<TestSummaryDto> getAvailableTests(String type, String moduleId) {
        List<Test> tests;
        if (type != null && !type.isBlank()) {
            tests = testRepository.findByTypeAndIsActiveTrue(type.toUpperCase());
        } else if (moduleId != null && !moduleId.isBlank()) {
            tests = testRepository.findByModuleIdAndIsActiveTrue(moduleId);
        } else {
            tests = testRepository.findByIsActiveTrue();
        }

        return tests.stream().map(t -> TestSummaryDto.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .type(t.getType())
                .moduleId(t.getModuleId())
                .durationMinutes(t.getDurationMinutes())
                .passingScore(t.getPassingScore())
                .totalQuestions(t.getQuestions().size())
                .build()
        ).collect(Collectors.toList());
    }

    /**
     * Start a new test attempt.
     * Generates a per-attempt Fisher-Yates shuffled question order and option order,
     * and persists them to the StudentTestAttempt record.
     */
    @Transactional(readOnly = true)
    public List<String> getAvailableTopics(String testType) {
        String type = (testType != null && !testType.isBlank()) ? testType : "MCQ";
        return questionRepository.findDistinctSkillCategoriesByTestType(type);
    }

    @Transactional
    public TestAttemptViewDto startAttempt(UUID testId, UUID studentId) {
        return startAttempt(testId, studentId, null);
    }

    @Transactional
    public TestAttemptViewDto startAttempt(UUID testId, UUID studentId, String topic) {
        StudentProfile student = getOrCreateStudentProfile(studentId);

        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new IllegalArgumentException("Test not found with ID: " + testId));

        if (!Boolean.TRUE.equals(test.getIsActive())) {
            throw new IllegalArgumentException("Selected test is currently inactive.");
        }

        List<Question> questions;
        if (topic != null && !topic.isBlank()) {
            questions = questionRepository.findByTestIdAndSkillCategoryIgnoreCase(testId, topic.trim());
            if (questions.isEmpty()) {
                questions = questionRepository.findByTestId(testId);
            }
        } else {
            questions = questionRepository.findByTestId(testId);
        }

        if (questions.isEmpty()) {
            throw new IllegalArgumentException("Test has no questions configured.");
        }

        // Fisher-Yates Shuffle on Questions per attempt
        List<Question> shuffledQuestions = new ArrayList<>(questions);
        Collections.shuffle(shuffledQuestions);

        List<UUID> questionOrderIds = shuffledQuestions.stream()
                .map(Question::getId)
                .collect(Collectors.toList());

        // Fisher-Yates Shuffle on Options per Question per attempt
        Map<String, List<UUID>> optionOrderMap = new HashMap<>();
        for (Question q : shuffledQuestions) {
            List<QuestionOption> options = new ArrayList<>(q.getOptions());
            Collections.shuffle(options);
            List<UUID> optionIds = options.stream()
                    .map(QuestionOption::getId)
                    .collect(Collectors.toList());
            optionOrderMap.put(q.getId().toString(), optionIds);
        }

        String questionOrderJson;
        String optionOrderJson;
        try {
            questionOrderJson = objectMapper.writeValueAsString(questionOrderIds);
            optionOrderJson = objectMapper.writeValueAsString(optionOrderMap);
        } catch (Exception e) {
            log.error("Failed to serialize attempt order JSON", e);
            throw new RuntimeException("Error initializing test attempt order");
        }

        int totalPossiblePoints = questions.stream().mapToInt(Question::getPoints).sum();

        StudentTestAttempt attempt = StudentTestAttempt.builder()
                .student(student)
                .test(test)
                .status("IN_PROGRESS")
                .questionOrder(questionOrderJson)
                .optionOrder(optionOrderJson)
                .score(0)
                .totalPoints(totalPossiblePoints)
                .percentage(0.0)
                .startedAt(ZonedDateTime.now())
                .isPractice(true)
                .build();

        attempt = attemptRepository.save(attempt);

        return buildAttemptViewDto(attempt, shuffledQuestions, optionOrderMap);
    }

    /**
     * Fetch questions for an ongoing attempt, retaining the exact persisted Fisher-Yates order.
     */
    @Transactional(readOnly = true)
    public TestAttemptViewDto getAttemptQuestions(UUID attemptId, UUID studentId) {
        StudentTestAttempt attempt = attemptRepository.findByIdAndStudentUserId(attemptId, studentId)
                .orElseThrow(() -> new IllegalArgumentException("Test attempt not found or unauthorized"));

        return buildAttemptViewFromPersistedOrder(attempt);
    }

    /**
     * Submit test attempt, calculate auto-score, compute category breakdowns,
     * detect weak areas (< 60%), attach suggestions, and save results.
     */
    @Transactional
    public TestReportResponseDto submitAttempt(UUID attemptId, UUID studentId, SubmitTestRequestDto submitDto) {
        StudentTestAttempt attempt = attemptRepository.findByIdAndStudentUserId(attemptId, studentId)
                .orElseThrow(() -> new IllegalArgumentException("Test attempt not found or unauthorized"));

        if ("COMPLETED".equals(attempt.getStatus())) {
            return getAttemptReport(attemptId, studentId);
        }

        List<Question> questions = questionRepository.findByTestId(attempt.getTest().getId());
        Map<UUID, Question> questionMap = questions.stream()
                .collect(Collectors.toMap(Question::getId, Function.identity()));

        Map<UUID, QuestionOption> optionMap = questions.stream()
                .flatMap(q -> q.getOptions().stream())
                .collect(Collectors.toMap(QuestionOption::getId, Function.identity()));

        int totalEarnedScore = 0;
        int totalPossiblePoints = 0;

        List<StudentAnswer> studentAnswers = new ArrayList<>();
        Map<String, Integer> categoryEarnedMap = new HashMap<>();
        Map<String, Integer> categoryMaxMap = new HashMap<>();

        Map<UUID, SubmitAnswerDto> submittedAnswersMap = (submitDto.getAnswers() != null)
                ? submitDto.getAnswers().stream().filter(a -> a.getQuestionId() != null)
                    .collect(Collectors.toMap(SubmitAnswerDto::getQuestionId, Function.identity(), (v1, v2) -> v1))
                : Collections.emptyMap();

        for (Question question : questions) {
            String category = question.getSkillCategory();
            int qPoints = (question.getPoints() != null) ? question.getPoints() : 10;

            categoryMaxMap.put(category, categoryMaxMap.getOrDefault(category, 0) + qPoints);
            totalPossiblePoints += qPoints;

            SubmitAnswerDto userAns = submittedAnswersMap.get(question.getId());
            boolean isCorrect = false;
            int pointsEarned = 0;
            QuestionOption selectedOpt = null;
            String ansText = null;
            int timeTaken = 0;

            if (userAns != null) {
                timeTaken = (userAns.getTimeTakenSeconds() != null) ? userAns.getTimeTakenSeconds() : 0;
                ansText = userAns.getAnswerText();

                if ("MCQ".equalsIgnoreCase(question.getType()) && userAns.getSelectedOptionId() != null) {
                    selectedOpt = optionMap.get(userAns.getSelectedOptionId());
                    if (selectedOpt != null && Boolean.TRUE.equals(selectedOpt.getIsCorrect())) {
                        isCorrect = true;
                    }
                } else if ("FILL_IN_BLANK".equalsIgnoreCase(question.getType()) && ansText != null) {
                    Optional<QuestionOption> correctOpt = question.getOptions().stream()
                            .filter(o -> Boolean.TRUE.equals(o.getIsCorrect()))
                            .findFirst();
                    if (correctOpt.isPresent() && ansText.trim().equalsIgnoreCase(correctOpt.get().getOptionText().trim())) {
                        isCorrect = true;
                    }
                } else if ("SHORT_ANSWER".equalsIgnoreCase(question.getType()) && ansText != null && !ansText.isBlank()) {
                    // Simple heuristic for subjective short answer: non-empty & length >= 5
                    isCorrect = ansText.trim().length() >= 5;
                }
            }

            if (isCorrect) {
                pointsEarned = qPoints;
                totalEarnedScore += pointsEarned;
                categoryEarnedMap.put(category, categoryEarnedMap.getOrDefault(category, 0) + pointsEarned);
            }

            StudentAnswer answerRecord = StudentAnswer.builder()
                    .attempt(attempt)
                    .question(question)
                    .selectedOption(selectedOpt)
                    .answerText(ansText)
                    .isCorrect(isCorrect)
                    .pointsEarned(pointsEarned)
                    .timeTakenSeconds(timeTaken)
                    .build();

            studentAnswers.add(answerRecord);
        }

        answerRepository.saveAll(studentAnswers);

        double percentage = (totalPossiblePoints > 0)
                ? ((double) totalEarnedScore / totalPossiblePoints) * 100.0
                : 0.0;

        attempt.setStatus("COMPLETED");
        attempt.setScore(totalEarnedScore);
        attempt.setTotalPoints(totalPossiblePoints);
        attempt.setPercentage(Math.round(percentage * 10.0) / 10.0);
        attempt.setSubmittedAt(ZonedDateTime.now());
        if (submitDto.getTimeTakenSeconds() != null) {
            attempt.setTimeTakenSeconds(submitDto.getTimeTakenSeconds());
        }
        attemptRepository.save(attempt);

        // Compute Category-wise Scores
        List<AttemptCategoryScore> categoryScoresList = new ArrayList<>();
        List<CategoryScoreDto> categoryDtos = new ArrayList<>();
        List<WeakAreaSuggestionDto> weakAreasList = new ArrayList<>();

        for (Map.Entry<String, Integer> entry : categoryMaxMap.entrySet()) {
            String category = entry.getKey();
            int maxScore = entry.getValue();
            int earnedScore = categoryEarnedMap.getOrDefault(category, 0);
            double catPercentage = (maxScore > 0) ? ((double) earnedScore / maxScore) * 100.0 : 0.0;
            catPercentage = Math.round(catPercentage * 10.0) / 10.0;

            AttemptCategoryScore catScore = AttemptCategoryScore.builder()
                    .attempt(attempt)
                    .skillCategory(category)
                    .score(earnedScore)
                    .maxScore(maxScore)
                    .percentage(catPercentage)
                    .build();
            categoryScoresList.add(catScore);

            categoryDtos.add(CategoryScoreDto.builder()
                    .skillCategory(category)
                    .score(earnedScore)
                    .maxScore(maxScore)
                    .percentage(catPercentage)
                    .build());

            // Weak area detection threshold (< 60%)
            if (catPercentage < 60.0) {
                Optional<SuggestionConfig> suggestionOpt = suggestionConfigRepository
                        .findBySkillCategoryIgnoreCase(category);

                String suggestionText = suggestionOpt.map(SuggestionConfig::getSuggestionText)
                        .orElse("Score below threshold (60%). Review foundational material and practice more exercises in " + category + ".");
                String resourceLink = suggestionOpt.map(SuggestionConfig::getResourceLink)
                        .orElse("https://skillforge.ai/resources/" + category.toLowerCase().replaceAll("\\s+", "-"));

                weakAreasList.add(WeakAreaSuggestionDto.builder()
                        .skillCategory(category)
                        .scorePercentage(catPercentage)
                        .suggestionText(suggestionText)
                        .resourceLink(resourceLink)
                        .build());
            }
        }

        categoryScoreRepository.saveAll(categoryScoresList);

        // Past attempts history trend
        List<StudentTestAttempt> pastAttempts = attemptRepository.findByStudentUserIdAndTestIdOrderByStartedAtDesc(studentId, attempt.getTest().getId());
        List<AttemptHistorySummaryDto> historyDtos = pastAttempts.stream().map(pa -> AttemptHistorySummaryDto.builder()
                .attemptId(pa.getId())
                .testId(pa.getTest().getId())
                .testTitle(pa.getTest().getTitle())
                .testType(pa.getTest().getType())
                .startedAt(pa.getStartedAt())
                .submittedAt(pa.getSubmittedAt())
                .score(pa.getScore())
                .totalPoints(pa.getTotalPoints())
                .percentage(pa.getPercentage())
                .status(pa.getStatus())
                .build()
        ).collect(Collectors.toList());

        boolean isPassed = attempt.getPercentage() >= attempt.getTest().getPassingScore();

        return TestReportResponseDto.builder()
                .attemptId(attempt.getId())
                .testId(attempt.getTest().getId())
                .testTitle(attempt.getTest().getTitle())
                .testType(attempt.getTest().getType())
                .status(attempt.getStatus())
                .score(attempt.getScore())
                .totalPoints(attempt.getTotalPoints())
                .percentage(attempt.getPercentage())
                .isPassed(isPassed)
                .passingScore(attempt.getTest().getPassingScore())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .timeTakenSeconds(attempt.getTimeTakenSeconds())
                .categoryBreakdown(categoryDtos)
                .weakAreasWithSuggestions(weakAreasList)
                .pastAttemptTrend(historyDtos)
                .build();
    }

    /**
     * Retrieve full test report for an existing attempt.
     */
    @Transactional(readOnly = true)
    public TestReportResponseDto getAttemptReport(UUID attemptId, UUID studentId) {
        StudentTestAttempt attempt = attemptRepository.findByIdAndStudentUserId(attemptId, studentId)
                .orElseThrow(() -> new IllegalArgumentException("Test attempt not found or unauthorized"));

        List<AttemptCategoryScore> catScores = categoryScoreRepository.findByAttemptId(attemptId);
        List<CategoryScoreDto> categoryDtos = catScores.stream().map(cs -> CategoryScoreDto.builder()
                .skillCategory(cs.getSkillCategory())
                .score(cs.getScore())
                .maxScore(cs.getMaxScore())
                .percentage(cs.getPercentage())
                .build()
        ).collect(Collectors.toList());

        List<WeakAreaSuggestionDto> weakAreasList = new ArrayList<>();
        for (CategoryScoreDto cat : categoryDtos) {
            if (cat.getPercentage() < 60.0) {
                Optional<SuggestionConfig> suggestionOpt = suggestionConfigRepository
                        .findBySkillCategoryIgnoreCase(cat.getSkillCategory());

                String suggestionText = suggestionOpt.map(SuggestionConfig::getSuggestionText)
                        .orElse("Score below threshold (60%). Practice more exercises in " + cat.getSkillCategory() + ".");
                String resourceLink = suggestionOpt.map(SuggestionConfig::getResourceLink)
                        .orElse("https://skillforge.ai/resources/" + cat.getSkillCategory().toLowerCase().replaceAll("\\s+", "-"));

                weakAreasList.add(WeakAreaSuggestionDto.builder()
                        .skillCategory(cat.getSkillCategory())
                        .scorePercentage(cat.getPercentage())
                        .suggestionText(suggestionText)
                        .resourceLink(resourceLink)
                        .build());
            }
        }

        List<StudentTestAttempt> pastAttempts = attemptRepository.findByStudentUserIdAndTestIdOrderByStartedAtDesc(studentId, attempt.getTest().getId());
        List<AttemptHistorySummaryDto> historyDtos = pastAttempts.stream().map(pa -> AttemptHistorySummaryDto.builder()
                .attemptId(pa.getId())
                .testId(pa.getTest().getId())
                .testTitle(pa.getTest().getTitle())
                .testType(pa.getTest().getType())
                .startedAt(pa.getStartedAt())
                .submittedAt(pa.getSubmittedAt())
                .score(pa.getScore())
                .totalPoints(pa.getTotalPoints())
                .percentage(pa.getPercentage())
                .status(pa.getStatus())
                .build()
        ).collect(Collectors.toList());

        boolean isPassed = attempt.getPercentage() >= attempt.getTest().getPassingScore();

        return TestReportResponseDto.builder()
                .attemptId(attempt.getId())
                .testId(attempt.getTest().getId())
                .testTitle(attempt.getTest().getTitle())
                .testType(attempt.getTest().getType())
                .status(attempt.getStatus())
                .score(attempt.getScore())
                .totalPoints(attempt.getTotalPoints())
                .percentage(attempt.getPercentage())
                .isPassed(isPassed)
                .passingScore(attempt.getTest().getPassingScore())
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .timeTakenSeconds(attempt.getTimeTakenSeconds())
                .categoryBreakdown(categoryDtos)
                .weakAreasWithSuggestions(weakAreasList)
                .pastAttemptTrend(historyDtos)
                .build();
    }

    /**
     * Get test attempt history for student.
     */
    @Transactional(readOnly = true)
    public List<AttemptHistorySummaryDto> getStudentTestHistory(UUID studentId, String testType) {
        List<StudentTestAttempt> attempts;
        if (testType != null && !testType.isBlank()) {
            attempts = attemptRepository.findByStudentAndTestType(studentId, testType.toUpperCase());
        } else {
            attempts = attemptRepository.findByStudentUserIdOrderByStartedAtDesc(studentId);
        }

        return attempts.stream().map(pa -> AttemptHistorySummaryDto.builder()
                .attemptId(pa.getId())
                .testId(pa.getTest().getId())
                .testTitle(pa.getTest().getTitle())
                .testType(pa.getTest().getType())
                .startedAt(pa.getStartedAt())
                .submittedAt(pa.getSubmittedAt())
                .score(pa.getScore())
                .totalPoints(pa.getTotalPoints())
                .percentage(pa.getPercentage())
                .status(pa.getStatus())
                .build()
        ).collect(Collectors.toList());
    }

    // Helper methods for deserialization and profile management
    private TestAttemptViewDto buildAttemptViewFromPersistedOrder(StudentTestAttempt attempt) {
        List<Question> allQuestions = questionRepository.findByTestId(attempt.getTest().getId());
        Map<UUID, Question> questionMap = allQuestions.stream()
                .collect(Collectors.toMap(Question::getId, Function.identity()));

        List<UUID> questionOrderIds = Collections.emptyList();
        Map<String, List<UUID>> optionOrderMap = Collections.emptyMap();

        try {
            if (attempt.getQuestionOrder() != null) {
                questionOrderIds = objectMapper.readValue(attempt.getQuestionOrder(), new TypeReference<List<UUID>>() {});
            }
            if (attempt.getOptionOrder() != null) {
                optionOrderMap = objectMapper.readValue(attempt.getOptionOrder(), new TypeReference<Map<String, List<UUID>>>() {});
            }
        } catch (Exception e) {
            log.error("Failed to parse attempt order JSON for attempt: " + attempt.getId(), e);
        }

        List<Question> orderedQuestions = new ArrayList<>();
        if (!questionOrderIds.isEmpty()) {
            for (UUID qid : questionOrderIds) {
                if (questionMap.containsKey(qid)) {
                    orderedQuestions.add(questionMap.get(qid));
                }
            }
        } else {
            orderedQuestions = allQuestions;
        }

        return buildAttemptViewDto(attempt, orderedQuestions, optionOrderMap);
    }

    private TestAttemptViewDto buildAttemptViewDto(StudentTestAttempt attempt, List<Question> orderedQuestions, Map<String, List<UUID>> optionOrderMap) {
        List<QuestionViewDto> questionDtos = new ArrayList<>();

        for (Question q : orderedQuestions) {
            List<QuestionOption> options = q.getOptions();
            Map<UUID, QuestionOption> optMap = options.stream()
                    .collect(Collectors.toMap(QuestionOption::getId, Function.identity()));

            List<UUID> orderedOptIds = optionOrderMap.get(q.getId().toString());
            List<QuestionOption> orderedOptions = new ArrayList<>();

            if (orderedOptIds != null && !orderedOptIds.isEmpty()) {
                for (UUID optId : orderedOptIds) {
                    if (optMap.containsKey(optId)) {
                        orderedOptions.add(optMap.get(optId));
                    }
                }
            } else {
                orderedOptions = options;
            }

            List<QuestionOptionDto> optDtos = orderedOptions.stream()
                    .map(o -> QuestionOptionDto.builder()
                            .id(o.getId())
                            .optionText(o.getOptionText())
                            .build() // Note: isCorrect excluded for security
                    ).collect(Collectors.toList());

            questionDtos.add(QuestionViewDto.builder()
                    .id(q.getId())
                    .questionText(q.getQuestionText())
                    .type(q.getType())
                    .skillCategory(q.getSkillCategory())
                    .difficulty(q.getDifficulty())
                    .points(q.getPoints())
                    .options(optDtos)
                    .build());
        }

        return TestAttemptViewDto.builder()
                .attemptId(attempt.getId())
                .testId(attempt.getTest().getId())
                .testTitle(attempt.getTest().getTitle())
                .testType(attempt.getTest().getType())
                .durationMinutes(attempt.getTest().getDurationMinutes())
                .startedAt(attempt.getStartedAt())
                .status(attempt.getStatus())
                .questions(questionDtos)
                .build();
    }

    private StudentProfile getOrCreateStudentProfile(UUID studentId) {
        User user = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + studentId));

        return studentProfileRepository.findById(studentId)
                .orElseGet(() -> studentProfileRepository.save(StudentProfile.builder()
                        .userId(studentId)
                        .user(user)
                        .fullName(user.getEmail().split("@")[0])
                        .build()));
    }
}
