package com.skillforge.assessment.controller;

import com.skillforge.assessment.dto.TestReportResponseDto;
import com.skillforge.assessment.dto.VoiceAssessmentDto;
import com.skillforge.assessment.service.VoiceAssessmentService;
import com.skillforge.auth.security.CustomUserDetails;
import com.skillforge.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/tests/voice")
@RequiredArgsConstructor
public class VoiceAssessmentController {

    private final VoiceAssessmentService voiceAssessmentService;

    @PostMapping("/start")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VoiceAssessmentDto.StartSessionResponse>> startVoiceSession(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody VoiceAssessmentDto.StartSessionRequest request
    ) {
        VoiceAssessmentDto.StartSessionResponse response = voiceAssessmentService.startVoiceSession(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Voice AI session started successfully"));
    }

    @PostMapping("/turn")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VoiceAssessmentDto.VoiceTurnResponse>> processVoiceTurn(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody VoiceAssessmentDto.VoiceTurnRequest request
    ) {
        VoiceAssessmentDto.VoiceTurnResponse response = voiceAssessmentService.processVoiceTurn(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Voice turn processed successfully"));
    }

    @PostMapping("/submit/{attemptId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TestReportResponseDto>> submitVoiceSession(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID attemptId
    ) {
        TestReportResponseDto report = voiceAssessmentService.submitVoiceSession(userDetails.getId(), attemptId);
        return ResponseEntity.ok(ApiResponse.success(report, "Voice session submitted and report evaluated successfully"));
    }
}
