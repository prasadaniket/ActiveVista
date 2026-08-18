from fastapi import APIRouter, HTTPException
from app.models.schemas import AthleteMetricsInput, RecoveryAnalysisResponse, TelemetryAnalysisInput, TelemetryAnalysisResponse
from app.services.metabolic import compute_recovery_metrics

router = APIRouter(prefix="/analytics", tags=["Physiological Analytics"])

@router.post("/recovery", response_model=RecoveryAnalysisResponse)
async def analyze_recovery(metrics: AthleteMetricsInput):
    """
    Computes Basal Metabolic Rate (BMR), Total Daily Energy Expenditure (TDEE),
    neuromuscular fatigue index, and recommended rest window.
    """
    try:
        return compute_recovery_metrics(metrics)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics computation failed: {str(e)}")

@router.post("/telemetry", response_model=TelemetryAnalysisResponse)
async def analyze_workout_telemetry(payload: TelemetryAnalysisInput):
    """
    Calculates biomechanical volume load, caloric efficiency score, and burnout risk percentage.
    """
    total_volume = sum(w.sets * w.reps * w.weight_kg for w in payload.workouts)
    total_duration = max(1, sum(w.duration_mins for w in payload.workouts))
    
    power_to_weight = round(total_volume / max(1.0, payload.athlete_weight_kg), 2)
    caloric_efficiency = round((total_volume / total_duration) * 0.08, 2)
    
    burnout_risk = min(95.0, max(5.0, round((total_duration / 300.0) * 45.0, 1)))
    
    return TelemetryAnalysisResponse(
        total_volume_load_kg=round(total_volume, 1),
        power_to_weight_ratio=power_to_weight,
        caloric_efficiency_score=caloric_efficiency,
        intensity_distribution={"strength": 0.45, "hypertrophy": 0.35, "endurance": 0.20},
        burnout_risk_percentage=burnout_risk
    )
