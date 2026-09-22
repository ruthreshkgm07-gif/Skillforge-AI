package com.skillforge.resume.repository;

import com.skillforge.resume.entity.PortfolioOptimization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PortfolioOptimizationRepository extends JpaRepository<PortfolioOptimization, UUID> {

    List<PortfolioOptimization> findByStudentUserIdOrderByAnalyzedAtDesc(UUID studentId);

    Optional<PortfolioOptimization> findFirstByStudentUserIdOrderByAnalyzedAtDesc(UUID studentId);
}
