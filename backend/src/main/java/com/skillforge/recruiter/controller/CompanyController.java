package com.skillforge.recruiter.controller;

import com.skillforge.auth.security.CustomUserDetails;
import com.skillforge.common.response.ApiResponse;
import com.skillforge.recruiter.dto.CompanyDto;
import com.skillforge.recruiter.dto.UpdateCompanyRequestDto;
import com.skillforge.recruiter.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/recruiter/company")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CompanyDto>> getCompany(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        CompanyDto company = companyService.getCompanyForRecruiter(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(company, "Company profile retrieved successfully"));
    }

    @PutMapping
    @PreAuthorize("hasRole('RECRUITER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CompanyDto>> updateCompany(
            @Valid @RequestBody UpdateCompanyRequestDto request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        CompanyDto company = companyService.updateCompanyForRecruiter(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(company, "Company profile updated successfully"));
    }
}
