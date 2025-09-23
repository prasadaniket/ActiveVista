import mongoose from "mongoose";

const WorkoutHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    workoutPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WorkoutPlan",
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
        type: Number, // in minutes
        default: 0,
      },
      completed: {
        type: Boolean,
        default: false,
      },
    }],
    totalDuration: {
      type: Number, // in minutes
      required: true,
    },
    caloriesBurned: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
  },
  { timestamps: true }
);

export default mongoose.model("WorkoutHistory", WorkoutHistorySchema);
