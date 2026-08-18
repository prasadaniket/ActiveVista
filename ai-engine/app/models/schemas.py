from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AthleteMetricsInput(BaseModel):
    weight_kg: float = Field(..., gt=20, lt=300, description="Athlete weight in kilograms")
    height_cm: float = Field(..., gt=100, lt=250, description="Athlete height in centimeters")
    age: int = Field(..., gt=10, lt=120, description="Athlete age in years")
    gender: str = Field("male", description="Gender: male, female, or other")
    activity_level: str = Field("moderate", description="sedentary, light, moderate, active, very_active")
    weekly_workout_count: int = Field(4, ge=0, le=28)
    avg_session_duration_mins: int = Field(45, ge=10, le=240)
    recent_intensity_rating: float = Field(7.0, ge=1.0, le=10.0)

class RecoveryAnalysisResponse(BaseModel):
    bmr_kcal: float
    tdee_kcal: float
    fatigue_score: float = Field(..., description="0-100 fatigue index")
    recovery_status: str = Field(..., description="Optimal, Moderate Fatigue, High Fatigue, Strain Risk")
    recommended_rest_hours: int
    hydration_target_liters: float
    daily_protein_target_grams: float
    tactical_recommendations: List[str]

class PlanGenerationInput(BaseModel):
    goal: str = Field("hypertrophy", description="fat_loss, hypertrophy, strength, endurance")
    difficulty: str = Field("intermediate", description="beginner, intermediate, advanced, elite")
    days_per_week: int = Field(4, ge=2, le=7)
    session_duration_mins: int = Field(45, ge=20, le=120)
    focus_areas: Optional[List[str]] = Field(default_factory=lambda: ["full_body"])

class ExerciseDetail(BaseModel):
    name: str
    target_muscle: str
    sets: int
    reps: str
    rest_seconds: int
    intensity_rpe: float

class DailyWorkoutPlan(BaseModel):
    day: int
    day_name: str
    focus: str
    estimated_calories: int
    exercises: List[ExerciseDetail]

class PlanGenerationResponse(BaseModel):
    plan_title: str
    goal: str
    duration_days: int
    weekly_volume_hours: float
    schedule: List[DailyWorkoutPlan]
    nutrition_strategy: Dict[str, Any]

class WorkoutLogItem(BaseModel):
    exercise_name: str
    sets: int
    reps: int
    weight_kg: float
    duration_mins: int

class TelemetryAnalysisInput(BaseModel):
    athlete_weight_kg: float
    workouts: List[WorkoutLogItem]

class TelemetryAnalysisResponse(BaseModel):
    total_volume_load_kg: float
    power_to_weight_ratio: float
    caloric_efficiency_score: float
    intensity_distribution: Dict[str, float]
    burnout_risk_percentage: float
