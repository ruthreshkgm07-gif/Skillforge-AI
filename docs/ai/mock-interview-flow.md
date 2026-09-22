# SkillForge AI — AI Mock Interview Prompt & State Architecture

This document details the multi-turn prompt engineering strategy, context window management, transcript JSON persistence, rate limiting, and Web Speech API mic integration for the **AI Mock Interview Engine** in **SkillForge AI**.

---

## 1. Overview & Architecture Flow

```text
┌────────────────────────┐      POST /start      ┌────────────────────────┐
│  React 19 Frontend UI  │ ────────────────────► │  Spring Boot AI API    │
│  (Chat Interface + Mic)│                       │ (MockInterviewService) │
└───────────┬────────────┘                       └───────────┬────────────┘
            │                                                │
            │ POST /{id}/answer                              │ Prompts Gemini API
            ▼                                                ▼
┌────────────────────────┐                      ┌────────────────────────┐
│ Turn-based Transcript  │ ◄─────────────────── │ Google Gemini 1.5 Pro  │
│  JSON in PostgreSQL    │  Generates Feedback  │  (Structured JSON)     │
└────────────────────────┘                      └────────────────────────┘
```

---

## 2. Multi-Turn State Management Strategy

To ensure seamless multi-turn conversations without hitting memory/token overflow:
1. **Persistent Transcript JSON**: The full interview state is persisted as a JSON array inside the `interview_sessions` PostgreSQL table.
2. **Transcript Schema**:
```json
[
  {
    "questionNumber": 1,
    "question": "Can you walk me through a time when you designed a high-concurrency microservice in Java?",
    "answer": "In my previous project, I used Spring Boot and Redis caching...",
    "askedAt": "2026-08-08T20:30:00Z"
  }
]
```
3. **Context Injection**: On every student answer submission, the service appends the student's response to the transcript array, passes the accumulated history to Gemini, and instructs Gemini to either ask the next logically progressing question (behavioral + technical balance) or produce the final structured evaluation.

---

## 3. Gemini System Prompts

### Start Session Prompt
```text
You are a Principal Tech Lead conducting a mock technical interview for a candidate targeting the role of: {targetRole}.
Generate a structured 6-question interview plan containing:
- 2 Behavioral/Leadership questions (STAR method focus)
- 3 Role-specific Technical & System Design questions
- 1 Practical scenario question

Output JSON format:
{
  "questions": [
    "Question 1 text...",
    "Question 2 text..."
  ]
}
```

### End-of-Session Evaluation Prompt
```text
You are an expert technical interviewer evaluating the completed transcript for candidate target role: {targetRole}.
Analyze the transcript and provide a structured JSON assessment:
{
  "overallScore": 85,
  "communicationScore": 88,
  "technicalScore": 82,
  "strengths": [
    "Clear communication of microservice trade-offs",
    "Solid understanding of relational database indexes"
  ],
  "areasToImprove": [
    "Elaborate more on error handling during system failures",
    "Use STAR method more strictly for behavioral questions"
  ],
  "sampleBetterAnswers": [
    {
      "questionNumber": 1,
      "question": "...",
      "critique": "Good technical depth, but missing mention of circuit breakers.",
      "suggestedResponse": "I would structure the answer by highlighting Spring Cloud Circuit Breaker and Resilience4j..."
    }
  ]
}
```

---

## 4. Daily Soft Rate Limiting

To control API costs and prevent excessive quota consumption:
* **Configuration Key**: `app.interview.max-daily-sessions: 5` in `application.yml`.
* **Execution**: Before starting a session, `MockInterviewService` checks `countByStudentUserIdAndCreatedAtAfter(studentId, startOfDay)`.
* If quota is exceeded, the user receives a standard `429 Too Many Requests` API response: `"Daily AI mock interview limit reached (max 5 sessions/day). Please try again tomorrow."`

---

## 5. Web Speech API Voice Input Strategy

* **Decision**: Implemented native browser Web Speech API (`window.webkitSpeechRecognition` / `window.SpeechRecognition`).
* **Rationale**: Low-risk, 100% native client-side support in modern browsers. Requires no backend audio upload or heavy speech-to-text API infrastructure. Spoken answers continuously transcribe directly into the chat response input box for instant editing or submission.
