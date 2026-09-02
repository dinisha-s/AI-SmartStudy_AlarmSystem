import os
import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="Smart Study ML Microservice",
    description="FastAPI service serving custom-trained scikit-learn models for snooze risk, focus score regression, and best study slot recommendation.",
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

# Model Directory Path
MODELS_DIR = os.path.join(os.path.dirname(__file__), 'models')

# Load Trained Models
try:
    snooze_model = joblib.load(os.path.join(MODELS_DIR, 'snooze_risk_model.pkl'))
except Exception:
    snooze_model = None

try:
    focus_model = joblib.load(os.path.join(MODELS_DIR, 'focus_score_model.pkl'))
except Exception:
    focus_model = None

try:
    slot_model = joblib.load(os.path.join(MODELS_DIR, 'slot_recommender_model.pkl'))
except Exception:
    slot_model = None

# --- REQUEST / RESPONSE SCHEMAS ---
class SnoozeRiskRequest(BaseModel):
    hour_of_alarm: int = Field(..., ge=0, le=23)
    day_of_week: int = Field(..., ge=0, le=6)
    sleep_duration_prev_night: float = Field(..., ge=0.0, le=16.0)
    snooze_count_last_7_days: int = Field(..., ge=0)
    study_session_pending: int = Field(..., ge=0, le=1)
    self_reported_energy: int = Field(..., ge=1, le=5)

class SnoozeRiskResponse(BaseModel):
    snooze_risk: float
    risk_level: str
    require_math_puzzle: bool
    recommendation: str

class FocusScoreRequest(BaseModel):
    session_duration: int = Field(..., ge=1, le=480)
    breaks_taken: int = Field(..., ge=0)
    time_of_day_hour: int = Field(..., ge=0, le=23)
    tab_switches: int = Field(..., ge=0)
    self_rating: int = Field(..., ge=1, le=5)

class FocusScoreResponse(BaseModel):
    predicted_focus_score: float
    score_quality: str

class BestSlotRequest(BaseModel):
    subject_type: int = Field(..., ge=0, le=3) # 0=Theory, 1=Numerical, 2=Coding, 3=Language
    avg_focus_history: float = Field(..., ge=0.0, le=100.0)

class BestSlotResponse(BaseModel):
    best_slot_id: int
    best_slot_name: str
    recommended_time_window: str

# --- ENDPOINTS ---
@app.get("/")
def health_check():
    return {
        "service": "Smart Study ML Service",
        "status": "healthy",
        "models": {
            "snooze_risk_model": snooze_model is not None,
            "focus_score_model": focus_model is not None,
            "slot_recommender_model": slot_model is not None,
        }
    }

@app.post("/predict/snooze-risk", response_model=SnoozeRiskResponse)
def predict_snooze_risk(payload: SnoozeRiskRequest):
    if snooze_model is None:
        raise HTTPException(status_code=500, detail="Snooze risk model is not loaded.")

    input_df = pd.DataFrame([{
        'hour_of_alarm': payload.hour_of_alarm,
        'day_of_week': payload.day_of_week,
        'sleep_duration_prev_night': payload.sleep_duration_prev_night,
        'snooze_count_last_7_days': payload.snooze_count_last_7_days,
        'study_session_pending': payload.study_session_pending,
        'self_reported_energy': payload.self_reported_energy
    }])

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

@app.post("/predict/focus-score", response_model=FocusScoreResponse)
def predict_focus_score(payload: FocusScoreRequest):
    if focus_model is None:
        raise HTTPException(status_code=500, detail="Focus score regression model is not loaded.")

    input_df = pd.DataFrame([{
        'session_duration': payload.session_duration,
        'breaks_taken': payload.breaks_taken,
        'time_of_day_hour': payload.time_of_day_hour,
        'tab_switches': payload.tab_switches,
        'self_rating': payload.self_rating
    }])

    predicted_score = round(float(focus_model.predict(input_df)[0]), 2)
    predicted_score = max(0.0, min(100.0, predicted_score))

    if predicted_score >= 80.0:
        score_quality = "EXCELLENT"
    elif predicted_score >= 60.0:
        score_quality = "GOOD"
    else:
        score_quality = "NEEDS_IMPROVEMENT"

    return FocusScoreResponse(
        predicted_focus_score=predicted_score,
        score_quality=score_quality
    )

@app.post("/predict/best-slot", response_model=BestSlotResponse)
def predict_best_slot(payload: BestSlotRequest):
    if slot_model is None:
        raise HTTPException(status_code=500, detail="Slot recommender model is not loaded.")

    input_df = pd.DataFrame([{
        'subject_type': payload.subject_type,
        'avg_focus_history': payload.avg_focus_history
    }])

    predicted_slot_id = int(slot_model.predict(input_df)[0])

    slots = {
        0: ("Morning", "06:00 AM - 12:00 PM"),
        1: ("Afternoon", "12:00 PM - 05:00 PM"),
        2: ("Evening", "05:00 PM - 09:00 PM"),
        3: ("Night", "09:00 PM - 02:00 AM")
    }

    slot_name, time_window = slots.get(predicted_slot_id, ("Morning", "06:00 AM - 12:00 PM"))

    return BestSlotResponse(
        best_slot_id=predicted_slot_id,
        best_slot_name=slot_name,
        recommended_time_window=time_window
    )
