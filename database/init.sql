-- SkillForge AI Database Initialization Script
-- Enables vector extension for semantic matching

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schema marker
COMMENT ON DATABASE skillforge_db IS 'SkillForge AI Core Database with pgvector support';
