import { createError } from "../middleware/errorMiddleware.js";
import Workout from "../models/Workout.js";
import WorkoutHistory from "../models/WorkoutHistory.js";

// Get workouts for a specific day (or today by default)
export const getWorkoutsByDate = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    // Parse YYYY-MM-DD as local day range to avoid UTC shift issues
    const q = req.query.date;
    let startOfDay;
    let endOfDay;
    if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) {
      const [y, m, d] = q.split('-').map(Number);
      startOfDay = new Date(y, m - 1, d);
      endOfDay = new Date(y, m - 1, d + 1);
    } else {
      const now = new Date();
      startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    }

    const todaysWorkouts = await Workout.find({
      user: userId,
      date: { $gte: startOfDay, $lt: endOfDay },
    }).sort({ createdAt: -1 });
    const totalCaloriesBurnt = todaysWorkouts.reduce(
      (total, w) => total + (Number(w.caloriesBurned) || 0),
      0
    );

    return res.status(200).json({ todaysWorkouts, totalCaloriesBurnt });
  } catch (err) {
    next(err);
  }
};

// Add new workout(s) via workoutString format
export const addWorkout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { workoutString } = req.body;
    if (!workoutString) return next(createError(400, "Workout string is missing"));

    // Get user's fitness level and weight for calorie calculation
    const User = (await import("../models/userModel.js")).default;
    const user = await User.findById(userId).select('fitnessLevel weight');
    const fitnessLevel = user?.fitnessLevel || 'beginner';
    const userWeight = user?.weight || 70;

    const eachworkout = workoutString.split(";").map((line) => line.trim());
    const categories = eachworkout.filter((line) => line.startsWith("#"));
    if (categories.length === 0) {
      return next(createError(400, "No categories found in workout string"));
    }

    const parsedWorkouts = [];
    let count = 0;
    for (const line of eachworkout) {
      count++;
      if (!line.startsWith("#")) {
        return next(createError(400, `Workout string is missing for ${count}th workout`));
      }
      const parts = line.split("\n").map((p) => p.trim());
      if (parts.length < 5) {
        return next(createError(400, `Workout string is missing for ${count}th workout`));
      }
      const details = parseWorkoutLine(parts);
      if (!details) return next(createError(400, "Please enter in proper format "));
      details.category = parts[0].substring(1).trim();
      parsedWorkouts.push(details);
    }

    for (const w of parsedWorkouts) {
      w.caloriesBurned = parseFloat(calculateCaloriesBurnt(w, fitnessLevel, userWeight));
      await Workout.create({ ...w, user: userId });
    }

    return res.status(201).json({ message: "Workouts added successfully", workouts: parsedWorkouts });
  } catch (err) {
    next(err);
  }
};

// Mark a workout as completed and push into history
export const completeWorkout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const workoutId = req.params.workoutId || req.params.id;

    let workout = null;
    try {
      workout = await Workout.findById(workoutId);
    } catch (e) {
      return next(createError(404, "Workout not found"));
    }
    if (!workout) return next(createError(404, "Workout not found"));
    if (String(workout.user) !== String(userId)) return next(createError(404, "Workout not found"));

    const historyDoc = new WorkoutHistory({
      user: userId,
      workoutPlan: null,
      workoutName: workout.workoutName || workout.category || "Workout",
      category: workout.category || "general",
      exercises: [
        {
          name: workout.workoutName || "Exercise",
          sets: workout.sets || 0,
          reps: workout.reps || 0,
          weight: workout.weight || 0,
          duration: workout.duration || 0,
          completed: true,
        },
      ],
      totalDuration: workout.duration || 0,
      caloriesBurned: workout.caloriesBurned || 0,
      completedAt: workout.date || new Date(),
      notes: "",
    });

    await historyDoc.save();
    await Workout.deleteOne({ _id: workoutId, user: userId });

    res.status(200).json({ success: true, message: "Workout marked as completed", history: historyDoc });
  } catch (err) {
    next(err);
  }
};

// Alternate entry: accept id in request body
export const completeWorkoutByBody = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const workoutId = req.body?.workoutId;
    if (!workoutId) return next(createError(400, "workoutId is required"));

    let workout = null;
    try {
      workout = await Workout.findById(workoutId);
    } catch (e) {
      return next(createError(404, "Workout not found"));
    }
    if (!workout) return next(createError(404, "Workout not found"));
    if (String(workout.user) !== String(userId)) return next(createError(404, "Workout not found"));

    const historyDoc = new WorkoutHistory({
      user: userId,
      workoutPlan: null,
      workoutName: workout.workoutName || workout.category || "Workout",
      category: workout.category || "general",
      exercises: [
        {
          name: workout.workoutName || "Exercise",
          sets: workout.sets || 0,
          reps: workout.reps || 0,
          weight: workout.weight || 0,
          duration: workout.duration || 0,
          completed: true,
        },
      ],
      totalDuration: workout.duration || 0,
      caloriesBurned: workout.caloriesBurned || 0,
      completedAt: workout.date || new Date(),
      notes: "",
    });

    await historyDoc.save();
    await Workout.deleteOne({ _id: workoutId, user: userId });

    res.status(200).json({ success: true, message: "Workout marked as completed", history: historyDoc });
  } catch (err) {
    next(err);
  }
};

// Delete a workout (active list)
export const deleteWorkout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { workoutId } = req.params;
    const w = await Workout.findOneAndDelete({ _id: workoutId, user: userId });
    if (!w) return next(createError(404, "Workout not found"));
    res.status(200).json({ success: true, message: "Workout deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Helpers (copied from userController)
const parseWorkoutLine = (parts) => {
  const details = {};
  if (parts.length >= 5) {
    details.workoutName = parts[1].substring(1).trim();
    details.sets = parseInt(parts[2].split("sets")[0].substring(1).trim());
    details.reps = parseInt(parts[2].split("sets")[1].split("reps")[0].substring(1).trim());
    details.weight = parseFloat(parts[3].split("kg")[0].substring(1).trim());
    details.duration = parseFloat(parts[4].split("min")[0].substring(1).trim());
    return details;
  }
  return null;
};

const calculateCaloriesBurnt = (workoutDetails, fitnessLevel = 'beginner', userWeight = 70) => {
  const durationInMinutes = parseInt(workoutDetails.duration) || 30;
  const weightInKg = parseInt(workoutDetails.weight) || userWeight;
  const workoutName = (workoutDetails.workoutName || '').toLowerCase();
  
  // Calorie multipliers based on fitness level
  const levelMultipliers = {
    'beginner': 1.0,
    'intermediate': 1.3,
    'advanced': 1.6,
    'expert': 1.9
  };
  
  // Base calories for different workout types (per 30 minutes for 70kg person)
  const workoutCalories = {
    'chest': { base: 180, keywords: ['bench press', 'pushups', 'chest fly', 'incline', 'decline', 'chest'] },
    'back': { base: 200, keywords: ['rows', 'pull', 'lat', 'deadlift', 'pullup', 'back'] },
    'shoulders': { base: 180, keywords: ['shoulder press', 'lateral raise', 'front raise', 'shrug', 'shoulder'] },
    'legs': { base: 250, keywords: ['squat', 'lunge', 'leg press', 'deadlift', 'calf', 'leg'] },
    'arms': { base: 150, keywords: ['curl', 'tricep', 'bicep', 'extension', 'dip', 'arm'] },
    'cardio': { base: 120, keywords: ['running', 'cycling', 'walking', 'jumping', 'jogging', 'cardio'] },
    'core': { base: 100, keywords: ['crunch', 'plank', 'situp', 'ab', 'core'] },
    'flexibility': { base: 80, keywords: ['yoga', 'stretch', 'flexibility', 'pilates'] }
  };
  
  // Find matching workout type
  let matchedType = 'cardio'; // default
  let baseCalories = 120;
  
  for (const [type, data] of Object.entries(workoutCalories)) {
    if (data.keywords.some(keyword => workoutName.includes(keyword))) {
      matchedType = type;
      baseCalories = data.base;
      break;
    }
  }
  
  // Calculate based on workout duration
  const durationMultiplier = durationInMinutes / 30;
  
  // Weight adjustment (assuming 70kg as baseline)
  const weightMultiplier = weightInKg / 70;
  
  // Apply all multipliers
  const totalCalories = Math.round(
    baseCalories * 
    durationMultiplier * 
    weightMultiplier * 
    (levelMultipliers[fitnessLevel] || levelMultipliers['beginner'])
  );
  
  return Math.max(totalCalories, 50); // minimum 50 calories
};


