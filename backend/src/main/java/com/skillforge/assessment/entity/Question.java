package com.skillforge.assessment.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_id", nullable = false)
    private Test test;

    @NotBlank(message = "Question text is required")
    @Column(name = "question_text", columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Builder.Default
    @Column(nullable = false)
    private String type = "MCQ"; // MCQ, FILL_IN_BLANK, SHORT_ANSWER

    @NotBlank(message = "Skill category is required")
    @Column(name = "skill_category", nullable = false)
    private String skillCategory;

    @Builder.Default
    @Column(nullable = false)
    private String difficulty = "MEDIUM"; // EASY, MEDIUM, HARD

    @Builder.Default
    @Column(nullable = false)
    private Integer points = 10;

    @Builder.Default
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuestionOption> options = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
