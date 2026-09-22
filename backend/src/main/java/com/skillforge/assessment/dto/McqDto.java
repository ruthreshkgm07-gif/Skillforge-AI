package com.skillforge.assessment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public class McqDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TopicSummaryItem {
        private String category;
        private String topic;
        private long questionCount;
        private List<String> subtopics;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StartTestRequest {
        private List<String> topics;
        private Integer questionCount;
        private String difficulty;
        private Integer timerMinutes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionItem {
        private UUID id;
        private String category;
        private String topic;
        private String subtopic;
        private String difficulty;
        private String questionText;
        private List<String> options;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StartTestResponse {
        private UUID testAttemptId;
        private List<String> topics;
        private int questionCount;
        private int timerMinutes;
        private List<QuestionItem> questions;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitAnswerItem {
        private UUID questionId;
        private Integer selectedOption;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitTestRequest {
        private UUID testAttemptId;
        private List<SubmitAnswerItem> answers;
        private Integer timeTakenSeconds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionReviewItem {
        private UUID questionId;
        private String category;
        private String topic;
        private String questionText;
        private List<String> options;
        private Integer selectedOption;
        private Integer correctOption;
        private Boolean isCorrect;
        private String explanation;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestResultResponse {
        private UUID testAttemptId;
        private int score;
        private int totalQuestions;
        private double percentage;
        private boolean passed;
        private int timeTakenSeconds;
        private List<String> topics;
        private List<QuestionReviewItem> review;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttemptHistoryItem {
        private UUID attemptId;
        private String topic;
        private int score;
        private int totalPoints;
        private double percentage;
        private String status;
        private ZonedDateTime startedAt;
        private ZonedDateTime submittedAt;
    }
}
