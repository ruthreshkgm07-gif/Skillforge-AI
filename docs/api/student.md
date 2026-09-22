# SkillForge AI — Student Portal API Reference

This document details the REST API endpoints powering the Student Portal in **SkillForge AI**.

---

## Aggregated Student Dashboard Endpoint

`GET /api/v1/student/dashboard`

### Description
Fetches all high-level dashboard metrics for the authenticated student in a single network call to eliminate frontend waterfall API requests.

### Authorization
* **Required Header:** `Authorization: Bearer <access_token>`
* **Required Role:** `STUDENT` or `ADMIN`

---

### Response Structure (`200 OK`)

```json
{
  "success": true,
  "message": "Student dashboard aggregated metrics fetched successfully",
  "data": {
    "student": {
      "userId": "c1f7a4b2-9d3e-4f81-a67b-123456789abc",
      "fullName": "Alex Student",
      "email": "student@skillforge.ai",
      "targetRole": "Full Stack Engineer",
      "avatarUrl": null,
      "headline": "Aspiring Software Engineer"
    },
    "resume": {
      "hasResume": true,
      "resumeId": "a1b2c3d4-5678-90ef-1234-567890abcdef",
      "atsScore": 82,
      "resumeScore": 85,
      "fileUrl": "https://res.cloudinary.com/skillforge/resumes/sample.pdf",
      "uploadedAt": "2026-08-07T20:00:00.000Z"
    },
    "placement": {
      "probability": 0.7800,
      "predictedSalaryLpa": 12.50,
      "recommendation": "High placement probability based on your profile & skill progression."
    },
    "roadmap": {
      "hasRoadmap": true,
      "roadmapId": "f9e8d7c6-b5a4-3210-9876-543210fedcba",
      "targetRole": "Full Stack Engineer",
      "durationMonths": 6,
      "completedMilestones": 4,
      "totalMilestones": 10,
      "progressPercentage": 40
    },
    "coding": {
      "leetcodeSolved": 185,
      "codeforcesRating": 1420,
      "githubContributions": 340
    },
    "topSkillGaps": [
      {
        "skillName": "System Design & Architecture",
        "category": "Backend",
        "currentProficiency": 2,
        "requiredProficiency": 4
      },
      {
        "skillName": "Docker & Kubernetes",
        "category": "Cloud & DevOps",
        "currentProficiency": 2,
        "requiredProficiency": 4
      },
      {
        "skillName": "pgvector & Semantic Search",
        "category": "Databases",
        "currentProficiency": 3,
        "requiredProficiency": 5
      }
    ],
    "recentJobMatches": [
      {
        "jobId": "e1d2c3b4-a596-8778-9900-aabbccddeeff",
        "title": "Senior Full Stack Engineer",
        "companyName": "TechForge Inc",
        "companyLogoUrl": null,
        "location": "Remote",
        "salaryRange": "$120k - $150k",
        "matchScore": 94.50
      }
    ],
    "unreadNotificationsCount": 3
  },
  "timestamp": "2026-08-07T21:10:00.000Z"
}
```
