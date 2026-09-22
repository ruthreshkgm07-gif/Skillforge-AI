-- ==============================================================================
-- SkillForge AI — Benchmark Script: Keyword Overlap vs pgvector Cosine Search
-- Database: PostgreSQL 16 + pgvector
-- Purpose: Qualitatively compare top-5 results between keyword and vector matching
-- ==============================================================================

-- 1. Keyword-based matching approach (Phase 6 placeholder)
SELECT 
    j.id AS job_id,
    j.title AS job_title,
    'Structured Keyword Overlap' AS method,
    (
        SELECT COUNT(*) 
        FROM jsonb_array_elements_text(j.required_skills) skill
        WHERE LOWER(skill) IN ('java', 'spring boot', 'react.js', 'postgresql')
    ) AS keyword_matches
FROM jobs j
WHERE j.status = 'ACTIVE'
ORDER BY keyword_matches DESC
LIMIT 5;

-- 2. pgvector Cosine Similarity Search (Phase 8 Semantic Engine)
-- Assumes sample vector embedding for target role: 'Full Stack Java & React Engineer'
EXPLAIN ANALYZE
SELECT 
    j.id AS job_id,
    j.title AS job_title,
    j.location,
    'pgvector Cosine Similarity' AS method,
    ROUND((1 - (j.embedding <=> '[0.015, -0.032, 0.088, 0.042, -0.012, 0.076]'::vector)) * 100, 2) AS semantic_match_percentage
FROM jobs j
WHERE j.status = 'ACTIVE' AND j.embedding IS NOT NULL
ORDER BY j.embedding <=> '[0.015, -0.032, 0.088, 0.042, -0.012, 0.076]'::vector ASC
LIMIT 5;
