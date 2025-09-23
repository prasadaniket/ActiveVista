/*
  models/StepsModel.js
  Purpose: Store per-user, per-day step counts with derived distance and calories.
  Notes: Enforces uniqueness per (user, date) and computes derived fields on save.
*/
import mongoose from "mongoose";

const StepsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    steps: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    distance: {
      type: Number,
      default: 0, // in kilometers
    },
    caloriesBurned: {
      type: Number,
      default: 0,
    },
    goal: {
      type: Number,
      default: 10000, // default 10,000 steps goal
    },
  },
  { 
    timestamps: true,
    // Ensure one record per user per date
    indexes: [
      { user: 1, date: 1 }, 
      { unique: true }
    ]
  }
);

// Pre-save middleware to calculate distance and calories
StepsSchema.pre('save', function(next) {
  // Calculate distance (roughly 0.0005 km per step)
  this.distance = Math.round(this.steps * 0.0005 * 100) / 100;
  
  // Calculate calories burned (roughly 0.04 calories per step)
  this.caloriesBurned = Math.round(this.steps * 0.04);
  
  next();
});

export default mongoose.model("Steps", StepsSchema);