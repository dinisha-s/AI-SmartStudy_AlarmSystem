from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
    assert response.json()["models"]["snooze_risk_model"] is True
    assert response.json()["models"]["focus_score_model"] is True
    assert response.json()["models"]["slot_recommender_model"] is True

def test_predict_snooze_risk_endpoint():
    payload = {
        "hour_of_alarm": 6,
        "day_of_week": 1,
        "sleep_duration_prev_night": 5.0,
        "snooze_count_last_7_days": 8,
        "study_session_pending": 1,
        "self_reported_energy": 2
    }
    response = client.post("/predict/snooze-risk", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "snooze_risk" in data
    assert "risk_level" in data
    assert "require_math_puzzle" in data

def test_predict_focus_score_endpoint():
    payload = {
        "session_duration": 45,
        "breaks_taken": 1,
        "time_of_day_hour": 10,
        "tab_switches": 2,
        "self_rating": 4
    }
    response = client.post("/predict/focus-score", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "predicted_focus_score" in data
    assert "score_quality" in data
    assert 0.0 <= data["predicted_focus_score"] <= 100.0

def test_predict_best_slot_endpoint():
    payload = {
        "subject_type": 1, # Numerical / Math
        "avg_focus_history": 82.5
    }
    response = client.post("/predict/best-slot", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "best_slot_id" in data
    assert "best_slot_name" in data
    assert "recommended_time_window" in data
