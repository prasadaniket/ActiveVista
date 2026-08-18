/*
  routes/aiRoute.js
  ActiveVista — AI & Physiological Telemetry Gateway
  Connects Express 5 to the Python FastAPI Intelligence Microservice
  Includes resilient fallback calculations if the Python engine is offline.
*/
import express from "express";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();
const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || "http://localhost:8000";

// --- Resilient Fallback Engine ---
const calculateFallbackRecovery = (metrics) => {
  const weight = parseFloat(metrics.weight_kg) || 75;
  const height = parseFloat(metrics.height_cm) || 175;
  const age = parseInt(metrics.age) || 25;
  const isFemale = (metrics.gender || "").toLowerCase() === "female";

  const bmr = isFemale
    ? 10 * weight + 6.25 * height - 5 * age - 161
    : 10 * weight + 6.25 * height - 5 * age + 5;

  const tdee = bmr * 1.55;
  const weeklyHours = ((parseInt(metrics.weekly_workout_count) || 4) * (parseInt(metrics.avg_session_duration_mins) || 45)) / 60;
  const intensity = parseFloat(metrics.recent_intensity_rating) || 7.0;
  const fatigueScore = Math.min(100, Math.max(10, Math.round((weeklyHours * 12) * Math.pow(intensity / 10, 1.2))));

  return {
    bmr_kcal: Math.round(bmr),
    tdee_kcal: Math.round(tdee),
    fatigue_score: fatigueScore,
    recovery_status: fatigueScore > 75 ? "High Fatigue" : fatigueScore > 50 ? "Moderate Fatigue" : "Optimal Readiness",
    recommended_rest_hours: fatigueScore > 75 ? 36 : 24,
    hydration_target_liters: Math.round((weight * 0.04 + weeklyHours * 0.15) * 100) / 100,
    daily_protein_target_grams: Math.round(weight * 1.8),
    tactical_recommendations: [
      "Target progressive overload in current cycle.",
      "Ensure 7.5+ hours of sleep for neuromuscular recovery.",
      "Maintain hydration protocol."
    ],
    engine: "node-fallback"
  };
};

// --- Proxy Route: Recovery Analytics ---
router.post("/recovery", verifyToken, async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/api/v1/analytics/recovery`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) throw new Error(`Python engine returned status: ${response.status}`);
    const data = await response.json();
    return res.status(200).json({ success: true, data, engine: "python-fastapi" });
  } catch (error) {
    // Fallback if Python engine is offline
    const fallbackData = calculateFallbackRecovery(req.body);
    return res.status(200).json({ success: true, data: fallbackData, fallback: true });
  }
});

// --- Proxy Route: Plan Generator ---
router.post("/plan", verifyToken, async (req, res) => {
  try {
    const response = await fetch(`${PYTHON_SERVICE_URL}/api/v1/planner/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    if (!response.ok) throw new Error(`Python engine returned status: ${response.status}`);
    const data = await response.json();
    return res.status(200).json({ success: true, data, engine: "python-fastapi" });
  } catch (error) {
    return res.status(200).json({
      success: true,
      data: {
        plan_title: `ActiveVista 30-Day ${req.body.goal || "Hypertrophy"} Protocol`,
        goal: req.body.goal || "hypertrophy",
        duration_days: 30,
        weekly_volume_hours: 4.5,
        schedule: [],
        nutrition_strategy: { note: "Ensure protein intake of 2.0g per kg of bodyweight" }
      },
      fallback: true
    });
  }
});

export default router;
