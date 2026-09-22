package com.skillforge.assessment.controller;

import com.skillforge.assessment.dto.McqDto;
import com.skillforge.assessment.service.McqService;
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
@RequestMapping("/mcq")
@RequiredArgsConstructor
public class McqController {

    private final McqService mcqService;

    @GetMapping("/topics")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<McqDto.TopicSummaryItem>>> getTopics() {
        List<McqDto.TopicSummaryItem> topics = mcqService.getTopics();
        return ResponseEntity.ok(ApiResponse.success(topics, "MCQ topic index retrieved successfully"));
    }

    @PostMapping("/start-test")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<McqDto.StartTestResponse>> startTest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody(required = false) McqDto.StartTestRequest request
    ) {
        McqDto.StartTestResponse response = mcqService.startTest(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Randomized MCQ assessment attempt created successfully"));
    }

    @PostMapping("/submit-test")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<McqDto.TestResultResponse>> submitTest(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody McqDto.SubmitTestRequest request
    ) {
        McqDto.TestResultResponse response = mcqService.submitTest(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "MCQ test evaluated successfully with detailed explanations review"));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<McqDto.AttemptHistoryItem>>> getHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<McqDto.AttemptHistoryItem> history = mcqService.getStudentHistory(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(history, "MCQ assessment history retrieved successfully"));
    }
}
