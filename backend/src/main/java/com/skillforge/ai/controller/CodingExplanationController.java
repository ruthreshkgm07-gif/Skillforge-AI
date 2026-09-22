package com.skillforge.ai.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillforge.ai.dto.CodingExplanationDto;
import com.skillforge.common.response.ApiResponse;
import com.skillforge.common.service.LlmService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/student/coding")
@RequiredArgsConstructor
@Slf4j
public class CodingExplanationController {

    private final LlmService llmService;
    private final ObjectMapper objectMapper;

    @PostMapping("/explain")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CodingExplanationDto.ExplainResponse>> explainCode(
            @Valid @RequestBody CodingExplanationDto.ExplainRequest request
    ) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an expert programming instructor explaining ").append(request.getLanguage());
        prompt.append(" code line by line for a student learning ").append(request.getTopic()).append(".\n\n");
        prompt.append("Code to explain:\n```").append(request.getLanguage().toLowerCase()).append("\n");
        prompt.append(request.getCode()).append("\n```\n\n");
        prompt.append("Explain EXACTLY line by line. Walk through what each line does, why it is needed, and how it connects to the overall algorithm.\n");
        prompt.append("Return ONLY a JSON object matching this exact schema:\n");
        prompt.append("{\n");
        prompt.append("  \"summary\": \"High-level simple overview of what this program does\",\n");
        prompt.append("  \"lineBreakdown\": [\n");
        prompt.append("    { \"lineNumber\": 1, \"code\": \"exact code line\", \"explanation\": \"clear simple explanation of what this line does and why\" }\n");
        prompt.append("  ]\n");
        prompt.append("}\n");

        List<CodingExplanationDto.LineExplanationItem> breakdown = new ArrayList<>();
        String summary = "This program demonstrates " + request.getTopic() + " in " + request.getLanguage() + ".";

        try {
            String jsonOutput = llmService.generateText(prompt.toString());
            if (jsonOutput != null && jsonOutput.contains("{")) {
                int start = jsonOutput.indexOf("{");
                int end = jsonOutput.lastIndexOf("}");
                if (start != -1 && end > start) {
                    String cleanJson = jsonOutput.substring(start, end + 1);
                    var node = objectMapper.readTree(cleanJson);
                    if (node.has("summary")) {
                        summary = node.get("summary").asText();
                    }
                    if (node.has("lineBreakdown")) {
                        List<CodingExplanationDto.LineExplanationItem> items = objectMapper.readValue(
                                node.get("lineBreakdown").toString(),
                                new TypeReference<List<CodingExplanationDto.LineExplanationItem>>() {}
                        );
                        breakdown.addAll(items);
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("Line-by-line code explanation parsing failed: {}", ex.getMessage());
        }

        // Rule-based beginner-friendly fallback if AI call is unavailable
        if (breakdown.isEmpty()) {
            String[] lines = request.getCode().split("\n");
            for (int i = 0; i < lines.length; i++) {
                String line = lines[i];
                if (line.trim().isEmpty()) continue;
                String explanationText;
                String trimmed = line.trim();

                if (trimmed.startsWith("import ") || trimmed.startsWith("#include") || trimmed.startsWith("using ")) {
                    explanationText = "Imports necessary standard library modules and dependencies required for execution.";
                } else if (trimmed.startsWith("def ") || trimmed.startsWith("public static") || trimmed.startsWith("function ")) {
                    explanationText = "Defines the core execution function signature and entry parameter contract.";
                } else if (trimmed.contains("for ") || trimmed.contains("while ")) {
                    explanationText = "Iterates through the dataset elements to apply processing logic and condition evaluations.";
                } else if (trimmed.contains("if ") || trimmed.contains("else ")) {
                    explanationText = "Conditional branch evaluating boundary limits and target equality constraints.";
                } else if (trimmed.startsWith("return ")) {
                    explanationText = "Returns the final computed result state or data structure to the caller.";
                } else {
                    explanationText = "Initializes variables or mutates state for " + request.getTopic() + " logic: " + trimmed;
                }

                breakdown.add(CodingExplanationDto.LineExplanationItem.builder()
                        .lineNumber(i + 1)
                        .code(line)
                        .explanation(explanationText)
                        .build());
            }
        }

        CodingExplanationDto.ExplainResponse response = CodingExplanationDto.ExplainResponse.builder()
                .language(request.getLanguage())
                .topic(request.getTopic())
                .summary(summary)
                .lineBreakdown(breakdown)
                .build();

        return ResponseEntity.ok(ApiResponse.success(response, "Line-by-line code explanation generated successfully"));
    }

    @PostMapping("/ask-ai")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CodingExplanationDto.AskAiResponse>> askProgrammingAi(
            @Valid @RequestBody CodingExplanationDto.AskAiRequest request
    ) {
        String lang = request.getLanguage() != null && !request.getLanguage().isBlank() ? request.getLanguage() : "Programming";
        String prompt = "You are a friendly AI Programming Tutor and CS Professor teaching " + lang + ".\n" +
                "Student Question: \"" + request.getQuestion() + "\"\n" +
                (request.getCodeSnippet() != null && !request.getCodeSnippet().isBlank() ? "Relevant Code:\n```" + lang + "\n" + request.getCodeSnippet() + "\n```\n" : "") +
                "Provide a clear, beginner-friendly explanation and include a clean code example with key takeaways.\n" +
                "Return ONLY a JSON object matching:\n" +
                "{\n" +
                "  \"answer\": \"Clear detailed answer explanation text\",\n" +
                "  \"codeExample\": \"Executable code example snippet in " + lang + "\",\n" +
                "  \"keyTakeaways\": [\"Point 1\", \"Point 2\", \"Point 3\"]\n" +
                "}\n";

        String answerText = "To answer your question in " + lang + ": " + request.getQuestion() + ", focus on understanding the underlying data structures, time complexity trade-offs, and clean syntax.";
        String exampleSnippet = "// Example demonstration in " + lang + "\n" +
                (request.getCodeSnippet() != null ? request.getCodeSnippet() : "public class Demo {\n    public static void main(String[] args) {\n        System.out.println(\"Happy coding!\");\n    }\n}");
        List<String> takeaways = List.of(
                "Verify variable initialization and array bounds",
                "Consider Big-O time and space complexity",
                "Write clean unit test cases for edge limits"
        );

        try {
            String aiJson = llmService.generateText(prompt);
            if (aiJson != null && aiJson.contains("{")) {
                int start = aiJson.indexOf("{");
                int end = aiJson.lastIndexOf("}");
                if (start != -1 && end > start) {
                    String clean = aiJson.substring(start, end + 1);
                    var node = objectMapper.readTree(clean);
                    if (node.has("answer")) answerText = node.get("answer").asText();
                    if (node.has("codeExample")) exampleSnippet = node.get("codeExample").asText();
                    if (node.has("keyTakeaways")) {
                        takeaways = objectMapper.readValue(node.get("keyTakeaways").toString(), new TypeReference<List<String>>() {});
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("AI Programming Q&A parsing fallback: {}", ex.getMessage());
        }

        CodingExplanationDto.AskAiResponse response = CodingExplanationDto.AskAiResponse.builder()
                .answer(answerText)
                .codeExample(exampleSnippet)
                .keyTakeaways(takeaways)
                .build();

        return ResponseEntity.ok(ApiResponse.success(response, "AI Programming answer generated successfully"));
    }

    @PostMapping("/explain-error")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<CodingExplanationDto.ExplainErrorResponse>> explainError(
            @RequestBody CodingExplanationDto.ExplainErrorRequest request
    ) {
        String lang = request.getLanguage() != null ? request.getLanguage() : "python";
        String errType = request.getErrorType() != null ? request.getErrorType() : "RuntimeError";
        String errMsg = request.getErrorMessage() != null ? request.getErrorMessage() : "Execution failed";
        Integer lineNum = request.getErrorLine() != null ? request.getErrorLine() : 1;

        String plainExplanation;
        String rootCause;
        String howToFix;
        String correctedCode = request.getCode();

        try {
            String rawAiExplanation = llmService.explainCodeError(
                    request.getCode(),
                    lang,
                    errType,
                    errMsg,
                    lineNum
            );
            plainExplanation = rawAiExplanation;
            rootCause = "Issue triggered at line " + lineNum + ": " + errMsg;
            howToFix = "Review the line diagnostics and replace invalid syntax or out-of-bound operations as shown below.";
        } catch (Exception ex) {
            log.warn("OpenRouter error explanation failed, generating deterministic breakdown: {}", ex.getMessage());
            plainExplanation = "At line " + lineNum + ", a " + errType + " occurred because: " + errMsg + ".";
            rootCause = "The operation on line " + lineNum + " violated " + lang + " execution constraints (" + errMsg + ").";
            howToFix = "Add boundary checks or correct syntax at line " + lineNum + " before accessing data.";
        }

        CodingExplanationDto.ExplainErrorResponse response = CodingExplanationDto.ExplainErrorResponse.builder()
                .plainExplanation(plainExplanation)
                .rootCause(rootCause)
                .howToFix(howToFix)
                .correctedCode(correctedCode)
                .errorLine(lineNum)
                .build();

        return ResponseEntity.ok(ApiResponse.success(response, "Error explanation generated successfully"));
    }
}
