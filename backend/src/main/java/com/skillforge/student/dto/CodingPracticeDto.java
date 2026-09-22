package com.skillforge.student.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

public class CodingPracticeDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProblemSummaryItem {
        private UUID id;
        private String topic;
        private String title;
        private String difficulty;
        private String description;
        private String sampleInput;
        private String sampleOutput;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProblemDetailResponse {
        private UUID id;
        private String topic;
        private String title;
        private String difficulty;
        private String description;
        private String constraintsText;
        private String sampleInput;
        private String sampleOutput;
        private String starterCodeJava;
        private String starterCodePython;
        private String starterCodeJs;
        private String starterCodeCpp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RunCodeRequest {
        private UUID problemId;
        private String language;
        private String code;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestCaseItem {
        private int testCaseNumber;
        private String input;
        private String expectedOutput;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TestCaseResult {
        private int testCaseNumber;
        private String input;
        private String expectedOutput;
        private String actualOutput;
        private boolean passed;
        private String status; // PASSED, FAILED, ERROR
        private Long executionTimeMs;
        private String errorMessage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RunCodeResponse {
        private boolean success;
        private String output;
        private long executionTimeMs;
        private int testCasesPassed;
        private int totalTestCases;
        private String error;
        private Integer errorLine;
        private String errorType;
        private String timeComplexity;
        private String spaceComplexity;
        private String complexityExplanation;
        private List<TestCaseResult> testCaseResults;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitCodeRequest {
        private UUID problemId;
        private String language;
        private String code;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitCodeResponse {
        private UUID submissionId;
        private String status; // PASSED, FAILED
        private int score;
        private int testCasesPassed;
        private int totalTestCases;
        private int topicSolvedCount;
        private boolean triggerMcqCheck; // true if threshold (e.g. 3 problems) reached for topic
        private String mcqTopic;
    }
}
