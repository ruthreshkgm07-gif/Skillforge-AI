package com.skillforge.student.controller;

import com.skillforge.auth.security.CustomUserDetails;
import com.skillforge.common.response.ApiResponse;
import com.skillforge.student.dto.StudentProfileDto;
import com.skillforge.student.service.StudentProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/student/profile")
@RequiredArgsConstructor
public class StudentProfileController {

    private final StudentProfileService studentProfileService;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentProfileDto>> getProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        StudentProfileDto profile = studentProfileService.getProfile(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(profile, "Student profile fetched successfully"));
    }

    @PutMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<StudentProfileDto>> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody StudentProfileDto dto
    ) {
        StudentProfileDto updatedProfile = studentProfileService.updateProfile(userDetails.getId(), dto);
        return ResponseEntity.ok(ApiResponse.success(updatedProfile, "Student profile updated successfully"));
    }
}
