package com.skillforge.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

public class VoiceAssessmentDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StartSessionRequest {
        private String mode; // INTERVIEW, SENTENCE_REPEATING, NORMAL_SPEAKING
        private String targetRole;
        private String topic;
        private Integer sentenceCount; // User-selected sentence practice count (e.g. 3, 5, 8, 10)
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StartSessionResponse {
        private UUID attemptId;
        private String mode;
        private String initialAiQuestion;
        private int totalMaxTurns;
        private String targetSentence;
        private int currentSentenceIndex;
        private int totalSentences;
        private List<String> allSentences;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VoiceTurnRequest {
        private UUID attemptId;
        private String studentSpokenText;
        private Integer sentenceIndex;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VoiceTurnResponse {
        private UUID attemptId;
        private String aiQuestion;
        private int currentTurn;
        private int totalMaxTurns;
        private boolean isFinished;
        private List<TurnItem> transcriptHistory;

        // Sentence Repeating specifics
        private String targetSentence;
        private String spokenSentence;
        private int currentSentenceIndex;
        private int totalSentences;
        private double sentenceAccuracy; // 0 - 100%
        private List<String> matchedWords;
        private List<String> missedWords;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TurnItem {
        private String speaker; // "AI" or "STUDENT"
        private String text;
        private String timestamp;
        private Double accuracy;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitSessionRequest {
        private UUID attemptId;
    }
}
