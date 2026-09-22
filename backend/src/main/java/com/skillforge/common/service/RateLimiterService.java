package com.skillforge.common.service;

import com.skillforge.common.exception.AuthException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
@RequiredArgsConstructor
public class RateLimiterService {

    private final StringRedisTemplate redisTemplate;
    
    // In-memory fallback tracking entry with expiration timestamp
    private static class FallbackEntry {
        int attempts;
        long expireAtMillis;

        FallbackEntry(int attempts, long expireAtMillis) {
            this.attempts = attempts;
            this.expireAtMillis = expireAtMillis;
        }
    }

    private final ConcurrentHashMap<String, FallbackEntry> inMemoryFallbackMap = new ConcurrentHashMap<>();

    public void checkRateLimit(String key, int maxRequests, int windowMinutes) {
        String redisKey = "rate_limit:" + key;
        try {
            Long currentRequests = redisTemplate.opsForValue().increment(redisKey);
            if (currentRequests != null && currentRequests == 1) {
                redisTemplate.expire(redisKey, windowMinutes, TimeUnit.MINUTES);
            }
            if (currentRequests != null && currentRequests > maxRequests) {
                Long ttlSeconds = redisTemplate.getExpire(redisKey, TimeUnit.SECONDS);
                long minutesLeft = (ttlSeconds != null && ttlSeconds > 0) ? Math.max(1, ttlSeconds / 60) : windowMinutes;
                throw AuthException.tooManyRequests("Too many authentication attempts. Please try again in " + minutesLeft + " minute" + (minutesLeft > 1 ? "s" : "") + ".");
            }
        } catch (AuthException ex) {
            throw ex;
        } catch (Exception ex) {
            log.warn("Redis rate limit check fallback to in-memory: {}", ex.getMessage());
            long now = System.currentTimeMillis();
            FallbackEntry entry = inMemoryFallbackMap.get(key);

            if (entry == null || now > entry.expireAtMillis) {
                entry = new FallbackEntry(1, now + (windowMinutes * 60L * 1000L));
                inMemoryFallbackMap.put(key, entry);
            } else {
                entry.attempts++;
            }

            if (entry.attempts > maxRequests) {
                long secondsLeft = Math.max(1, (entry.expireAtMillis - now) / 1000L);
                long minutesLeft = Math.max(1, secondsLeft / 60L);
                throw AuthException.tooManyRequests("Too many authentication attempts. Please try again in " + minutesLeft + " minute" + (minutesLeft > 1 ? "s" : "") + ".");
            }
        }
    }

    public void resetRateLimit(String key) {
        String redisKey = "rate_limit:" + key;
        try {
            redisTemplate.delete(redisKey);
        } catch (Exception ex) {
            log.warn("Redis clear failed: {}", ex.getMessage());
        }
        inMemoryFallbackMap.remove(key);
    }
}
