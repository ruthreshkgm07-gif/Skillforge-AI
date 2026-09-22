package com.skillforge.ai.assistant;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssistantSessionRepository extends JpaRepository<AssistantSession, UUID> {
    List<AssistantSession> findByUserIdOrderByUpdatedAtDesc(UUID userId);
}
