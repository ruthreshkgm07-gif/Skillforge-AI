-- V11: Add skill_analysis_json column to resumes table to persist skill-based feedback
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS skill_analysis_json JSONB;
