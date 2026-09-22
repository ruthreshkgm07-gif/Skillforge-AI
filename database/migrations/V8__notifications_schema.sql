-- ==============================================================================
-- Flyway Migration V8: In-App Notifications Schema
-- Database: PostgreSQL 16
-- Project: SkillForge AI
-- ==============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- APPLICATION_STATUS, JOB_MATCH, ROADMAP_NUDGE, MOCK_INTERVIEW
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, is_read, created_at DESC);
