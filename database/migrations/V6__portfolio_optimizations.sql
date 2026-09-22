-- ==============================================================================
-- Flyway Migration V6: Portfolio Optimizations Schema
-- Database: PostgreSQL 16
-- Project: SkillForge AI
-- ==============================================================================

CREATE TABLE portfolio_optimizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    github_url VARCHAR(500),
    portfolio_score INT CHECK (portfolio_score BETWEEN 0 AND 100),
    alignment_issues JSONB DEFAULT '[]'::jsonb,
    pinned_repo_suggestions JSONB DEFAULT '[]'::jsonb,
    missing_project_suggestions JSONB DEFAULT '[]'::jsonb,
    resume_rewrite_suggestions JSONB DEFAULT '[]'::jsonb,
    github_stats JSONB DEFAULT '{}'::jsonb,
    analyzed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_portfolio_student ON portfolio_optimizations(student_id);
