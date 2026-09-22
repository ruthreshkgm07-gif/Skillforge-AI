package com.skillforge.recruiter.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateJobRequestDto {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Required skills list cannot be empty")
    private List<String> requiredSkills;

    @NotNull(message = "Minimum experience is required")
    private Integer minExperience;

    @NotBlank(message = "Location is required")
    private String location;

    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String employmentType; // FULL_TIME, PART_TIME, INTERNSHIP, CONTRACT
}
