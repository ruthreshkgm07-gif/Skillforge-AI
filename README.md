# SkillForge AI

> An intelligent career accelerator and semantic talent discovery platform connecting candidates and recruiters through AI-driven interviews, resume analytics, and skill evaluation.

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Python%203.12-teal.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%20%2B%20pgvector-blue.svg)](https://github.com/pgvector/pgvector)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#license)

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Demo / Screenshots](#demo--screenshots)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Project](#running-the-project)
- [Application Services & Endpoints](#application-services--endpoints)
- [Usage Examples](#usage-examples)
- [API Reference & Documentation](#api-reference--documentation)
- [Testing & Quality Checks](#testing--quality-checks)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Author & Contact](#author--contact)

---

## Overview

Traditional technical hiring is broken: candidates rely on guesswork to pass opaque applicant tracking systems, while recruiters sift through hundreds of keyword-stuffed resumes without understanding true technical competence.

**SkillForge AI** solves this by uniting Generative AI, Machine Learning, and vector embeddings into a cohesive career platform:

1. **For Job Seekers**: Provides real-time conversational AI mock interviews, ATS resume scoring with actionable bullet-point fixes, data-driven placement/salary predictions, and automated tracking of external coding activity (GitHub and LeetCode).
2. **For Recruiters**: Enables high-dimensional semantic candidate search using `pgvector` (matching candidates by verified projects, skill synergy, and assessment scores rather than raw keywords), alongside an end-to-end Kanban hiring pipeline.

---

## Key Features

- **Voice-Enabled AI Mock Interviewer**: Conducts realistic technical and behavioral interview sessions powered by LLMs (Google Gemini, OpenRouter, and OpenAI) with real-time feedback, turn-by-turn critiques, and radar skill assessments.
- **ATS Resume Parser & Optimizer**: Ingests PDF and DOCX files via Apache PDFBox, Apache POI, and Apache Tika to diagnose keyword gaps, format deficiencies, and quantifiable impact metrics.
- **ML Placement & Salary Predictor**: Scikit-learn Random Forest models estimate candidate placement likelihood, salary bands (LPA), and key contributing factors.
- **Interactive Coding Practice & Explainer**: An in-browser coding environment with real-time test execution, multi-language support, and AI-assisted step-by-step logic explanations.
- **Multi-Platform Coding Tracker**: Synchronizes GitHub commits and LeetCode problem-solving stats into a single verified candidate portfolio.
- **Adaptive Assessments & Question Bank**: Evaluates computer science fundamentals, DSA, and aptitude through timed, domain-categorized MCQ test banks.
- **Semantic Candidate Matching (Recruiters)**: Uses 768-dimensional vector embeddings with PostgreSQL `pgvector` and HNSW indexing to rank candidates by contextual fit.
- **Recruiter Kanban Pipeline**: Tracks candidates across the full recruitment lifecycle (`Applied` &rarr; `Reviewing` &rarr; `Interviewing` &rarr; `Offered`) with AI candidate fit summaries.

---

## Demo / Screenshots

<!-- TODO: Add application demo GIFs and UI screenshots below -->

| Candidate Dashboard | AI Mock Interview |
| :---: | :---: |
| ![Candidate Dashboard Placeholder](docs/screenshots/candidate-dashboard.png)<br>*(Add screenshot of student dashboard, coding metrics, and readiness score)* | ![Mock Interview Placeholder](docs/screenshots/mock-interview.png)<br>*(Add screenshot of voice interview interface and feedback radar)* |

| Resume ATS Analyzer | Recruiter Candidate Search |
| :---: | :---: |
| ![ATS Analyzer Placeholder](docs/screenshots/resume-analyzer.png)<br>*(Add screenshot of ATS score breakdown and bullet recommendations)* | ![Recruiter Search Placeholder](docs/screenshots/recruiter-search.png)<br>*(Add screenshot of semantic vector matching and candidate Kanban board)* |

---

## Tech Stack

### Frontend
- **Framework**: React 18, TypeScript, Vite 5
- **UI & Styling**: Tailwind CSS, Radix UI primitives, Lucide React icons
- **State & Data Fetching**: TanStack Query (React Query), Axios, React Hook Form, Zod
- **Animations & Visualizations**: Framer Motion, Recharts

### Backend
- **Core Engine**: Java 21, Spring Boot 3.4.2
- **Security**: Spring Security 6, JJWT (stateless JWT authentication and role-based access control)
- **Persistence & ORM**: Spring Data JPA, Hibernate, PostgreSQL driver, H2 (local development fallback)
- **Document Processing**: Apache PDFBox (3.0.3), Apache POI (5.3.0), Apache Tika (3.0.0)
- **Media & File Storage**: Cloudinary Java SDK
- **Communication**: Spring Mail (SMTP notification engine)

### Machine Learning Microservice
- **Runtime**: Python 3.12, FastAPI, Uvicorn, Pydantic
- **Data & Modeling**: Scikit-learn, Pandas, NumPy, Joblib (Random Forest Classifier & Regressor)

### Database, Caching & Vector Search
- **Primary Database**: PostgreSQL 16
- **Vector Search Engine**: `pgvector` extension with HNSW similarity indexing
- **Caching & Rate Limiting**: Redis 7
- **Migrations**: Versioned SQL scripts / Flyway migration structure

### AI & LLM Integrations
- **Providers**: Google Gemini (`gemini-1.5-flash`), OpenRouter (`meta-llama/llama-3.3-70b-instruct:free`), and OpenAI (`gpt-4o-mini`)
- **Resilience**: Unified `LlmService` with automatic failover, timeout handling, and token management

---

## System Architecture

```text
                           Candidate / Recruiter Client (React 18 + Vite)
                                                │
                                                │ HTTP / REST
                                                ▼
                                   Spring Boot API Gateway
                                   (/api/v1  •  Port: 8080)
                                                │
                 ┌──────────────────────────────┼──────────────────────────────┐
                 ▼                              ▼                              ▼
          Security & Auth               Resume & Document               ML Client Service
       (JWT / Redis Sessions)         (Tika / PDFBox / POI)             (Internal HTTP)
                 │                              │                              │
                 │                              ▼                              ▼
                 │                      Cloudinary Storage              Python FastAPI
                 │                                                   (Port: 8000 • Scikit-learn)
                 │                                                             │
                 └──────────────────────────────┬──────────────────────────────┘
                                                ▼
                                   Unified LLM Orchestrator
                           (Google Gemini / OpenRouter / OpenAI)
                                                │
                                                ▼
                                 PostgreSQL 16 Database
                            (pgvector • HNSW Semantic Search)
```

---

## Project Structure

```text
Skillforge-AI/
├── backend/               # Spring Boot 3.4 REST API service (Java 21)
│   ├── src/main/java/     # Core application layers (auth, ai, recruiter, student, resume)
│   ├── src/main/resources/# Application configuration (application.yml)
│   └── pom.xml            # Maven project dependencies and build configuration
├── frontend/              # Single-page web client (React 18, TypeScript, Vite)
│   ├── src/               # React components, pages, context providers, and hooks
│   ├── package.json       # Node.js dependencies and script definitions
│   └── vite.config.ts     # Vite bundler, path aliases, and dev proxy configuration
├── ml-service/            # Machine learning microservice (Python 3.12, FastAPI)
│   ├── models/            # Serialized Joblib model artifacts
│   ├── main.py            # FastAPI inference endpoints
│   ├── train.py           # Model training and artifact generation pipeline
│   └── requirements.txt   # Python pip dependency manifest
├── database/              # Database scripts and migration files
│   ├── init.sql           # Database initialization and pgvector extension registration
│   └── migrations/        # Versioned SQL migration scripts
├── docker/                # Container orchestration
│   └── docker-compose.yml # Multi-container environment definition
├── docs/                  # Architecture specifications, deployment guides, and API documentation
│   ├── DEPLOYMENT.md      # Production deployment guide (Neon, Upstash, Render, Vercel)
│   └── api/               # API endpoint specifications and Postman collections
└── .env.example           # Reference environment variable template
```

---

## Getting Started

### Prerequisites

Choose one of the following setups:

#### Option 1: Docker (Recommended)
- [Docker](https://docs.docker.com/get-docker/) (v24+) and Docker Compose (v2+)

#### Option 2: Local Native Toolchain
- **Java**: JDK 21+
- **Build Tool**: Apache Maven 3.8+
- **Node.js**: Node 20+ and `npm`
- **Python**: Python 3.12+ and `pip`
- **Database & Cache**: PostgreSQL 16 (with `pgvector` enabled) and Redis 7

---

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ruthreshkgm07-gif/Skillforge-AI.git
   cd Skillforge-AI
   ```

2. **Create the environment file:**
   ```bash
   cp .env.example .env
   ```

---

### Environment Configuration

Update `.env` with your API keys and local configuration. A minimal working example:

```env
# Database (PostgreSQL + pgvector)
POSTGRES_DB=skillforge_db
POSTGRES_USER=skillforge_user
POSTGRES_PASSWORD=skillforge_password_secret
POSTGRES_PORT=5432
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/skillforge_db

# Redis Cache
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# Security & JWT
JWT_SECRET=404D635166546A576E5A7234753778214125442A472D4B6150645267556B5870
JWT_EXPIRATION_MS=86400000
JWT_REFRESH_EXPIRATION_MS=604800000

# LLM Providers (Provide at least one)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
OPENROUTER_API_KEYS=your_openrouter_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Python ML Microservice
ML_SERVICE_URL=http://ml-service:8000
ML_SERVICE_PORT=8000

# Cloudinary (Required for resume uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend Client
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_ML_API_BASE_URL=http://localhost:8000
```

> [!NOTE]
> For local standalone backend execution without Docker or PostgreSQL, Spring Boot falls back automatically to an embedded H2 file database (`./data/skillforge_db`). For full semantic vector search, PostgreSQL with `pgvector` is required.

---

### Running the Project

#### Method A: Using Docker Compose (All Services)

Run the full stack (PostgreSQL + pgvector, Redis, ML Service, Backend API, and Frontend client) with a single command:

```bash
docker compose -f docker/docker-compose.yml up --build -d
```

To stop all running services:
```bash
docker compose -f docker/docker-compose.yml down
```

---

#### Method B: Running Services Individually (Local Development)

If you prefer running services directly on your host machine:

**1. Start Database & Redis (via Docker):**
```bash
docker run -d --name skillforge-postgres -p 5432:5432 \
  -e POSTGRES_DB=skillforge_db \
  -e POSTGRES_USER=skillforge_user \
  -e POSTGRES_PASSWORD=skillforge_password_secret \
  pgvector/pgvector:pg16

docker run -d --name skillforge-redis -p 6379:6379 redis:7-alpine
```

**2. Start the ML Microservice (FastAPI):**
```bash
cd ml-service
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
*The ML service will start at `http://localhost:8000`.*

**3. Start the Backend API (Spring Boot):**
```bash
cd backend
mvn clean spring-boot:run
```
*The API gateway will start at `http://localhost:8080/api/v1`.*

**4. Start the Frontend Client (React + Vite):**
```bash
cd frontend
npm install
npm run dev
```
*The web interface will start at `http://localhost:3000`.*

---

## Application Services & Endpoints

| Service | Port | Base URL | Health Check / Documentation |
| :--- | :--- | :--- | :--- |
| **Frontend Web App** | `3000` | `http://localhost:3000` | `http://localhost:3000` |
| **Spring Boot REST API** | `8080` | `http://localhost:8080/api/v1` | `http://localhost:8080/api/v1/health` |
| **Spring Actuator Metrics** | `8080` | `http://localhost:8080/api/v1/actuator` | `http://localhost:8080/api/v1/actuator/health` |
| **FastAPI ML Service** | `8000` | `http://localhost:8000` | `http://localhost:8000/health` (Docs: `/docs`) |

---

## Usage Examples

### 1. Register a Candidate Account

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex.student@example.com",
    "password": "Password123!",
    "fullName": "Alex Student",
    "role": "STUDENT",
    "targetRole": "Full Stack Engineer"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "data": {
    "id": "c1f7a4b2-9d3e-4f81-a67b-123456789abc",
    "email": "alex.student@example.com",
    "fullName": "Alex Student",
    "role": "STUDENT"
  }
}
```

---

### 2. Candidate Login

```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alex.student@example.com",
    "password": "Password123!"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsIn...",
    "tokenType": "Bearer",
    "expiresIn": 86400000
  }
}
```

---

### 3. Run Placement & Salary Prediction (ML Service)

```bash
curl -X POST http://localhost:8000/predict/placement \
  -H "Content-Type: application/json" \
  -d '{
    "cgpa": 8.5,
    "coding_score": 350,
    "internships": 2,
    "projects_count": 3,
    "backlogs": 0,
    "resume_score": 85,
    "ats_score": 80,
    "mock_interview_score": 88
  }'
```

**Response:**
```json
{
  "placement_probability": 0.94,
  "predicted_salary_lpa": 17.13,
  "recommendation": "High likelihood of tier-1 placement. Focus on system design and mock interviews.",
  "top_factors": [
    {
      "feature": "Academic Standing (CGPA)",
      "impact": "POSITIVE",
      "importance_score": 0.35
    },
    {
      "feature": "Competitive Problem Solving",
      "impact": "POSITIVE",
      "importance_score": 0.30
    },
    {
      "feature": "AI Mock Interview Readiness",
      "impact": "POSITIVE",
      "importance_score": 0.25
    }
  ]
}
```

---

## API Reference & Documentation

Comprehensive API documentation and schemas are available in the [`docs/`](docs/) directory:

- [Authentication & Security API](docs/api/auth.md): Registration, login, JWT refresh, logout, and password recovery.
- [Student & Profile API](docs/api/student.md): Profile updates, coding tracker synchronization, and student dashboard stats.
- [Skill Gap & Jobs API](docs/api/skill-gap-jobs.md): Recruiter job postings, applicant tracking, and skill requirements.
- [Postman Collection](docs/api/SkillForge.postman_collection.json): Importable Postman environment and endpoint collection.
- **FastAPI Interactive Docs**: Accessible at `http://localhost:8000/docs` (Swagger UI) and `http://localhost:8000/redoc` when the ML service is running.
- [Production Deployment Guide](docs/DEPLOYMENT.md): Detailed deployment instructions for Neon, Upstash, Render, and Vercel.

---

## Testing & Quality Checks

### Backend (Spring Boot)
Run unit and integration tests with Maven:
```bash
cd backend
mvn test
```

### Frontend (React + TypeScript)
Execute TypeScript type checking and ESLint rules:
```bash
cd frontend
npm run lint
npm run build
```

### Machine Learning Service
Train or validate model artifacts and generate updated Joblib files:
```bash
cd ml-service
python train.py
```

---

## Roadmap

- [ ] **WebRTC Video Interviewing**: Live audio/video interview analysis with facial engagement and posture detection.
- [ ] **Sandboxed Code Execution**: Containerized code execution environment (Judge0 / isolated microVMs) for hands-on coding tests.
- [ ] **Third-Party ATS Integrations**: Webhook synchronization with Greenhouse, Lever, and Workday.
- [ ] **Multi-Tenant Enterprise Workspaces**: Dedicated tenant boundaries for university placement cells and enterprise recruiters.
- [ ] **Mobile Progressive Web App (PWA)**: Offline-first question bank review and mobile push notifications for interview reminders.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. **Fork the repository** on GitHub.
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**:
   ```bash
   git commit -m "feat: add amazing feature"
   ```
4. **Push to your branch**:
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request** against the `main` branch with a clear description of your changes.

Please ensure all tests and linter checks pass before submitting your PR.

---

## License

<!-- TODO: Commit a LICENSE file to the root of the repository if you want to explicitly license under MIT -->
This project is licensed under the [MIT License](LICENSE) — see the LICENSE file for details.

---

## Author & Contact

- **Author**: Ruthresh E
- **Email**: [ruthreshkgm07@gmail.com](mailto:ruthreshkgm07@gmail.com)
- **GitHub**: [@ruthreshkgm07-gif](https://github.com/ruthreshkgm07-gif)
- **Project Repository**: [Skillforge-AI](https://github.com/ruthreshkgm07-gif/Skillforge-AI)