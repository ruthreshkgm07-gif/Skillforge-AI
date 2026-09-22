package com.skillforge.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnswerInterviewRequestDto {

    @NotBlank(message = "Answer cannot be empty")
    private String answer;
}
