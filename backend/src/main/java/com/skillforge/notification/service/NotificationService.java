package com.skillforge.notification.service;

import com.skillforge.auth.entity.User;
import com.skillforge.auth.repository.UserRepository;
import com.skillforge.common.exception.AuthException;
import com.skillforge.notification.dto.NotificationDto;
import com.skillforge.notification.entity.Notification;
import com.skillforge.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public NotificationDto.NotificationSummary getUserNotifications(UUID userId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);

        if (list.isEmpty()) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                // Seed initial notifications for immediate clean UI presentation
                List.of(
                        Notification.builder().user(user).title("New Job Match Above 90%").message("Senior Full Stack Java Engineer at SkillForge Enterprise matches your vector profile.").type("JOB_MATCH").isRead(false).linkUrl("/student/jobs").build(),
                        Notification.builder().user(user).title("Weekly Roadmap Check-in").message("You are on track for Month 2 Backend Architecture milestone!").type("ROADMAP_NUDGE").isRead(false).linkUrl("/student/roadmap").build(),
                        Notification.builder().user(user).title("Mock Interview Ready").message("Your AI Mock Interview Coach evaluation report is now available.").type("MOCK_INTERVIEW").isRead(true).linkUrl("/student/mock-interview").build()
                ).forEach(notificationRepository::save);
                list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
            }
        }

        long unreadCount = list.stream().filter(n -> !n.isRead()).count();
        List<NotificationDto> dtos = list.stream().map(this::mapToDto).collect(Collectors.toList());

        return NotificationDto.NotificationSummary.builder()
                .unreadCount(unreadCount)
                .notifications(dtos)
                .build();
    }

    @Transactional
    public NotificationDto createNotification(UUID userId, String title, String message, String type, String linkUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(AuthException::userNotFound);

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .linkUrl(linkUrl)
                .build();

        notification = notificationRepository.save(notification);
        log.info("Created notification {} for user {}", notification.getId(), userId);
        return mapToDto(notification);
    }

    @Transactional
    public void markAsRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (notification.getUser().getId().equals(userId)) {
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }

    @Transactional
    public void markAllAsRead(UUID userId) {
        List<Notification> list = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
        list.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(list);
    }

    private NotificationDto mapToDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .isRead(n.isRead())
                .linkUrl(n.getLinkUrl())
                .createdAt(n.getCreatedAt() != null ? n.getCreatedAt().toString() : ZonedDateTime.now().toString())
                .build();
    }
}
