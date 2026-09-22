package com.skillforge.resume.repository;

import com.skillforge.resume.entity.ResumeEmbedding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResumeEmbeddingRepository extends JpaRepository<ResumeEmbedding, UUID> {

    @org.springframework.data.jpa.repository.Query(value = "SELECT re.* FROM resume_embeddings re " +
            "ORDER BY re.embedding <=> CAST(:jobVector AS vector) ASC LIMIT :limit", nativeQuery = true)
    List<ResumeEmbedding> findTopCandidatesByVectorSimilarity(
            @org.springframework.data.repository.query.Param("jobVector") String jobVector,
            @org.springframework.data.repository.query.Param("limit") int limit
    );
}
