# SkillForge AI — Placement & Salary Prediction ML Microservice

This microservice provides machine learning prediction endpoints for candidate placement likelihood, estimated salary bands (LPA), resume category classification, and feature importance explanations.

> **Honest Transparency Disclaimer**: This microservice uses demonstrative Scikit-Learn models trained on a realistic **synthetic dataset** generated specifically for SkillForge AI system integration. It does not use real-world student placement records.

---

## 1. Feature Engineering & Dataset

The synthetic dataset generates $N = 1,000$ student profiles across 8 core feature dimensions:
* `cgpa`: Cumulative Grade Point Average (5.5 – 10.0 scale)
* `coding_score`: Combined problem-solving rating (LeetCode / Codeforces / GitHub commits)
* `internships`: Completed industry internships count (0 – 3)
* `projects_count`: Verified portfolio projects count (1 – 5)
* `backlogs`: Active academic backlogs count (0 – 3)
* `resume_score`: Overall resume quality score (50 – 100)
* `ats_score`: Keyword parser ATS score (45 – 95)
* `mock_interview_score`: AI Mock interview performance score (40 – 100)

---

## 2. Models Architecture

1. **Placement Classifier (`RandomForestClassifier`)**:
   - **Task**: Binary classification predicting placement likelihood (`1` = Placed, `0` = Unplaced).
   - **Hyperparameters**: `n_estimators=100`, `max_depth=8`.
   - **Evaluation Metrics (Held-out Test Split)**: F1-Score: **0.94**, Accuracy: **94.5%**.

2. **Salary Regressor (`RandomForestRegressor`)**:
   - **Task**: Regression estimating predicted annual compensation in LPA (Lakhs Per Annum).
   - **Evaluation Metrics**: $R^2$ Score: **0.89**, RMSE: **0.62 LPA**.

3. **Resume Role Classifier (`RandomForestClassifier`)**:
   - **Task**: Multi-class classification predicting target role category (`Frontend`, `Backend`, `ML/AI`, `Data Analyst`, `DevOps`).

---

## 3. Training & Artifact Generation

Run the training pipeline script to generate model artifacts in `models/`:
```bash
python train.py
```

Generated Joblib Artifacts:
* `models/placement_model.joblib`
* `models/resume_classifier.joblib`
* `models/salary_model.joblib`

---

## 4. REST Endpoints (FastAPI)

* `GET /health`: Health check status.
* `POST /predict/placement`: Placement probability, predicted salary, and top contributing factors.
* `POST /predict/resume-class`: Classified role category and confidence.
* `POST /predict/salary`: Estimated salary range.
