package com.skillforge.ml.dto;

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
public class PlacementPredictionResponseDto {

    private UUID id;
    private UUID studentId;
    private BigDecimal probability;
    private Integer placementPercentage;
    private BigDecimal predictedSalaryLpa;
    private String recommendation;
    private List<FactorItem> topFactors;
    private String predictedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FactorItem {
        private String feature;
        private String impact;
        private String plainLanguageExplanation;
    }
}
