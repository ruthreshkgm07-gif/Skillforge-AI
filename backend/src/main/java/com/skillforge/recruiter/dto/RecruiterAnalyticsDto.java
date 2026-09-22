package com.skillforge.recruiter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterAnalyticsDto {

    private Integer totalActiveJobs;
    private Integer totalApplicants;
    private Integer shortlistedCount;
    private Double avgMatchScore;

    private List<JobApplicationCount> applicationsPerJob;
    private List<MatchDistributionItem> matchDistribution;
    private List<ApplicantSkillGapItem> applicantSkillGaps;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class JobApplicationCount {
        private String jobTitle;
        private Integer applicantCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchDistributionItem {
        private String range; // e.g. "90-100%", "80-89%", "70-79%", "<70%"
        private Integer candidateCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicantSkillGapItem {
        private String skillName;
        private Integer missingCandidatesCount;
        private Double gapPercentage;
    }
}
