-- ==============================================================================
-- Flyway Migration V10: Communication Test & MCQ Practice Test Schema & Seed Data
-- Database: PostgreSQL 16 / H2 compatible
-- Project: SkillForge AI
-- ==============================================================================

-- 1. Tests Table
CREATE TABLE IF NOT EXISTS tests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- COMMUNICATION, MCQ
    module_id VARCHAR(100),
    duration_minutes INT NOT NULL DEFAULT 30,
    passing_score INT NOT NULL DEFAULT 60,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tests_type_active ON tests(type, is_active);
CREATE INDEX IF NOT EXISTS idx_tests_module ON tests(module_id);

-- 2. Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'MCQ', -- MCQ, FILL_IN_BLANK, SHORT_ANSWER
    skill_category VARCHAR(100) NOT NULL, -- Grammar, Vocabulary, Fluency, Comprehension, Pronunciation, Java, React, SQL, Data Structures
    difficulty VARCHAR(50) NOT NULL DEFAULT 'MEDIUM', -- EASY, MEDIUM, HARD
    points INT NOT NULL DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_questions_test ON questions(test_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(skill_category);

-- 3. Question Options Table
CREATE TABLE IF NOT EXISTS question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    explanation TEXT
);

CREATE INDEX IF NOT EXISTS idx_options_question ON question_options(question_id);

-- 4. Student Test Attempts Table
CREATE TABLE IF NOT EXISTS student_test_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES student_profiles(user_id) ON DELETE CASCADE,
    test_id UUID NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, COMPLETED, TIMED_OUT
    question_order JSONB, -- Array of question UUIDs in per-attempt Fisher-Yates shuffled order
    option_order JSONB, -- Object mapping question_id -> array of option UUIDs
    score INT NOT NULL DEFAULT 0,
    total_points INT NOT NULL DEFAULT 0,
    percentage DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP WITH TIME ZONE,
    time_taken_seconds INT NOT NULL DEFAULT 0,
    is_practice BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_attempts_student_test ON student_test_attempts(student_id, test_id, started_at DESC);

-- 5. Student Answers Table
CREATE TABLE IF NOT EXISTS student_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES student_test_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES question_options(id) ON DELETE SET NULL,
    answer_text TEXT,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    points_earned INT NOT NULL DEFAULT 0,
    time_taken_seconds INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_answers_attempt ON student_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_answers_question ON student_answers(question_id);

-- 6. Attempt Category Scores Table
CREATE TABLE IF NOT EXISTS attempt_category_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES student_test_attempts(id) ON DELETE CASCADE,
    skill_category VARCHAR(100) NOT NULL,
    score INT NOT NULL DEFAULT 0,
    max_score INT NOT NULL DEFAULT 0,
    percentage DOUBLE PRECISION NOT NULL DEFAULT 0.0
);

CREATE INDEX IF NOT EXISTS idx_category_scores_attempt ON attempt_category_scores(attempt_id);

-- 7. Suggestions Config Table
CREATE TABLE IF NOT EXISTS suggestions_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_type VARCHAR(50) NOT NULL DEFAULT 'ALL', -- COMMUNICATION, MCQ, ALL
    skill_category VARCHAR(100) NOT NULL,
    threshold_percentage DOUBLE PRECISION NOT NULL DEFAULT 60.0,
    suggestion_text TEXT NOT NULL,
    resource_link VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suggestions_category ON suggestions_config(skill_category);

-- ==============================================================================
-- Seed Data: Predefined Suggestions Mappings
-- ==============================================================================

INSERT INTO suggestions_config (id, test_type, skill_category, threshold_percentage, suggestion_text, resource_link) VALUES
('a1111111-1111-1111-1111-111111111111', 'COMMUNICATION', 'Grammar', 60.0, 'Focus on subject-verb agreement and complex tense usage. Practice daily grammar drills on tense consistency.', 'https://grammarly.com/blog/category/handbook'),
('a2222222-2222-2222-2222-222222222222', 'COMMUNICATION', 'Vocabulary', 60.0, 'Expand your professional technical vocabulary. Learn 5 new context words daily and practice using them in sentences.', 'https://vocabulary.com/lists'),
('a3333333-3333-3333-3333-333333333333', 'COMMUNICATION', 'Fluency', 60.0, 'Work on sentence linking, transition words, and pacing. Try recording 2-minute spontaneous speeches.', 'https://bbc.co.uk/learningenglish'),
('a4444444-4444-4444-4444-444444444444', 'COMMUNICATION', 'Comprehension', 60.0, 'Practice active reading and main-idea extraction from complex tech blogs and documentation.', 'https://medium.com/topic/technology'),
('a5555555-5555-5555-5555-555555555555', 'COMMUNICATION', 'Pronunciation', 60.0, 'Practice stress and intonation patterns for common technical jargon. Listen and shadow native audio clips.', 'https://youglish.com'),
('a6666666-6666-6666-6666-666666666666', 'MCQ', 'Java', 60.0, 'Review Java 21 features, Stream API, Concurrency, and Memory Management fundamentals.', 'https://docs.oracle.com/en/java/javase/21'),
('a7777777-7777-7777-7777-777777777777', 'MCQ', 'React', 60.0, 'Deep dive into React Hooks lifecycle, state management, memoization, and component re-rendering optimization.', 'https://react.dev/learn'),
('a8888888-8888-8888-8888-888888888888', 'MCQ', 'SQL', 60.0, 'Master SQL window functions, indexing strategies, JOIN optimization, and query execution plans.', 'https://postgresqltutorial.com'),
('a9999999-9999-9999-9999-999999999999', 'MCQ', 'Data Structures', 60.0, 'Practice time/space complexity analysis (Big O), trees, graphs, dynamic programming, and binary search.', 'https://leetcode.com/explore');

-- ==============================================================================
-- Seed Data: Sample Tests, Questions, and Options
-- ==============================================================================

-- Test 1: Professional Technical Communication Test
INSERT INTO tests (id, title, description, type, module_id, duration_minutes, passing_score, is_active) VALUES
('b1000000-0000-0000-0000-000000000001', 'Professional Workplace Communication Assessment', 'Comprehensive assessment evaluating professional grammar, tech vocabulary, sentence fluency, listening/reading comprehension, and pronunciation rules.', 'COMMUNICATION', 'COMM_101', 20, 60, TRUE);

-- Questions for Communication Test
-- Q1: Grammar
INSERT INTO questions (id, test_id, question_text, type, skill_category, difficulty, points) VALUES
('b1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000001', 'Identify the sentence with correct subject-verb agreement in a technical report context:', 'MCQ', 'Grammar', 'EASY', 10);
INSERT INTO question_options (id, question_id, option_text, is_correct, explanation) VALUES
('b1000000-0000-0000-0000-000000000011', 'b1000000-0000-0000-0000-000000000010', 'Neither the server logs nor the database error report show any anomalies.', TRUE, 'Correct! When using "neither/nor", the verb agrees with the closer subject ("report" is singular -> "shows" or plural compound subject rule).'),
('b1000000-0000-0000-0000-000000000012', 'b1000000-0000-0000-0000-000000000010', 'Neither the server logs nor the database error report shows any anomalies.', FALSE, 'Incorrect agreement.'),
('b1000000-0000-0000-0000-000000000013', 'b1000000-0000-0000-0000-000000000010', 'Each of the microservices were failing during stress testing.', FALSE, '"Each" is singular and requires "was failing".'),
('b1000000-0000-0000-0000-000000000014', 'b1000000-0000-0000-0000-000000000010', 'The group of developers have decided to refactor the module.', FALSE, '"group" as a single entity takes "has decided".');

-- Q2: Vocabulary
INSERT INTO questions (id, test_id, question_text, type, skill_category, difficulty, points) VALUES
('b1000000-0000-0000-0000-000000000020', 'b1000000-0000-0000-0000-000000000001', 'What is the most accurate synonym for "idempotent" in software architecture communication?', 'MCQ', 'Vocabulary', 'MEDIUM', 10);
INSERT INTO question_options (id, question_id, option_text, is_correct, explanation) VALUES
('b1000000-0000-0000-0000-000000000021', 'b1000000-0000-0000-0000-000000000020', 'Producing the same result regardless of how many times an operation is executed', TRUE, 'Correct! Idempotency means multiple identical requests have the same effect as a single request.'),
('b1000000-0000-0000-0000-000000000022', 'b1000000-0000-0000-0000-000000000020', 'Executing tasks asynchronously without blocking the main process thread', FALSE, 'That is asynchronous execution.'),
('b1000000-0000-0000-0000-000000000023', 'b1000000-0000-0000-0000-000000000020', 'Automatically scaling database connections under high load', FALSE, 'That is auto-scaling.'),
('b1000000-0000-0000-0000-000000000024', 'b1000000-0000-0000-0000-000000000020', 'Encrypting sensitive payloads during data transmission', FALSE, 'That is transport encryption.');

-- Q3: Fluency
INSERT INTO questions (id, test_id, question_text, type, skill_category, difficulty, points) VALUES
('b1000000-0000-0000-0000-000000000030', 'b1000000-0000-0000-0000-000000000001', 'Select the best cohesive transition word to complete: "The deployment failed due to network latency; ______, we initiated the automated rollback procedure immediately."', 'MCQ', 'Fluency', 'MEDIUM', 10);
INSERT INTO question_options (id, question_id, option_text, is_correct, explanation) VALUES
('b1000000-0000-0000-0000-000000000031', 'b1000000-0000-0000-0000-000000000030', 'consequently', TRUE, 'Correct! "consequently" connects cause (deployment failure) to effect (initiating rollback).'),
('b1000000-0000-0000-0000-000000000032', 'b1000000-0000-0000-0000-000000000030', 'nevertheless', FALSE, 'Used for contrast, which does not fit.'),
('b1000000-0000-0000-0000-000000000030', 'b1000000-0000-0000-0000-000000000030', 'on the other hand', FALSE, 'Used for presenting opposing points.'),
('b1000000-0000-0000-0000-000000000034', 'b1000000-0000-0000-0000-000000000030', 'in addition', FALSE, 'Used for additive points.');

-- Q4: Comprehension
INSERT INTO questions (id, test_id, question_text, type, skill_category, difficulty, points) VALUES
('b1000000-0000-0000-0000-000000000040', 'b1000000-0000-0000-0000-000000000001', 'Passage: "Micro-frontend architecture decomposes a monolithic frontend into smaller, semi-independent web applications that can be built and deployed by separate teams." What is the primary takeaway of micro-frontends according to this statement?', 'MCQ', 'Comprehension', 'EASY', 10);
INSERT INTO question_options (id, question_id, option_text, is_correct, explanation) VALUES
('b1000000-0000-0000-0000-000000000041', 'b1000000-0000-0000-0000-000000000040', 'It enables autonomous team ownership and independent deployment of UI slices.', TRUE, 'Correct! The passage highlights decomposing monoliths so separate teams can build and deploy semi-independently.'),
('b1000000-0000-0000-0000-000000000042', 'b1000000-0000-0000-0000-000000000040', 'It completely eliminates backend microservices requirement.', FALSE, 'The passage does not state this.'),
('b1000000-0000-0000-0000-000000000043', 'b1000000-0000-0000-0000-000000000040', 'It forces all developers to write code in a single repository.', FALSE, 'Micro-frontends allow separate teams to manage independent codebases.'),
('b1000000-0000-0000-0000-000000000044', 'b1000000-0000-0000-0000-000000000040', 'It improves database indexing speed.', FALSE, 'Irrelevant to frontend architecture.');

-- Q5: Pronunciation / Sound Stress
INSERT INTO questions (id, test_id, question_text, type, skill_category, difficulty, points) VALUES
('b1000000-0000-0000-0000-000000000050', 'b1000000-0000-0000-0000-000000000001', 'Which syllable carries the primary stress in the word "architecture"?', 'MCQ', 'Pronunciation', 'EASY', 10);
INSERT INTO question_options (id, question_id, option_text, is_correct, explanation) VALUES
('b1000000-0000-0000-0000-000000000051', 'b1000000-0000-0000-0000-000000000050', 'First syllable (AR-chi-tec-ture)', TRUE, 'Correct! Primary stress is on the first syllable: AR-chi-tec-ture.'),
('b1000000-0000-0000-0000-000000000052', 'b1000000-0000-0000-0000-000000000050', 'Second syllable (ar-CHI-tec-ture)', FALSE, 'Incorrect stress.'),
('b1000000-0000-0000-0000-000000000053', 'b1000000-0000-0000-0000-000000000050', 'Third syllable (ar-chi-TEC-ture)', FALSE, 'Incorrect stress.'),
('b1000000-0000-0000-0000-000000000054', 'b1000000-0000-0000-0000-000000000050', 'Fourth syllable (ar-chi-tec-TURE)', FALSE, 'Incorrect stress.');


-- Test 2: Full-Stack Engineering MCQ Practice Test
INSERT INTO tests (id, title, description, type, module_id, duration_minutes, passing_score, is_active) VALUES
('c1000000-0000-0000-0000-000000000001', 'Full-Stack Engineering & Core CS Practice Test', 'Timed multiple-choice practice test covering Java Spring Boot, React Architecture, SQL Queries, and Data Structures.', 'MCQ', 'FS_201', 15, 60, TRUE);

-- Questions for MCQ Practice Test
-- Q1: Java
INSERT INTO questions (id, test_id, question_text, type, skill_category, difficulty, points) VALUES
('c1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000001', 'What is the default bean scope in Spring Framework?', 'MCQ', 'Java', 'EASY', 10);
INSERT INTO question_options (id, question_id, option_text, is_correct, explanation) VALUES
('c1000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000010', 'singleton', TRUE, 'Correct! Spring creates a single instance of a singleton bean per IoC container.'),
('c1000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000010', 'prototype', FALSE, 'Prototype creates a new instance on every request.'),
('c1000000-0000-0000-0000-000000000013', 'c1000000-0000-0000-0000-000000000010', 'request', FALSE, 'Request scope is scoped to HTTP request lifecycle.'),
('c1000000-0000-0000-0000-000000000014', 'c1000000-0000-0000-0000-000000000010', 'session', FALSE, 'Session scope is scoped to HTTP session.');

-- Q2: React
INSERT INTO questions (id, test_id, question_text, type, skill_category, difficulty, points) VALUES
('c1000000-0000-0000-0000-000000000020', 'c1000000-0000-0000-0000-000000000001', 'Which hook should be used to memoize expensive calculation results between re-renders?', 'MCQ', 'React', 'MEDIUM', 10);
INSERT INTO question_options (id, question_id, option_text, is_correct, explanation) VALUES
('c1000000-0000-0000-0000-000000000021', 'c1000000-0000-0000-0000-000000000020', 'useMemo', TRUE, 'Correct! useMemo caches the result of a calculation between renders.'),
('c1000000-0000-0000-0000-000000000022', 'c1000000-0000-0000-0000-000000000020', 'useCallback', FALSE, 'useCallback caches a function definition.'),
('c1000000-0000-0000-0000-000000000023', 'c1000000-0000-0000-0000-000000000020', 'useEffect', FALSE, 'useEffect handles side effects.'),
('c1000000-0000-0000-0000-000000000024', 'c1000000-0000-0000-0000-000000000020', 'useRef', FALSE, 'useRef stores a mutable value that does not trigger re-renders.');

-- Q3: SQL
INSERT INTO questions (id, test_id, question_text, type, skill_category, difficulty, points) VALUES
('c1000000-0000-0000-0000-000000000030', 'c1000000-0000-0000-0000-000000000001', 'Which SQL clause is used to filter aggregate records after GROUP BY?', 'MCQ', 'SQL', 'EASY', 10);
INSERT INTO question_options (id, question_id, option_text, is_correct, explanation) VALUES
('c1000000-0000-0000-0000-000000000031', 'c1000000-0000-0000-0000-000000000030', 'HAVING', TRUE, 'Correct! HAVING filters aggregated results created by GROUP BY.'),
('c1000000-0000-0000-0000-000000000032', 'c1000000-0000-0000-0000-000000000030', 'WHERE', FALSE, 'WHERE filters individual rows before aggregation.'),
('c1000000-0000-0000-0000-000000000033', 'c1000000-0000-0000-0000-000000000030', 'ORDER BY', FALSE, 'ORDER BY sorts the output.'),
('c1000000-0000-0000-0000-000000000034', 'c1000000-0000-0000-0000-000000000030', 'LIMIT', FALSE, 'LIMIT restricts row counts.');

-- Q4: Data Structures
INSERT INTO questions (id, test_id, question_text, type, skill_category, difficulty, points) VALUES
('c1000000-0000-0000-0000-000000000040', 'c1000000-0000-0000-0000-000000000001', 'What is the worst-case time complexity of QuickSort?', 'MCQ', 'Data Structures', 'HARD', 10);
INSERT INTO question_options (id, question_id, option_text, is_correct, explanation) VALUES
('c1000000-0000-0000-0000-000000000041', 'c1000000-0000-0000-0000-000000000040', 'O(n^2)', TRUE, 'Correct! Worst-case occurs when the pivot selection consistently splits array into 0 and n-1 elements.'),
('c1000000-0000-0000-0000-000000000042', 'c1000000-0000-0000-0000-000000000040', 'O(n log n)', FALSE, 'O(n log n) is the average case.'),
('c1000000-0000-0000-0000-000000000043', 'c1000000-0000-0000-0000-000000000040', 'O(n)', FALSE, 'Linear time is not QuickSort worst-case.'),
('c1000000-0000-0000-0000-000000000044', 'c1000000-0000-0000-0000-000000000040', 'O(1)', FALSE, 'O(1) is constant time.');
