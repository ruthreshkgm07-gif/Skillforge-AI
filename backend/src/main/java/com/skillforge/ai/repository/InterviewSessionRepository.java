package com.skillforge.ai.repository;

import com.skillforge.ai.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface InterviewSessionRepository extends JpaRepository<InterviewSession, UUID> {

    List<InterviewSession> findByStudentUserIdOrderByCreatedAtDesc(UUID studentId);

    long countByStudentUserIdAndCreatedAtAfter(UUID studentId, ZonedDateTime after);
}
