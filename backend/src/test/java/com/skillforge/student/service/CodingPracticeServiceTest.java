package com.skillforge.student.service;

import com.skillforge.student.dto.CodingPracticeDto;
import com.skillforge.student.entity.CodingProblem;
import com.skillforge.student.entity.StudentCodingSubmission;
import com.skillforge.student.entity.StudentProfile;
import com.skillforge.student.repository.CodingProblemRepository;
import com.skillforge.student.repository.StudentCodingSubmissionRepository;
import com.skillforge.student.repository.StudentProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;
import java.util.concurrent.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CodingPracticeServiceTest {

    @Mock
    private CodingProblemRepository problemRepository;

    @Mock
    private StudentCodingSubmissionRepository submissionRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private CodingTrackerService codingTrackerService;

    @Mock
    private StudentProfileService studentProfileService;

    @InjectMocks
    private CodingPracticeService codingPracticeService;

    private UUID sampleProblemId;
    private CodingProblem sampleProblem;
    private UUID studentId;
    private StudentProfile studentProfile;

    @BeforeEach
    void setUp() {
        sampleProblemId = UUID.randomUUID();
        sampleProblem = CodingProblem.builder()
                .id(sampleProblemId)
                .title("Two Sum Target")
                .topic("Arrays")
                .difficulty("EASY")
                .description("Find two numbers that add to target")
                .sampleInput("[2, 7, 11, 15], target = 9")
                .sampleOutput("[0, 1]")
                .testCasesJson("[{\"input\":\"[2,7,11,15], 9\",\"expectedOutput\":\"[0, 1]\"}]")
                .build();

        studentId = UUID.randomUUID();
        studentProfile = StudentProfile.builder()
                .userId(studentId)
                .fullName("Alice Developer")
                .codingScore(35)
                .codingLevel("Beginner")
                .build();
    }

    @Test
    @DisplayName("Problem 1: Two different programs run back-to-back assert each gets its own correct output and distinct runId")
    void testBackToBackRunsGetOwnOutput() {
        UUID runId1 = UUID.randomUUID();
        String code1 = "print('PROGRAM_1_UNIQUE_ALPHA_OUTPUT_8877')";
        CodingPracticeDto.RunCodeRequest req1 = CodingPracticeDto.RunCodeRequest.builder()
                .runId(runId1)
                .language("python")
                .code(code1)
                .build();

        CodingPracticeDto.RunCodeResponse res1 = codingPracticeService.runCode(req1);

        assertNotNull(res1, "Response 1 must not be null");
        assertEquals(runId1, res1.getRunId(), "Response 1 must echo runId 1");
        assertTrue(res1.isSuccess(), "Execution 1 should succeed");
        assertTrue(res1.getOutput().contains("PROGRAM_1_UNIQUE_ALPHA_OUTPUT_8877"), "Output 1 must contain program 1 token");
        assertFalse(res1.getOutput().contains("PROGRAM_2_UNIQUE_BETA_OUTPUT_9944"), "Output 1 must NOT contain program 2 token");

        UUID runId2 = UUID.randomUUID();
        String code2 = "print('PROGRAM_2_UNIQUE_BETA_OUTPUT_9944')";
        CodingPracticeDto.RunCodeRequest req2 = CodingPracticeDto.RunCodeRequest.builder()
                .runId(runId2)
                .language("python")
                .code(code2)
                .build();

        CodingPracticeDto.RunCodeResponse res2 = codingPracticeService.runCode(req2);

        assertNotNull(res2, "Response 2 must not be null");
        assertEquals(runId2, res2.getRunId(), "Response 2 must echo runId 2");
        assertTrue(res2.isSuccess(), "Execution 2 should succeed");
        assertTrue(res2.getOutput().contains("PROGRAM_2_UNIQUE_BETA_OUTPUT_9944"), "Output 2 must contain program 2 token");
        assertFalse(res2.getOutput().contains("PROGRAM_1_UNIQUE_ALPHA_OUTPUT_8877"), "Output 2 must NOT contain program 1 token");
    }

    @Test
    @DisplayName("Problem 1: Concurrent executions of different programs maintain full sandbox isolation without cross-contamination")
    void testConcurrentRunsGetOwnOutput() throws InterruptedException, ExecutionException {
        int concurrencyLevel = 8;
        ExecutorService executor = Executors.newFixedThreadPool(concurrencyLevel);
        List<Callable<CodingPracticeDto.RunCodeResponse>> tasks = new ArrayList<>();
        List<UUID> expectedRunIds = new ArrayList<>();

        for (int i = 0; i < concurrencyLevel; i++) {
            final int index = i;
            final UUID runId = UUID.randomUUID();
            expectedRunIds.add(runId);
            final String uniqueMarker = "CONCURRENT_THREAD_MARKER_" + index + "_" + UUID.randomUUID().toString().substring(0, 8);

            tasks.add(() -> {
                CodingPracticeDto.RunCodeRequest request = CodingPracticeDto.RunCodeRequest.builder()
                        .runId(runId)
                        .language("python")
                        .code("print('" + uniqueMarker + "')")
                        .build();
                return codingPracticeService.runCode(request);
            });
        }

        List<Future<CodingPracticeDto.RunCodeResponse>> futures = executor.invokeAll(tasks);
        Set<UUID> receivedRunIds = new HashSet<>();

        for (int i = 0; i < concurrencyLevel; i++) {
            CodingPracticeDto.RunCodeResponse response = futures.get(i).get();
            assertNotNull(response, "Response should not be null");
            assertTrue(response.isSuccess(), "Concurrent execution should succeed");
            assertEquals(expectedRunIds.get(i), response.getRunId(), "Run ID must match request exactly");
            receivedRunIds.add(response.getRunId());

            String out = response.getOutput();
            assertTrue(out.contains("CONCURRENT_THREAD_MARKER_" + i + "_"), "Output must contain its own unique marker");

            // Verify no other thread's marker leaked into this output
            for (int other = 0; other < concurrencyLevel; other++) {
                if (other != i) {
                    assertFalse(out.contains("CONCURRENT_THREAD_MARKER_" + other + "_"),
                            "Thread " + i + " output leaked data from thread " + other);
                }
            }
        }

        assertEquals(concurrencyLevel, receivedRunIds.size(), "All run IDs must be unique");
        executor.shutdown();
    }

    @Test
    @DisplayName("Problem 2: Submission evaluation returns structured JSON feedback with code quality, test cases, and suggestions")
    void testSubmitCodeGeneratesStructuredFeedback() {
        when(problemRepository.findById(sampleProblemId)).thenReturn(Optional.of(sampleProblem));
        when(studentProfileRepository.findById(studentId)).thenReturn(Optional.of(studentProfile));
        when(submissionRepository.findByStudentUserIdOrderBySubmittedAtDesc(studentId)).thenReturn(Collections.emptyList());
        when(submissionRepository.save(any(StudentCodingSubmission.class))).thenAnswer(invocation -> {
            StudentCodingSubmission sub = invocation.getArgument(0);
            sub.setId(UUID.randomUUID());
            return sub;
        });

        String userCode = """
                def two_sum(nums, target):
                    # Linear scan using dictionary lookup
                    seen = {}
                    for i, num in enumerate(nums):
                        diff = target - num
                        if diff in seen:
                            return [seen[diff], i]
                        seen[num] = i
                    return []
                print('[0, 1]')
                """;

        CodingPracticeDto.SubmitCodeRequest submitReq = CodingPracticeDto.SubmitCodeRequest.builder()
                .runId(UUID.randomUUID())
                .problemId(sampleProblemId)
                .language("python")
                .code(userCode)
                .build();

        CodingPracticeDto.SubmitCodeResponse response = codingPracticeService.submitCode(studentId, submitReq);

        assertNotNull(response, "Submit response must not be null");
        assertNotNull(response.getSubmissionId(), "Submission ID must be generated");
        assertNotNull(response.getFeedback(), "Feedback object must be present");

        CodingPracticeDto.SubmissionFeedbackDto feedback = response.getFeedback();
        assertEquals("PASSED", feedback.getStatus(), "Status should be PASSED");
        assertTrue(feedback.getScore() > 0, "Score should be calculated");
        assertTrue(feedback.getTestsPassed() >= 1, "Test cases should pass");

        // Code quality metrics
        assertNotNull(feedback.getCodeQuality(), "Code quality metrics must be provided");
        assertTrue(feedback.getCodeQuality().getCorrectness() > 0);
        assertTrue(feedback.getCodeQuality().getReadability() > 0);
        assertTrue(feedback.getCodeQuality().getNaming() > 0);
        assertTrue(feedback.getCodeQuality().getStructure() > 0);
        assertTrue(feedback.getCodeQuality().getEdgeCaseHandling() > 0);

        // Strengths & Improvements & Complexity
        assertNotNull(feedback.getStrengths());
        assertFalse(feedback.getStrengths().isEmpty(), "Strengths should not be empty");
        assertNotNull(feedback.getComplexity());
        assertNotNull(feedback.getComplexity().getTime());
        assertNotNull(feedback.getSuggestion(), "Encouraging suggestion must be present");
        assertNotNull(feedback.getHint(), "Approach hint must be present");

        verify(submissionRepository, times(1)).save(any(StudentCodingSubmission.class));
    }

    @Test
    @DisplayName("Problem 3: User skill level, progress to next tier, and difficulty stats are computed and updated in DB")
    void testComputeAndUpdateUserSkillLevel() {
        when(studentProfileRepository.findById(studentId)).thenReturn(Optional.of(studentProfile));

        // Mock historical submissions
        CodingProblem easyProblem = CodingProblem.builder()
                .id(UUID.randomUUID()).title("Bit XOR").topic("Bit Manipulation").difficulty("EASY").build();
        CodingProblem mediumProblem = CodingProblem.builder()
                .id(UUID.randomUUID()).title("Queue Stacks").topic("Queues").difficulty("MEDIUM").build();

        StudentCodingSubmission sub1 = StudentCodingSubmission.builder()
                .id(UUID.randomUUID()).problem(easyProblem).status("PASSED").score(85).build();
        StudentCodingSubmission sub2 = StudentCodingSubmission.builder()
                .id(UUID.randomUUID()).problem(mediumProblem).status("PASSED").score(65).build();

        when(submissionRepository.findByStudentUserIdOrderBySubmittedAtDesc(studentId))
                .thenReturn(List.of(sub1, sub2));

        CodingPracticeDto.UserSkillStatsDto stats = codingPracticeService.computeAndUpdateUserSkillLevel(
                studentId, 75, mediumProblem
        );

        assertNotNull(stats);
        assertEquals(75, stats.getOverallScore(), "Average of 85 and 65 is 75");
        assertEquals("Advanced", stats.getLevel(), "Score 75 should be in Advanced tier (70-89)");
        assertEquals("Expert", stats.getNextLevel(), "Next tier for Advanced should be Expert");
        assertTrue(stats.getProgressToNextLevel() >= 0 && stats.getProgressToNextLevel() <= 100);
        assertEquals(2, stats.getTotalSolved(), "Should have 2 solved problems");
        assertEquals(1, stats.getEasySolved(), "1 Easy solved");
        assertEquals(1, stats.getMediumSolved(), "1 Medium solved");
        assertFalse(stats.getStrongestTopics().isEmpty(), "Strongest topics should be identified");

        // Verify StudentProfile was updated and saved
        verify(studentProfileRepository, atLeastOnce()).save(argThat(profile ->
                profile.getCodingScore() == 75 && "Advanced".equals(profile.getCodingLevel())
        ));
    }
}
