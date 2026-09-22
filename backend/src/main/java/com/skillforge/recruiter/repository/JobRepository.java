package com.skillforge.recruiter.repository;

import com.skillforge.recruiter.entity.Job;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID> {
    List<Job> findTop5ByStatusOrderByCreatedAtDesc(Job.JobStatus status);

    List<Job> findByRecruiterUserIdOrderByCreatedAtDesc(UUID recruiterId);

    List<Job> findTop3ByStatusOrderByCreatedAtDesc(Job.JobStatus status);

    @Query(value = "SELECT j.*, (1 - (j.embedding <=> CAST(:candidateVector AS vector))) AS similarity " +
            "FROM jobs j WHERE j.status = 'ACTIVE' AND j.embedding IS NOT NULL " +
            "ORDER BY j.embedding <=> CAST(:candidateVector AS vector) ASC LIMIT 20", nativeQuery = true)
    List<Job> findActiveJobsByVectorSimilarity(@org.springframework.data.repository.query.Param("candidateVector") String candidateVector);
}
