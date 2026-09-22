package com.skillforge.recruiter.controller;

import com.skillforge.recruiter.dto.MatchingWeightsDto;
import com.skillforge.auth.security.CustomUserDetails;
import com.skillforge.common.response.ApiResponse;
import com.skillforge.recruiter.dto.CreateJobRequestDto;
import com.skillforge.recruiter.dto.MatchedCandidateResponseDto;
import com.skillforge.recruiter.entity.Job;
import com.skillforge.recruiter.service.RecruiterJobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/recruiter")
@RequiredArgsConstructor
public class RecruiterJobController {

    private final RecruiterJobService recruiterJobService;

    @PostMapping("/jobs")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Job>> createJob(
            @Valid @RequestBody CreateJobRequestDto request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Job job = recruiterJobService.createJob(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(job, "Job posting created successfully with vector embedding"));
    }

    @GetMapping("/jobs")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<Job>>> getRecruiterJobs(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<Job> jobs = recruiterJobService.getRecruiterJobs(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(jobs, "Recruiter jobs retrieved successfully"));
    }

    @PutMapping("/jobs/{jobId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Job>> updateJob(
            @PathVariable("jobId") UUID jobId,
            @Valid @RequestBody CreateJobRequestDto request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Job job = recruiterJobService.updateJob(jobId, userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(job, "Job posting updated successfully"));
    }

    @DeleteMapping("/jobs/{jobId}")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteJob(
            @PathVariable("jobId") UUID jobId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        recruiterJobService.deleteJob(jobId, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Job posting deleted successfully", "Job deleted"));
    }

    @GetMapping("/jobs/{jobId}/candidates")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<MatchedCandidateResponseDto>>> getMatchedCandidates(
            @PathVariable("jobId") UUID jobId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<MatchedCandidateResponseDto> candidates = recruiterJobService.getMatchedCandidatesForJob(jobId, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(candidates, "Matched candidates retrieved using pgvector similarity"));
    }

    @PostMapping("/jobs/{jobId}/candidates/{studentId}/status")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> updateApplicationStatus(
            @PathVariable("jobId") UUID jobId,
            @PathVariable("studentId") UUID studentId,
            @RequestBody Map<String, String> body
    ) {
        String status = body.getOrDefault("status", "SHORTLISTED");
        recruiterJobService.updateApplicationStatus(studentId, jobId, status);
        return ResponseEntity.ok(ApiResponse.success("Candidate application status updated to " + status, "Status updated"));
    }

    @PostMapping("/matching-weights")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<MatchingWeightsDto>> updateMatchingWeights(
            @RequestBody MatchingWeightsDto weights
    ) {
        return ResponseEntity.ok(ApiResponse.success(weights, "Matching weights updated successfully for dynamic re-ranking"));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<com.skillforge.recruiter.dto.RecruiterAnalyticsDto>> getAnalytics(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        com.skillforge.recruiter.dto.RecruiterAnalyticsDto analytics = recruiterJobService.getRecruiterAnalytics(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(analytics, "Recruiter analytics metrics retrieved successfully"));
    }
}
