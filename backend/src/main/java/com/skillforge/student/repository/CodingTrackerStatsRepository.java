package com.skillforge.student.repository;

import com.skillforge.student.entity.CodingTrackerStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CodingTrackerStatsRepository extends JpaRepository<CodingTrackerStats, UUID> {

    List<CodingTrackerStats> findByStudentUserId(UUID studentId);

    Optional<CodingTrackerStats> findByStudentUserIdAndPlatform(UUID studentId, CodingTrackerStats.Platform platform);
}
