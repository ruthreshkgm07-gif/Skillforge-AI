package com.skillforge.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitAnswerDto {
    private UUID questionId;
    private UUID selectedOptionId;
    private String answerText;
    private Integer timeTakenSeconds;
}
