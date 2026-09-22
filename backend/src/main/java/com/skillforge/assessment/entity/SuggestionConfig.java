package com.skillforge.assessment.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "suggestions_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuggestionConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Builder.Default
    @Column(name = "test_type", nullable = false)
    private String testType = "ALL"; // COMMUNICATION, MCQ, ALL

    @Column(name = "skill_category", nullable = false)
    private String skillCategory;

    @Builder.Default
    @Column(name = "threshold_percentage", nullable = false)
    private Double thresholdPercentage = 60.0;

    @Column(name = "suggestion_text", columnDefinition = "TEXT", nullable = false)
    private String suggestionText;

    @Column(name = "resource_link")
    private String resourceLink;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
