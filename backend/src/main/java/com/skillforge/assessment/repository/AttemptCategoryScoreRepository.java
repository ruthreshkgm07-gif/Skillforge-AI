package com.skillforge.assessment.repository;

import com.skillforge.assessment.entity.AttemptCategoryScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AttemptCategoryScoreRepository extends JpaRepository<AttemptCategoryScore, UUID> {
    List<AttemptCategoryScore> findByAttemptId(UUID attemptId);
    void deleteByAttemptId(UUID attemptId);
}
