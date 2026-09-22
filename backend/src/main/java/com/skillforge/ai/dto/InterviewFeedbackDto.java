package com.skillforge.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterviewFeedbackDto {

    private Integer overallScore;
    private Integer communicationScore;
    private Integer technicalScore;
    private Integer problemSolvingScore;
    private Integer roleAlignmentScore;
    private List<String> strengths;
    private List<String> areasToImprove;
    private List<PerQuestionFeedback> sampleBetterAnswers;

    // Feature 3 Voice Analysis & Speech Metrics Fields
    private Integer clarityScore;
    private String speakingPace;
    private Integer fillerWordsCount;
    private List<String> detectedFillerWords;
    private Integer confidenceScore;
    private String voiceAnalysisSummary;
    private List<String> suggestedNextSteps;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PerQuestionFeedback {
        private Integer questionNumber;
        private String question;
        private String candidateAnswer;
        private String critique;
        private String suggestedResponse;
    }
}
