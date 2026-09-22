-- ==============================================================================
-- Flyway Migration V3: Seed Reference Tech & Soft Skills Taxonomy (~60 Skills)
-- Categories: Languages, Frontend, Backend, Databases, Cloud & DevOps, AI & Data, Soft Skills
-- ==============================================================================

INSERT INTO skills (id, name, category) VALUES
-- Programming Languages
(uuid_generate_v4(), 'Java', 'Languages'),
(uuid_generate_v4(), 'Python', 'Languages'),
(uuid_generate_v4(), 'JavaScript', 'Languages'),
(uuid_generate_v4(), 'TypeScript', 'Languages'),
(uuid_generate_v4(), 'C++', 'Languages'),
(uuid_generate_v4(), 'Go', 'Languages'),
(uuid_generate_v4(), 'Rust', 'Languages'),
(uuid_generate_v4(), 'SQL', 'Languages'),
(uuid_generate_v4(), 'Kotlin', 'Languages'),
(uuid_generate_v4(), 'Swift', 'Languages'),

-- Web & Frontend
(uuid_generate_v4(), 'React.js', 'Frontend'),
(uuid_generate_v4(), 'Next.js', 'Frontend'),
(uuid_generate_v4(), 'Vue.js', 'Frontend'),
(uuid_generate_v4(), 'Angular', 'Frontend'),
(uuid_generate_v4(), 'Tailwind CSS', 'Frontend'),
(uuid_generate_v4(), 'HTML5 / CSS3', 'Frontend'),
(uuid_generate_v4(), 'Redux Toolkit', 'Frontend'),
(uuid_generate_v4(), 'GraphQL', 'Frontend'),

-- Backend & Frameworks
(uuid_generate_v4(), 'Spring Boot', 'Backend'),
(uuid_generate_v4(), 'Node.js', 'Backend'),
(uuid_generate_v4(), 'Express.js', 'Backend'),
(uuid_generate_v4(), 'FastAPI', 'Backend'),
(uuid_generate_v4(), 'Django', 'Backend'),
(uuid_generate_v4(), 'NestJS', 'Backend'),
(uuid_generate_v4(), 'ASP.NET Core', 'Backend'),
(uuid_generate_v4(), 'RESTful API Design', 'Backend'),
(uuid_generate_v4(), 'Microservices', 'Backend'),

-- Databases & Storage
(uuid_generate_v4(), 'PostgreSQL', 'Databases'),
(uuid_generate_v4(), 'MySQL', 'Databases'),
(uuid_generate_v4(), 'MongoDB', 'Databases'),
(uuid_generate_v4(), 'Redis', 'Databases'),
(uuid_generate_v4(), 'pgvector', 'Databases'),
(uuid_generate_v4(), 'Elasticsearch', 'Databases'),
(uuid_generate_v4(), 'Cassandra', 'Databases'),

-- Cloud, DevOps & Infrastructure
(uuid_generate_v4(), 'Docker', 'Cloud & DevOps'),
(uuid_generate_v4(), 'Kubernetes', 'Cloud & DevOps'),
(uuid_generate_v4(), 'AWS', 'Cloud & DevOps'),
(uuid_generate_v4(), 'Google Cloud Platform (GCP)', 'Cloud & DevOps'),
(uuid_generate_v4(), 'Microsoft Azure', 'Cloud & DevOps'),
(uuid_generate_v4(), 'Terraform', 'Cloud & DevOps'),
(uuid_generate_v4(), 'CI/CD Pipelines (GitHub Actions)', 'Cloud & DevOps'),
(uuid_generate_v4(), 'Linux Systems', 'Cloud & DevOps'),

-- AI, Machine Learning & Data Science
(uuid_generate_v4(), 'Machine Learning', 'AI & Data'),
(uuid_generate_v4(), 'Deep Learning', 'AI & Data'),
(uuid_generate_v4(), 'Scikit-learn', 'AI & Data'),
(uuid_generate_v4(), 'Pandas & NumPy', 'AI & Data'),
(uuid_generate_v4(), 'PyTorch', 'AI & Data'),
(uuid_generate_v4(), 'TensorFlow', 'AI & Data'),
(uuid_generate_v4(), 'Natural Language Processing (NLP)', 'AI & Data'),
(uuid_generate_v4(), 'Google Gemini API / LLMs', 'AI & Data'),

-- Software Engineering & Tools
(uuid_generate_v4(), 'Git & GitHub', 'Tools'),
(uuid_generate_v4(), 'Data Structures & Algorithms', 'Tools'),
(uuid_generate_v4(), 'System Design', 'Tools'),
(uuid_generate_v4(), 'Agile / Scrum', 'Tools'),

-- Soft Skills & Leadership
(uuid_generate_v4(), 'Problem Solving', 'Soft Skills'),
(uuid_generate_v4(), 'Technical Communication', 'Soft Skills'),
(uuid_generate_v4(), 'Teamwork & Collaboration', 'Soft Skills'),
(uuid_generate_v4(), 'Time Management', 'Soft Skills'),
(uuid_generate_v4(), 'Critical Thinking', 'Soft Skills')
ON CONFLICT (name) DO NOTHING;
