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
        private UUID runId;
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
        private UUID runId;
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
        private UUID runId;
        private UUID problemId;
        private String language;
        private String code;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FailedTestCaseDetail {
        private int testCaseNumber;
        private String input;
        private String expectedOutput;
        private String actualOutput;
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CodeQualityMetrics {
        private int correctness;      // 0-100
        private int readability;      // 0-100
        private int naming;           // 0-100
        private int structure;        // 0-100
        private int edgeCaseHandling; // 0-100
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComplexityMetrics {
        private String time;
        private String space;
        private long executionTimeMs;
        private long memoryUsedKb;
        private String explanation;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserSkillStatsDto {
        private int overallScore;          // 0-100
        private String level;              // Beginner, Intermediate, Advanced, Expert
        private int progressToNextLevel;   // 0-100%
        private String nextLevel;          // Intermediate, Advanced, Expert, Max Tier
        private int scoreMinForCurrentLevel;
        private int scoreMaxForCurrentLevel;
        private List<String> strongestTopics;
        private List<String> weakestTopics;
        private int totalSolved;
        private int easySolved;
        private int mediumSolved;
        private int hardSolved;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmissionFeedbackDto {
        private String status;           // PASSED, FAILED
        private int score;               // 0-100
        private int testsPassed;
        private int testsTotal;
        private List<FailedTestCaseDetail> failedTestCases;
        private CodeQualityMetrics codeQuality;
        private List<String> strengths;
        private List<String> improvements;
        private ComplexityMetrics complexity;
        private String suggestion;       // Encouraging, beginner-friendly advice
        private String hint;             // Cleaner or optimized approach hint
        private String level;            // Beginner, Intermediate, Advanced, Expert
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SubmitCodeResponse {
        private UUID submissionId;
        private UUID runId;
        private String status; // PASSED, FAILED
        private int score;
        private int testCasesPassed;
        private int totalTestCases;
        private int topicSolvedCount;
        private boolean triggerMcqCheck; // true if threshold (e.g. 3 problems) reached for topic
        private String mcqTopic;
        private SubmissionFeedbackDto feedback;
        private UserSkillStatsDto userSkillStats;
    }
}
