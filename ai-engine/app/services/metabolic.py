import math
from app.models.schemas import AthleteMetricsInput, RecoveryAnalysisResponse

def calculate_bmr(metrics: AthleteMetricsInput) -> float:
    """
    Calculates Basal Metabolic Rate using the refined Mifflin-St Jeor equation.
    """
    if metrics.gender.lower() == "female":
        bmr = (10 * metrics.weight_kg) + (6.25 * metrics.height_cm) - (5 * metrics.age) - 161
    else:
        bmr = (10 * metrics.weight_kg) + (6.25 * metrics.height_cm) - (5 * metrics.age) + 5
    return round(bmr, 2)

def calculate_tdee(bmr: float, activity_level: str) -> float:
    """
    Calculates Total Daily Energy Expenditure based on activity multiplier.
    """
    multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9,
    }
    multiplier = multipliers.get(activity_level.lower(), 1.55)
    return round(bmr * multiplier, 2)

def compute_recovery_metrics(metrics: AthleteMetricsInput) -> RecoveryAnalysisResponse:
    bmr = calculate_bmr(metrics)
    tdee = calculate_tdee(bmr, metrics.activity_level)
    
    # Calculate exponential fatigue strain score (0 - 100)
    weekly_hours = (metrics.weekly_workout_count * metrics.avg_session_duration_mins) / 60.0
    intensity_factor = metrics.recent_intensity_rating / 10.0
    
    raw_fatigue = (weekly_hours * 12.5) * (intensity_factor ** 1.3)
    fatigue_score = min(100.0, max(5.0, round(raw_fatigue, 1)))
    
    if fatigue_score < 30.0:
        recovery_status = "Optimal Readiness"
        rest_hours = 12
        recommendations = [
            "Physiological readiness is primed for high-intensity training.",
            "Target progressive overload in current cycle.",
            "Maintain baseline hydration protocol."
        ]
    elif fatigue_score < 60.0:
        recovery_status = "Moderate Fatigue"
        rest_hours = 24
        recommendations = [
            "Adequate recovery capacity. Maintain standard scheduled workouts.",
            "Ensure 7.5+ hours of sleep for neuromuscular rejuvenation.",
            "Focus on post-workout electrolyte replenishment."
        ]
    elif fatigue_score < 80.0:
        recovery_status = "High Fatigue"
        rest_hours = 36
        recommendations = [
            "Elevated central nervous system fatigue detected.",
            "Recommend an active recovery session or light mobility work today.",
            "Increase complex carbohydrate intake around training windows."
        ]
    else:
        recovery_status = "Systemic Strain Risk"
        rest_hours = 48
        recommendations = [
            "High acute-to-chronic workload ratio detected. Injury risk elevated.",
            "Mandate 24-48 hour complete deload or rest period.",
            "Prioritize deep sleep, cold/heat contrast, and micronutrient intake."
        ]
    
    hydration_target = round(metrics.weight_kg * 0.04 + (weekly_hours * 0.15), 2)
    protein_target = round(metrics.weight_kg * (2.0 if metrics.activity_level in ["active", "very_active"] else 1.6), 1)

    return RecoveryAnalysisResponse(
        bmr_kcal=bmr,
        tdee_kcal=tdee,
        fatigue_score=fatigue_score,
        recovery_status=recovery_status,
        recommended_rest_hours=rest_hours,
        hydration_target_liters=hydration_target,
        daily_protein_target_grams=protein_target,
        tactical_recommendations=recommendations,
    )
