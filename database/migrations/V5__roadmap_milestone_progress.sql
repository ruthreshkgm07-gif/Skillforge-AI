-- ==============================================================================
-- Flyway Migration V5: Roadmap Milestone Progress Tracking Table
-- Database: PostgreSQL 16
-- Project: SkillForge AI
-- ==============================================================================

CREATE TABLE roadmap_milestone_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roadmap_id UUID NOT NULL REFERENCES career_roadmaps(id) ON DELETE CASCADE,
    milestone_index INT NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_roadmap_milestone UNIQUE (roadmap_id, milestone_index)
);

CREATE INDEX idx_roadmap_progress_roadmap ON roadmap_milestone_progress(roadmap_id);
