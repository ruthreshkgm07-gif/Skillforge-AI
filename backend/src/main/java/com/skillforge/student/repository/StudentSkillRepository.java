package com.skillforge.student.repository;

import com.skillforge.student.entity.StudentSkill;
import com.skillforge.student.entity.StudentSkillId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StudentSkillRepository extends JpaRepository<StudentSkill, StudentSkillId> {
    List<StudentSkill> findByStudentUserId(UUID studentId);
}
