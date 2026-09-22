package com.skillforge.student.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CodingTrackerSummaryDto {

    private Integer totalProblemsSolved;
    private Integer overallRating;
    private List<PlatformStatItem> platformStats;
    private List<TrendDataPoint> trendHistory;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PlatformStatItem {
        private String platform;
        private Integer problemsSolved;
        private Integer rating;
        private String lastSynced;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TrendDataPoint {
        private String date;
        private Integer totalProblems;
        private Integer leetcode;
        private Integer codeforces;
        private Integer githubCommits;
    }
}
