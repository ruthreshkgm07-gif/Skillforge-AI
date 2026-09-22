package com.skillforge.student.repository;

import com.skillforge.student.entity.CodingTrackerTrend;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CodingTrackerTrendRepository extends JpaRepository<CodingTrackerTrend, UUID> {

    List<CodingTrackerTrend> findByStudentUserIdOrderByRecordedAtAsc(UUID studentId);
}
