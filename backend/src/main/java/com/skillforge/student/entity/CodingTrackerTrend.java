package com.skillforge.student.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "coding_tracker_trends")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingTrackerTrend {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CodingTrackerStats.Platform platform;

    @Column(name = "problems_solved", nullable = false)
    private Integer problemsSolved;

    @Column(name = "rating")
    private Integer rating;

    @CreationTimestamp
    @Column(name = "recorded_at", updatable = false)
    private ZonedDateTime recordedAt;
}
