/*
  controllers/userController.js
  Purpose: User domain logic: authentication, profile, workouts/history, steps tracking,
           dashboard aggregation, and 30-day workout plan lifecycle APIs.
  Notes: Used by routes/userRoute.js, with verifyToken middleware guarding protected routes.
*/
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { createError } from "../middleware/errorMiddleware.js";
import { generateToken } from "../utils/generateToken.js";
import User from "../models/userModel.js";
import Workout from "../models/Workout.js";
import WorkoutPlan from "../models/WorkoutPlan.js";
import WorkoutHistory from "../models/WorkoutHistory.js";
import Steps from "../models/StepsModel.js";
import UserPlan from "../models/UserPlan.js";

dotenv.config();

export const UserRegister = async (req, res, next) => {
  try {
    const { email, password, name, img } = req.body;

    // Validate required fields
    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        message: "Email, password, and name are required" 
      });
    }

    // Check if the email is in use
    const existingUser = await User.findOne({ email }).exec();
    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: "Email is already in use" 
      });
    }

    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      img,
    });
    
    const createdUser = await user.save();
    
    // Check if JWT secret is available
    if (!process.env.JWT) {
      console.error("❌ JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ 
        success: false, 
        message: "Server configuration error" 
      });
    }
    
    const token = generateToken(createdUser._id, "7d");
    
    return res.status(201).json({ 
      success: true,
      message: "User created successfully",
      token, 
      user: {
        id: createdUser._id,
        name: createdUser.name,
        email: createdUser.email
      }
    });
  } catch (error) {
    console.error("❌ UserRegister Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during registration" 
    });
  }
};

export const UserLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: "Email and password are required" 
      });
    }

    const user = await User.findOne({ email: email });
    
    // Check if user exists
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Check if password is correct
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Check if JWT secret is available
    if (!process.env.JWT) {
      console.error("❌ JWT_SECRET is not defined in environment variables");
      return res.status(500).json({ 
        success: false, 
        message: "Server configuration error" 
      });
    }

    const token = generateToken(user._id, "7d");

    return res.status(200).json({ 
      success: true,
      message: "Login successful",
      token, 
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("❌ UserLogin Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Server error during login" 
    });
  }
};

export const getUserDashboard = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    const currentDateFormatted = new Date();
    const startToday = new Date(
      currentDateFormatted.getFullYear(),
      currentDateFormatted.getMonth(),
      currentDateFormatted.getDate()
    );
    const endToday = new Date(
      currentDateFormatted.getFullYear(),
      currentDateFormatted.getMonth(),
      currentDateFormatted.getDate() + 1
    );

    // Calculate total calories burnt from ALL workouts (including history from both collections and plan workouts)
    const [currentWorkoutsCalories, historyWorkoutsCalories, planWorkoutsCalories] = await Promise.all([
      // Current workouts
      Workout.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: null,
            totalCaloriesBurnt: { $sum: "$caloriesBurned" },
          },
        },
      ]),
      // Historical workouts
      WorkoutHistory.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: null,
            totalCaloriesBurnt: { $sum: "$caloriesBurned" },
          },
        },
      ]),
      // Plan workouts (from active plan)
      UserPlan.aggregate([
        { $match: { user: user._id, status: 'active' } },
        { $unwind: "$dayMapping" },
        { $match: { "dayMapping.completed": true } },
        {
          $group: {
            _id: null,
            totalCaloriesBurnt: { $sum: "$dayMapping.caloriesBurned" },
          },
        },
      ])
    ]);

    const totalCaloriesBurnt = [
      ...(currentWorkoutsCalories.length > 0 ? currentWorkoutsCalories : [{ totalCaloriesBurnt: 0 }]),
      ...(historyWorkoutsCalories.length > 0 ? historyWorkoutsCalories : [{ totalCaloriesBurnt: 0 }]),
      ...(planWorkoutsCalories.length > 0 ? planWorkoutsCalories : [{ totalCaloriesBurnt: 0 }])
    ];

    // Calculate total no of workouts from ALL workouts (including history from both collections and plan workouts)
    const [currentWorkoutsCount, historyWorkoutsCount, planWorkoutsCount] = await Promise.all([
      Workout.countDocuments({ user: userId }),
      WorkoutHistory.countDocuments({ user: userId }),
      UserPlan.aggregate([
        { $match: { user: user._id, status: 'active' } },
        { $unwind: "$dayMapping" },
        { $match: { "dayMapping.completed": true } },
        { $count: "total" }
      ])
    ]);

    const totalWorkouts = currentWorkoutsCount + historyWorkoutsCount + (planWorkoutsCount.length > 0 ? planWorkoutsCount[0].total : 0);

    // Calculate today's calories burnt (for today's specific data)
    const todaysCaloriesBurnt = await Workout.aggregate([
      { $match: { user: user._id, date: { $gte: startToday, $lt: endToday } } },
      {
        $group: {
          _id: null,
          totalCaloriesBurnt: { $sum: "$caloriesBurned" },
        },
      },
    ]);

    // Calculate today's workout count
    const todaysWorkouts = await Workout.countDocuments({
      user: userId,
      date: { $gte: startToday, $lt: endToday },
    });

    // Calculate total calories from both collections
    const totalCaloriesFromCurrent = currentWorkoutsCalories.length > 0 ? currentWorkoutsCalories[0].totalCaloriesBurnt : 0;
    const totalCaloriesFromHistory = historyWorkoutsCalories.length > 0 ? historyWorkoutsCalories[0].totalCaloriesBurnt : 0;
    const totalCaloriesCombined = totalCaloriesFromCurrent + totalCaloriesFromHistory;

    // Calculate average calories burnt per workout
    const avgCaloriesBurntPerWorkout =
      totalWorkouts > 0 ? totalCaloriesCombined / totalWorkouts : 0;

    // Fetch category of workouts from ALL workouts (including history from both collections and plan workouts)
    const [currentCategoryCalories, historyCategoryCalories, planCategoryCalories] = await Promise.all([
      // Current workouts categories
      Workout.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: "$category",
            totalCaloriesBurnt: { $sum: "$caloriesBurned" },
          },
        },
      ]),
      // Historical workouts categories
      WorkoutHistory.aggregate([
        { $match: { user: user._id } },
        {
          $group: {
            _id: "$category",
            totalCaloriesBurnt: { $sum: "$caloriesBurned" },
          },
        },
      ]),
      // Plan workouts categories
      UserPlan.aggregate([
        { $match: { user: user._id, status: 'active' } },
        { $unwind: "$dayMapping" },
        { $match: { "dayMapping.completed": true } },
        {
          $group: {
            _id: "$dayMapping.category",
            totalCaloriesBurnt: { $sum: "$dayMapping.caloriesBurned" },
          },
        },
      ])
    ]);

    // Combine category data from both collections
    const combinedCategoryMap = new Map();
    
    // Add current workout categories
    currentCategoryCalories.forEach(cat => {
      combinedCategoryMap.set(cat._id, (combinedCategoryMap.get(cat._id) || 0) + cat.totalCaloriesBurnt);
    });
    
    // Add historical workout categories
    historyCategoryCalories.forEach(cat => {
      combinedCategoryMap.set(cat._id, (combinedCategoryMap.get(cat._id) || 0) + cat.totalCaloriesBurnt);
    });
    
    // Add plan workout categories
    planCategoryCalories.forEach(cat => {
      combinedCategoryMap.set(cat._id, (combinedCategoryMap.get(cat._id) || 0) + cat.totalCaloriesBurnt);
    });

    // Convert back to array format
    const categoryCalories = Array.from(combinedCategoryMap.entries()).map(([category, calories]) => ({
      _id: category,
      totalCaloriesBurnt: calories
    }));

    //Format category data for pie chart

    const pieChartData = categoryCalories.map((category, index) => ({
      id: index,
      value: category.totalCaloriesBurnt,
      label: category._id,
    }));

    const weeks = [];
    const caloriesBurnt = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(
        currentDateFormatted.getTime() - i * 24 * 60 * 60 * 1000
      );
      weeks.push(`${date.getDate()}th`);

      const startOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      );
      const endOfDay = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate() + 1
      );

      const weekData = await Workout.aggregate([
        {
          $match: {
            user: user._id,
            date: { $gte: startOfDay, $lt: endOfDay },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            totalCaloriesBurnt: { $sum: "$caloriesBurned" },
          },
        },
        {
          $sort: { _id: 1 }, // Sort by date in ascending order
        },
      ]);

      caloriesBurnt.push(
        weekData[0]?.totalCaloriesBurnt ? weekData[0]?.totalCaloriesBurnt : 0
      );
    }

    // Format data for charts
    const categories = [
      { name: "Cardio", value: 0, color: "#3b82f6" },
      { name: "Strength", value: 0, color: "#10b981" },
      { name: "Flexibility", value: 0, color: "#f59e0b" },
      { name: "Other", value: 0, color: "#ef4444" },
    ];

    // Map workout categories to chart categories
    const categoryMap = {
      // Strength Training
      'chest': 'Strength',
      'back': 'Strength', 
      'shoulders': 'Strength',
      'legs': 'Strength',
      'arms': 'Strength',
      'biceps': 'Strength',
      'triceps': 'Strength',
      'upper body': 'Strength',
      'lower body': 'Strength',
      'full body': 'Strength',
      'strength': 'Strength',
      'weight training': 'Strength',
      'resistance': 'Strength',
      
      // Cardio
      'cardio': 'Cardio',
      'running': 'Cardio',
      'cycling': 'Cardio',
      'swimming': 'Cardio',
      'walking': 'Cardio',
      'jogging': 'Cardio',
      'hiit': 'Cardio',
      'aerobic': 'Cardio',
      'endurance': 'Cardio',
      
      // Flexibility
      'flexibility': 'Flexibility',
      'yoga': 'Flexibility',
      'stretching': 'Flexibility',
      'pilates': 'Flexibility',
      'mobility': 'Flexibility',
      'balance': 'Flexibility',
      'meditation': 'Flexibility',
      
      // Other
      'core': 'Other',
      'abs': 'Other',
      'functional': 'Other',
      'sports': 'Other',
      'dance': 'Other',
      'martial arts': 'Other',
      'boxing': 'Other',
      'crossfit': 'Other',
      'calisthenics': 'Other',
      'rehabilitation': 'Other',
      'recovery': 'Other'
    };

    // Update categories with actual data
    categoryCalories.forEach(cat => {
      const chartCategory = categoryMap[cat._id.toLowerCase()] || 'Other';
      const categoryIndex = categories.findIndex(c => c.name === chartCategory);
      if (categoryIndex !== -1) {
        categories[categoryIndex].value += cat.totalCaloriesBurnt || 0;
      }
    });

    // Get active plan data for weekly integration
    const activePlan = await UserPlan.findOne({ 
      user: user._id, 
      status: 'active' 
    });

    // Calculate plan calories for the last 7 days
    let planCaloriesForWeek = [0, 0, 0, 0, 0, 0, 0];
    if (activePlan && activePlan.dayMapping) {
      const today = new Date();
      const startDate = new Date(activePlan.startDate);
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dayNumber = Math.floor((date - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        if (dayNumber >= 1 && dayNumber <= 30) {
          const planDay = activePlan.dayMapping.find(d => d.dayNumber === dayNumber);
          if (planDay && planDay.completed) {
            planCaloriesForWeek[6 - i] = planDay.caloriesBurned || 0;
          }
        }
      }
    }

    // Combine regular workout calories with plan calories
    const combinedWeeklyCalories = caloriesBurnt.map((cal, index) => 
      cal + (planCaloriesForWeek[index] || 0)
    );

    // Weekly stats for bar chart (now includes plan data)
    const weeklyStats = weeks.map((day, index) => ({
      day: day.replace('th', '').replace('st', '').replace('nd', '').replace('rd', ''),
      value: Math.round((combinedWeeklyCalories[index] / 500) * 100) // Convert to percentage (500 cal = 100%)
    }));

    return res.status(200).json({
      // Total historical data (all workouts including history from both collections)
      totalCaloriesBurnt: totalCaloriesCombined,
      totalWorkouts: totalWorkouts,
      avgCaloriesBurntPerWorkout: avgCaloriesBurntPerWorkout,
      
      // Today's specific data
      todaysCaloriesBurnt:
        todaysCaloriesBurnt.length > 0
          ? todaysCaloriesBurnt[0].totalCaloriesBurnt
          : 0,
      todaysWorkouts: todaysWorkouts,
      
      // Weekly data (last 7 days) - includes plan data
      totalWeeksCaloriesBurnt: {
        weeks: weeks,
        caloriesBurned: combinedWeeklyCalories,
      },
      pieChartData: pieChartData,
      
      // Chart data (includes all historical workouts)
      categories: categories,
      weeklyStats: weeklyStats,
      totalSteps: await getTotalStepsForToday(userId),
      totalTime: totalWorkouts * 45, // Mock time in minutes
      
      // Active plan data
      activePlan: activePlan ? {
        planName: activePlan.planName,
        totalWorkoutsCompleted: activePlan.totalWorkoutsCompleted,
        totalCaloriesBurned: activePlan.totalCaloriesBurned,
        currentStreak: activePlan.currentStreak,
        startDate: activePlan.startDate,
        endDate: activePlan.endDate,
        progressPercentage: Math.round((activePlan.totalWorkoutsCompleted / 30) * 100),
        daysRemaining: 30 - activePlan.totalWorkoutsCompleted
      } : null,
    });
  } catch (err) {
    next(err);
  }
};


// Get user profile
export const getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Ensure gender and pronouns fields exist with default values
    if (user.gender === undefined) {
      user.gender = null;
    }
    if (user.pronouns === undefined) {
      user.pronouns = null;
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (err) {
    next(err);
  }
};

// Update user profile
export const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const updateData = req.body;

    console.log("Updating profile for user:", userId);
    console.log("Update data received:", updateData);

    // Remove password from update data if present
    delete updateData.password;

    // Ensure gender and pronouns are properly handled
    if (updateData.gender === '') {
      updateData.gender = null;
    }
    if (updateData.pronouns === '') {
      updateData.pronouns = null;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return next(createError(404, "User not found"));
    }

    console.log("Updated user data:", user);

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user
    });
  } catch (err) {
    console.error("Error updating user profile:", err);
    next(err);
  }
};

// Migration: Add missing gender and pronouns fields to existing users
export const migrateUserFields = async (req, res, next) => {
  try {
    console.log("Starting migration for gender and pronouns fields...");
    
    const result = await User.updateMany(
      { 
        $or: [
          { gender: { $exists: false } },
          { pronouns: { $exists: false } }
        ]
      },
      { 
        $set: { 
          gender: null,
          pronouns: null
        }
      }
    );

    console.log(`Migration completed. Updated ${result.modifiedCount} users.`);

    res.status(200).json({
      success: true,
      message: `Migration completed. Updated ${result.modifiedCount} users.`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Migration error:", err);
    next(err);
  }
};

// Change password
export const changePassword = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return next(createError(400, "Current password and new password are required"));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return next(createError(400, "Current password is incorrect"));
    }

    // Hash new password
    const salt = bcrypt.genSaltSync(10);
    const hashedNewPassword = bcrypt.hashSync(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (err) {
    next(err);
  }
};

// Get user's workout plans
export const getUserWorkoutPlans = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const workoutPlans = await WorkoutPlan.find({ user: userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      workoutPlans
    });
  } catch (err) {
    next(err);
  }
};

// Create custom workout plan
export const createWorkoutPlan = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const workoutPlanData = {
      ...req.body,
      user: userId,
      isCustom: true
    };

    const workoutPlan = new WorkoutPlan(workoutPlanData);
    await workoutPlan.save();

    res.status(201).json({
      success: true,
      message: "Workout plan created successfully",
      workoutPlan
    });
  } catch (err) {
    next(err);
  }
};

// Get recommended workout plans
export const getRecommendedWorkoutPlans = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return next(createError(404, "User not found"));
    }

    // Best-effort seeding (never fail the request if seeding encounters a validation error)
    try {
      const existingRecommended = await WorkoutPlan.countDocuments({ isRecommended: true });
      if (existingRecommended === 0) {
        await createDefaultSevenDaySplitPlan();
      }
      const beginnerRecommended = await WorkoutPlan.countDocuments({ isRecommended: true, difficulty: "beginner" });
      if (beginnerRecommended === 0) {
        await createDefaultBeginnerPlan();
      }
    } catch (seedErr) {
      console.error("⚠️ Seeding recommended plans failed (continuing):", seedErr?.message || seedErr);
    }

    // Get recommended plans based on user's fitness level and goals (fallback to all recommended)
    const query = {
      isRecommended: true,
    };
    let recommendedPlans = [];
    try {
      recommendedPlans = await WorkoutPlan.find(query).limit(6).lean();
    } catch (queryErr) {
      console.error("⚠️ Fetching recommended plans failed (will return fallback):", queryErr?.message || queryErr);
      recommendedPlans = [];
    }

    // Fallback data when DB is empty or query failed
    if (!Array.isArray(recommendedPlans) || recommendedPlans.length === 0) {
      recommendedPlans = [
        {
          _id: "fallback-adv-7day",
          name: "7-Day Split: Advanced",
          description: "Five lifting days and two active rest days.",
          duration: 1,
          difficulty: "advanced",
          isRecommended: true,
          weeks: [
            {
              weekNumber: 1,
              days: [
                { dayNumber: 1, dayName: "Chest", workouts: [{ name: "Chest Day" }] },
                { dayNumber: 2, dayName: "Back & Core", workouts: [{ name: "Back & Core" }] },
                { dayNumber: 3, dayName: "Active Rest", workouts: [{ name: "Active Recovery" }] },
                { dayNumber: 4, dayName: "Shoulders & Traps", workouts: [{ name: "Shoulders & Traps" }] },
                { dayNumber: 5, dayName: "Legs", workouts: [{ name: "Leg Day" }] },
                { dayNumber: 6, dayName: "Arms", workouts: [{ name: "Arms" }] },
                { dayNumber: 7, dayName: "Active Rest", workouts: [{ name: "Active Recovery" }] },
              ],
            },
          ],
        },
        {
          _id: "fallback-beginner-7day",
          name: "7-Day Beginner: Full-Body Intro",
          description: "Gentle, beginner-friendly split with two active rest days.",
          duration: 1,
          difficulty: "beginner",
          isRecommended: true,
          weeks: [
            {
              weekNumber: 1,
              days: [
                { dayNumber: 1, dayName: "Upper (Light)", workouts: [{ name: "Beginner Upper" }] },
                { dayNumber: 2, dayName: "Active Rest", workouts: [{ name: "Walk & Stretch" }] },
                { dayNumber: 3, dayName: "Lower (Light)", workouts: [{ name: "Beginner Lower" }] },
                { dayNumber: 4, dayName: "Core + Cardio", workouts: [{ name: "Core & Walk" }] },
                { dayNumber: 5, dayName: "Full Body (Light)", workouts: [{ name: "Beginner Full Body" }] },
                { dayNumber: 6, dayName: "Active Rest", workouts: [{ name: "Mobility & Walk" }] },
                { dayNumber: 7, dayName: "Optional Cardio", workouts: [{ name: "Light Cardio" }] },
              ],
            },
          ],
        },
      ];
    }

    return res.status(200).json({
      success: true,
      recommendedPlans,
    });
  } catch (err) {
    next(err);
  }
};

// Helper: seed a default 7-day split plan (advanced difficulty)
const createDefaultSevenDaySplitPlan = async () => {
  const plan = new WorkoutPlan({
    user: null,
    name: "7-Day Split: Advanced",
    description: "Five lifting days and two active rest days.",
    duration: 1,
    difficulty: "advanced",
    goals: ["strength", "muscle_gain"],
    equipment: ["gym_equipment", "barbell", "dumbbells", "cardio_machine"],
    isCustom: false,
    isRecommended: true,
    weeks: [
      {
        weekNumber: 1,
        days: [
          // Day 1: Chest
          {
            dayNumber: 1,
            dayName: "Chest",
            workouts: [
              {
                name: "Chest Day",
                category: "chest",
                exercises: [
                  { name: "Bench press", sets: 3, reps: 10 },
                  { name: "Decline press", sets: 3, reps: 10 },
                  { name: "Seated bench press", sets: 3, reps: 10 },
                  { name: "Incline dumbbell press", sets: 3, reps: 12 },
                  { name: "Cable chest flys", sets: 3, reps: 12 },
                  { name: "Pec deck flys", sets: 3, reps: 12 },
                  { name: "Lever chest press", sets: 3, reps: 12 },
                  { name: "Pushups", sets: 3, reps: 15 },
                ],
                duration: 60,
                calories: 350,
              },
            ],
          },
          // Day 2: Back and Core
          {
            dayNumber: 2,
            dayName: "Back & Core",
            workouts: [
              {
                name: "Back & Core",
                category: "back_core",
                exercises: [
                  { name: "Ab crunches", sets: 3, reps: 15 },
                  { name: "Rollouts (ball/wheel)", sets: 3, reps: 12 },
                  { name: "Bent-over rows", sets: 3, reps: 10 },
                  { name: "Lat pull-down", sets: 3, reps: 12 },
                  { name: "Pull-ups", sets: 3, reps: 8 },
                  { name: "Seated cable rows", sets: 3, reps: 12 },
                  { name: "One-arm DB row", sets: 3, reps: 12 },
                  { name: "Machine T-bar row", sets: 3, reps: 10 },
                ],
                duration: 60,
                calories: 350,
              },
            ],
          },
          // Day 3: Rest (active)
          {
            dayNumber: 3,
            dayName: "Active Rest",
            workouts: [
              {
                name: "Active Recovery",
                category: "rest",
                exercises: [
                  { name: "Light cardio (walk/bike)", duration: 30 },
                  { name: "Stretching", duration: 10 },
                ],
                duration: 40,
                calories: 150,
              },
            ],
          },
          // Day 4: Shoulders and Traps
          {
            dayNumber: 4,
            dayName: "Shoulders & Traps",
            workouts: [
              {
                name: "Shoulders & Traps",
                category: "shoulders_traps",
                exercises: [
                  { name: "Military press", sets: 3, reps: 10 },
                  { name: "Machine shoulder press", sets: 3, reps: 12 },
                  { name: "Lateral raises", sets: 3, reps: 12 },
                  { name: "Front raises", sets: 3, reps: 12 },
                  { name: "Reverse flies", sets: 3, reps: 12 },
                  { name: "Upright rows", sets: 3, reps: 10 },
                  { name: "Dumbbell shrugs", sets: 3, reps: 12 },
                  { name: "Cable rotations", sets: 3, reps: 12 },
                ],
                duration: 60,
                calories: 350,
              },
            ],
          },
          // Day 5: Legs
          {
            dayNumber: 5,
            dayName: "Legs",
            workouts: [
              {
                name: "Leg Day",
                category: "legs",
                exercises: [
                  { name: "Back squats", sets: 3, reps: 10 },
                  { name: "Deadlifts", sets: 3, reps: 8 },
                  { name: "Leg extensions", sets: 3, reps: 12 },
                  { name: "Leg curls", sets: 3, reps: 12 },
                  { name: "Front squats", sets: 3, reps: 10 },
                  { name: "Good mornings", sets: 3, reps: 10 },
                  { name: "Weighted lunges", sets: 3, reps: 12 },
                  { name: "Glute-ham curl", sets: 3, reps: 12 },
                ],
                duration: 60,
                calories: 400,
              },
            ],
          },
          // Day 6: Arms
          {
            dayNumber: 6,
            dayName: "Arms",
            workouts: [
              {
                name: "Arms",
                category: "arms",
                exercises: [
                  { name: "Seated DB curls", sets: 3, reps: 12 },
                  { name: "Skull crushers", sets: 3, reps: 10 },
                  { name: "Cable curls", sets: 3, reps: 12 },
                  { name: "Triceps push-downs", sets: 3, reps: 12 },
                  { name: "Preacher curls", sets: 3, reps: 10 },
                  { name: "Triceps extensions", sets: 3, reps: 12 },
                  { name: "Concentration curls", sets: 3, reps: 12 },
                  { name: "Triceps dips", sets: 3, reps: 12 },
                ],
                duration: 60,
                calories: 300,
              },
            ],
          },
          // Day 7: Rest (active)
          {
            dayNumber: 7,
            dayName: "Active Rest",
            workouts: [
              {
                name: "Active Recovery",
                category: "rest",
                exercises: [
                  { name: "Light cardio (walk/bike)", duration: 30 },
                  { name: "Stretching", duration: 10 },
                ],
                duration: 40,
                calories: 150,
              },
            ],
          },
        ],
      },
    ],
  });

  await plan.save();
};

// Helper: seed a beginner-friendly 7-day plan
const createDefaultBeginnerPlan = async () => {
  const plan = new WorkoutPlan({
    user: null,
    name: "7-Day Beginner: Full-Body Intro",
    description: "Gentle, beginner-friendly split with two active rest days.",
    duration: 1,
    difficulty: "beginner",
    goals: ["general_fitness", "endurance"],
    equipment: ["bodyweight", "dumbbells", "cardio_machine"],
    isCustom: false,
    isRecommended: true,
    weeks: [
      {
        weekNumber: 1,
        days: [
          { // Day 1: Upper (light)
            dayNumber: 1,
            dayName: "Upper (Light)",
            workouts: [
              {
                name: "Beginner Upper",
                category: "upper",
                exercises: [
                  { name: "Push-ups (incline if needed)", sets: 2, reps: 8 },
                  { name: "Dumbbell rows (light)", sets: 2, reps: 10 },
                  { name: "Shoulder taps", sets: 2, reps: 10 },
                ],
                duration: 30,
                calories: 150,
              },
            ],
          },
          { // Day 2: Active Rest
            dayNumber: 2,
            dayName: "Active Rest",
            workouts: [
              {
                name: "Walk & Stretch",
                category: "rest",
                exercises: [
                  { name: "Walking", duration: 20 },
                  { name: "Full-body stretch", duration: 10 },
                ],
                duration: 30,
                calories: 100,
              },
            ],
          },
          { // Day 3: Lower (light)
            dayNumber: 3,
            dayName: "Lower (Light)",
            workouts: [
              {
                name: "Beginner Lower",
                category: "lower",
                exercises: [
                  { name: "Bodyweight squats", sets: 2, reps: 10 },
                  { name: "Glute bridges", sets: 2, reps: 10 },
                  { name: "Reverse lunges", sets: 2, reps: 8 },
                ],
                duration: 30,
                calories: 150,
              },
            ],
          },
          { // Day 4: Core + Cardio
            dayNumber: 4,
            dayName: "Core + Cardio",
            workouts: [
              {
                name: "Core & Walk",
                category: "core",
                exercises: [
                  { name: "Plank", sets: 2, reps: 20 },
                  { name: "Dead bugs", sets: 2, reps: 10 },
                  { name: "Walking", duration: 15 },
                ],
                duration: 30,
                calories: 130,
              },
            ],
          },
          { // Day 5: Full Body (light)
            dayNumber: 5,
            dayName: "Full Body (Light)",
            workouts: [
              {
                name: "Beginner Full Body",
                category: "full_body",
                exercises: [
                  { name: "DB shoulder press (light)", sets: 2, reps: 10 },
                  { name: "DB Romanian deadlift (light)", sets: 2, reps: 10 },
                  { name: "Assisted rows/bands", sets: 2, reps: 10 },
                ],
                duration: 30,
                calories: 160,
              },
            ],
          },
          { // Day 6: Active Rest
            dayNumber: 6,
            dayName: "Active Rest",
            workouts: [
              {
                name: "Mobility & Walk",
                category: "rest",
                exercises: [
                  { name: "Mobility flow", duration: 15 },
                  { name: "Walking", duration: 15 },
                ],
                duration: 30,
                calories: 100,
              },
            ],
          },
          { // Day 7: Optional Light Cardio
            dayNumber: 7,
            dayName: "Optional Cardio",
            workouts: [
              {
                name: "Light Cardio",
                category: "cardio",
                exercises: [
                  { name: "Cycling / Elliptical (easy)", duration: 20 },
                  { name: "Stretching", duration: 10 },
                ],
                duration: 30,
                calories: 120,
              },
            ],
          },
        ],
      },
    ],
  });

  await plan.save();
};

// Get workout history
export const getWorkoutHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { page = 1, limit = 10, date } = req.query;

    let query = { user: userId };
    
    if (date) {
      // Parse YYYY-MM-DD as local date range to avoid UTC timezone shifts
      if (/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
        const [y, m, d] = String(date).split('-').map(Number);
        const startOfDay = new Date(y, m - 1, d);
        const endOfDay = new Date(y, m - 1, d + 1);
        query.completedAt = { $gte: startOfDay, $lt: endOfDay };
      } else {
        const startOfDay = new Date(date);
        const endOfDay = new Date(date);
        endOfDay.setDate(endOfDay.getDate() + 1);
        query.completedAt = { $gte: startOfDay, $lt: endOfDay };
      }
    }

    const workoutHistory = await WorkoutHistory.find(query)
      .sort({ completedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await WorkoutHistory.countDocuments(query);

    res.status(200).json({
      success: true,
      workoutHistory,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (err) {
    next(err);
  }
};

// Get all historical workouts for dashboard integration
export const getAllHistoricalWorkouts = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    // Get all workouts (both current and completed/historical)
    const allWorkouts = await Workout.find({ user: userId })
      .sort({ date: -1 })
      .lean();

    // Get all workout history
    const allWorkoutHistory = await WorkoutHistory.find({ user: userId })
      .sort({ completedAt: -1 })
      .lean();

    // Combine and format the data
    const combinedWorkouts = [
      ...allWorkouts.map(workout => ({
        ...workout,
        type: 'current',
        completedAt: workout.date
      })),
      ...allWorkoutHistory.map(workout => ({
        ...workout,
        type: 'completed',
        date: workout.completedAt
      }))
    ].sort((a, b) => new Date(b.completedAt || b.date) - new Date(a.completedAt || a.date));

    // Calculate totals
    const totalCalories = combinedWorkouts.reduce((sum, workout) => sum + (workout.caloriesBurned || 0), 0);
    const totalWorkouts = combinedWorkouts.length;
    const avgCalories = totalWorkouts > 0 ? totalCalories / totalWorkouts : 0;

    res.status(200).json({
      success: true,
      allWorkouts: combinedWorkouts,
      totalCalories,
      totalWorkouts,
      avgCalories,
      total: combinedWorkouts.length
    });
  } catch (err) {
    next(err);
  }
};

// Delete a workout history record
export const deleteWorkoutHistory = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const historyId = req.params?.historyId || req.params?.id || req.params?.workoutId;

    if (!historyId) {
      return next(createError(400, "historyId is required"));
    }

    let deleted = null;
    try {
      deleted = await WorkoutHistory.findOneAndDelete({ _id: historyId, user: userId });
    } catch (castErr) {
      // Invalid ObjectId → act like not found
      return next(createError(404, "History workout not found"));
    }
    if (!deleted) {
      return next(createError(404, "History workout not found"));
    }

    return res.status(200).json({ success: true, message: "History workout deleted successfully" });
  } catch (err) {
    next(err);
  }
};

// Helper function to get total steps for today
const getTotalStepsForToday = async (userId) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const stepsRecord = await Steps.findOne({
      user: userId,
      date: { $gte: startOfDay, $lt: endOfDay }
    });

    return stepsRecord ? stepsRecord.steps : 0;
  } catch (error) {
    console.error("Error getting total steps for today:", error);
    return 0;
  }
};

// Get daily steps
export const getDailySteps = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { date } = req.query;

    let targetDate;
    if (date) {
      // Parse YYYY-MM-DD as local date range to avoid UTC timezone shifts
      if (/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
        const [y, m, d] = String(date).split('-').map(Number);
        targetDate = new Date(y, m - 1, d);
      } else {
        targetDate = new Date(date);
      }
    } else {
      targetDate = new Date();
    }

    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);

    const stepsRecord = await Steps.findOne({
      user: userId,
      date: { $gte: startOfDay, $lt: endOfDay }
    });

    const steps = stepsRecord ? stepsRecord.steps : 0;
    const distance = stepsRecord ? stepsRecord.distance : 0;
    const caloriesBurned = stepsRecord ? stepsRecord.caloriesBurned : 0;
    const goal = stepsRecord ? stepsRecord.goal : 10000;

    res.status(200).json({
      success: true,
      steps,
      distance,
      caloriesBurned,
      goal,
      date: targetDate.toISOString().split('T')[0]
    });
  } catch (err) {
    next(err);
  }
};

// Update daily steps
export const updateDailySteps = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { date, steps } = req.body;

    if (steps === undefined || steps < 0) {
      return next(createError(400, "Valid steps count is required"));
    }

    let targetDate;
    if (date) {
      // Parse YYYY-MM-DD as local date range to avoid UTC timezone shifts
      if (/^\d{4}-\d{2}-\d{2}$/.test(String(date))) {
        const [y, m, d] = String(date).split('-').map(Number);
        targetDate = new Date(y, m - 1, d);
      } else {
        targetDate = new Date(date);
      }
    } else {
      targetDate = new Date();
    }

    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);

    // Use upsert to create or update the steps record
    const stepsRecord = await Steps.findOneAndUpdate(
      {
        user: userId,
        date: { $gte: startOfDay, $lt: endOfDay }
      },
      {
        user: userId,
        date: startOfDay,
        steps: steps,
        goal: 10000 // Default goal
      },
      { 
        upsert: true, 
        new: true, 
        runValidators: true 
      }
    );

    res.status(200).json({
      success: true,
      message: "Steps updated successfully",
      steps: stepsRecord.steps,
      distance: stepsRecord.distance,
      caloriesBurned: stepsRecord.caloriesBurned,
      goal: stepsRecord.goal,
      date: targetDate.toISOString().split('T')[0]
    });
  } catch (err) {
    next(err);
  }
};

// Get weekly steps data
export const getWeeklySteps = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const currentDate = new Date();
    
    const weeklySteps = [];
    const weeklyStats = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(currentDate.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

      const stepsRecord = await Steps.findOne({
        user: userId,
        date: { $gte: startOfDay, $lt: endOfDay }
      });

      const steps = stepsRecord ? stepsRecord.steps : 0;
      const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      weeklySteps.push({
        day: dayName,
        steps: steps,
        date: date.toISOString().split('T')[0]
      });

      // Convert to percentage for chart (10,000 steps = 100%)
      weeklyStats.push({
        day: dayName,
        value: Math.round((steps / 10000) * 100)
      });
    }

    res.status(200).json({
      success: true,
      weeklySteps,
      weeklyStats,
      totalSteps: weeklySteps.reduce((sum, day) => sum + day.steps, 0),
      averageSteps: Math.round(weeklySteps.reduce((sum, day) => sum + day.steps, 0) / 7)
    });
  } catch (err) {
    next(err);
  }
};

// Use a workout plan (activate 30-day plan)
export const useWorkoutPlan = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { planId } = req.body;

    if (!planId) {
      return next(createError(400, "Plan ID is required"));
    }

    // Check if user has an active plan and terminate it if exists
    const existingActivePlan = await UserPlan.findOne({ 
      user: userId, 
      status: 'active' 
    });

    if (existingActivePlan) {
      // Terminate the existing active plan
      existingActivePlan.status = 'terminated';
      existingActivePlan.endDate = new Date();
      await existingActivePlan.save();
      
      console.log(`Terminated existing plan: ${existingActivePlan.planName}`);
    }

    // Get the workout plan details
    const workoutPlan = await WorkoutPlan.findById(planId);
    if (!workoutPlan) {
      return next(createError(404, "Workout plan not found"));
    }

    // Create 30-day mapping starting from next Monday (Monday = Day 1)
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    // Helper function to get next or same Monday
    const getNextMonday = () => {
      const today = new Date();
      const todayIndex = today.getDay() === 0 ? 7 : today.getDay(); // Convert Sunday=0 to 7
      const mondayIndex = 1; // Monday = 1
      let diff = (mondayIndex - todayIndex + 7) % 7;
      if (diff === 0 && today.getDay() !== 1) diff = 7; // If today is not Monday, go to next Monday
      const result = new Date(today);
      result.setDate(today.getDate() + diff);
      result.setHours(0, 0, 0, 0);
      return result;
    };

    const startDate = getNextMonday();
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 29);
    endDate.setHours(23, 59, 59, 999);

    const dayMapping = [];

    // Get the plan's weekly structure
    const weeklyPlan = workoutPlan.weeks[0]; // Use first week as template
    if (!weeklyPlan || !weeklyPlan.days) {
      return next(createError(400, "Invalid workout plan structure"));
    }

    // Create 30-day mapping with proper weekday alignment
    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const weekdayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Convert to Monday = 0
      const weekday = weekdays[weekdayIndex];
      
      // Find corresponding day in the plan (1-based day numbers)
      const planDay = weeklyPlan.days.find(d => d.dayNumber === (weekdayIndex + 1));
      
      if (planDay && planDay.workouts && planDay.workouts.length > 0) {
        // Create individual workouts for this day
        const workouts = planDay.workouts.map(workout => ({
          workoutId: workout._id || null,
          name: workout.name || `Day ${i + 1} Workout`,
          duration: workout.duration || 30,
          estimatedCalories: workout.calories || 0,
          category: workout.category || 'general',
          exercises: workout.exercises || [],
          completed: false,
          completedAt: null
        }));
        
        dayMapping.push({
          dayNumber: i + 1,
          weekday: weekday,
          date: currentDate,
          workoutName: planDay.workouts[0].name || `Day ${i + 1} Workout`,
          category: planDay.workouts[0].category || 'general',
          exercises: planDay.workouts[0].exercises || [],
          totalDuration: planDay.workouts.reduce((sum, w) => sum + (w.duration || 30), 0),
          caloriesBurned: planDay.workouts.reduce((sum, w) => sum + (w.calories || 0), 0),
          completed: false,
          completedAt: null,
          workouts: workouts // Store individual workouts
        });
      } else {
        // Rest day
        dayMapping.push({
          dayNumber: i + 1,
          weekday: weekday,
          date: currentDate,
          workoutName: 'Rest Day',
          category: 'rest',
          exercises: [],
          totalDuration: 0,
          caloriesBurned: 0,
          completed: false,
          completedAt: null,
          workouts: []
        });
      }
    }

    // Create new user plan
    const userPlan = new UserPlan({
      user: userId,
      planId: planId,
      planName: workoutPlan.name,
      startDate: startDate,
      endDate: endDate,
      status: 'active',
      dayMapping: dayMapping,
      totalWorkoutsCompleted: 0,
      totalCaloriesBurned: 0,
      currentStreak: 0,
      longestStreak: 0
    });

    await userPlan.save();

    res.status(200).json({
      success: true,
      message: existingActivePlan 
        ? `Plan switched successfully! "${existingActivePlan.planName}" has been moved to past plans and "${userPlan.planName}" is now your active 30-day plan.`
        : "Workout plan activated successfully! Your 30-day journey begins now.",
      plan: {
        id: userPlan._id,
        name: userPlan.planName,
        startDate: userPlan.startDate,
        endDate: userPlan.endDate,
        totalDays: 30,
        dayMapping: userPlan.dayMapping.slice(0, 7) // Return first week as preview
      },
      terminatedPlan: existingActivePlan ? {
        id: existingActivePlan._id,
        name: existingActivePlan.planName,
        daysCompleted: existingActivePlan.totalWorkoutsCompleted,
        terminatedAt: new Date()
      } : null
    });

  } catch (err) {
    console.error("Error using workout plan:", err);
    next(err);
  }
};

// Get user's active plan
export const getActivePlan = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    const activePlan = await UserPlan.findOne({ 
      user: userId, 
      status: 'active' 
    }).populate('planId', 'name description difficulty');

    if (!activePlan) {
      return res.status(200).json({
        success: true,
        plan: null
      });
    }

    res.status(200).json({
      success: true,
      plan: activePlan
    });

  } catch (err) {
    next(err);
  }
};

// Get user's past plans
export const getPastPlans = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    const pastPlans = await UserPlan.find({ 
      user: userId, 
      status: { $in: ['terminated', 'completed'] }
    })
    .populate('planId', 'name description difficulty')
    .sort({ endDate: -1 }) // Most recent first
    .limit(10); // Limit to last 10 plans

    res.status(200).json({
      success: true,
      plans: pastPlans
    });

  } catch (err) {
    next(err);
  }
};

// Terminate current plan
export const terminatePlan = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    
    const activePlan = await UserPlan.findOne({ 
      user: userId, 
      status: 'active' 
    });

    if (!activePlan) {
      return next(createError(404, "No active plan found"));
    }

    // Update plan status to terminated
    activePlan.status = 'terminated';
    await activePlan.save();

    res.status(200).json({
      success: true,
      message: "Plan terminated successfully",
      plan: {
        id: activePlan._id,
        name: activePlan.planName,
        daysCompleted: activePlan.totalWorkoutsCompleted,
        totalCalories: activePlan.totalCaloriesBurned
      }
    });

  } catch (err) {
    next(err);
  }
};

// Complete a workout from the plan
export const completePlanWorkout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { dayNumber, actualCalories, actualDuration } = req.body;

    const activePlan = await UserPlan.findOne({ 
      user: userId, 
      status: 'active' 
    });

    if (!activePlan) {
      return next(createError(404, "No active plan found"));
    }

    // Find the day in the plan
    const planDay = activePlan.dayMapping.find(d => d.dayNumber === dayNumber);
    if (!planDay) {
      return next(createError(404, "Day not found in plan"));
    }

    if (planDay.completed) {
      return res.status(400).json({
        success: false,
        message: "This workout has already been completed"
      });
    }

    // Mark as completed
    planDay.completed = true;
    planDay.completedAt = new Date();
    planDay.caloriesBurned = actualCalories || planDay.caloriesBurned;
    planDay.totalDuration = actualDuration || planDay.totalDuration;

    // Update plan totals
    activePlan.totalWorkoutsCompleted += 1;
    activePlan.totalCaloriesBurned += planDay.caloriesBurned;
    activePlan.currentStreak += 1;
    
    if (activePlan.currentStreak > activePlan.longestStreak) {
      activePlan.longestStreak = activePlan.currentStreak;
    }

    await activePlan.save();

    res.status(200).json({
      success: true,
      message: "Workout completed successfully!",
      progress: {
        dayCompleted: dayNumber,
        totalCompleted: activePlan.totalWorkoutsCompleted,
        totalCalories: activePlan.totalCaloriesBurned,
        currentStreak: activePlan.currentStreak,
        daysRemaining: 30 - activePlan.totalWorkoutsCompleted
      }
    });

  } catch (err) {
    next(err);
  }
};

// Complete individual workout within a day
export const completeIndividualWorkout = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    const { dayNumber, workoutIndex, actualCalories, actualDuration } = req.body;

    if (typeof dayNumber !== "number" || typeof workoutIndex !== "number") {
      return next(createError(400, "dayNumber and workoutIndex are required"));
    }

    const activePlan = await UserPlan.findOne({ 
      user: userId, 
      status: 'active' 
    });

    if (!activePlan) {
      return next(createError(404, "No active plan found"));
    }

    // Find the day in the plan
    const planDay = activePlan.dayMapping.find(d => d.dayNumber === dayNumber);
    if (!planDay) {
      return next(createError(404, "Day not found in plan"));
    }

    if (!planDay.workouts || !planDay.workouts[workoutIndex]) {
      return next(createError(404, "Workout not found"));
    }

    const workout = planDay.workouts[workoutIndex];
    if (workout.completed) {
      return res.status(400).json({
        success: false,
        message: "This workout has already been completed"
      });
    }

    // Mark individual workout as completed
    workout.completed = true;
    workout.completedAt = new Date();
    workout.estimatedCalories = actualCalories || workout.estimatedCalories;
    workout.duration = actualDuration || workout.duration;

    // Check if all workouts for this day are completed
    const allWorkoutsCompleted = planDay.workouts.every(w => w.completed);
    if (allWorkoutsCompleted && !planDay.completed) {
      planDay.completed = true;
      planDay.completedAt = new Date();
      
      // Update plan totals
      activePlan.totalWorkoutsCompleted += 1;
      activePlan.totalCaloriesBurned += planDay.caloriesBurned;
      activePlan.currentStreak += 1;
      
      if (activePlan.currentStreak > activePlan.longestStreak) {
        activePlan.longestStreak = activePlan.currentStreak;
      }
    }

    await activePlan.save();

    res.status(200).json({
      success: true,
      message: "Workout completed successfully!",
      progress: {
        dayCompleted: dayNumber,
        workoutCompleted: workoutIndex,
        totalCompleted: activePlan.totalWorkoutsCompleted,
        totalCalories: activePlan.totalCaloriesBurned,
        currentStreak: activePlan.currentStreak,
        daysRemaining: 30 - activePlan.totalWorkoutsCompleted,
        allWorkoutsCompleted: allWorkoutsCompleted
      }
    });

  } catch (err) {
    next(err);
  }
};
