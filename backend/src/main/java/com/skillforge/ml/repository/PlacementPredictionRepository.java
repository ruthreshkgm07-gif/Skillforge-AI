package com.skillforge.ml.repository;

import com.skillforge.ml.entity.PlacementPrediction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PlacementPredictionRepository extends JpaRepository<PlacementPrediction, UUID> {

    List<PlacementPrediction> findByStudentUserIdOrderByPredictedAtDesc(UUID studentId);

    Optional<PlacementPrediction> findFirstByStudentUserIdOrderByPredictedAtDesc(UUID studentId);
}
