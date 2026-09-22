package com.skillforge.common.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class VectorEmbeddingServiceTest {

    private VectorEmbeddingService vectorEmbeddingService;

    @BeforeEach
    void setUp() {
        vectorEmbeddingService = new VectorEmbeddingService();
    }

    @Test
    @DisplayName("Should generate 768-dimensional float vector string format")
    void shouldGenerate768DimVectorString() {
        String input = "Senior Java Spring Boot PostgreSQL Engineer";
        String vectorStr = vectorEmbeddingService.generateEmbeddingVector(input);

        assertNotNull(vectorStr);
        assertTrue(vectorStr.startsWith("["));
        assertTrue(vectorStr.endsWith("]"));

        String[] components = vectorStr.substring(1, vectorStr.length() - 1).split(",");
        assertEquals(768, components.length, "Embedding vector must contain exactly 768 float dimensions");
    }

    @Test
    @DisplayName("Should produce normalized unit-length vector")
    void shouldProduceNormalizedUnitVector() {
        String input = "React TypeScript Frontend Developer";
        String vectorStr = vectorEmbeddingService.generateEmbeddingVector(input);

        String[] parts = vectorStr.substring(1, vectorStr.length() - 1).split(",");
        double sumSq = 0.0;
        for (String p : parts) {
            double val = Double.parseDouble(p.trim());
            sumSq += val * val;
        }

        double norm = Math.sqrt(sumSq);
        assertEquals(1.0, norm, 1e-4, "Unit normalized vector magnitude must be approximately 1.0");
    }
}
