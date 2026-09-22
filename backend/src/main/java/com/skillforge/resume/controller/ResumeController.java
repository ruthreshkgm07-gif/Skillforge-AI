package com.skillforge.resume.controller;

import com.skillforge.auth.security.CustomUserDetails;
import com.skillforge.common.response.ApiResponse;
import com.skillforge.resume.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/resume")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadResume(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Map<String, Object> result = resumeService.uploadAndAnalyzeResume(file, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(result, "Resume uploaded and analyzed successfully"));
    }

    @GetMapping("/latest")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getLatestAnalysis(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Map<String, Object> result = resumeService.getLatestAnalysis(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(result, "Latest resume analysis retrieved"));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getResumeHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<Map<String, Object>> history = resumeService.getResumeHistory(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(history, "Resume upload history fetched"));
    }
}
