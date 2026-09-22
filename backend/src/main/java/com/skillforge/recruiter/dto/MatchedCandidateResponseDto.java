package com.skillforge.recruiter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchedCandidateResponseDto {

    private UUID studentId;
    private String fullName;
    private String headline;
    private String avatarUrl;
    private String targetRole;
    private BigDecimal matchScore;
    private String matchType;
    private String aiFitExplanation; // Gemini-generated 2-3 sentence recruiter rationale
    private String resumeUrl;
    private String applicationStatus; // NOT_APPLIED, APPLIED, SHORTLISTED, REJECTED, HIRED
    private List<String> topSkills;
}
