package com.skillforge.assessment.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "attempt_category_scores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptCategoryScore {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private StudentTestAttempt attempt;

    @Column(name = "skill_category", nullable = false)
    private String skillCategory;

    @Builder.Default
    @Column(nullable = false)
    private Integer score = 0;

    @Builder.Default
    @Column(name = "max_score", nullable = false)
    private Integer maxScore = 0;

    @Builder.Default
    @Column(nullable = false)
    private Double percentage = 0.0;
}
