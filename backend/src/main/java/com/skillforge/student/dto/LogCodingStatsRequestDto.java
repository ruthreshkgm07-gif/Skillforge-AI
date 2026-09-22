package com.skillforge.student.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogCodingStatsRequestDto {

    @NotBlank(message = "Platform is required (LEETCODE, CODEFORCES, GITHUB)")
    private String platform;

    @Min(value = 0, message = "Problems solved cannot be negative")
    private Integer problemsSolved;

    private Integer rating;
}
