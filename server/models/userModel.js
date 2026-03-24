import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: null,
    },
    pronouns: {
      type: String,
      default: null,
    },
    img: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      default: null,
    },
    // Profile fields
    weight: {
      type: Number,
      min: 0,
      default: null,
    },
    height: {
      type: Number,
      min: 0,
      default: null,
    },
    bodyType: {
      type: String,
      enum: ['fit', 'slim', 'muscular', 'curvy', 'athletic'],
      default: null,
    },
    fitnessLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: null,
    },
    workoutExperience: {
      type: String,
      enum: ['new', 'some_experience', 'experienced', 'expert'],
      default: null,
    },
    goals: [{
      type: String,
      enum: ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility', 'general_fitness'],
    }],
    preferences: {
      workoutDuration: {
        type: Number,
        default: 30, // minutes
      },
      workoutDays: {
        type: Number,
        default: 3, // days per week
      },
      equipment: [{
        type: String,
        enum: ['bodyweight', 'dumbbells', 'barbell', 'kettlebell', 'resistance_bands', 'cardio_machine', 'gym_equipment'],
      }],
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", UserSchema);