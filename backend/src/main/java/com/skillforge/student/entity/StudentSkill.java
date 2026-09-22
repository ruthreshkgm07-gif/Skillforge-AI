package com.skillforge.student.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.ZonedDateTime;

@Entity
@Table(name = "student_skills")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentSkill {

    @EmbeddedId
    private StudentSkillId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("studentId")
    @JoinColumn(name = "student_id")
    private StudentProfile student;

    @ManyToOne(fetch = FetchType.EAGER)
    @MapsId("skillId")
    @JoinColumn(name = "skill_id")
    private Skill skill;

    @Min(1)
    @Max(5)
    @Column(name = "proficiency_level", nullable = false)
    private Integer proficiencyLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "verified_by", nullable = false)
    private VerificationSource verifiedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    public enum VerificationSource {
        SELF, CODING_TRACKER, ASSESSMENT
    }
}
