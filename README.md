# ⚡ SkillForge AI

<div align="center">

> **The Intelligent Career Accelerator & Semantic Talent Discovery Platform**

<p align="center">
  <em>Transforming tech hiring with AI-powered mock interviews, semantic candidate matching, and career analytics.</em>
</p>

<p align="center">
  <b>No guesswork. No keyword-matching. Just intelligent talent discovery.</b>
</p>

<p align="center">
  <a href="#-overview">Overview</a> •
  <a href="#-core-features">Core Features</a> •
  <a href="#-technology-stack">Tech Stack</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-application-endpoints">Endpoints</a> •
  <a href="#-project-structure">Project Structure</a> •
  <a href="#-why-skillforge-ai">Why SkillForge AI</a> •
  <a href="#-vision">Vision</a>
</p>

---

</div>

## 🚀 Overview

**SkillForge AI** is an enterprise-grade career intelligence platform that unifies AI-driven mock interviews, resume analytics, and semantic candidate matching into a single ecosystem.

Designed for modern job seekers and hiring teams alike, SkillForge AI combines **Generative AI**, **Machine Learning**, and **Vector Search** into one seamless platform. Whether it's a single candidate preparing for their next interview or an enterprise recruiting team scaling its hiring pipeline, SkillForge AI eliminates guesswork while providing real, data-backed insight.

---

## ✨ Core Features

### 🎙️ Voice-Enabled AI Mock Interviewer
Simulates realistic technical and behavioral interviews powered by Gemini.

* ✔️ Real-time voice interaction with speech synthesis
* ✔️ Turn-by-turn critique of candidate responses
* ✔️ Multi-axis radar skill assessments (communication, technical depth, confidence)

### 📄 ATS Deep Resume Parser & Scorer
Analyzes resumes the way real applicant tracking systems do.

* Multi-format extraction (PDF/DOCX)
* Keyword deficiency detection
* Actionable, bullet-point resume optimizations

### 📈 ML Placement & Salary Predictor
Delivers data-backed career outcomes using trained ML models.

* Placement probability scoring
* Estimated compensation bands (LPA)
* Random Forest regression models trained on real market data

### 💻 Interactive Coding Workbench & Explainer
An integrated practice environment for hands-on skill building.

* Real-time test execution
* AI-assisted code walkthroughs
* Multi-language support

### 🔗 Multi-Platform Coding Tracker
Syncs external coding activity into a single, verifiable profile.

* GitHub commit tracking
* LeetCode solved-problem metrics
* Tamper-proof proof-of-work portfolio

### 🧠 Adaptive Assessments & Test Bank
Tests core competencies across multiple domains.

* CS fundamentals & aptitude question banks
* Timed evaluation with analytics
* Adaptive difficulty scaling

### 🎯 Semantic Candidate Matching (Recruiters)
Surfaces candidates who truly fit job requirements.

* 768-dimensional vector embeddings via `pgvector`
* HNSW indexing for high-speed similarity search
* Matches on skill synergy, projects, and assessment scores — not just keywords

### 📊 Kanban Candidate Pipeline & Analytics (Recruiters)
Manages the full hiring lifecycle in one dashboard.

* `Applied` → `Reviewing` → `Interviewing` → `Offered` pipeline tracking
* AI-generated candidate fit summaries
* Hiring funnel analytics and time-to-hire metrics

---

## 🛠️ Technology Stack

<div align="center">

### 🎨 Frontend

| Technology | Purpose |
| :--- | :--- |
| ⚛️ **React 18 + TypeScript** | Modern, type-safe SPA framework |
| ⚡ **Vite** | Fast build tooling and dev server |
| 🎨 **Tailwind CSS** | Responsive, utility-first styling |
| 🧩 **Radix UI** | Accessible, unstyled component primitives |
| 🎬 **Framer Motion** | Smooth micro-interactions and transitions |
| 🔄 **TanStack Query** | Data fetching, caching, and synchronization |

### 🧠 Backend & AI

| Technology | Purpose |
| :--- | :--- |
| ☕ **Java 21 + Spring Boot 3.4** | Core REST microservice engine |
| 🔐 **Spring Security 6 + JWT** | Stateless authentication and RBAC |
| ⚡ **FastAPI (Python 3.12)** | Machine learning inference microservice |
| 🤖 **Scikit-learn, Pandas, Joblib** | Placement & salary prediction models |
| 💬 **Google Gemini 1.5 Pro / Flash** | Voice mock interviews & resume feedback generation |
| 🗄️ **PostgreSQL 16 + pgvector** | Relational storage + semantic vector search (HNSW) |
| ⚡ **Redis 7** | Session management and low-latency caching |

### 📄 Document Processing

* Apache PDFBox — PDF parsing
* Apache POI — DOCX parsing
* Apache Tika — Metadata and content extraction

### ☁️ Storage & DevOps

* Cloudinary — Media delivery
* Docker & Docker Compose — Multi-container orchestration

</div>

---

## 🏗️ System Architecture

```text
        Candidate / Recruiter Client (React)
                     │
                     ▼
          Spring Boot REST API Gateway
                     │
        ┌────────────┼─────────────┐
        ▼            ▼             ▼
   Auth & RBAC   Resume Engine   ML Service (FastAPI)
   (JWT/Redis)  (Tika/PDFBox)   (Placement & Salary)
        │            │             │
        └────────────┼─────────────┘
                     ▼
        Gemini AI (Interviews & Feedback)
                     │
                     ▼
     PostgreSQL 16 + pgvector (HNSW Search)
                     │
                     ▼
        Candidate Profile + Recruiter Dashboard
```

---

## 🚀 Quick Start

### Prerequisites

* **Docker & Docker Compose** (Recommended) — [Install Docker](https://docs.docker.com/get-docker/)
* *Or for manual setup:*
  * **Java JDK 21+** & **Maven 3.8+**
  * **Node.js 20+** & **npm**
  * **Python 3.12+**
  * **PostgreSQL 16** (with `pgvector` extension) & **Redis 7**

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/skillforge-ai/skillforge-ai.git
cd skillforge-ai
```

### 2️⃣ Configure Environment Variables

```bash
cp .env.example .env
# Add your Google Gemini API key and adjust database credentials in .env
```

### 3️⃣ Launch with Docker Compose (Recommended)

```bash
docker-compose -f docker/docker-compose.yml up --build -d
```

<details>
<summary><b>Or set up manually (click to expand)</b></summary>

**Start ML Microservice (FastAPI):**
```bash
cd ml-service
python -m venv venv

# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Start Backend API (Spring Boot):**
```bash
cd backend
mvn clean spring-boot:run
```

**Start Frontend Web Client (React + Vite):**
```bash
cd frontend
npm install
npm run dev
```

</details>

---

## 🌐 Application Endpoints

| Service | URL |
| :--- | :--- |
| 🌍 **Frontend Application** | `http://localhost:3000` |
| 🔌 **Spring Boot REST API** | `http://localhost:8080/api/v1/health` |
| 🧠 **FastAPI ML Service** | `http://localhost:8000/health` |

---

## 📂 Project Structure

```text
skillforge-ai
│
├── backend/                       # Spring Boot 3.4 REST API (Java 21)
│   ├── src/main/java/com/skillforge/
│   │   ├── ai/                    # Gemini integrations (Mock Interview, Resume Assistant)
│   │   ├── assessment/            # MCQ test bank, adaptive testing engine
│   │   ├── auth/                  # Stateless JWT, Spring Security, RBAC filters
│   │   ├── common/                # Exception handlers, base entities, DTOs
│   │   ├── config/                # Security, Redis, Cloudinary & CORS configs
│   │   ├── ml/                    # HTTP clients for Python ML microservice
│   │   ├── recruiter/             # Jobs, pgvector candidate matching, pipeline
│   │   ├── resume/                # Resume upload, Tika/PDFBox parser, ATS engine
│   │   └── student/                # Profile, GitHub/LeetCode sync, dashboard
│   └── pom.xml
│
├── frontend/                      # React 18 + TypeScript + Vite SPA
│   ├── src/
│   │   ├── app/                   # Router tree, layout wrappers, providers
│   │   ├── components/            # Reusable Radix UI & design system components
│   │   ├── context/                # Auth, theme, and toast state providers
│   │   ├── features/               # Feature slices (student, recruiter, interview, assessments)
│   │   └── lib/                    # Axios instance, Tailwind helpers, utilities
│   └── package.json
│
├── ml-service/                    # Python FastAPI Machine Learning microservice
│   ├── models/                    # Pre-trained Joblib model artifacts
│   ├── main.py                    # FastAPI REST endpoints
│   ├── train.py                   # Model training pipelines
│   └── requirements.txt
│
├── database/                      # DB initialization & Flyway migrations
│   ├── init.sql                   # PostgreSQL pgvector extension setup
│   └── migrations/                # Versioned Flyway migration scripts
│
├── docker/                        # Multi-container orchestration
│   └── docker-compose.yml
│
├── docs/                          # Architecture blueprints & API specs
│
└── README.md
```

---

## 💡 Why SkillForge AI?

Traditional hiring platforms rely on rigid keyword filters and one-size-fits-all interview prep. **SkillForge AI** replaces that with intelligent, personalized automation powered by Generative AI, Machine Learning, and Vector Search.

✅ AI-Powered Mock Interviews
✅ Semantic Candidate Matching
✅ Real-Time ATS Resume Scoring
✅ ML-Backed Placement Predictions
✅ Unified Coding Portfolio Tracking
✅ Enterprise Recruiter Dashboard
✅ Scalable, Cloud-Ready Architecture

---

## 🎯 Built For

🎓 Students & Job Seekers · 💼 Recruiters & Talent Teams · 🏢 Enterprises · 🏫 Training Institutes · 🚀 Career Platforms

---

## 🔮 Vision

> *"To redefine tech hiring through Artificial Intelligence — empowering candidates with genuine, actionable career guidance while giving recruiters the precision to find talent that truly fits."*

---

<div align="center">

⭐ **If you found this project interesting, consider giving it a star and supporting its development!**

</div>