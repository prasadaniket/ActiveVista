/*
  Profile.jsx
  Purpose: User profile settings and snapshots (daily steps, active plan, recent workouts).
  Data Flow:
    - GET /user/profile, /user/workout, /user/steps?date=YYYY-MM-DD, /user/active-plan
    - PUT /user/profile, /user/change-password
    - Listens for steps:saved, plan:activated, workout:completed to refresh sections.
  UI Structure:
    - Left: profile basics, security, active plan
    - Middle: fitness star, basic info form, my workouts
    - Right: daily steps, fitness info, workout preferences
*/
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

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [todaysWorkouts, setTodaysWorkouts] = useState([]);
  const [dailySteps, setDailySteps] = useState(0);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    pronouns: "",
    age: "",
    weight: "",
    height: "",
    bodyType: "",
    fitnessLevel: "",
    workoutExperience: "",
    goals: [],
    preferences: {
      workoutDuration: 30,
      workoutDays: 3,
      equipment: [],
    },
  });

  useEffect(() => {
    fetchUserProfile();
    fetchTodaysWorkouts();
    fetchDailySteps();
    fetchActivePlan();

    const handleStepsSaved = () => fetchDailySteps();
    const handlePlanActivated = () => fetchActivePlan();
    const handleWorkoutCompleted = () => fetchTodaysWorkouts();

    window.addEventListener('steps:saved', handleStepsSaved);
    window.addEventListener('plan:activated', handlePlanActivated);
    window.addEventListener('workout:completed', handleWorkoutCompleted);
    return () => {
      window.removeEventListener('steps:saved', handleStepsSaved);
      window.removeEventListener('plan:activated', handlePlanActivated);
      window.removeEventListener('workout:completed', handleWorkoutCompleted);
    };
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get("/user/profile");
      const userData = response.data.user;
      console.log("Fetched user data:", userData);
      setUser(userData);
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        gender: userData.gender || "",
        pronouns: userData.pronouns || "",
        age: userData.age || "",
        weight: userData.weight || "",
        height: userData.height || "",
        bodyType: userData.bodyType || "",
        fitnessLevel: userData.fitnessLevel || "beginner",
        workoutExperience: userData.workoutExperience || "new",
        goals: userData.goals || [],
        preferences: {
          workoutDuration: userData.preferences?.workoutDuration || 30,
          workoutDays: userData.preferences?.workoutDays || 3,
          equipment: userData.preferences?.equipment || [],
        },
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaysWorkouts = async () => {
    try {
      const res = await axiosInstance.get("/user/workout");
      setTodaysWorkouts(
        Array.isArray(res?.data?.todaysWorkouts) ? res.data.todaysWorkouts : []
      );
    } catch (error) {
      console.error("Error fetching profile workouts:", error);
      setTodaysWorkouts([]);
    }
  };

  const fetchDailySteps = async () => {
    try {
      setStepsLoading(true);
      const d = new Date();
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const res = await axiosInstance.get(`/user/steps?date=${dateStr}`);
      setDailySteps(res?.data?.steps || 0);
    } catch (error) {
      console.error("Error fetching daily steps (profile):", error);
      setDailySteps(0);
    } finally {
      setStepsLoading(false);
    }
  };

  const fetchActivePlan = async () => {
    try {
      const res = await axiosInstance.get("/user/active-plan");
      if (res.data?.success) {
        setActivePlan(res.data.plan);
      } else {
        setActivePlan(null);
      }
    } catch (error) {
      setActivePlan(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log("Input change:", { name, value, type, checked });
    
    // Email is non-editable – ignore any attempted changes programmatically
    if (name === "email") {
      return;
    }

    if (name.startsWith("preferences.")) {
      const prefKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]:
            type === "checkbox"
              ? checked
                ? [...prev.preferences[prefKey], value]
                : prev.preferences[prefKey].filter((item) => item !== value)
              : value,
        },
      }));
    } else if (name === "goals") {
      setFormData((prev) => ({
        ...prev,
        goals: checked
          ? [...prev.goals, value]
          : prev.goals.filter((goal) => goal !== value),
      }));
    } else {
      setFormData((prev) => {
        const newData = {
          ...prev,
          [name]: type === "checkbox" ? checked : value,
        };
        console.log("Updated form data:", newData);
        return newData;
      });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      console.log("Saving profile data:", formData);
      const response = await axiosInstance.put("/user/profile", formData);
      console.log("Profile update response:", response.data);
      await fetchUserProfile();
      setEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      console.error("Error details:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data
      });
      alert("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords don't match!");
      return;
    }

    try {
      await axiosInstance.put("/user/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      alert("Password changed successfully!");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setShowPasswordForm(false);
    } catch (error) {
      console.error("Error changing password:", error);
      alert("Failed to change password. Please check your current password.");
    }
  };

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

  if (loading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-gradient-to-br from-slate-50 to-blue-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Profile
          </h1>
          <p className="text-gray-600 mt-1">
            Here is your daily activities & reports
          </p>
        </div>

        {/* 3-column violet layout */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left Column: Profile card */}
          <div className="xl:col-span-3 space-y-6">
            <Card className="bg-white shadow-modern border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-bold text-gray-900">
                  {"Your profile"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold">
                    {formData.name ? formData.name.charAt(0) : "U"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {formData.gender === 'female' && <Venus className="h-4 w-4 text-pink-500" />}
                      {formData.gender === 'male' && <Mars className="h-4 w-4 text-blue-500" />}
                      {formData.gender === 'other' && <VenusAndMars className="h-4 w-4 text-purple-500" />}
                      <div className="text-sm font-medium text-gray-900">
                        {formData.name || "User"}
                      </div>
                      {formData.pronouns && (
                        <div className="text-xs text-gray-400">
                          ({formData.pronouns})
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formData.email || "user@example.com"}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-gray-500">Age</div>
                    <div className="font-medium text-gray-900">
                      {formData.age || "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Height</div>
                    <div className="font-medium text-gray-900">
                      {formData.height ? `${formData.height} cm` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Weight</div>
                    <div className="font-medium text-gray-900">
                      {formData.weight ? `${formData.weight} kg` : "—"}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-500">Level</div>
                    <div className="font-medium text-gray-900 capitalize">
                      {formData.fitnessLevel || "beginner"}
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full border-indigo-600 text-indigo-600 hover:bg-indigo-50"
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>

            {/* Password Change */}
            <Card className="bg-white shadow-modern border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <Lock className="h-5 w-5 mr-2 text-indigo-600" />
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
                      <Button onClick={handlePasswordChange} className="flex-1">
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
              <Card className="bg-white shadow-modern border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-indigo-600" />
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
                  <div className="mt-2 text-xs text-gray-500 flex justify-between">
                    <span>Started {new Date(activePlan.startDate).toLocaleDateString()}</span>
                    <span>{30 - activePlan.totalWorkoutsCompleted} days left</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Middle Column: Fitness star + account + forms */}
          <div className="xl:col-span-5 space-y-6">
            <Card className="bg-white shadow-modern border-0 gradient-primary text-white">
              <CardContent className="p-5">
                <div className="text-lg font-semibold">Fitness Star</div>
                <div className="text-sm opacity-90">
                  Get an award for your calorie-burning journey
                </div>
              </CardContent>
            </Card>

            {/* Basic Information */}
            <Card className="bg-white shadow-modern border-0">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                    <User className="h-5 w-5 mr-2 text-indigo-600" />
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
                        onClick={handleSave}
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
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 disabled:bg-gray-100"
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
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 disabled:bg-gray-100"
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
                    <p className="text-xs text-gray-500 mt-1">
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
                      className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 disabled:bg-gray-100"
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
            <Card className="bg-white shadow-modern border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900">
                  My workouts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.isArray(todaysWorkouts) &&
                  todaysWorkouts.length > 0 ? (
                    todaysWorkouts.slice(0, 6).map((w, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-indigo-50" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">
                            {(w.category || "Workout").toString()}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(
                              w.date || w.createdAt
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">
                      No workouts yet. Start your first session today!
                    </div>
                  )}
                  <div className="text-right">
                    <Button
                      variant="ghost"
                      className="text-indigo-600 hover:bg-indigo-50 px-2 py-1"
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
            <Card className="bg-white shadow-modern border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <Footprints className="h-5 w-5 mr-2 text-green-600" />
                  Daily Steps
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-gray-900">
                    {stepsLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-24 rounded" />
                    ) : (
                      dailySteps.toLocaleString()
                    )}
                  </div>
                  <div className="text-sm text-gray-500">today</div>
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
            <Card className="bg-white shadow-modern border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <Dumbbell className="h-5 w-5 mr-2 text-indigo-600" />
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
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 disabled:bg-gray-100"
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
                    className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 disabled:bg-gray-100"
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
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
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
            <Card className="bg-white shadow-modern border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-indigo-600" />
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
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
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
  );
};

export default Profile;
