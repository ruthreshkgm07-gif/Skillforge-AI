-- ==============================================================================
-- Flyway Migration V7: Coding Tracker Trend Data Logging Schema
-- Database: PostgreSQL 16
-- Project: SkillForge AI
-- ==============================================================================

CREATE TABLE coding_tracker_trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    platform coding_platform NOT NULL,
    problems_solved INT NOT NULL DEFAULT 0,
    rating INT DEFAULT 0,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_coding_trends_student ON coding_tracker_trends(student_id, recorded_at);
