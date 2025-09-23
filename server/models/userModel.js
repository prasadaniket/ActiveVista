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
      required: true,
    },
    pronouns: {
      type: String,
      required: true,
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
      required: true,
    },
    // Profile fields
    weight: {
      type: Number,
      min: 0,
      required: true,
    },
    height: {
      type: Number,
      min: 0,
      required: true,
    },
    bodyType: {
      type: String,
      enum: ['fit', 'slim', 'muscular', 'curvy', 'athletic'],
      required: true,
    },
    fitnessLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      required: true,
    },
    workoutExperience: {
      type: String,
      enum: ['new', 'some_experience', 'experienced', 'expert'],
      required: true,
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