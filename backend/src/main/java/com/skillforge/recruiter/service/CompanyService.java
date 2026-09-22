package com.skillforge.recruiter.service;

import com.skillforge.auth.entity.User;
import com.skillforge.auth.repository.UserRepository;
import com.skillforge.common.exception.AuthException;
import com.skillforge.recruiter.dto.CompanyDto;
import com.skillforge.recruiter.dto.UpdateCompanyRequestDto;
import com.skillforge.recruiter.entity.Company;
import com.skillforge.recruiter.entity.RecruiterProfile;
import com.skillforge.recruiter.repository.CompanyRepository;
import com.skillforge.recruiter.repository.RecruiterProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final RecruiterProfileRepository recruiterProfileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public CompanyDto getCompanyForRecruiter(UUID recruiterUserId) {
        RecruiterProfile recruiter = recruiterProfileRepository.findById(recruiterUserId)
                .orElse(null);

        Company company;
        if (recruiter != null && recruiter.getCompany() != null) {
            company = recruiter.getCompany();
        } else {
            company = companyRepository.findAll().stream().findFirst()
                    .orElseGet(() -> companyRepository.save(Company.builder()
                            .name("SkillForge Enterprise Partners")
                            .industry("Technology & Software")
                            .location("San Francisco, CA & Remote")
                            .description("Leading tech enterprise hiring top engineering talent.")
                            .build()));
        }

        return mapToDto(company);
    }

    @Transactional
    public CompanyDto updateCompanyForRecruiter(UUID recruiterUserId, UpdateCompanyRequestDto request) {
        CompanyDto current = getCompanyForRecruiter(recruiterUserId);
        Company company = companyRepository.findById(current.getId())
                .orElseThrow(() -> new RuntimeException("Company entity not found"));

        company.setName(request.getName());
        if (request.getLogoUrl() != null) company.setLogoUrl(request.getLogoUrl());
        if (request.getIndustry() != null) company.setIndustry(request.getIndustry());
        if (request.getWebsite() != null) company.setWebsite(request.getWebsite());
        if (request.getDescription() != null) company.setDescription(request.getDescription());
        if (request.getLocation() != null) company.setLocation(request.getLocation());

        company = companyRepository.save(company);
        log.info("Recruiter {} updated company profile {}", recruiterUserId, company.getId());
        return mapToDto(company);
    }

    private CompanyDto mapToDto(Company c) {
        return CompanyDto.builder()
                .id(c.getId())
                .name(c.getName())
                .logoUrl(c.getLogoUrl())
                .industry(c.getIndustry())
                .website(c.getWebsite())
                .description(c.getDescription())
                .location(c.getLocation())
                .build();
    }
}
