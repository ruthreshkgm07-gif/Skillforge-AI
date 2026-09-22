package com.skillforge.student.controller;

import com.skillforge.auth.security.CustomUserDetails;
import com.skillforge.common.response.ApiResponse;
import com.skillforge.student.dto.StudentDashboardDto;
import com.skillforge.student.service.StudentDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/student/dashboard")
@RequiredArgsConstructor
public class StudentDashboardController {

    private final StudentDashboardService dashboardService;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentDashboardDto>> getDashboard(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        StudentDashboardDto data = dashboardService.getStudentDashboardData(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(data, "Student dashboard aggregated metrics fetched successfully"));
    }
}
