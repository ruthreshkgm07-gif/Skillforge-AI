package com.skillforge.assessment.repository;

import com.skillforge.assessment.entity.StudentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StudentAnswerRepository extends JpaRepository<StudentAnswer, UUID> {
    List<StudentAnswer> findByAttemptId(UUID attemptId);
    Optional<StudentAnswer> findByAttemptIdAndQuestionId(UUID attemptId, UUID questionId);
}
