-- ==============================================================================
-- Flyway Migration V1: Core Domain Enums and Tables
-- Database: PostgreSQL 16
-- Project: SkillForge AI
-- ==============================================================================

-- Core Enums
CREATE TYPE user_role AS ENUM ('STUDENT', 'RECRUITER', 'ADMIN');
CREATE TYPE skill_verification_source AS ENUM ('SELF', 'CODING_TRACKER', 'ASSESSMENT');
CREATE TYPE application_status AS ENUM ('APPLIED', 'SHORTLISTED', 'REJECTED', 'HIRED');
CREATE TYPE coding_platform AS ENUM ('LEETCODE', 'CODEFORCES', 'GITHUB');
CREATE TYPE job_employment_type AS ENUM ('FULL_TIME', 'PART_TIME', 'INTERNSHIP', 'CONTRACT');
CREATE TYPE job_status AS ENUM ('DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED');

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 2. Student Profiles Table
CREATE TABLE student_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    headline VARCHAR(255),
    bio TEXT,
    target_role VARCHAR(255),
    github_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    phone VARCHAR(50),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Skills Master Table
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_name ON skills(name);

-- 4. Student Skills (Junction Table)
CREATE TABLE student_skills (
    student_id UUID NOT NULL REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    proficiency_level INT NOT NULL CHECK (proficiency_level BETWEEN 1 AND 5),
    verified_by skill_verification_source NOT NULL DEFAULT 'SELF',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, skill_id)
);

-- 5. Companies Table
CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    logo_url VARCHAR(500),
    industry VARCHAR(100),
    website VARCHAR(500),
    description TEXT,
    location VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Recruiter Profiles Table
CREATE TABLE recruiter_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
    designation VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Resumes Table
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    file_url VARCHAR(500) NOT NULL,
    parsed_text TEXT,
    ats_score INT CHECK (ats_score BETWEEN 0 AND 100),
    resume_score INT CHECK (resume_score BETWEEN 0 AND 100),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_resumes_student ON resumes(student_id);

-- 8. Jobs Table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    recruiter_id UUID NOT NULL REFERENCES recruiter_profiles(user_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
    min_experience INT NOT NULL DEFAULT 0,
    location VARCHAR(255) NOT NULL,
    salary_min NUMERIC(12, 2),
    salary_max NUMERIC(12, 2),
    employment_type job_employment_type NOT NULL DEFAULT 'FULL_TIME',
    status job_status NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_jobs_status ON jobs(status);

-- 9. Job Applications Table
CREATE TABLE job_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    status application_status NOT NULL DEFAULT 'APPLIED',
    match_score NUMERIC(5, 2),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_student_job UNIQUE (student_id, job_id)
);

CREATE INDEX idx_applications_job ON job_applications(job_id);
CREATE INDEX idx_applications_student ON job_applications(student_id);

-- 10. AI Mock Interview Sessions Table
CREATE TABLE interview_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    target_role VARCHAR(255) NOT NULL,
    transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
    feedback JSONB DEFAULT '{}'::jsonb,
    score INT CHECK (score BETWEEN 0 AND 100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_interviews_student ON interview_sessions(student_id);

-- 11. AI Career Roadmaps Table
CREATE TABLE career_roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    target_role VARCHAR(255) NOT NULL,
    duration_months INT NOT NULL CHECK (duration_months IN (3, 6, 12)),
    plan JSONB NOT NULL DEFAULT '{}'::jsonb,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roadmaps_student ON career_roadmaps(student_id);

-- 12. Coding Tracker Stats Table
CREATE TABLE coding_tracker_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    platform coding_platform NOT NULL,
    problems_solved INT NOT NULL DEFAULT 0,
    rating INT DEFAULT 0,
    last_synced TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_student_platform UNIQUE (student_id, platform)
);

-- 13. ML Placement Predictions Table
CREATE TABLE placement_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    probability NUMERIC(5, 4) NOT NULL CHECK (probability BETWEEN 0 AND 1),
    predicted_salary_lpa NUMERIC(6, 2),
    factors JSONB NOT NULL DEFAULT '{}'::jsonb,
    predicted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_predictions_student ON placement_predictions(student_id);

-- 14. Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
