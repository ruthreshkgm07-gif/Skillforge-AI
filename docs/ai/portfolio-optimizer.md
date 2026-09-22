# SkillForge AI — Multi-Source Portfolio & Resume Optimizer Pipeline

This document details the multi-source prompt fusion strategy, GitHub REST API integration, Redis caching, and graceful degradation workflow for the **AI Portfolio & Resume Optimizer** in **SkillForge AI**.

---

## 1. Multi-Source Context Fusion Strategy

To deliver a holistic portfolio report, SkillForge AI merges three authoritative candidate data sources into a unified Google Gemini LLM context:

```text
┌────────────────────────┐
│  Parsed Resume Text    │ ──┐
│  & ATS Score (Phase 5) │   │
└────────────────────────┘   │
┌────────────────────────┐   ├──► ┌────────────────────────┐      ┌────────────────────────┐
│ GitHub Profile Summary │ ──┼──► │ Unified Context Fusion │ ───► │ Google Gemini 1.5 Pro  │
│ (Repos, Stars, README) │   │    │  (Portfolio Engine)    │      │  (Structured JSON)     │
└────────────────────────┘   │    └────────────────────────┘      └────────────────────────┘
┌────────────────────────┐   │
│ Declared Skills &      │ ──┘
│ Target Role (Phase 6)  │
└────────────────────────┘
```

---

## 2. GitHub REST API Integration & Redis Caching

* **Endpoint**: `https://api.github.com/users/{username}/repos?sort=updated&per_page=30`
* **Optional PAT**: Supported via `GITHUB_TOKEN` environment variable for higher API rate limits.
* **Redis Caching**: Cached under `github:profile:{username}` with a **1-Hour TTL** to prevent hitting GitHub rate limits.
* **Extracted Signals**:
  - Total Public Repository Count
  - Top Programming Languages used
  - Aggregate Star and Fork counts
  - Commit recency & README quality presence signals

---

## 3. Gemini Prompt Architecture

```text
You are an Executive Tech Recruiter and Portfolio Coach analyzing a candidate targeting: {targetRole}.

DATA SOURCE 1: Resume Parsed Highlights & ATS Score ({atsScore}%):
{resumeText}

DATA SOURCE 2: GitHub Repository Summary ({repoCount} repos, top languages: {topLanguages}):
{githubReposSummary}

DATA SOURCE 3: Declared Skills:
{declaredSkills}

Analyze cross-alignment inconsistencies and generate a structured JSON report:
{
  "portfolioScore": 88,
  "alignmentIssues": [
    {
      "issue": "Resume claims React.js expertise, but no public React repositories were found on GitHub.",
      "severity": "HIGH",
      "fixSuggestion": "Publish your React 19 portfolio project to GitHub with a clear README."
    }
  ],
  "pinnedRepoSuggestions": [
    {
      "repoName": "skillforge-backend",
      "reasonToFeature": "Demonstrates Java 21, Spring Boot 3.5, and PostgreSQL pgvector integration.",
      "targetSkillHighlight": "Spring Boot & pgvector"
    }
  ],
  "missingProjectSuggestions": [
    {
      "title": "Distributed Cloud Cache Microservice",
      "rationale": "Bridges your missing DevOps and Redis caching skill gap for Backend Engineer roles.",
      "techStack": ["Java 21", "Redis", "Docker"],
      "alignedSkillGap": "Docker & Redis"
    }
  ],
  "resumeRewriteSuggestions": [
    {
      "section": "Projects & Experience",
      "originalBullet": "Built backend APIs for web applications using Java.",
      "suggestedRewrite": "Architected high-concurrency Spring Boot 3.5 microservices utilizing Redis caching and pgvector vector search, serving 1,000+ API requests.",
      "githubEvidence": "Verified in GitHub repository 'skillforge-backend'"
    }
  ]
}
```

---

## 4. Graceful Degradation Workflow

* **No GitHub URL Configured**: If a student has not provided a GitHub URL, the engine:
  1. Cross-analyzes Resume parsed text against Declared Skills and Target Role.
  2. Generates resume bullet rewrites and missing project suggestions.
  3. Displays a prompt banner encouraging the student to add their GitHub profile URL for the complete cross-analysis.
