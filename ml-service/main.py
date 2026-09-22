from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("skillforge-ml")

app = FastAPI(
    title="SkillForge AI ML Microservice",
    description="Placement Probability Classifier, Resume Role Classifier, and Salary Regressor",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model Artifacts
placement_model = None
role_model = None
salary_model = None

@app.on_event("startup")
def load_models():
    global placement_model, role_model, salary_model
    try:
        if os.path.exists("models/placement_model.joblib"):
            placement_model = joblib.load("models/placement_model.joblib")
            logger.info("Loaded placement_model.joblib successfully")
        if os.path.exists("models/resume_classifier.joblib"):
            role_model = joblib.load("models/resume_classifier.joblib")
            logger.info("Loaded resume_classifier.joblib successfully")
        if os.path.exists("models/salary_model.joblib"):
            salary_model = joblib.load("models/salary_model.joblib")
            logger.info("Loaded salary_model.joblib successfully")
    except Exception as ex:
        logger.warning(f"Model artifacts startup load warning: {ex}")

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str

class PlacementPredictionRequest(BaseModel):
    cgpa: float = Field(..., ge=0.0, le=10.0, description="Cumulative Grade Point Average")
    coding_score: int = Field(..., ge=0, le=1000, description="Problem solving rating")
    internships: int = Field(0, ge=0, description="Completed internships count")
    projects_count: int = Field(1, ge=0, description="Portfolio projects count")
    backlogs: int = Field(0, ge=0, description="Active backlogs count")
    resume_score: int = Field(75, ge=0, le=100, description="Resume quality score")
    ats_score: int = Field(75, ge=0, le=100, description="ATS parser score")
    mock_interview_score: int = Field(80, ge=0, le=100, description="AI Mock interview score")

class FactorDetail(BaseModel):
    feature: str
    impact: str
    importance_score: float

class PlacementPredictionResponse(BaseModel):
    placement_probability: float
    predicted_salary_lpa: float
    recommendation: str
    top_factors: list[FactorDetail]

class ResumeClassResponse(BaseModel):
    predicted_role_category: str
    confidence: float

class SalaryPredictionResponse(BaseModel):
    predicted_salary_lpa: float
    salary_range: str

@app.get("/")
def root():
    return {"service": "SkillForge ML Microservice", "status": "online", "docs": "/docs"}

@app.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(status="UP", service="skillforge-ml-service", version="1.0.0")

@app.post("/predict/placement", response_model=PlacementPredictionResponse)
@app.post("/api/v1/predict/placement", response_model=PlacementPredictionResponse)
def predict_placement(payload: PlacementPredictionRequest):
    features = [
        payload.cgpa,
        payload.coding_score,
        payload.internships,
        payload.projects_count,
        payload.backlogs,
        payload.resume_score,
        payload.ats_score,
        payload.mock_interview_score
    ]

    if placement_model is not None:
        try:
            prob = float(placement_model.predict_proba([features])[0][1])
            prob = round(prob, 2)
        except Exception:
            prob = calculate_heuristic_prob(payload)
    else:
        prob = calculate_heuristic_prob(payload)

    if salary_model is not None:
        try:
            sal = float(salary_model.predict([features])[0])
            sal = round(sal, 2)
        except Exception:
            sal = round(3.5 + (prob * 14.5), 2)
    else:
        sal = round(3.5 + (prob * 14.5), 2)

    factors = generate_human_factors(payload)
    recommendation = generate_recommendation(prob)

    return PlacementPredictionResponse(
        placement_probability=prob,
        predicted_salary_lpa=sal,
        recommendation=recommendation,
        top_factors=factors
    )

@app.post("/predict/resume-class", response_model=ResumeClassResponse)
def classify_resume(payload: PlacementPredictionRequest):
    if role_model is not None:
        try:
            role = str(role_model.predict([[payload.cgpa, payload.coding_score, payload.internships, payload.projects_count, payload.backlogs, payload.resume_score, payload.ats_score, payload.mock_interview_score]])[0])
            return ResumeClassResponse(predicted_role_category=role, confidence=0.89)
        except Exception:
            pass
    return ResumeClassResponse(predicted_role_category="Full Stack Engineer", confidence=0.85)

@app.post("/predict/salary", response_model=SalaryPredictionResponse)
def predict_salary(payload: PlacementPredictionRequest):
    features = [payload.cgpa, payload.coding_score, payload.internships, payload.projects_count, payload.backlogs, payload.resume_score, payload.ats_score, payload.mock_interview_score]
    if salary_model is not None:
        try:
            sal = round(float(salary_model.predict([features])[0]), 2)
            return SalaryPredictionResponse(predicted_salary_lpa=sal, salary_range=f"${sal - 1.5:.1f} LPA - ${sal + 2.0:.1f} LPA")
        except Exception:
            pass
    return SalaryPredictionResponse(predicted_salary_lpa=12.5, salary_range="10.0 LPA - 15.0 LPA")

def calculate_heuristic_prob(p: PlacementPredictionRequest) -> float:
    score = (p.cgpa * 10) + (p.coding_score * 0.04) + (p.internships * 8) + (p.projects_count * 5) + (p.mock_interview_score * 0.2) - (p.backlogs * 12)
    return round(min(max(score / 100.0, 0.05), 0.98), 2)

def generate_human_factors(p: PlacementPredictionRequest) -> list[FactorDetail]:
    factors = []
    if p.cgpa >= 8.0:
        factors.append(FactorDetail(feature="Academic Standing (CGPA)", impact="POSITIVE", importance_score=0.35))
    else:
        factors.append(FactorDetail(feature="Academic Standing (CGPA)", impact="NEUTRAL", importance_score=0.15))

    if p.coding_score >= 200:
        factors.append(FactorDetail(feature="Competitive Problem Solving", impact="POSITIVE", importance_score=0.30))
    else:
        factors.append(FactorDetail(feature="Competitive Problem Solving", impact="NEEDS_IMPROVEMENT", importance_score=0.10))

    if p.mock_interview_score >= 75:
        factors.append(FactorDetail(feature="AI Mock Interview Readiness", impact="POSITIVE", importance_score=0.25))

    return factors[:3]

def generate_recommendation(prob: float) -> str:
    if prob >= 0.75:
        return "High likelihood of tier-1 placement. Focus on system design and mock interviews."
    elif prob >= 0.50:
        return "Moderate likelihood. Focus on advancing LeetCode problem count and 1 major project."
    else:
        return "Needs improvement. Prioritize core DSA, complete foundational projects, and clear backlogs."

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
