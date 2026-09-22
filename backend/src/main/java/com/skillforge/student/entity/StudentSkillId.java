package com.skillforge.student.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class StudentSkillId implements Serializable {

    @Column(name = "student_id")
    private UUID studentId;

    @Column(name = "skill_id")
    private UUID skillId;
}
