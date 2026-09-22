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
public class TestAttemptViewDto {
    private UUID attemptId;
    private UUID testId;
    private String testTitle;
    private String testType;
    private Integer durationMinutes;
    private ZonedDateTime startedAt;
    private String status;
    private List<QuestionViewDto> questions;
}
