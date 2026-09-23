package com.skillforge.student.repository;

import com.skillforge.student.entity.StudentCodingSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StudentCodingSubmissionRepository extends JpaRepository<StudentCodingSubmission, UUID> {

    List<StudentCodingSubmission> findByStudentUserIdOrderBySubmittedAtDesc(UUID studentId);

    @Query("SELECT s FROM StudentCodingSubmission s WHERE s.student.userId = :studentId AND s.status = 'PASSED'")
    List<StudentCodingSubmission> findPassedSubmissionsByStudent(@Param("studentId") UUID studentId);

    @Query("SELECT COUNT(DISTINCT s.problem.id) FROM StudentCodingSubmission s WHERE s.student.userId = :studentId AND s.status = 'PASSED'")
    long countDistinctSolvedProblems(@Param("studentId") UUID studentId);
}
