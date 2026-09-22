package com.skillforge.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptHistorySummaryDto {
    private UUID attemptId;
    private UUID testId;
    private String testTitle;
    private String testType;
    private ZonedDateTime startedAt;
    private ZonedDateTime submittedAt;
    private Integer score;
    private Integer totalPoints;
    private Double percentage;
    private String status;
}
