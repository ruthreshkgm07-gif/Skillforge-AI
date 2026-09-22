package com.skillforge.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestReportResponseDto {
    private UUID attemptId;
    private UUID testId;
    private String testTitle;
    private String testType;
    private String status;
    private Integer score;
    private Integer totalPoints;
    private Double percentage;
    private Boolean isPassed;
    private Integer passingScore;
    private ZonedDateTime startedAt;
    private ZonedDateTime submittedAt;
    private Integer timeTakenSeconds;
    private List<CategoryScoreDto> categoryBreakdown;
    private List<WeakAreaSuggestionDto> weakAreasWithSuggestions;
    private List<AttemptHistorySummaryDto> pastAttemptTrend;
}
