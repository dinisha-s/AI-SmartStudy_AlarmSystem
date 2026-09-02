import os
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="Smart Study ML Microservice",
    description="FastAPI service serving custom-trained scikit-learn models for snooze risk and focus predictions.",
    version="1.0.0"
)

# Enable CORS for Django REST backend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load trained Snooze Risk ML model
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'snooze_risk_model.pkl')
try:
    snooze_model = joblib.load(MODEL_PATH)
    print(f"Loaded ML model successfully from {MODEL_PATH}")
except Exception as e:
    snooze_model = None
    print(f"Warning: Model file not found at {MODEL_PATH}. Error: {e}")

class SnoozeRiskRequest(BaseModel):
    hour_of_alarm: int = Field(..., ge=0, le=23, example=6)
    day_of_week: int = Field(..., ge=0, le=6, example=1) # 0=Mon, 6=Sun
    sleep_duration_prev_night: float = Field(..., ge=0.0, le=16.0, example=6.5)
    snooze_count_last_7_days: int = Field(..., ge=0, example=3)
    study_session_pending: int = Field(..., ge=0, le=1, example=1)
    self_reported_energy: int = Field(..., ge=1, le=5, example=3)

class SnoozeRiskResponse(BaseModel):
    snooze_risk: float
    risk_level: str
    require_math_puzzle: bool
    recommendation: str

@app.get("/")
def health_check():
    return {
        "service": "Smart Study ML Service",
        "status": "healthy",
        "model_loaded": snooze_model is not None
    }

@app.post("/predict/snooze-risk", response_model=SnoozeRiskResponse)
def predict_snooze_risk(payload: SnoozeRiskRequest):
    if snooze_model is None:
        raise HTTPException(status_code=500, detail="ML model is not loaded.")

    input_df = pd.DataFrame([{
        'hour_of_alarm': payload.hour_of_alarm,
        'day_of_week': payload.day_of_week,
        'sleep_duration_prev_night': payload.sleep_duration_prev_night,
        'snooze_count_last_7_days': payload.snooze_count_last_7_days,
        'study_session_pending': payload.study_session_pending,
        'self_reported_energy': payload.self_reported_energy
    }])

    # Predict probability of class 1 (did_snooze)
    probabilities = snooze_model.predict_proba(input_df)[0]
    snooze_prob = round(float(probabilities[1]), 2)

    if snooze_prob >= 0.70:
        risk_level = "HIGH"
        require_math_puzzle = True
        recommendation = "High snooze risk detected. Escalate alarm volume and mandate Math Puzzle overlay."
    elif snooze_prob >= 0.40:
        risk_level = "MEDIUM"
        require_math_puzzle = False
        recommendation = "Moderate snooze risk. Progressive volume ramp-up recommended."
    else:
        risk_level = "LOW"
        require_math_puzzle = False
        recommendation = "Low snooze risk. User expected to wake up cleanly."

    return SnoozeRiskResponse(
        snooze_risk=snooze_prob,
        risk_level=risk_level,
        require_math_puzzle=require_math_puzzle,
        recommendation=recommendation
    )
