package com.skillforge.resume.entity;

import com.skillforge.student.entity.StudentProfile;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "portfolio_optimizations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioOptimization {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @Column(name = "github_url", length = 500)
    private String githubUrl;

    @Min(0)
    @Max(100)
    @Column(name = "portfolio_score")
    private Integer portfolioScore;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "alignment_issues", columnDefinition = "jsonb")
    private String alignmentIssues;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "pinned_repo_suggestions", columnDefinition = "jsonb")
    private String pinnedRepoSuggestions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "missing_project_suggestions", columnDefinition = "jsonb")
    private String missingProjectSuggestions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "resume_rewrite_suggestions", columnDefinition = "jsonb")
    private String resumeRewriteSuggestions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "github_stats", columnDefinition = "jsonb")
    private String githubStats;

    @CreationTimestamp
    @Column(name = "analyzed_at", updatable = false)
    private ZonedDateTime analyzedAt;
}
