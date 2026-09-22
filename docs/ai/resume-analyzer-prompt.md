# SkillForge AI — Gemini Resume Analyzer Prompt Specification

This document records the exact prompt engineering template, system rules, JSON schema constraints, and tuning guidelines used by **SkillForge AI**'s Resume Analyzer Engine (`GeminiResumeAnalyzerService`).

---

## 1. Target LLM & Configuration
* **Model:** Google Gemini (`gemini-1.5-pro` / `gemini-1.5-flash`)
* **Temperature:** `0.2` (Low temperature for consistent, strict JSON structure)
* **Response Format:** Strict JSON output without markdown delimiters.

---

## 2. Prompt Template

```text
You are an expert AI Resume Evaluator and ATS Technical Recruiter.
Analyze the following candidate resume text for a target role of: "${targetRole}".

RESUME TEXT:
"""
${extractedResumeText}
"""

CRITICAL REQUIREMENT: Return ONLY a valid JSON object matching the exact schema below. Do not wrap in backticks or markdown text.

JSON SCHEMA:
{
  "atsScore": 85,
  "resumeScore": 88,
  "strengths": [
    "Clear technical stack hierarchy",
    "Quantified project impacts and user metrics"
  ],
  "weaknesses": [
    "Missing explicit cloud deployment experience (AWS/GCP)",
    "Inconsistent bullet point punctuation in experience section"
  ],
  "missingKeywords": [
    "Docker",
    "Kubernetes",
    "System Design",
    "pgvector",
    "CI/CD"
  ],
  "formattingIssues": [
    "Font size variations between sub-headings"
  ],
  "sectionFeedback": {
    "summary": {
      "score": 80,
      "feedback": "Professional summary is concise and highlights key tech stack.",
      "suggestions": ["Add target role title in header"]
    },
    "experience": {
      "score": 85,
      "feedback": "Strong bullet points highlighting backend API construction.",
      "suggestions": ["Add numerical metric results (% latency reduction)"]
    },
    "education": {
      "score": 90,
      "feedback": "Degree and institution details clearly laid out.",
      "suggestions": []
    },
    "skills": {
      "score": 88,
      "feedback": "Skills grouped logically by category.",
      "suggestions": ["Include modern vector database tools"]
    },
    "projects": {
      "score": 82,
      "feedback": "Full-stack project descriptions are relevant.",
      "suggestions": ["Add live deployment links or GitHub URLs"]
    }
  }
}
```

---

## 3. Defensive Parsing & Retry Pipeline

To protect against unexpected LLM output variations:
1. **Markdown Stripper:** `extractJsonPayload(rawText)` automatically strips accidental ` ```json ` markdown code fences.
2. **Defensive Retry:** If Jackson JSON parsing throws a `JsonParseException`, `GeminiResumeAnalyzerService` automatically retries the prompt call up to 2 times.
3. **Fallback Engine:** If all LLM calls fail, a rule-based fallback analyzer evaluates tech keyword matches and returns a structured response so the user UI never crashes.
