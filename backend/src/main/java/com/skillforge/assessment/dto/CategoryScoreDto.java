package com.skillforge.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryScoreDto {
    private String skillCategory;
    private Integer score;
    private Integer maxScore;
    private Double percentage;
}
