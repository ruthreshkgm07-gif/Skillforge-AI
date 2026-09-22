package com.skillforge.recruiter.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCompanyRequestDto {

    @NotBlank(message = "Company name is required")
    private String name;

    private String logoUrl;
    private String industry;
    private String website;
    private String description;
    private String location;
}
