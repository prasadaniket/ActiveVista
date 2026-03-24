import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../src/components/ui/card";
import { Button } from "../src/components/ui/button";
import { Input } from "../src/components/ui/input";
import { Label } from "../src/components/ui/label";
import { Textarea } from "../src/components/ui/textarea";
import {
  User,
  Mail,
  Lock,
  Weight,
  Ruler,
  Target,
  Dumbbell,
  Save,
  Edit3,
  Check,
  X,
  Venus,
  Mars,
  VenusAndMars,
  Footprints,
  CheckCircle,
} from "lucide-react";
import axiosInstance from "../src/api/axiosInstance";
import { useToast } from "../src/components/ui/Toast";
import PageTransition from "../src/components/PageTransition";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import {
  useProfile,
  useTodaysWorkouts,
  useDailySteps,
  useActivePlan,
  queryKeys,
} from "../src/api/queries";

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email(),
  gender: z.string().optional(),
  pronouns: z.string().optional(),
  age: z.coerce.number().optional().nullable(),
  weight: z.coerce.number().optional().nullable(),
  height: z.coerce.number().optional().nullable(),
  bodyType: z.string().optional(),
  fitnessLevel: z.string().optional(),
  workoutExperience: z.string().optional(),
  goals: z.array(z.string()).optional(),
  preferences: z.object({
    workoutDuration: z.coerce.number().optional().nullable(),
    workoutDays: z.coerce.number().optional().nullable(),
    equipment: z.array(z.string()).optional()
  }).optional()
});

const genderOptions = [
  { value: "", label: "Please select" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const pronounOptions = [
  { value: "", label: "Please select" },
  { value: "he/him", label: "He/Him" },
  { value: "she/her", label: "She/Her" },
  { value: "they/them", label: "They/Them" },
  { value: "ze/zir", label: "Ze/Zir" },
  { value: "other", label: "Other" },
];

const bodyTypes = [
  { value: "fit", label: "Fit" },
  { value: "slim", label: "Slim" },
  { value: "muscular", label: "Muscular" },
  { value: "curvy", label: "Curvy" },
  { value: "athletic", label: "Athletic" },
];

const fitnessLevels = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "expert", label: "Expert" },
];

const workoutExperiences = [
  { value: "new", label: "New to working out" },
  { value: "some_experience", label: "Some experience" },
  { value: "experienced", label: "Experienced" },
  { value: "expert", label: "Expert" },
];

const goalOptions = [
  { value: "weight_loss", label: "Weight Loss" },
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "endurance", label: "Endurance" },
  { value: "strength", label: "Strength" },
  { value: "flexibility", label: "Flexibility" },
  { value: "general_fitness", label: "General Fitness" },
];

const equipmentOptions = [
  { value: "bodyweight", label: "Bodyweight" },
  { value: "dumbbells", label: "Dumbbells" },
  { value: "barbell", label: "Barbell" },
  { value: "kettlebell", label: "Kettlebell" },
  { value: "resistance_bands", label: "Resistance Bands" },
  { value: "cardio_machine", label: "Cardio Machine" },
  { value: "gym_equipment", label: "Gym Equipment" },
];

const Profile = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { data: userProfile, isLoading: profileLoading } = useProfile();
  const { data: todaysWorkoutsRaw } = useTodaysWorkouts("");
  const { data: dailyStepsRaw, isLoading: stepsLoading } = useDailySteps();
  const { data: activePlan } = useActivePlan();

  const todaysWorkouts = Array.isArray(todaysWorkoutsRaw) ? todaysWorkoutsRaw : [];
  const dailySteps = dailyStepsRaw || 0;

  useEffect(() => {
    const handleStepsSaved = () => queryClient.invalidateQueries({ queryKey: queryKeys.dailySteps() });
    const handlePlanActivated = () => queryClient.invalidateQueries({ queryKey: queryKeys.activePlan });
    const handleWorkoutCompleted = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.todaysWorkouts("") });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    };

    window.addEventListener('steps:saved', handleStepsSaved);
    window.addEventListener('plan:activated', handlePlanActivated);
    window.addEventListener('workout:completed', handleWorkoutCompleted);
    return () => {
      window.removeEventListener('steps:saved', handleStepsSaved);
      window.removeEventListener('plan:activated', handlePlanActivated);
      window.removeEventListener('workout:completed', handleWorkoutCompleted);
    };
  }, [queryClient]);

  const {
    setValue,
    watch,
    reset
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      gender: "",
      pronouns: "",
      age: null,
      weight: null,
      height: null,
      bodyType: "",
      fitnessLevel: "beginner",
      workoutExperience: "new",
      goals: [],
      preferences: {
        workoutDuration: 30,
        workoutDays: 3,
        equipment: []
      }
    }
  });

  useEffect(() => {
    if (userProfile) {
      reset({
        name: userProfile.name || "",
        email: userProfile.email || "",
        gender: userProfile.gender || "",
        pronouns: userProfile.pronouns || "",
        age: userProfile.age || null,
        weight: userProfile.weight || null,
        height: userProfile.height || null,
        bodyType: userProfile.bodyType || "",
        fitnessLevel: userProfile.fitnessLevel || "beginner",
        workoutExperience: userProfile.workoutExperience || "new",
        goals: userProfile.goals || [],
        preferences: {
          workoutDuration: userProfile.preferences?.workoutDuration || 30,
          workoutDays: userProfile.preferences?.workoutDays || 3,
          equipment: userProfile.preferences?.equipment || [],
        }
      });
    }
  }, [userProfile, reset]);

  const formData = watch();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "email") return;

    if (name.startsWith("preferences.")) {
      const prefKey = name.split(".")[1];
      const currentPrefs = formData.preferences?.[prefKey];
      
      let newValue;
      if (type === "checkbox") {
        newValue = checked 
          ? [...(currentPrefs || []), value]
          : (currentPrefs || []).filter(item => item !== value);
      } else {
        newValue = value;
      }
      setValue(`preferences.${prefKey}`, newValue, { shouldDirty: true });
    } else if (name === "goals") {
      const currentGoals = formData.goals || [];
      const newValue = checked 
        ? [...currentGoals, value]
        : currentGoals.filter(goal => goal !== value);
      setValue("goals", newValue, { shouldDirty: true });
    } else {
      setValue(name, type === "checkbox" ? checked : value, { shouldDirty: true });
    }
  };

  const { mutate: handleSave, isPending: saving } = useMutation({
    mutationFn: async () => {
      return await axiosInstance.put("/user/profile", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      setEditing(false);
      addToast({ type: "success", title: "Saved", message: "Profile updated successfully!" });
    },
    onError: () => {
      addToast({ type: "error", title: "Update Failed", message: "Failed to update profile. Please try again." });
    }
  });

  const { mutate: handlePasswordChange } = useMutation({
    mutationFn: async () => {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
         throw new Error("Mismatch");
      }
      return await axiosInstance.put("/user/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
    },
    onSuccess: () => {
      addToast({ type: "success", title: "Changed", message: "Password changed successfully!" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordForm(false);
    },
    onError: (error) => {
      if(error.message === "Mismatch") {
         addToast({ type: "warning", title: "Mismatch", message: "New passwords don't match!" });
      } else {
         addToast({ type: "error", title: "Failed", message: "Failed to change password. Please check your current password." });
      }
    }
  });

  if (profileLoading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-muted">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
    <div className="flex-1 h-full bg-void overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-text">
            Profile
          </h1>
          <p className="text-muted mt-1">
            Here is your daily activities & reports
          </p>
        </div>

        {/* 3-column violet layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column: Profile card */}
          <div className="xl:col-span-3 space-y-6">
            <Card className="glass-panel border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-text">
                  {"Your profile"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center text-primary font-semibold">
                    {formData.name ? formData.name.charAt(0) : "U"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {formData.gender === 'female' && <Venus className="h-4 w-4 text-pink-500" />}
                      {formData.gender === 'male' && <Mars className="h-4 w-4 text-primary-light" />}
                      {formData.gender === 'other' && <VenusAndMars className="h-4 w-4 text-purple-500" />}
                      <div className="text-sm font-medium text-text">
                        {formData.name || "User"}
                      </div>
                      {formData.pronouns && (
                        <div className="text-xs text-muted/60">
                          ({formData.pronouns})
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-muted">
                      {formData.email || "user@example.com"}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-muted">Age</div>
                    <div className="font-medium text-text">
                      {formData.age || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted">Height</div>
                    <div className="font-medium text-text">
                      {formData.height ? `${formData.height} cm` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted">Weight</div>
                    <div className="font-medium text-text">
                      {formData.weight ? `${formData.weight} kg` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted">Level</div>
                    <div className="font-medium text-text capitalize">
                      {formData.fitnessLevel || "beginner"}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-indigo-600 text-primary hover:bg-primary/10"
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card className="glass-panel border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-text flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-primary" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!showPasswordForm ? (
                  <Button
                    onClick={() => setShowPasswordForm(true)}
                    variant="outline"
                    className="w-full"
                  >
                    Change Password
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            currentPassword: e.target.value,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            newPassword: e.target.value,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm((prev) => ({
                            ...prev,
                            confirmPassword: e.target.value,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button onClick={() => handlePasswordChange()} className="flex-1">
                        <Save className="h-4 w-4 mr-1" />
                        Change Password
                      </Button>
                      <Button
                        onClick={() => setShowPasswordForm(false)}
                        variant="outline"
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Active Plan Snapshot (moved to left column) */}
            {activePlan && (
              <Card className="glass-panel border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-text flex items-center">
                    <Target className="h-5 w-5 mr-2 text-primary" />
                    Active Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-700 font-medium">
                      {activePlan.planName}
                    </div>
                    {activePlan.totalWorkoutsCompleted > 0 && (
                      <div className="flex items-center text-green-600 text-xs">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {activePlan.totalWorkoutsCompleted}/30
                      </div>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
                      style={{ width: `${(activePlan.totalWorkoutsCompleted / 30) * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-muted flex justify-between">
                    <span>Started {new Date(activePlan.startDate).toLocaleDateString()}</span>
                    <span>{30 - activePlan.totalWorkoutsCompleted} days left</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Middle Column: Fitness star + account + forms */}
          <div className="xl:col-span-5 space-y-6">
            <Card className="glass-panel border-0 gradient-primary text-white">
              <CardContent className="p-5">
                <div className="text-lg font-semibold">Fitness Star</div>
                <div className="text-sm opacity-90">
                  Get an award for your calorie-burning journey
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="glass-panel border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-text flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary" />
                    Basic Information
                  </CardTitle>
                  {!editing ? (
                    <Button
                      onClick={() => setEditing(true)}
                      variant="outline"
                      size="sm"
                      className="flex items-center"
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  ) : (
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => handleSave()}
                        disabled={saving}
                        size="sm"
                        className="flex items-center"
                      >
                        {saving ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                        ) : (
                          <Check className="h-4 w-4 mr-1" />
                        )}
                        Save
                      </Button>
                      <Button
                        onClick={() => setEditing(false)}
                        variant="outline"
                        size="sm"
                        className="flex items-center"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="mt-1 w-full p-2 border border-white/10 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 disabled:bg-gray-100"
                    >
                      {genderOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="pronouns">Pronouns</Label>
                    <select
                      id="pronouns"
                      name="pronouns"
                      value={formData.pronouns}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="mt-1 w-full p-2 border border-white/10 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 disabled:bg-gray-100"
                    >
                      {pronounOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={true}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted mt-1">
                      Email is fixed for account security.
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      name="weight"
                      type="number"
                      value={formData.weight}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      name="height"
                      type="number"
                      value={formData.height}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bodyType">Body Type</Label>
                    <select
                      id="bodyType"
                      name="bodyType"
                      value={formData.bodyType}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="mt-1 w-full p-2 border border-white/10 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 disabled:bg-gray-100"
                    >
                      <option value="">Select body type</option>
                      {bodyTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* My workouts (moved under Basic Information) */}
            <Card className="glass-panel border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-text">
                  My workouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.isArray(todaysWorkouts) && todaysWorkouts.length > 0 ? (
                    todaysWorkouts.slice(0, 6).map((w, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-text">
                            {(w.category || "Workout").toString()}
                          </div>
                          <div className="text-xs text-muted">
                            {new Date(
                              w.date || w.createdAt
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-muted">
                      No workouts yet. Start your first session today!
                    </div>
                  )}
                  <div className="text-right">
                    <Button
                      variant="ghost"
                      className="text-primary hover:bg-primary/10 px-2 py-1"
                      onClick={() => (window.location.href = "/workouts")}
                    >
                      View All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="xl:col-span-4 space-y-6">
            {/* Daily Steps */}
            <Card className="glass-panel border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-text flex items-center">
                  <Footprints className="h-5 w-5 mr-2 text-green-600" />
                  Daily Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-text">
                    {stepsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-24 rounded" />
                    ) : (
                      dailySteps.toLocaleString()
                    )}
                  </div>
                  <div className="text-sm text-muted">today</div>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-green-400 to-green-600"
                    style={{ width: `${Math.min((dailySteps / 10000) * 100, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Active Plan Snapshot moved to left column */}
            {/* Fitness Information */}
            <Card className="glass-panel border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-text flex items-center">
                  <Dumbbell className="h-5 w-5 mr-2 text-primary" />
                  Fitness Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="fitnessLevel">Fitness Level</Label>
                  <select
                    id="fitnessLevel"
                    name="fitnessLevel"
                    value={formData.fitnessLevel}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="mt-1 w-full p-2 border border-white/10 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 disabled:bg-gray-100"
                  >
                    {fitnessLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="workoutExperience">Workout Experience</Label>
                  <select
                    id="workoutExperience"
                    name="workoutExperience"
                    value={formData.workoutExperience}
                    onChange={handleInputChange}
                    disabled={!editing}
                    className="mt-1 w-full p-2 border border-white/10 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 disabled:bg-gray-100"
                  >
                    {workoutExperiences.map((exp) => (
                      <option key={exp.value} value={exp.value}>
                        {exp.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label>Fitness Goals</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {goalOptions.map((goal) => (
                      <label
                        key={goal.value}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          name="goals"
                          value={goal.value}
                          checked={formData.goals.includes(goal.value)}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className="rounded border-white/10 text-primary focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">
                          {goal.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workout Preferences */}
            <Card className="glass-panel border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-text flex items-center">
                  <Target className="h-5 w-5 mr-2 text-primary" />
                  Workout Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="workoutDuration">
                      Workout Duration (min)
                    </Label>
                    <Input
                      id="workoutDuration"
                      name="preferences.workoutDuration"
                      type="number"
                      value={formData.preferences.workoutDuration}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="workoutDays">Workout Days per Week</Label>
                    <Input
                      id="workoutDays"
                      name="preferences.workoutDays"
                      type="number"
                      min="1"
                      max="7"
                      value={formData.preferences.workoutDays}
                      onChange={handleInputChange}
                      disabled={!editing}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>Available Equipment</Label>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {equipmentOptions.map((equipment) => (
                      <label
                        key={equipment.value}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          name="preferences.equipment"
                          value={equipment.value}
                          checked={formData.preferences.equipment.includes(
                            equipment.value
                          )}
                          onChange={handleInputChange}
                          disabled={!editing}
                          className="rounded border-white/10 text-primary focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">
                          {equipment.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
    </PageTransition>
  );
};

export default Profile;
