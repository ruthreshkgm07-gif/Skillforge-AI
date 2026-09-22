-- ==============================================================================
-- Flyway Migration V2: pgvector Extension, Embedding Columns, and HNSW Indexes
-- Database: PostgreSQL 16 + pgvector
-- Target Embedding Model: Google Gemini text-embedding-004 (768 dimensions)
-- ==============================================================================

-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Resume Embeddings Table (Vector store for candidate CVs)
CREATE TABLE resume_embeddings (
    resume_id UUID PRIMARY KEY REFERENCES resumes(id) ON DELETE CASCADE,
    embedding vector(768) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Add Vector Embedding Column to Jobs Table
ALTER TABLE jobs 
ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. HNSW Cosine Similarity Indexes for Ultra-Fast Vector Search
-- Note: HNSW (Hierarchical Navigable Small World) provides superior query speed
-- and does not require pre-populating data rows before index creation.

CREATE INDEX IF NOT EXISTS idx_resume_embeddings_vector 
ON resume_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_jobs_embedding_vector 
ON jobs 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
