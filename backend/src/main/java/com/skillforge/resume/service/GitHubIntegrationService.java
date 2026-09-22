package com.skillforge.resume.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.skillforge.resume.dto.PortfolioOptimizationResponseDto.GithubStatsSummary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class GitHubIntegrationService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    private static final String REDIS_GITHUB_PREFIX = "github:profile:";

    public String extractUsername(String githubUrl) {
        if (githubUrl == null || githubUrl.isBlank()) return null;
        String clean = githubUrl.trim().replaceAll("^https?://", "").replaceAll("^github\\.com/", "").replaceAll("/$", "");
        int slashIdx = clean.indexOf('/');
        return slashIdx > 0 ? clean.substring(0, slashIdx) : clean;
    }

    public GithubStatsSummary fetchGitHubProfileStats(String githubUrl) {
        String username = extractUsername(githubUrl);
        if (username == null || username.isBlank()) {
            return GithubStatsSummary.builder()
                    .username("N/A")
                    .publicReposCount(0)
                    .totalStars(0)
                    .topLanguages(List.of())
                    .hasReadmeSignal(false)
                    .build();
        }

        String cacheKey = REDIS_GITHUB_PREFIX + username.toLowerCase();
        try {
            String cachedJson = redisTemplate.opsForValue().get(cacheKey);
            if (cachedJson != null && !cachedJson.isBlank()) {
                return objectMapper.readValue(cachedJson, GithubStatsSummary.class);
            }
        } catch (Exception ex) {
            log.warn("Redis GitHub profile cache read bypass: {}", ex.getMessage());
        }

        // Aggregate simulated profile stats for GitHub username
        GithubStatsSummary summary = GithubStatsSummary.builder()
                .username(username)
                .publicReposCount(12)
                .totalStars(24)
                .topLanguages(List.of("Java", "TypeScript", "Python", "HTML/CSS"))
                .hasReadmeSignal(true)
                .build();

        try {
            String json = objectMapper.writeValueAsString(summary);
            redisTemplate.opsForValue().set(cacheKey, json, Duration.ofHours(1));
        } catch (Exception ex) {
            log.warn("Failed to cache GitHub stats in Redis", ex);
        }

        return summary;
    }
}
