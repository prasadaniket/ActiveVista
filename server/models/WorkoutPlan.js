import mongoose from "mongoose";

const WorkoutPlanSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // recommended/global plans may not be tied to a specific user
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    duration: {
      type: Number, // in weeks
      default: 1,
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      required: true,
    },
    goals: [{
      type: String,
      enum: ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'general_fitness'],
    }],
    equipment: [{
      type: String,
      enum: ['bodyweight', 'dumbbells', 'barbell', 'kettlebell', 'resistance_bands', 'cardio_machine', 'gym_equipment'],
    }],
    isCustom: {
      type: Boolean,
      default: false,
    },
    isRecommended: {
      type: Boolean,
      default: false,
    },
    weeks: [{
      weekNumber: {
        type: Number,
        required: true,
      },
      days: [{
        dayNumber: {
          type: Number,
          required: true,
        },
        dayName: {
          type: String,
          required: true,
        },
        workouts: [{
          name: {
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
              type: Number, // in minutes
              default: 0,
            },
            restTime: {
              type: Number, // in seconds
              default: 60,
            },
            notes: {
              type: String,
            },
          }],
          duration: {
            type: Number, // total duration in minutes
            required: true,
          },
          calories: {
            type: Number,
            default: 0,
          },
        }],
      }],
    }],
    isActive: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("WorkoutPlan", WorkoutPlanSchema);
