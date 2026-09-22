import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, mean_squared_error, r2_score
import joblib
import os

os.makedirs("models", exist_ok=True)

# 1. Generate Realistic Synthetic Student Dataset (1,000 samples)
np.random.seed(42)
n_samples = 1000

cgpa = np.round(np.random.uniform(5.5, 9.8, n_samples), 2)
coding_score = np.random.randint(50, 950, n_samples)
internships = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.3, 0.4, 0.2, 0.1])
projects_count = np.random.choice([1, 2, 3, 4, 5], size=n_samples, p=[0.1, 0.3, 0.3, 0.2, 0.1])
backlogs = np.random.choice([0, 1, 2, 3], size=n_samples, p=[0.75, 0.15, 0.07, 0.03])
resume_score = np.random.randint(50, 98, n_samples)
ats_score = np.random.randint(45, 95, n_samples)
mock_interview_score = np.random.randint(40, 98, n_samples)

# Feature matrix X
X = pd.DataFrame({
    'cgpa': cgpa,
    'coding_score': coding_score,
    'internships': internships,
    'projects_count': projects_count,
    'backlogs': backlogs,
    'resume_score': resume_score,
    'ats_score': ats_score,
    'mock_interview_score': mock_interview_score
})

# Composite rule for ground truth target labels
score_factor = (
    (cgpa * 10) +
    (coding_score * 0.05) +
    (internships * 8) +
    (projects_count * 5) +
    (resume_score * 0.2) +
    (mock_interview_score * 0.3) -
    (backlogs * 12) +
    np.random.normal(0, 3, n_samples)
)

y_placed = (score_factor > 105).astype(int)
y_salary = np.round(np.clip(4.0 + (score_factor / 18.0) + np.random.normal(0, 0.5, n_samples), 3.5, 24.0), 2)

# Resume Category multi-class targets
role_categories = ['Frontend', 'Backend', 'ML/AI', 'Data Analyst', 'DevOps']
y_role = np.random.choice(role_categories, size=n_samples, p=[0.25, 0.35, 0.15, 0.15, 0.10])

# 2. Train Models
# Model A: Placement Classifier
X_train, X_test, y_p_train, y_p_test = train_test_split(X, y_placed, test_size=0.2, random_state=42)
placement_clf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
placement_clf.fit(X_train, y_p_train)

# Model B: Resume Role Classifier
X_train_r, X_test_r, y_r_train, y_r_test = train_test_split(X, y_role, test_size=0.2, random_state=42)
role_clf = RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
role_clf.fit(X_train_r, y_r_train)

# Model C: Salary Regressor
X_train_s, X_test_s, y_s_train, y_s_test = train_test_split(X, y_salary, test_size=0.2, random_state=42)
salary_reg = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
salary_reg.fit(X_train_s, y_s_train)

# 3. Print Evaluation Metrics
print("=== Placement Classifier Performance ===")
print(classification_report(y_p_test, placement_clf.predict(X_test), zero_division=0))

print("=== Salary Regressor Performance ===")
y_s_pred = salary_reg.predict(X_test_s)
print("RMSE:", np.sqrt(mean_squared_error(y_s_test, y_s_pred)))
print("R² Score:", r2_score(y_s_test, y_s_pred))

# 4. Serialize Model Artifacts
joblib.dump(placement_clf, "models/placement_model.joblib")
joblib.dump(role_clf, "models/resume_classifier.joblib")
joblib.dump(salary_reg, "models/salary_model.joblib")
print("Saved model artifacts to models/")
