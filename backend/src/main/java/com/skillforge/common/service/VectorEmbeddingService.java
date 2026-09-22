package com.skillforge.common.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Locale;

@Service
@Slf4j
public class VectorEmbeddingService {

    public static final int EMBEDDING_DIMENSION = 768;

    /**
     * Generates a normalized 768-dimensional float vector string for PostgreSQL pgvector.
     * Uses a deterministic seed hash feature vector for text input.
     */
    public String generateEmbeddingVector(String text) {
        if (text == null || text.isBlank()) {
            return generateZeroVectorString();
        }

        float[] vector = new float[EMBEDDING_DIMENSION];
        String normalizedText = text.toLowerCase(Locale.ROOT).trim();

        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(normalizedText.getBytes(StandardCharsets.UTF_8));

            // Seed pseudo-random generator deterministically from hash
            long seed = 0;
            for (int i = 0; i < Math.min(hash.length, 8); i++) {
                seed = (seed << 8) | (hash[i] & 0xFF);
            }

            java.util.Random random = new java.util.Random(seed);
            double normSquare = 0.0;

            for (int i = 0; i < EMBEDDING_DIMENSION; i++) {
                float val = (float) (random.nextGaussian());
                vector[i] = val;
                normSquare += val * val;
            }

            // Normalize vector to unit length for accurate cosine similarity
            double norm = Math.sqrt(normSquare);
            if (norm > 0) {
                for (int i = 0; i < EMBEDDING_DIMENSION; i++) {
                    vector[i] /= norm;
                }
            }

            return formatVectorString(vector);
        } catch (Exception ex) {
            log.error("Error generating vector embedding for text", ex);
            return generateZeroVectorString();
        }
    }

    public String formatVectorString(float[] vector) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < vector.length; i++) {
            sb.append(String.format(Locale.US, "%.6f", vector[i]));
            if (i < vector.length - 1) {
                sb.append(", ");
            }
        }
        sb.append("]");
        return sb.toString();
    }

    private String generateZeroVectorString() {
        float[] zeroes = new float[EMBEDDING_DIMENSION];
        Arrays.fill(zeroes, 0.0f);
        return formatVectorString(zeroes);
    }
}
