/*
  models/UserPlan.js
  Purpose: Persistent user-specific instance of a 30-day workout plan with per-day mapping
           and per-workout completion tracking and summary fields.
*/
import mongoose from "mongoose";

const UserPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkoutPlan",
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'terminated'],
      default: 'active',
    },
    // 30-day mapping with day numbers and weekdays
    dayMapping: [{
      dayNumber: {
        type: Number,
        required: true,
      },
      weekday: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
      workoutName: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        required: true,
      },
      exercises: [{
        name: {
          type: String,
          required: true,
        },
        sets: {
          type: Number,
          default: 1,
        },
        reps: {
          type: Number,
          default: 1,
        },
        weight: {
          type: Number,
          default: 0,
        },
        duration: {
          type: Number,
          default: 0,
        },
      }],
      totalDuration: {
        type: Number,
        default: 0,
      },
      caloriesBurned: {
        type: Number,
        default: 0,
      },
      completed: {
        type: Boolean,
        default: false,
      },
      completedAt: {
        type: Date,
      },
      // Individual workouts for this day
      workouts: [{
        workoutId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Workout",
          required: false,
        },
        name: {
          type: String,
          required: true,
        },
        duration: {
          type: Number,
          default: 30,
        },
        estimatedCalories: {
          type: Number,
          default: 0,
        },
        category: {
          type: String,
          default: 'general',
        },
        exercises: [{
          name: {
            type: String,
            required: true,
          },
          sets: {
            type: Number,
            default: 1,
          },
          reps: {
            type: Number,
            default: 1,
          },
          weight: {
            type: Number,
            default: 0,
          },
          duration: {
            type: Number,
            default: 0,
          },
        }],
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: {
          type: Date,
        },
      }],
    }],
    // Track progress
    totalWorkoutsCompleted: {
      type: Number,
      default: 0,
    },
    totalCaloriesBurned: {
      type: Number,
      default: 0,
    },
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
UserPlanSchema.index({ user: 1, status: 1 });
UserPlanSchema.index({ user: 1, startDate: 1 });

export default mongoose.model("UserPlan", UserPlanSchema);
