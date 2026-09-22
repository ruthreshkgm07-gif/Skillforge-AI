# SkillForge AI — Production Deployment Guide

This guide details the step-by-step instructions to deploy the full SkillForge AI platform to production from scratch.

---

## 1. Production Architecture Services

| Service Layer | Cloud Provider | Instance Spec / Plan |
| :--- | :--- | :--- |
| **Frontend Web App** | Vercel | Node 20 (Vite Single-Page Application) |
| **Backend REST API** | Render | Docker Web Service (Java 21 Spring Boot 3.5) |
| **ML Microservice** | Render | Docker Web Service (Python 3.12 FastAPI) |
| **Database** | Neon Tech | PostgreSQL 16 + `pgvector` Extension |
| **Redis Cache** | Upstash | Serverless Redis 7 |
| **File Storage** | Cloudinary | Unsigned Resume & Image Uploads |

---

## 2. Step 1: Database Setup (Neon PostgreSQL + pgvector)

1. Sign in to [Neon Console](https://console.neon.tech).
2. Create a new PostgreSQL 16 database named `skillforge_prod`.
3. Enable `pgvector` extension in the SQL editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```
4. Copy the Pooled Connection String:
   `postgres://username:password@ep-cool-dbname.us-east-2.aws.neon.tech/skillforge_prod?sslmode=require`

---

## 3. Step 2: Cache Setup (Upstash Redis)

1. Sign in to [Upstash Console](https://console.upstash.com).
2. Create a new Redis Database: `skillforge-cache`.
3. Copy the Redis TLS Host, Port (6379), and Password.

---

## 4. Step 3: ML Microservice Deployment (Render)

1. Push code repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), click **New + -> Web Service**.
3. Connect your repository and select root directory `/ml-service`.
4. Select **Docker Runtime** (uses `ml-service/Dockerfile`).
5. Configure Environment Variables:
   - `PORT`: `8000`
6. Set Health Check Path: `/health`.

---

## 5. Step 4: Backend REST API Deployment (Render)

1. In Render Dashboard, click **New + -> Web Service**.
2. Connect your repository and select root directory `/backend`.
3. Select **Docker Runtime** (uses `docker/Dockerfile.backend`).
4. Configure Environment Variables:
   - `SPRING_DATASOURCE_URL`: `jdbc:postgresql://<neon-host>:5432/skillforge_prod?sslmode=require`
   - `POSTGRES_USER`: `<neon-user>`
   - `POSTGRES_PASSWORD`: `<neon-password>`
   - `REDIS_HOST`: `<upstash-host>`
   - `REDIS_PORT`: `6379`
   - `REDIS_PASSWORD`: `<upstash-password>`
   - `GEMINI_API_KEY`: `<google-gemini-api-key>`
   - `ML_SERVICE_URL`: `https://skillforge-ml.onrender.com`
   - `JWT_SECRET`: `<generated-256-bit-hex-string>`
5. Set Health Check Path: `/api/v1/health`.
6. Flyway will automatically run all migrations (`V1__` through `V8__`) against Neon on startup.

---

## 6. Step 5: Frontend Deployment (Vercel)

1. Sign in to [Vercel Dashboard](https://vercel.com).
2. Import GitHub repository and select `/frontend` project folder.
3. Framework Preset: **Vite**.
4. Configure Environment Variables:
   - `VITE_API_BASE_URL`: `https://skillforge-backend.onrender.com/api/v1`
5. Click **Deploy**.

---

## 7. Verification & Health Monitoring

* **Backend Health**: `https://skillforge-backend.onrender.com/api/v1/health`
* **Spring Actuator Metrics**: `https://skillforge-backend.onrender.com/api/v1/actuator/metrics`
* **ML Microservice Health**: `https://skillforge-ml.onrender.com/health`
