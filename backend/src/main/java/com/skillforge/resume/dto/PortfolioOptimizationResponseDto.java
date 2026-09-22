package com.skillforge.resume.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioOptimizationResponseDto {

    private UUID id;
    private UUID studentId;
    private String githubUrl;
    private Integer portfolioScore;
    private List<AlignmentIssue> alignmentIssues;
    private List<PinnedRepoSuggestion> pinnedRepoSuggestions;
    private List<MissingProjectSuggestion> missingProjectSuggestions;
    private List<ResumeRewriteSuggestion> resumeRewriteSuggestions;
    private GithubStatsSummary githubStats;
    private String analyzedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AlignmentIssue {
        private String issue;
        private String severity; // HIGH, MEDIUM, LOW
        private String fixSuggestion;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PinnedRepoSuggestion {
        private String repoName;
        private String reasonToFeature;
        private String targetSkillHighlight;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MissingProjectSuggestion {
        private String title;
        private String rationale;
        private List<String> techStack;
        private String alignedSkillGap;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResumeRewriteSuggestion {
        private String section;
        private String originalBullet;
        private String suggestedRewrite;
        private String githubEvidence;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GithubStatsSummary {
        private String username;
        private Integer publicReposCount;
        private Integer totalStars;
        private List<String> topLanguages;
        private Boolean hasReadmeSignal;
    }
}
