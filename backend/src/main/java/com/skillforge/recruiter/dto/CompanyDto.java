package com.skillforge.recruiter.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDto {

    private UUID id;
    private String name;
    private String logoUrl;
    private String industry;
    private String website;
    private String description;
    private String location;
}
