package com.skillforge.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestSummaryDto {
    private UUID id;
    private String title;
    private String description;
    private String type; // COMMUNICATION, MCQ
    private String moduleId;
    private Integer durationMinutes;
    private Integer passingScore;
    private Integer totalQuestions;
}
