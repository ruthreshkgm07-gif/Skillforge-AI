package com.skillforge.common.controller;

import com.skillforge.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping
public class HealthController {

    @GetMapping({"/", "/health", ""})
    public ResponseEntity<ApiResponse<Map<String, String>>> checkHealth() {
        Map<String, String> status = Map.of(
                "status", "UP",
                "service", "skillforge-backend",
                "version", "1.0.0"
        );
        return ResponseEntity.ok(ApiResponse.success(status, "SkillForge AI Backend API is running"));
    }
}
