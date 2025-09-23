/*
  Dashboard.jsx
  Purpose: Main dashboard screen showing stats, charts, recommended plans, and today's workouts.
  Data Flow:
    - Fetches dashboard aggregates (/user/dashboard), weekly steps (/user/steps/weekly), active plan (/user/active-plan), past plans (/user/past-plans), and today's workouts (/user/workout).
    - Listens for custom events (steps:saved, plan:activated, workout:completed) to auto-refresh data.
  UI Structure:
    - Header with dynamic engagement message
    - Counts cards, weekly stats chart, category donut chart
    - Add Workout panel
    - Recommended Plans with activation
    - Today's workouts and Past plans
*/
import React, { useEffect, useState } from "react";
import { counts } from "../src/utils/data";
import CountsCard from "../src/components/cards/CountsCard";
import WeeklyStatCard from "../src/components/cards/WeeklyStatCard";
import CategoryChart from "../src/components/cards/CategoryChart";
import Recom from "../src/components/cards/Recom";
import AddWorkout from "../src/components/AddWorkout";
import WorkoutCard from "../src/components/cards/WorkoutCard";
import axiosInstance from "../src/api/axiosInstance";
import { Dumbbell, Clock, Trophy } from "lucide-react";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [todaysWorkouts, setTodaysWorkouts] = useState([]);
  const [recommendedPlans, setRecommendedPlans] = useState([]);
  const [recoLoading, setRecoLoading] = useState(false);
  const [recoError, setRecoError] = useState(null);
  const [activePlan, setActivePlan] = useState(null);
  const [pastPlans, setPastPlans] = useState([]);
  const [pastPlansLoading, setPastPlansLoading] = useState(false);
  const [weeklyStepsData, setWeeklyStepsData] = useState(null);
  const [workout, setWorkout] = useState(`#Legs
-Back Squat
-5 setsX15 reps
-30 kg
-10 min`);

  const dashboardData = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/user/dashboard");
      const dashboardData = res.data || {};
      
      // Map backend data to frontend expected format
      const mappedData = {
        totalWorkouts: dashboardData.totalWorkouts || 0,
        totalCalories: dashboardData.totalCaloriesBurnt || 0, // Map totalCaloriesBurnt to totalCalories
        totalSteps: dashboardData.totalSteps || 0,
        totalTime: dashboardData.totalTime || 0,
        categories: dashboardData.categories || [],
        weeklyStats: dashboardData.weeklyStats || []
      };
      
      setData(mappedData);
      console.log("Dashboard data:", mappedData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      console.error("Error details:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data
      });
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeeklyStepsData = async () => {
    try {
      const res = await axiosInstance.get("/user/steps/weekly");
      setWeeklyStepsData(res.data);
      console.log("Weekly steps data:", res.data);
    } catch (error) {
      console.error("Error fetching weekly steps data:", error);
      setWeeklyStepsData(null);
    }
  };

  const fetchActivePlan = async () => {
    try {
      const res = await axiosInstance.get("/user/active-plan");
      if (res.data.success) {
        setActivePlan(res.data.plan);
      } else {
        setActivePlan(null);
      }
    } catch (error) {
      console.log("No active plan found (optional).");
      setActivePlan(null);
    }
  };

  const fetchPastPlans = async () => {
    setPastPlansLoading(true);
    try {
      const res = await axiosInstance.get("/user/past-plans");
      if (res.data.success) {
        setPastPlans(res.data.plans || []);
      }
    } catch (error) {
      console.error("Error fetching past plans:", error);
      setPastPlans([]);
    } finally {
      setPastPlansLoading(false);
    }
  };

  const fetchRecommendedPlans = async () => {
    setRecoLoading(true);
    setRecoError(null);
    try {
      const res = await axiosInstance.get("/user/recommended-plans");
      const plans = Array.isArray(res?.data?.recommendedPlans) ? res.data.recommendedPlans : [];
      // Ensure beginner plans are visible first
      const order = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 };
      let sorted = [...plans].sort((a, b) => (order[a?.difficulty] ?? 99) - (order[b?.difficulty] ?? 99));
      // Fallback if backend returned empty
      if (!sorted.length) {
        sorted = [
          {
            _id: "fallback-adv-7day",
            name: "7-Day Split: Advanced",
            description: "Five lifting days and two active rest days.",
            duration: 1,
            difficulty: "advanced",
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
      setRecommendedPlans(sorted);
    } catch (error) {
      console.error("Error fetching recommended plans:", error);
      setRecoError("Failed to load recommended plans");
      // UI-safe fallback
      setRecommendedPlans([
        {
          _id: "fallback-adv-7day",
          name: "7-Day Split: Advanced",
          description: "Five lifting days and two active rest days.",
          duration: 1,
          difficulty: "advanced",
          weeks: [
            { weekNumber: 1, days: [
              { dayNumber: 1, dayName: "Chest", workouts: [{ name: "Chest Day" }] },
              { dayNumber: 2, dayName: "Back & Core", workouts: [{ name: "Back & Core" }] },
              { dayNumber: 3, dayName: "Active Rest", workouts: [{ name: "Active Recovery" }] },
              { dayNumber: 4, dayName: "Shoulders & Traps", workouts: [{ name: "Shoulders & Traps" }] },
              { dayNumber: 5, dayName: "Legs", workouts: [{ name: "Leg Day" }] },
              { dayNumber: 6, dayName: "Arms", workouts: [{ name: "Arms" }] },
              { dayNumber: 7, dayName: "Active Rest", workouts: [{ name: "Active Recovery" }] },
            ]}
          ],
        },
        {
          _id: "fallback-beginner-7day",
          name: "7-Day Beginner: Full-Body Intro",
          description: "Gentle, beginner-friendly split with two active rest days.",
          duration: 1,
          difficulty: "beginner",
          weeks: [
            { weekNumber: 1, days: [
              { dayNumber: 1, dayName: "Upper (Light)", workouts: [{ name: "Beginner Upper" }] },
              { dayNumber: 2, dayName: "Active Rest", workouts: [{ name: "Walk & Stretch" }] },
              { dayNumber: 3, dayName: "Lower (Light)", workouts: [{ name: "Beginner Lower" }] },
              { dayNumber: 4, dayName: "Core + Cardio", workouts: [{ name: "Core & Walk" }] },
              { dayNumber: 5, dayName: "Full Body (Light)", workouts: [{ name: "Beginner Full Body" }] },
              { dayNumber: 6, dayName: "Active Rest", workouts: [{ name: "Mobility & Walk" }] },
              { dayNumber: 7, dayName: "Optional Cardio", workouts: [{ name: "Light Cardio" }] },
            ]}
          ],
        },
      ]);
    } finally {
      setRecoLoading(false);
    }
  };

  const useThisPlan = async (plan) => {
    // This function is now handled by the Recom component
    // It's kept for backward compatibility
    console.log("Plan activation handled by Recom component:", plan);
  };

  const weekOneDays = (plan) => {
    if (!plan?.weeks?.length) return [];
    const week1 = plan.weeks.find((w) => w.weekNumber === 1) || plan.weeks[0];
    return Array.isArray(week1?.days) ? week1.days : [];
  };

  const getTodaysWorkout = async () => {
    try {
      const res = await axiosInstance.get("/user/workout");
      setTodaysWorkouts(Array.isArray(res?.data?.todaysWorkouts) ? res.data.todaysWorkouts : []);
      console.log("Today's workouts:", res.data);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      console.error("Workout error details:", {
        status: error.response?.status,
        message: error.response?.data?.message,
        data: error.response?.data
      });
      setTodaysWorkouts([]);
    }
  };

  const addNewWorkout = async () => {
    setButtonLoading(true);
    try {
      // Format the workout string according to backend expectations
      const formattedWorkoutString = workout.trim();
      
      // Validate the workout format
      if (!formattedWorkoutString.includes('#')) {
        alert("Please include a workout category starting with # (e.g., #Legs)");
        return;
      }

      await axiosInstance.post("/user/workout", { workoutString: formattedWorkoutString });
      
      // Show success message
      alert("Workout added successfully!");
      
      // Refresh data
      dashboardData();
      getTodaysWorkout();
      // Notify other pages (e.g., Workouts) to refresh
      window.dispatchEvent(new CustomEvent('workout:added'));
      
      // Reset workout input
      setWorkout(`#Legs
-Back Squat
-5 setsX15 reps
-30 kg
-10 min`);
    } catch (error) {
      console.error("Error adding workout:", error);
      // Error handling is now done by axios interceptor
    } finally {
      setButtonLoading(false);
    }
  };

  useEffect(() => {
    dashboardData();
    getTodaysWorkout();
    fetchRecommendedPlans();
    fetchWeeklyStepsData();
    fetchActivePlan();
    fetchPastPlans();
    
    // Listen for steps saved event to refresh data
    const handleStepsSaved = () => {
      fetchWeeklyStepsData();
      dashboardData(); // Refresh dashboard data to update charts
    };

    // Listen for plan activation event to refresh data
    const handlePlanActivated = () => {
      fetchActivePlan();
      dashboardData(); // Refresh dashboard data to update charts
      fetchWeeklyStepsData();
    };

    // Listen for workout completion event to refresh data
    const handleWorkoutCompleted = () => {
      dashboardData(); // Refresh dashboard data to update charts
      getTodaysWorkout();
    };
    
    window.addEventListener('steps:saved', handleStepsSaved);
    window.addEventListener('plan:activated', handlePlanActivated);
    window.addEventListener('workout:completed', handleWorkoutCompleted);
    
    return () => {
      window.removeEventListener('steps:saved', handleStepsSaved);
      window.removeEventListener('plan:activated', handlePlanActivated);
      window.removeEventListener('workout:completed', handleWorkoutCompleted);
    };
  }, []);

  // Dynamic header messaging based on user status
  const computeEngagement = (dashboard) => {
    if (!dashboard) return { level: "new", title: "Welcome to ActiveVista!", sub: "Tracking today, transforming tomorrow. Let's log your first workout." };
    const totalWorkouts = Number(dashboard.totalWorkouts || 0);
    const weekly = Array.isArray(dashboard.totalWeeksCaloriesBurnt?.caloriesBurned)
      ? dashboard.totalWeeksCaloriesBurnt.caloriesBurned
      : [];
    const activeDays = weekly.filter((v) => Number(v) > 0).length;
    const recentSum = weekly.slice(-3).reduce((s, v) => s + Number(v || 0), 0);

    if (totalWorkouts === 0 && activeDays === 0) {
      return {
        level: "new",
        title: "Welcome to ActiveVista!",
        sub: "You're off to a fresh start. Add a workout to begin your journey.",
      };
    }
    if (totalWorkouts < 10 || activeDays <= 3 || recentSum > 0) {
      return {
        level: "progress",
        title: "Great momentum!",
        sub: "Keep pushing — small steps add up. You're building a powerful habit.",
      };
    }
    return {
      level: "crushing",
      title: "You're on fire!",
      sub: "Outstanding consistency and results. Stay strong and keep leading the way.",
    };
  };

  const header = computeEngagement(data);

  // Detect missed days / off-track streak (based on last 7 days calories)
  const computeMissedCopy = (dashboard) => {
    if (!dashboard?.totalWeeksCaloriesBurnt?.caloriesBurned) return null;
    const arr = dashboard.totalWeeksCaloriesBurnt.caloriesBurned.map((n) => Number(n) || 0);
    if (!arr.length) return null;
    // Assuming arr is oldest -> today
    let off = 0;
    for (let i = arr.length - 1; i >= 0; i--) {
      if (arr[i] > 0) break;
      off += 1;
    }
    if (off === 0) return null;
    if (off === 1) {
      return {
        badgeClass: "bg-rose-50 text-rose-700",
        title: "Missed today? No worries.",
        sub: "Log a quick session now — even 10 minutes counts.",
      };
    }
    return {
      badgeClass: "bg-rose-50 text-rose-700",
      title: `You're ${off} day${off > 1 ? 's' : ''} off-track`,
      sub: "You've got this — start small today and rebuild your streak.",
    };
  };

  // Do not show missed/off-track banner for brand new users
  const missed = header.level === "new" ? null : computeMissedCopy(data);
  if (loading) {
    return (
      <div className="flex-1 h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full bg-gradient-to-br from-slate-50 to-blue-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section (dynamic) */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {missed ? (
              <span className={`text-xs px-2 py-1 rounded-full ${missed.badgeClass}`}>Off Track</span>
            ) : (
              <>
                {header.level === "new" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700">New Journey</span>
                )}
                {header.level === "progress" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700">Making Progress</span>
                )}
                {header.level === "crushing" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700">On a Streak</span>
                )}
              </>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-1">{(missed?.title) || header.title}</h1>
          <p className="text-gray-600 text-base md:text-lg">{(missed?.sub) || header.sub}</p>
        </div>
        
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.isArray(counts) && counts.map((item, index) => (
            <CountsCard key={index} item={item} data={data} stepsData={weeklyStepsData} index={index} />
          ))}
        </div>

        {/* Charts and Add Workout Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <WeeklyStatCard data={data} stepsData={weeklyStepsData} />
            <CategoryChart data={data} stepsData={weeklyStepsData} />
          </div>
          <div className="lg:col-span-1">
            <AddWorkout
              workout={workout}
              setWorkout={setWorkout}
              addNewWorkout={addNewWorkout}
              buttonLoading={buttonLoading}
            />
          </div>
        </div>

        {/* Recommended Plans */}
        {recoError && (
          <div className="bg-rose-50 text-rose-700 rounded-xl p-4 mb-4 text-sm">{recoError}</div>
        )}
        <Recom
          recommendedPlans={recommendedPlans}
          recoLoading={recoLoading}
          onUsePlan={useThisPlan}
          getWeekOneDays={weekOneDays}
          activePlan={activePlan}
          refreshActivePlan={fetchActivePlan}
        />

        {/* Today's Workouts Section */}
        <div className="bg-white rounded-2xl shadow-modern-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Today's Workouts</h2>
            <div className="gradient-primary text-white px-4 py-2 rounded-full text-sm font-medium">
              {Array.isArray(todaysWorkouts) ? todaysWorkouts.length : 0} workouts
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(todaysWorkouts) && todaysWorkouts.length > 0 ? (
              todaysWorkouts.map((workout, index) => (
                <WorkoutCard key={index} workout={workout} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Dumbbell className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No workouts logged yet</h3>
                <p className="text-gray-500 mb-4">Start your fitness journey by adding your first workout!</p>
                <div className="text-sm text-gray-400">Use the "Add New Workout" card above to get started</div>
              </div>
            )}
          </div>
        </div>

        {/* Past Plans Section */}
        {pastPlans.length > 0 && (
          <div className="bg-white rounded-2xl shadow-modern-lg p-6 mt-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Past Plans</h2>
              <div className="text-sm text-gray-500">Your completed and terminated plans</div>
            </div>
            
            {pastPlansLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastPlans.map((plan, index) => (
                  <div key={plan._id || index} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{plan.planName}</h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {plan.planId?.description || 'No description available'}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{plan.totalWorkoutsCompleted}/30 days</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Trophy className="h-3 w-3" />
                            <span>{plan.status === 'completed' ? 'Completed' : 'Terminated'}</span>
                          </div>
                        </div>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        plan.status === 'completed' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : 'bg-orange-50 text-orange-700 border border-orange-200'
                      }`}>
                        {plan.status === 'completed' ? 'Completed' : 'Terminated'}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{Math.round((plan.totalWorkoutsCompleted / 30) * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            plan.status === 'completed' 
                              ? 'bg-gradient-to-r from-green-400 to-green-600' 
                              : 'bg-gradient-to-r from-orange-400 to-orange-600'
                          }`}
                          style={{ width: `${(plan.totalWorkoutsCompleted / 30) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div>
                        <div className="text-lg font-semibold text-indigo-600">
                          {plan.totalCaloriesBurned || 0}
                        </div>
                        <div className="text-xs text-gray-500">Calories</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-purple-600">
                          {plan.currentStreak || 0}
                        </div>
                        <div className="text-xs text-gray-500">Best Streak</div>
                      </div>
                    </div>
                    
                    {/* Date Range */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-xs text-gray-500 text-center">
                        {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;