package com.skillforge.student.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "role_skill_requirements", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"role_name", "skill_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleSkillRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Column(name = "role_name", nullable = false)
    private String roleName;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "skill_id", nullable = false)
    private Skill skill;

    @Min(1)
    @Max(5)
    @Column(name = "required_proficiency", nullable = false)
    private Integer requiredProficiency;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority priority;

    public enum Priority {
        MUST_HAVE, NICE_TO_HAVE
    }
}
