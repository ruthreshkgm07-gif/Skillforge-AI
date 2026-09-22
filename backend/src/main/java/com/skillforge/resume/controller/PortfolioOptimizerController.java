package com.skillforge.resume.controller;

import com.skillforge.auth.security.CustomUserDetails;
import com.skillforge.common.response.ApiResponse;
import com.skillforge.resume.dto.AnalyzePortfolioRequestDto;
import com.skillforge.resume.dto.PortfolioOptimizationResponseDto;
import com.skillforge.resume.service.PortfolioOptimizerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class PortfolioOptimizerController {

    private final PortfolioOptimizerService portfolioOptimizerService;

    @PostMapping({"/student/portfolio-optimizer/analyze", "/students/{id}/portfolio-optimizer/analyze"})
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PortfolioOptimizationResponseDto>> analyzePortfolio(
            @PathVariable(value = "id", required = false) UUID studentId,
            @RequestBody(required = false) AnalyzePortfolioRequestDto request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        UUID targetId = (studentId != null) ? studentId : userDetails.getId();
        String githubUrl = request != null ? request.getGithubUrl() : null;
        PortfolioOptimizationResponseDto response = portfolioOptimizerService.analyzePortfolio(targetId, githubUrl);
        return ResponseEntity.ok(ApiResponse.success(response, "Portfolio and resume cross-analysis completed successfully"));
    }

    @GetMapping({"/student/portfolio-optimizer", "/students/{id}/portfolio-optimizer"})
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PortfolioOptimizationResponseDto>> getLatestOptimization(
            @PathVariable(value = "id", required = false) UUID studentId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        UUID targetId = (studentId != null) ? studentId : userDetails.getId();
        PortfolioOptimizationResponseDto response = portfolioOptimizerService.getLatestOptimization(targetId);
        return ResponseEntity.ok(ApiResponse.success(response, "Latest portfolio optimization report retrieved successfully"));
    }
}
