# SkillForge AI — Skill Gap & Job Recommendations API Reference

This document details the REST API endpoints for **Skill Gap Detection** and **Job Recommendations** in **SkillForge AI**.

---

## 1. Skill Gap Detection

`GET /api/v1/student/skill-gap`

### Authorization
* **Required Header:** `Authorization: Bearer <access_token>`
* **Required Role:** `STUDENT` or `ADMIN`

### Response Structure (`200 OK`)

```json
{
  "success": true,
  "message": "Skill gap analysis generated successfully",
  "data": {
    "targetRole": "Full Stack Engineer",
    "overallMatchPercentage": 75,
    "radarChartData": [
      { "skillName": "Java", "currentLevel": 4, "requiredLevel": 4 },
      { "skillName": "Spring Boot", "currentLevel": 4, "requiredLevel": 4 },
      { "skillName": "React.js", "currentLevel": 3, "requiredLevel": 4 },
      { "skillName": "TypeScript", "currentLevel": 3, "requiredLevel": 4 },
      { "skillName": "PostgreSQL", "currentLevel": 4, "requiredLevel": 4 },
      { "skillName": "Docker", "currentLevel": 2, "requiredLevel": 3 },
      { "skillName": "pgvector", "currentLevel": 2, "requiredLevel": 3 }
    ],
    "gaps": [
      {
        "skillName": "Docker",
        "category": "Cloud & DevOps",
        "currentProficiency": 2,
        "requiredProficiency": 3,
        "priority": "MUST_HAVE",
        "whyItMatters": "Industry standard for containerization and automated cloud deployment in modern DevOps pipelines.",
        "learningResource": {
          "title": "Docker Official Hands-On Documentation",
          "provider": "Documentation",
          "url": "https://docs.docker.com",
          "isFree": "100% Free"
        }
      }
    ]
  },
  "timestamp": "2026-08-07T21:30:00.000Z"
}
```

---

## 2. Job Recommendations

`GET /api/v1/student/job-recommendations`

### Authorization
* **Required Header:** `Authorization: Bearer <access_token>`
* **Required Role:** `STUDENT` or `ADMIN`

### Response Structure (`200 OK`)

```json
{
  "success": true,
  "message": "Job recommendations retrieved successfully",
  "data": [
    {
      "jobId": "11111111-1111-1111-1111-111111111111",
      "title": "Senior Full Stack Java Engineer",
      "companyName": "Acme Tech Solutions",
      "companyLogoUrl": "https://logo.clearbit.com/acme.com",
      "location": "Remote",
      "salaryRange": "$120k - $150k",
      "employmentType": "FULL_TIME",
      "minExperience": 2,
      "matchScore": 91.67,
      "matchTypePlaceholder": "Structured Keyword Overlap (Phase 8 pgvector preview)",
      "applicationStatus": "NOT_APPLIED",
      "requiredSkills": [
        { "skillName": "Java", "isPossessed": true },
        { "skillName": "Spring Boot", "isPossessed": true },
        { "skillName": "React.js", "isPossessed": true },
        { "skillName": "Docker", "isPossessed": false }
      ]
    }
  ],
  "timestamp": "2026-08-07T21:30:00.000Z"
}
```

---

## 3. Apply to Job

`POST /api/v1/student/jobs/{jobId}/apply`

### Authorization
* **Required Header:** `Authorization: Bearer <access_token>`
* **Required Role:** `STUDENT` or `ADMIN`

### Response Structure (`200 OK`)

```json
{
  "success": true,
  "message": "Applied to job",
  "data": "Job application submitted successfully",
  "timestamp": "2026-08-07T21:30:00.000Z"
}
```
