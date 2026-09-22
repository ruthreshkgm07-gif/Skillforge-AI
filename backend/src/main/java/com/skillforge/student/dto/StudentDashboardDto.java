package com.skillforge.student.dto;

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
public class StudentDashboardDto {

    private StudentSummary student;
    private ResumeSummary resume;
    private PlacementSummary placement;
    private CodingSummary coding;
    private List<SkillGapDto> topSkillGaps;
    private long unreadNotificationsCount;
    private RealtimeStatusDto realtimeStatus;
    private ReportAnalysisDto reportAnalysis;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentSummary {
        private UUID userId;
        private String fullName;
        private String email;
        private String targetRole;
        private String avatarUrl;
        private String headline;
        private int streakDays;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResumeSummary {
        private boolean hasResume;
        private UUID resumeId;
        private Integer atsScore;
        private Integer resumeScore;
        private String fileUrl;
        private String uploadedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlacementSummary {
        private BigDecimal probability;
        private BigDecimal predictedSalaryLpa;
        private String recommendation;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CodingSummary {
        private int leetcodeSolved;
        private int codeforcesRating;
        private int githubContributions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SkillGapDto {
        private String skillName;
        private String category;
        private int currentProficiency;
        private int requiredProficiency;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RealtimeStatusDto {
        private String lastActiveTime;
        private String currentTestTitle;
        private UUID currentAttemptId;
        private int testsCompletedToday;
        private int testsCompletedThisWeek;
        private int overallProgressPercentage;
        private int streakDays;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReportAnalysisDto {
        private double overallAverageScore;
        private int totalTestsCompleted;
        private double passRatePercentage;
        private List<ScoreTrendPointDto> scoreTrend;
        private List<CategoryPerformanceDto> categoryBreakdown;
        private List<StrengthAreaDto> strengths;
        private List<WeakAreaDto> weakAreas;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScoreTrendPointDto {
        private String date;
        private String testTitle;
        private String testType;
        private double scorePercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryPerformanceDto {
        private String category;
        private double averageScore;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StrengthAreaDto {
        private String category;
        private double scorePercentage;
        private String summary;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class WeakAreaDto {
        private String category;
        private double scorePercentage;
        private String suggestionText;
        private String resourceLink;
    }
}
