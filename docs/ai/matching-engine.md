# SkillForge AI — Recruiter–Candidate Semantic Matching Engine Architecture

This document details the embedding vector specs, index configuration, cosine distance search queries, weighted re-ranking formula, and Gemini candidate fit rationale generation for the **Semantic Matching Engine** in **SkillForge AI**.

---

## 1. Vector Specs & HNSW Indexing

* **Database Extension**: PostgreSQL `pgvector`
* **Embedding Model**: Google Gemini `text-embedding-004` (768 dimensions)
* **Vector Tables**:
  - `resume_embeddings(resume_id UUID PRIMARY KEY, embedding vector(768))`
  - `jobs(id UUID PRIMARY KEY, ..., embedding vector(768))`
* **Index Strategy**: HNSW (Hierarchical Navigable Small World) with cosine distance operators:
```sql
CREATE INDEX idx_resume_embeddings_vector 
ON resume_embeddings 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);

CREATE INDEX idx_jobs_embedding_vector 
ON jobs 
USING hnsw (embedding vector_cosine_ops) 
WITH (m = 16, ef_construction = 64);
```

---

## 2. Dual-Direction Search Queries

### Candidate → Job Matching Query
Calculates semantic similarity between candidate resume vector `$1` and active job posting vectors:
```sql
SELECT j.id, j.title, j.company_id, j.location, j.min_experience, j.salary_min, j.salary_max,
       (1 - (j.embedding <=> CAST($1 AS vector))) AS semantic_similarity
FROM jobs j
WHERE j.status = 'ACTIVE'
ORDER BY j.embedding <=> CAST($1 AS vector) ASC
LIMIT 20;
```

### Recruiter → Candidate Inverse Matching Query
Calculates semantic similarity between job specification vector `$1` and candidate resume vectors:
```sql
SELECT s.user_id, s.full_name, s.headline, s.target_role, r.id AS resume_id,
       (1 - (re.embedding <=> CAST($1 AS vector))) AS semantic_similarity
FROM student_profiles s
JOIN resumes r ON s.user_id = r.student_id
JOIN resume_embeddings re ON r.id = re.resume_id
ORDER BY re.embedding <=> CAST($1 AS vector) ASC
LIMIT 15;
```

---

## 3. Weighted Re-Ranking Formula

To allow recruiters to customize matching weights without retraining models, SkillForge AI applies a hybrid re-ranking formula:

$$\text{Final Match Score} = \left( w_{\text{vector}} \times S_{\text{semantic}} \right) + \left( w_{\text{skill}} \times S_{\text{skill\_overlap}} \right) + \left( w_{\text{exp}} \times S_{\text{experience}} \right) + \left( w_{\text{loc}} \times S_{\text{location}} \right)$$

* Default Weights:
  - $w_{\text{vector}} = 0.50$ (Semantic Understanding)
  - $w_{\text{skill}} = 0.30$ (Hard Skill Overlap)
  - $w_{\text{exp}} = 0.10$ (Experience Level Fit)
  - $w_{\text{loc}} = 0.10$ (Location Preference)

---

## 4. Top-K Candidate Fit Explanation Prompt (Gemini)

For top candidates retrieved by vector similarity, Gemini generates a 2-3 sentence recruiter rationale note:

```text
You are an Executive Tech Recruiter evaluating candidate {fullName} for position {jobTitle} at {companyName}.
Candidate Headline: {headline}
Candidate Target Role: {targetRole}
Key Match Score: {matchScore}%

Generate a concise 2-3 sentence recruiter justification explaining why this candidate is a strong fit. Highlight relevant skills and background alignment. Output plain text.
```
