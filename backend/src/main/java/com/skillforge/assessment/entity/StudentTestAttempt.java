package com.skillforge.assessment.entity;

import com.skillforge.student.entity.StudentProfile;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "student_test_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentTestAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    private Test test;

    @Builder.Default
    @Column(nullable = false)
    private String status = "IN_PROGRESS"; // IN_PROGRESS, COMPLETED, TIMED_OUT

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "question_order", columnDefinition = "jsonb")
    private String questionOrder; // JSON string array of Question UUIDs in per-attempt Fisher-Yates order

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "option_order", columnDefinition = "jsonb")
    private String optionOrder; // JSON map of { questionId: [optionUUIDs] }

    @Builder.Default
    @Column(nullable = false)
    private Integer score = 0;

    @Builder.Default
    @Column(name = "total_points", nullable = false)
    private Integer totalPoints = 0;

    @Builder.Default
    @Column(nullable = false)
    private Double percentage = 0.0;

    @CreationTimestamp
    @Column(name = "started_at", updatable = false)
    private ZonedDateTime startedAt;

    @Column(name = "submitted_at")
    private ZonedDateTime submittedAt;

    @Builder.Default
    @Column(name = "time_taken_seconds", nullable = false)
    private Integer timeTakenSeconds = 0;

    @Builder.Default
    @Column(name = "is_practice", nullable = false)
    private Boolean isPractice = true;

    @Builder.Default
    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<StudentAnswer> answers = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<AttemptCategoryScore> categoryScores = new ArrayList<>();
}
