package com.skillforge.student.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "coding_tracker_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodingTrackerStats {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Platform platform;

    @Builder.Default
    @Column(name = "problems_solved", nullable = false)
    private Integer problemsSolved = 0;

    @Builder.Default
    private Integer rating = 0;

    @Column(name = "last_synced")
    private ZonedDateTime lastSynced;

    public enum Platform {
        LEETCODE, CODEFORCES, GITHUB
    }
}
