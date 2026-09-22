package com.skillforge.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartInterviewRequestDto {

    @NotBlank(message = "Target role is required")
    private String targetRole;

    private UUID jobId;

    private String difficultyLevel; // e.g. "MID", "HARD"
}
