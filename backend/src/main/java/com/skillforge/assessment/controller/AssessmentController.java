package com.skillforge.assessment.controller;

import com.skillforge.assessment.dto.*;
import com.skillforge.assessment.service.AssessmentService;
import com.skillforge.auth.security.CustomUserDetails;
import com.skillforge.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/tests")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<TestSummaryDto>>> getAvailableTests(
            @RequestParam(name = "type", required = false) String type,
            @RequestParam(name = "moduleId", required = false) String moduleId
    ) {
        List<TestSummaryDto> tests = assessmentService.getAvailableTests(type, moduleId);
        return ResponseEntity.ok(ApiResponse.success(tests, "Available tests retrieved successfully"));
    }

    @GetMapping("/topics")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN') or hasRole('RECRUITER')")
    public ResponseEntity<ApiResponse<List<String>>> getAvailableTopics(
            @RequestParam(name = "type", required = false, defaultValue = "MCQ") String testType
    ) {
        List<String> topics = assessmentService.getAvailableTopics(testType);
        return ResponseEntity.ok(ApiResponse.success(topics, "Available assessment topics fetched successfully"));
    }

    @PostMapping("/{id}/start")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TestAttemptViewDto>> startTestAttempt(
            @PathVariable("id") UUID testId,
            @RequestParam(name = "topic", required = false) String topic,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        TestAttemptViewDto attemptView = assessmentService.startAttempt(testId, userDetails.getId(), topic);
        return ResponseEntity.ok(ApiResponse.success(attemptView, "Test attempt started successfully with topic filtering and question shuffling"));
    }

    @GetMapping("/attempt/{attemptId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TestAttemptViewDto>> getAttemptQuestions(
            @PathVariable("attemptId") UUID attemptId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        TestAttemptViewDto attemptView = assessmentService.getAttemptQuestions(attemptId, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(attemptView, "Attempt questions retrieved successfully"));
    }

    @PostMapping("/attempt/{attemptId}/submit")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TestReportResponseDto>> submitAttempt(
            @PathVariable("attemptId") UUID attemptId,
            @Valid @RequestBody SubmitTestRequestDto submitDto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        TestReportResponseDto report = assessmentService.submitAttempt(attemptId, userDetails.getId(), submitDto);
        return ResponseEntity.ok(ApiResponse.success(report, "Test submitted and evaluated successfully"));
    }

    @GetMapping("/attempt/{attemptId}/report")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TestReportResponseDto>> getAttemptReport(
            @PathVariable("attemptId") UUID attemptId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        TestReportResponseDto report = assessmentService.getAttemptReport(attemptId, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(report, "Test report retrieved successfully"));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AttemptHistorySummaryDto>>> getStudentHistory(
            @RequestParam(name = "testType", required = false) String testType,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<AttemptHistorySummaryDto> history = assessmentService.getStudentTestHistory(userDetails.getId(), testType);
        return ResponseEntity.ok(ApiResponse.success(history, "Test history retrieved successfully"));
    }
}
