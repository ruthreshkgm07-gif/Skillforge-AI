package com.skillforge.assessment.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitTestRequestDto {

    @NotNull(message = "Answers list is required")
    private List<SubmitAnswerDto> answers;

    private Integer timeTakenSeconds;
}
