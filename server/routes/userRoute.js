/*
  routes/userRoute.js
  Purpose: Defines REST endpoints for user features: auth, profile, dashboard,
           workouts, steps tracking, and workout plan lifecycle.
  Notes: Many routes protected by verifyToken; delegates to userController.js.
*/
import express from "express";
import {
  UserLogin,
  UserRegister,
  getUserDashboard,
  getUserProfile,
  updateUserProfile,
  migrateUserFields,
  changePassword,
  getUserWorkoutPlans,
  createWorkoutPlan,
  getRecommendedWorkoutPlans,
  getWorkoutHistory,
  deleteWorkoutHistory,
  getAllHistoricalWorkouts,
  getDailySteps,
  updateDailySteps,
  getWeeklySteps,
  useWorkoutPlan,
  getActivePlan,
  getPastPlans,
  terminatePlan,
  completePlanWorkout,
  completeIndividualWorkout,
} from "../controllers/userController.js";
import WorkoutRoutes from "./workoutRoute.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Authentication routes
router.post("/signup", UserRegister);
router.post("/signin", UserLogin);

// Profile routes
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateUserProfile);
router.post("/migrate-fields", verifyToken, migrateUserFields);
router.put("/change-password", verifyToken, changePassword);

// Dashboard and workout routes
router.get("/dashboard", verifyToken, getUserDashboard);
// Mount workout routes here to preserve legacy paths like /api/user/workout
router.use("/workout", WorkoutRoutes);

// Workout plan routes
router.get("/workout-plans", verifyToken, getUserWorkoutPlans);
router.post("/workout-plans", verifyToken, createWorkoutPlan);
router.get("/recommended-plans", verifyToken, getRecommendedWorkoutPlans);

// Workout history routes
router.get("/workout-history", verifyToken, getWorkoutHistory);
router.get("/all-workouts", verifyToken, getAllHistoricalWorkouts);
router.delete("/workout-history/:historyId", verifyToken, deleteWorkoutHistory);

// Steps tracking routes
router.get("/steps", verifyToken, getDailySteps);
router.post("/steps", verifyToken, updateDailySteps);
router.get("/steps/weekly", verifyToken, getWeeklySteps);

// Workout plan routes
router.post("/use-plan", verifyToken, useWorkoutPlan);
router.get("/active-plan", verifyToken, getActivePlan);
router.get("/past-plans", verifyToken, getPastPlans);
router.post("/terminate-plan", verifyToken, terminatePlan);
router.post("/complete-plan-workout", verifyToken, completePlanWorkout);
router.post("/complete-individual-workout", verifyToken, completeIndividualWorkout);

export default router;