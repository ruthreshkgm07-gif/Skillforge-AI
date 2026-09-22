package com.skillforge.ai.assistant;

import com.skillforge.auth.security.CustomUserDetails;
import com.skillforge.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/ai/assistant")
@RequiredArgsConstructor
public class AssistantController {

    private final AssistantService assistantService;

    @PostMapping("/chat")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<AssistantChatDto.ChatResponse>> chat(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AssistantChatDto.ChatRequest request
    ) {
        AssistantChatDto.ChatResponse response = assistantService.chat(userDetails.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "AI Assistant response generated successfully"));
    }

    @GetMapping("/sessions")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<AssistantChatDto.SessionSummary>>> getSessions(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<AssistantChatDto.SessionSummary> sessions = assistantService.getUserSessions(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success(sessions, "Assistant chat sessions retrieved successfully"));
    }

    @GetMapping("/sessions/{sessionId}/messages")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<AssistantChatDto.MessageItem>>> getSessionMessages(
            @PathVariable UUID sessionId
    ) {
        List<AssistantChatDto.MessageItem> messages = assistantService.getSessionMessages(sessionId);
        return ResponseEntity.ok(ApiResponse.success(messages, "Session messages retrieved successfully"));
    }
}
