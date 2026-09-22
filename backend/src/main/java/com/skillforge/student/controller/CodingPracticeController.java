package com.skillforge.student.controller;

import com.skillforge.auth.security.CustomUserDetails;
import com.skillforge.common.response.ApiResponse;
import com.skillforge.student.dto.CodingPracticeDto;
import com.skillforge.student.service.CodingPracticeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/student/coding/practice")
@RequiredArgsConstructor
public class CodingPracticeController {

    private final CodingPracticeService codingPracticeService;

    @GetMapping("/problems")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CodingPracticeDto.ProblemSummaryItem>>> getProblems(
            @RequestParam(name = "topic", required = false) String topic,
            @RequestParam(name = "difficulty", required = false) String difficulty
    ) {
        List<CodingPracticeDto.ProblemSummaryItem> problems = codingPracticeService.getProblems(topic, difficulty);
        return ResponseEntity.ok(ApiResponse.success(problems, "Coding practice problems fetched successfully"));
    }

    @GetMapping("/problems/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CodingPracticeDto.ProblemDetailResponse>> getProblemDetails(
            @PathVariable("id") UUID problemId
    ) {
        CodingPracticeDto.ProblemDetailResponse problem = codingPracticeService.getProblemDetails(problemId);
        return ResponseEntity.ok(ApiResponse.success(problem, "Coding problem details fetched successfully"));
    }

    @PostMapping("/run")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CodingPracticeDto.RunCodeResponse>> runCode(
            @Valid @RequestBody CodingPracticeDto.RunCodeRequest request
    ) {
        CodingPracticeDto.RunCodeResponse response = codingPracticeService.runCode(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Code executed successfully"));
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CodingPracticeDto.SubmitCodeResponse>> submitCode(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CodingPracticeDto.SubmitCodeRequest request
    ) {
        CodingPracticeDto.SubmitCodeResponse response = codingPracticeService.submitCode(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Coding challenge submission evaluated successfully"));
    }
}
