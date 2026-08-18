from fastapi import APIRouter, HTTPException
from app.models.schemas import PlanGenerationInput, PlanGenerationResponse
from app.services.planner_service import generate_tactical_plan

router = APIRouter(prefix="/planner", tags=["AI Workout Generation"])

@router.post("/generate", response_model=PlanGenerationResponse)
async def generate_plan(payload: PlanGenerationInput):
    """
    Generates a personalized, periodized 30-day tactical training protocol
    complete with exercise database matching and nutrition macro targets.
    """
    try:
        return generate_tactical_plan(payload)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Plan generation failed: {str(e)}")
