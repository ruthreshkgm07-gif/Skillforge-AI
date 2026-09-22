-- V14__resume_analyzer_theme_voice_interview.sql
-- Add fields for parsed resume metrics and voice mock interview history

ALTER TABLE resumes ADD COLUMN IF NOT EXISTS years_of_experience DOUBLE PRECISION;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS education TEXT;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS past_job_titles_json TEXT;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS certifications_json TEXT;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS extracted_keywords_json TEXT;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS job_match_recommendations_json TEXT;

CREATE INDEX IF NOT EXISTS idx_interview_sessions_student_created ON interview_sessions (student_id, created_at DESC);
