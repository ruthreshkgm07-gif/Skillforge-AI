package com.skillforge.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;

public class CodingExplanationDto {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExplainRequest {
        @NotBlank(message = "Programming language is required")
        private String language;

        @NotBlank(message = "Topic is required")
        private String topic;

        @NotBlank(message = "Code snippet is required")
        private String code;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LineExplanationItem {
        private Integer lineNumber;
        private String code;
        private String explanation;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExplainResponse {
        private String language;
        private String topic;
        private String summary;
        private List<LineExplanationItem> lineBreakdown;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AskAiRequest {
        @NotBlank(message = "Question is required")
        private String question;
        private String language;
        private String codeSnippet;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AskAiResponse {
        private String answer;
        private String codeExample;
        private List<String> keyTakeaways;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExplainErrorRequest {
        private String code;
        private String language;
        private String errorType;
        private String errorMessage;
        private Integer errorLine;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ExplainErrorResponse {
        private String plainExplanation;
        private String rootCause;
        private String howToFix;
        private String correctedCode;
        private Integer errorLine;
    }
}
