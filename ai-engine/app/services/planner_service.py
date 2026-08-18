from typing import List
from app.models.schemas import (
    PlanGenerationInput,
    PlanGenerationResponse,
    DailyWorkoutPlan,
    ExerciseDetail
)

EXERCISE_DATABASE = {
    "hypertrophy": [
        ExerciseDetail(name="Incline Barbell Bench Press", target_muscle="Upper Chest", sets=4, reps="8-10", rest_seconds=90, intensity_rpe=8.5),
        ExerciseDetail(name="Dumbbell Lateral Raises", target_muscle="Side Deltoids", sets=4, reps="12-15", rest_seconds=60, intensity_rpe=8.0),
        ExerciseDetail(name="Barbell Romanian Deadlift", target_muscle="Hamstrings & Glutes", sets=4, reps="8-10", rest_seconds=120, intensity_rpe=8.5),
        ExerciseDetail(name="Cable Seated Row", target_muscle="Lats & Mid-Back", sets=4, reps="10-12", rest_seconds=75, intensity_rpe=8.0),
        ExerciseDetail(name="Standing Calf Raises", target_muscle="Calves", sets=3, reps="15-20", rest_seconds=60, intensity_rpe=7.5),
    ],
    "strength": [
        ExerciseDetail(name="Barbell Back Squat", target_muscle="Quadriceps & Core", sets=5, reps="3-5", rest_seconds=180, intensity_rpe=9.0),
        ExerciseDetail(name="Flat Barbell Bench Press", target_muscle="Pectorals", sets=5, reps="3-5", rest_seconds=180, intensity_rpe=9.0),
        ExerciseDetail(name="Conventional Deadlift", target_muscle="Posterior Chain", sets=4, reps="3-5", rest_seconds=240, intensity_rpe=9.5),
        ExerciseDetail(name="Overhead Barbell Press", target_muscle="Anterior Deltoids", sets=4, reps="5-6", rest_seconds=150, intensity_rpe=8.5),
        ExerciseDetail(name="Weighted Pull-Ups", target_muscle="Latissimus Dorsi", sets=4, reps="5-6", rest_seconds=120, intensity_rpe=8.5),
    ],
    "fat_loss": [
        ExerciseDetail(name="Kettlebell Goblet Squats", target_muscle="Full Body", sets=4, reps="15-20", rest_seconds=45, intensity_rpe=7.5),
        ExerciseDetail(name="Dumbbell Renegade Rows", target_muscle="Core & Back", sets=4, reps="12 per side", rest_seconds=45, intensity_rpe=8.0),
        ExerciseDetail(name="Thrusters (Squat to Overhead)", target_muscle="Full Body Conditioning", sets=4, reps="15", rest_seconds=60, intensity_rpe=8.5),
        ExerciseDetail(name="Mountain Climbers & Burpees", target_muscle="Cardio Conditioning", sets=4, reps="45 sec", rest_seconds=30, intensity_rpe=8.5),
        ExerciseDetail(name="Plank with Shoulder Taps", target_muscle="Anterior Core", sets=3, reps="60 sec", rest_seconds=45, intensity_rpe=7.0),
    ],
    "endurance": [
        ExerciseDetail(name="Interval Rowing Machine", target_muscle="Cardiovascular & Full Body", sets=5, reps="500m sprints", rest_seconds=60, intensity_rpe=8.5),
        ExerciseDetail(name="Bodyweight Walking Lunges", target_muscle="Quads & Glutes", sets=4, reps="20 per leg", rest_seconds=45, intensity_rpe=7.5),
        ExerciseDetail(name="Box Jumps & Step Downs", target_muscle="Explosive Power", sets=4, reps="12 reps", rest_seconds=60, intensity_rpe=8.0),
        ExerciseDetail(name="Battle Ropes Waves", target_muscle="Upper Body Anaerobic", sets=4, reps="30 sec", rest_seconds=45, intensity_rpe=8.5),
    ]
}

def generate_tactical_plan(req: PlanGenerationInput) -> PlanGenerationResponse:
    goal_key = req.goal.lower() if req.goal.lower() in EXERCISE_DATABASE else "hypertrophy"
    exercises_pool = EXERCISE_DATABASE[goal_key]
    
    day_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    foci = ["Upper Body Power", "Lower Body Foundation", "Tactical Hypertrophy", "Cardio Conditioning", "Full Body Mastery"]
    
    schedule: List[DailyWorkoutPlan] = []
    for day_idx in range(req.days_per_week):
        day_focus = foci[day_idx % len(foci)]
        schedule.append(
            DailyWorkoutPlan(
                day=day_idx + 1,
                day_name=day_names[day_idx % 7],
                focus=day_focus,
                estimated_calories=int(req.session_duration_mins * 7.5),
                exercises=exercises_pool
            )
        )
    
    weekly_hours = round((req.days_per_week * req.session_duration_mins) / 60.0, 1)
    
    macro_distributions = {
        "fat_loss": {"protein_pct": 40, "carbs_pct": 35, "fats_pct": 25, "calorie_delta": "-400 kcal deficit"},
        "hypertrophy": {"protein_pct": 30, "carbs_pct": 50, "fats_pct": 20, "calorie_delta": "+300 kcal surplus"},
        "strength": {"protein_pct": 30, "carbs_pct": 45, "fats_pct": 25, "calorie_delta": "+200 kcal surplus"},
        "endurance": {"protein_pct": 25, "carbs_pct": 55, "fats_pct": 20, "calorie_delta": "Maintenance"}
    }
    
    return PlanGenerationResponse(
        plan_title=f"ActiveVista 30-Day {req.goal.replace('_', ' ').title()} Protocol",
        goal=req.goal,
        duration_days=30,
        weekly_volume_hours=weekly_hours,
        schedule=schedule,
        nutrition_strategy=macro_distributions.get(goal_key, macro_distributions["hypertrophy"])
    )
