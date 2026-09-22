package com.skillforge.student.controller;

import com.skillforge.auth.security.CustomUserDetails;
import com.skillforge.common.response.ApiResponse;
import com.skillforge.student.dto.CodingTrackerSummaryDto;
import com.skillforge.student.dto.LogCodingStatsRequestDto;
import com.skillforge.student.service.CodingTrackerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class CodingTrackerController {

    private final CodingTrackerService codingTrackerService;

    @PostMapping({"/student/coding-tracker", "/students/{id}/coding-tracker"})
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CodingTrackerSummaryDto>> logCodingStats(
            @PathVariable(value = "id", required = false) UUID studentId,
            @Valid @RequestBody LogCodingStatsRequestDto request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        UUID targetId = (studentId != null) ? studentId : userDetails.getId();
        CodingTrackerSummaryDto response = codingTrackerService.logManualStats(targetId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Coding statistics logged successfully"));
    }

    @GetMapping({"/student/coding-tracker", "/students/{id}/coding-tracker"})
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CodingTrackerSummaryDto>> getCodingSummary(
            @PathVariable(value = "id", required = false) UUID studentId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        UUID targetId = (studentId != null) ? studentId : userDetails.getId();
        CodingTrackerSummaryDto response = codingTrackerService.getCodingSummary(targetId);
        return ResponseEntity.ok(ApiResponse.success(response, "Coding statistics summary retrieved successfully"));
    }

    @PostMapping("/student/coding-tracker/sync/github")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CodingTrackerSummaryDto>> syncGitHub(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        CodingTrackerSummaryDto response = codingTrackerService.syncGitHubStats(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "GitHub statistics synced successfully"));
    }

    @PostMapping("/student/coding-tracker/sync/leetcode")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CodingTrackerSummaryDto>> syncLeetCode(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        String username = body.getOrDefault("username", "candidate");
        CodingTrackerSummaryDto response = codingTrackerService.syncLeetCodeStub(userDetails.getId(), username);
        return ResponseEntity.ok(ApiResponse.success(response, "LeetCode statistics synced successfully"));
    }

    @PostMapping("/student/coding-tracker/sync/codeforces")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CodingTrackerSummaryDto>> syncCodeforces(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        String handle = body.getOrDefault("handle", "candidate");
        CodingTrackerSummaryDto response = codingTrackerService.syncCodeforcesStub(userDetails.getId(), handle);
        return ResponseEntity.ok(ApiResponse.success(response, "Codeforces statistics synced successfully"));
    }
}
