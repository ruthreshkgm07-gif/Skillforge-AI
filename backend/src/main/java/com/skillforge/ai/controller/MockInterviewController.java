package com.skillforge.ai.controller;

import com.skillforge.ai.dto.AnswerInterviewRequestDto;
import com.skillforge.ai.dto.InterviewSessionResponseDto;
import com.skillforge.ai.dto.StartInterviewRequestDto;
import com.skillforge.ai.service.MockInterviewService;
import com.skillforge.auth.security.CustomUserDetails;
import com.skillforge.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/ai/interview")
@RequiredArgsConstructor
public class MockInterviewController {

    private final MockInterviewService mockInterviewService;

    @PostMapping("/start")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InterviewSessionResponseDto>> startInterview(
            @Valid @RequestBody StartInterviewRequestDto request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        InterviewSessionResponseDto response = mockInterviewService.startSession(
                userDetails.getId(),
                request.getTargetRole(),
                request.getJobId()
        );
        return ResponseEntity.ok(ApiResponse.success(response, "AI mock interview session started successfully"));
    }

    @PostMapping("/{sessionId}/answer")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InterviewSessionResponseDto>> submitAnswer(
            @PathVariable("sessionId") UUID sessionId,
            @Valid @RequestBody AnswerInterviewRequestDto request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        InterviewSessionResponseDto response = mockInterviewService.answerQuestion(
                sessionId,
                userDetails.getId(),
                request.getAnswer()
        );
        return ResponseEntity.ok(ApiResponse.success(response, "Answer submitted successfully"));
    }

    @GetMapping("/{sessionId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InterviewSessionResponseDto>> getInterviewSession(
            @PathVariable("sessionId") UUID sessionId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        InterviewSessionResponseDto response = mockInterviewService.getSession(sessionId, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Interview session retrieved successfully"));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<java.util.List<java.util.Map<String, Object>>>> getInterviewHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        java.util.List<java.util.Map<String, Object>> history = mockInterviewService.getStudentInterviewHistory(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(history, "Interview session history retrieved successfully"));
    }
}
