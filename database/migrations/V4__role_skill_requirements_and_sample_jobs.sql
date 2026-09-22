-- ==============================================================================
-- Flyway Migration V4: Role-Skill Requirements Matrix & Sample Jobs Seeding
-- Database: PostgreSQL 16
-- Project: SkillForge AI
-- ==============================================================================

-- 1. Role Skill Requirements Matrix Table
CREATE TABLE role_skill_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_name VARCHAR(255) NOT NULL,
    skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
    required_proficiency INT NOT NULL CHECK (required_proficiency BETWEEN 1 AND 5),
    priority VARCHAR(50) NOT NULL DEFAULT 'MUST_HAVE', -- MUST_HAVE or NICE_TO_HAVE
    CONSTRAINT uk_role_skill UNIQUE (role_name, skill_id)
);

CREATE INDEX idx_role_skill_role ON role_skill_requirements(role_name);

-- 2. Seed Role Skill Requirements for ~15 Common Tech Roles
-- 1. Full Stack Engineer
INSERT INTO role_skill_requirements (role_name, skill_id, required_proficiency, priority)
SELECT 'Full Stack Engineer', id, 4, 'MUST_HAVE' FROM skills WHERE name IN ('Java', 'Spring Boot', 'React.js', 'TypeScript', 'PostgreSQL', 'RESTful API Design')
ON CONFLICT DO NOTHING;

INSERT INTO role_skill_requirements (role_name, skill_id, required_proficiency, priority)
SELECT 'Full Stack Engineer', id, 3, 'NICE_TO_HAVE' FROM skills WHERE name IN ('Docker', 'Redis', 'pgvector', 'CI/CD Pipelines (GitHub Actions)')
ON CONFLICT DO NOTHING;

-- 2. Backend Engineer
INSERT INTO role_skill_requirements (role_name, skill_id, required_proficiency, priority)
SELECT 'Backend Engineer', id, 4, 'MUST_HAVE' FROM skills WHERE name IN ('Java', 'Spring Boot', 'SQL', 'PostgreSQL', 'RESTful API Design', 'Microservices')
ON CONFLICT DO NOTHING;

INSERT INTO role_skill_requirements (role_name, skill_id, required_proficiency, priority)
SELECT 'Backend Engineer', id, 3, 'NICE_TO_HAVE' FROM skills WHERE name IN ('Docker', 'Redis', 'System Design', 'pgvector')
ON CONFLICT DO NOTHING;

-- 3. Frontend Engineer
INSERT INTO role_skill_requirements (role_name, skill_id, required_proficiency, priority)
SELECT 'Frontend Engineer', id, 5, 'MUST_HAVE' FROM skills WHERE name IN ('JavaScript', 'TypeScript', 'React.js', 'Next.js', 'Tailwind CSS', 'HTML5 / CSS3')
ON CONFLICT DO NOTHING;

INSERT INTO role_skill_requirements (role_name, skill_id, required_proficiency, priority)
SELECT 'Frontend Engineer', id, 3, 'NICE_TO_HAVE' FROM skills WHERE name IN ('Redux Toolkit', 'GraphQL')
ON CONFLICT DO NOTHING;

-- 4. DevOps Engineer
INSERT INTO role_skill_requirements (role_name, skill_id, required_proficiency, priority)
SELECT 'DevOps Engineer', id, 5, 'MUST_HAVE' FROM skills WHERE name IN ('Docker', 'Kubernetes', 'AWS', 'Linux Systems', 'CI/CD Pipelines (GitHub Actions)', 'Terraform')
ON CONFLICT DO NOTHING;

-- 5. ML Engineer
INSERT INTO role_skill_requirements (role_name, skill_id, required_proficiency, priority)
SELECT 'ML Engineer', id, 5, 'MUST_HAVE' FROM skills WHERE name IN ('Python', 'Machine Learning', 'Deep Learning', 'Scikit-learn', 'Pandas & NumPy', 'PyTorch')
ON CONFLICT DO NOTHING;

INSERT INTO role_skill_requirements (role_name, skill_id, required_proficiency, priority)
SELECT 'ML Engineer', id, 4, 'NICE_TO_HAVE' FROM skills WHERE name IN ('Google Gemini API / LLMs', 'pgvector')
ON CONFLICT DO NOTHING;

-- 6. Data Analyst
INSERT INTO role_skill_requirements (role_name, skill_id, required_proficiency, priority)
SELECT 'Data Analyst', id, 4, 'MUST_HAVE' FROM skills WHERE name IN ('SQL', 'Python', 'Pandas & NumPy', 'Problem Solving')
ON CONFLICT DO NOTHING;

-- 7. Cloud Engineer
INSERT INTO role_skill_requirements (role_name, skill_id, required_proficiency, priority)
SELECT 'Cloud Engineer', id, 4, 'MUST_HAVE' FROM skills WHERE name IN ('AWS', 'Docker', 'Terraform', 'Linux Systems', 'CI/CD Pipelines (GitHub Actions)')
ON CONFLICT DO NOTHING;

-- 8. Mobile App Developer
INSERT INTO role_skill_requirements (role_name, skill_id, required_proficiency, priority)
SELECT 'Mobile App Developer', id, 4, 'MUST_HAVE' FROM skills WHERE name IN ('Kotlin', 'Swift', 'React.js', 'TypeScript', 'RESTful API Design')
ON CONFLICT DO NOTHING;

-- 9. Data Engineer
INSERT INTO role_skill_requirements (role_name, skill_id, required_proficiency, priority)
SELECT 'Data Engineer', id, 4, 'MUST_HAVE' FROM skills WHERE name IN ('Python', 'SQL', 'PostgreSQL', 'MongoDB', 'Pandas & NumPy')
ON CONFLICT DO NOTHING;

-- 10. Security Engineer
INSERT INTO role_skill_requirements (role_name, skill_id, required_proficiency, priority)
SELECT 'Security Engineer', id, 4, 'MUST_HAVE' FROM skills WHERE name IN ('Linux Systems', 'Python', 'AWS', 'Critical Thinking')
ON CONFLICT DO NOTHING;

-- 11. QA / Test Automation Engineer
INSERT INTO role_skill_requirements (role_name, skill_id, required_proficiency, priority)
SELECT 'QA Engineer', id, 4, 'MUST_HAVE' FROM skills WHERE name IN ('Python', 'JavaScript', 'Git & GitHub', 'RESTful API Design', 'Problem Solving')
ON CONFLICT DO NOTHING;

-- 12. UI/UX Designer & Developer
INSERT INTO role_skill_requirements (role_name, skill_id, required_proficiency, priority)
SELECT 'UI/UX Developer', id, 4, 'MUST_HAVE' FROM skills WHERE name IN ('HTML5 / CSS3', 'Tailwind CSS', 'React.js', 'TypeScript')
ON CONFLICT DO NOTHING;

-- 13. Technical Product Manager
INSERT INTO role_skill_requirements (role_name, skill_id, required_proficiency, priority)
SELECT 'Product Manager', id, 4, 'MUST_HAVE' FROM skills WHERE name IN ('Agile / Scrum', 'Technical Communication', 'Problem Solving', 'Teamwork & Collaboration')
ON CONFLICT DO NOTHING;

-- 14. Embedded Systems & IoT Engineer
INSERT INTO role_skill_requirements (role_name, skill_id, required_proficiency, priority)
SELECT 'Embedded Systems Engineer', id, 4, 'MUST_HAVE' FROM skills WHERE name IN ('C++', 'Python', 'Linux Systems', 'Problem Solving')
ON CONFLICT DO NOTHING;

-- 15. AI / LLM Solutions Engineer
INSERT INTO role_skill_requirements (role_name, skill_id, required_proficiency, priority)
SELECT 'AI Solutions Engineer', id, 5, 'MUST_HAVE' FROM skills WHERE name IN ('Python', 'Google Gemini API / LLMs', 'pgvector', 'FastAPI', 'Natural Language Processing (NLP)')
ON CONFLICT DO NOTHING;

-- 3. Seed Sample Companies & Jobs for testing recommendations
INSERT INTO companies (id, name, logo_url, industry, website, description, location) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Acme Tech Solutions', 'https://logo.clearbit.com/acme.com', 'Enterprise Software', 'https://acme.com', 'Leading enterprise software ecosystem provider', 'Remote'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Apex AI Labs', 'https://logo.clearbit.com/apex.ai', 'Artificial Intelligence', 'https://apex.ai', 'Next-gen generative AI applications', 'San Francisco, CA'),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'CloudScale Systems', 'https://logo.clearbit.com/cloudscale.io', 'Cloud & Infrastructure', 'https://cloudscale.io', 'Scalable distributed systems provider', 'New York, NY')
ON CONFLICT (name) DO NOTHING;

-- Seed Sample Jobs (Note: Recruiter ID uses dummy UUID or reference)
INSERT INTO jobs (id, company_id, recruiter_id, title, description, required_skills, min_experience, location, salary_min, salary_max, employment_type, status) VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '00000000-0000-0000-0000-000000000000',
    'Senior Full Stack Java Engineer',
    'We are seeking a high-performing Full Stack Engineer proficient in Java 21, Spring Boot 3.5, React 19, and PostgreSQL vector embeddings.',
    '["Java", "Spring Boot", "React.js", "TypeScript", "PostgreSQL", "Docker"]'::jsonb,
    2,
    'Remote',
    120000.00,
    150000.00,
    'FULL_TIME',
    'ACTIVE'
),
(
    '22222222-2222-2222-2222-222222222222',
    'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
    '00000000-0000-0000-0000-000000000000',
    'AI Application & Backend Engineer',
    'Join our Core AI Team to build scalable LLM pipelines using Spring Boot, FastAPI, Google Gemini API, and pgvector.',
    '["Python", "Java", "Spring Boot", "FastAPI", "Google Gemini API / LLMs", "pgvector"]'::jsonb,
    1,
    'San Francisco, CA',
    135000.00,
    170000.00,
    'FULL_TIME',
    'ACTIVE'
),
(
    '33333333-3333-3333-3333-333333333333',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
    '00000000-0000-0000-0000-000000000000',
    'Cloud & DevOps Engineer Intern',
    'Build and maintain CI/CD pipelines, Docker containers, and Kubernetes clusters across AWS infrastructure.',
    '["Docker", "Kubernetes", "AWS", "Linux Systems", "CI/CD Pipelines (GitHub Actions)"]'::jsonb,
    0,
    'New York, NY',
    80000.00,
    100000.00,
    'INTERNSHIP',
    'ACTIVE'
)
ON CONFLICT (id) DO NOTHING;
