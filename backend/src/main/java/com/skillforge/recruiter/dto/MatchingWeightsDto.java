package com.skillforge.recruiter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MatchingWeightsDto {

    private Double skillWeight; // e.g. 0.50
    private Double experienceWeight; // e.g. 0.30
    private Double locationWeight; // e.g. 0.20
}
