package com.skillforge.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionViewDto {
    private UUID id;
    private String questionText;
    private String type; // MCQ, FILL_IN_BLANK, SHORT_ANSWER
    private String skillCategory;
    private String difficulty;
    private Integer points;
    private List<QuestionOptionDto> options;
}
