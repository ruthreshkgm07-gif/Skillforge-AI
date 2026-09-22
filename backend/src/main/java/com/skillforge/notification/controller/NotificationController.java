package com.skillforge.notification.controller;

import com.skillforge.auth.security.CustomUserDetails;
import com.skillforge.common.response.ApiResponse;
import com.skillforge.notification.dto.NotificationDto;
import com.skillforge.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<NotificationDto.NotificationSummary>> getNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        NotificationDto.NotificationSummary summary = notificationService.getUserNotifications(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(summary, "In-app notifications retrieved successfully"));
    }

    @PutMapping("/{id}/read")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> markAsRead(
            @PathVariable("id") UUID notificationId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        notificationService.markAsRead(notificationId, userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", "Read"));
    }

    @PutMapping("/read-all")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<String>> markAllAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        notificationService.markAllAsRead(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", "Read All"));
    }
}
