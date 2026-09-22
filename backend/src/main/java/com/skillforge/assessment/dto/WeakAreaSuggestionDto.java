package com.skillforge.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WeakAreaSuggestionDto {
    private String skillCategory;
    private Double scorePercentage;
    private String suggestionText;
    private String resourceLink;
}
