package com.skillforge.ml.controller;

import com.skillforge.auth.security.CustomUserDetails;
import com.skillforge.common.response.ApiResponse;
import com.skillforge.ml.dto.PlacementPredictionResponseDto;
import com.skillforge.ml.service.MLPlacementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class MLPlacementController {

    private final MLPlacementService mlPlacementService;

    @PostMapping({"/student/placement-prediction", "/students/{id}/placement-prediction"})
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PlacementPredictionResponseDto>> predictPlacement(
            @PathVariable(value = "id", required = false) UUID studentId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        UUID targetId = (studentId != null) ? studentId : userDetails.getId();
        PlacementPredictionResponseDto response = mlPlacementService.predictPlacement(targetId);
        return ResponseEntity.ok(ApiResponse.success(response, "Placement likelihood and salary prediction generated successfully"));
    }

    @GetMapping({"/student/placement-prediction", "/students/{id}/placement-prediction"})
    @PreAuthorize("hasRole('STUDENT') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PlacementPredictionResponseDto>> getLatestPrediction(
            @PathVariable(value = "id", required = false) UUID studentId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        UUID targetId = (studentId != null) ? studentId : userDetails.getId();
        PlacementPredictionResponseDto response = mlPlacementService.getLatestPrediction(targetId);
        return ResponseEntity.ok(ApiResponse.success(response, "Latest placement prediction retrieved successfully"));
    }
}
