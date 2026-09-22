package com.skillforge.ai.dto;

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
public class InterviewSessionResponseDto {

    private UUID sessionId;
    private String targetRole;
    private Boolean isComplete;
    private Integer questionNumber;
    private Integer totalQuestions;
    private String currentQuestion;
    private List<TranscriptItem> transcript;
    private InterviewFeedbackDto feedback;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TranscriptItem {
        private Integer questionNumber;
        private String question;
        private String answer;
        private String askedAt;
    }
}
