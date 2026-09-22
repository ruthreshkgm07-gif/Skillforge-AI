package com.skillforge.assessment.repository;

import com.skillforge.assessment.entity.StudentTestAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentTestAttemptRepository extends JpaRepository<StudentTestAttempt, UUID> {

    List<StudentTestAttempt> findByStudentUserIdOrderByStartedAtDesc(UUID studentId);

    List<StudentTestAttempt> findByStudentUserIdAndTestIdOrderByStartedAtDesc(UUID studentId, UUID testId);

    @Query("SELECT a FROM StudentTestAttempt a WHERE a.student.userId = :studentId AND a.test.type = :testType ORDER BY a.startedAt DESC")
    List<StudentTestAttempt> findByStudentAndTestType(@Param("studentId") UUID studentId, @Param("testType") String testType);

    Optional<StudentTestAttempt> findByIdAndStudentUserId(UUID attemptId, UUID studentId);
}
