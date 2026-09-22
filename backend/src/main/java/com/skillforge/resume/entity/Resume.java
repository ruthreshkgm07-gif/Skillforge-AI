package com.skillforge.resume.entity;

import com.skillforge.student.entity.StudentProfile;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @NotBlank(message = "File URL is required")
    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "parsed_text", columnDefinition = "TEXT")
    private String parsedText;

    @Min(0)
    @Max(100)
    @Column(name = "ats_score")
    private Integer atsScore;

    @Min(0)
    @Max(100)
    @Column(name = "resume_score")
    private Integer resumeScore;

    @Column(name = "skill_analysis_json", columnDefinition = "TEXT")
    private String skillAnalysisJson;

    @Column(name = "years_of_experience")
    private Double yearsOfExperience;

    @Column(name = "education", columnDefinition = "TEXT")
    private String education;

    @Column(name = "past_job_titles_json", columnDefinition = "TEXT")
    private String pastJobTitlesJson;

    @Column(name = "certifications_json", columnDefinition = "TEXT")
    private String certificationsJson;

    @Column(name = "extracted_keywords_json", columnDefinition = "TEXT")
    private String extractedKeywordsJson;

    @CreationTimestamp
    @Column(name = "uploaded_at", updatable = false)
    private ZonedDateTime uploadedAt;

    @OneToOne(mappedBy = "resume", cascade = CascadeType.ALL, orphanRemoval = true)
    private ResumeEmbedding resumeEmbedding;
}
