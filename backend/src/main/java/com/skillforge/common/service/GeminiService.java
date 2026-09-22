package com.skillforge.common.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class GeminiService {

    private final LlmService llmService;

    public String generateText(String prompt) {
        try {
            return llmService.generateText(prompt);
        } catch (Exception ex) {
            log.error("Error in GeminiService text generation: {}", ex.getMessage());
            throw ex;
        }
    }
}
