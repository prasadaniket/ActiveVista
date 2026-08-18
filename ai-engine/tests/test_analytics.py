from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_recovery_analytics():
    payload = {
        "weight_kg": 75.0,
        "height_cm": 178.0,
        "age": 25,
        "gender": "male",
        "activity_level": "moderate",
        "weekly_workout_count": 5,
        "avg_session_duration_mins": 60,
        "recent_intensity_rating": 8.0
    }
    response = client.post("/api/v1/analytics/recovery", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "bmr_kcal" in data
    assert "tdee_kcal" in data
    assert "fatigue_score" in data
    assert data["fatigue_score"] > 0

def test_plan_generator():
    payload = {
        "goal": "hypertrophy",
        "difficulty": "intermediate",
        "days_per_week": 4,
        "session_duration_mins": 50
    }
    response = client.post("/api/v1/planner/generate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["schedule"]) == 4
    assert "ActiveVista" in data["plan_title"]
