/*
  routes/workoutRoute.js
  Purpose: Legacy/aux workout endpoints mounted under /api/user/workout for CRUD and completion.
*/
import express from "express";
import { verifyToken } from "../middleware/auth.js";
import {
  addWorkout,
  getWorkoutsByDate,
  deleteWorkout,
  completeWorkout,
  completeWorkoutByBody,
} from "../controllers/workoutController.js";

const router = express.Router();

// /api/workout
router.get("/", verifyToken, getWorkoutsByDate);
router.post("/", verifyToken, addWorkout);
router.delete("/:workoutId", verifyToken, deleteWorkout);
router.post("/:workoutId/complete", verifyToken, completeWorkout);
router.post("/:id/complete", verifyToken, completeWorkout); // alias
router.post("/complete", verifyToken, completeWorkoutByBody); // body-based

export default router;


