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
import React, { useState } from "react";
import { counts } from "../src/utils/data";
import CountsCard from "../src/components/cards/CountsCard";
import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
  useDashboardData,
  useWeeklySteps,
  useActivePlan,
  usePastPlans,
  useRecommendedPlans,
  useTodaysWorkouts,
  queryKeys
} from "../src/api/queries";
import WeeklyStatCard from "../src/components/cards/WeeklyStatCard";
import CategoryChart from "../src/components/cards/CategoryChart";
import Recom from "../src/components/cards/Recom";
import AddWorkout from "../src/components/AddWorkout";
import WorkoutCard from "../src/components/cards/WorkoutCard";
import axiosInstance from "../src/api/axiosInstance";
import { Dumbbell, Clock, Trophy } from "lucide-react";
import { useToast } from "../src/components/ui/Toast";
import ScrollReveal, { StaggerContainer, StaggerItem } from "../src/components/ScrollReveal";
import PageTransition from "../src/components/PageTransition";

const Dashboard = () => {
  const queryClient = useQueryClient();
  const { data: dataRaw, isLoading: loading } = useDashboardData();
  const { data: weeklyStepsData } = useWeeklySteps();
  const { data: activePlan, refetch: fetchActivePlan } = useActivePlan();
  const { data: pastPlans, isLoading: pastPlansLoading } = usePastPlans();
  const { data: recommendedPlansRaw, isLoading: recoLoading, isError } = useRecommendedPlans();
  const { data: todaysWorkouts } = useTodaysWorkouts("");
  
  const [workout, setWorkout] = useState(`#Legs\n-Back Squat\n-5 setsX15 reps\n-30 kg\n-10 min`);
  const { addToast } = useToast();

  const data = dataRaw ? {
    totalWorkouts: dataRaw.totalWorkouts || 0,
    totalCalories: dataRaw.totalCaloriesBurnt || 0,
    totalSteps: dataRaw.totalSteps || 0,
    totalTime: dataRaw.totalTime || 0,
    categories: dataRaw.categories || [],
    weeklyStats: dataRaw.weeklyStats || [],
    totalWeeksCaloriesBurnt: dataRaw.totalWeeksCaloriesBurnt || {}
  } : null;

  const fallbackPlans = [
    {
      _id: "fallback-adv-7day",
      name: "7-Day Split: Advanced",
      description: "Five lifting days and two active rest days.",
      duration: 1,
      difficulty: "advanced",
      weeks: [{ weekNumber: 1, days: [{ dayNumber: 1, dayName: "Chest", workouts: [{ name: "Chest Day" }] }, { dayNumber: 2, dayName: "Back & Core", workouts: [{ name: "Back & Core" }] }, { dayNumber: 3, dayName: "Active Rest", workouts: [{ name: "Active Recovery" }] }, { dayNumber: 4, dayName: "Shoulders & Traps", workouts: [{ name: "Shoulders & Traps" }] }, { dayNumber: 5, dayName: "Legs", workouts: [{ name: "Leg Day" }] }, { dayNumber: 6, dayName: "Arms", workouts: [{ name: "Arms" }] }, { dayNumber: 7, dayName: "Active Rest", workouts: [{ name: "Active Recovery" }] }] }]
    },
    {
      _id: "fallback-beginner-7day",
      name: "7-Day Beginner: Full-Body Intro",
      description: "Gentle, beginner-friendly split with two active rest days.",
      duration: 1,
      difficulty: "beginner",
      weeks: [{ weekNumber: 1, days: [{ dayNumber: 1, dayName: "Upper (Light)", workouts: [{ name: "Beginner Upper" }] }, { dayNumber: 2, dayName: "Active Rest", workouts: [{ name: "Walk & Stretch" }] }, { dayNumber: 3, dayName: "Lower (Light)", workouts: [{ name: "Beginner Lower" }] }, { dayNumber: 4, dayName: "Core + Cardio", workouts: [{ name: "Core & Walk" }] }, { dayNumber: 5, dayName: "Full Body (Light)", workouts: [{ name: "Beginner Full Body" }] }, { dayNumber: 6, dayName: "Active Rest", workouts: [{ name: "Mobility & Walk" }] }, { dayNumber: 7, dayName: "Optional Cardio", workouts: [{ name: "Light Cardio" }] }] }]
    }
  ];

  let recommendedPlans = Array.isArray(recommendedPlansRaw) && recommendedPlansRaw.length > 0 ? recommendedPlansRaw : fallbackPlans;
  const order = { beginner: 0, intermediate: 1, advanced: 2, expert: 3 };
  recommendedPlans = [...recommendedPlans].sort((a, b) => (order[a?.difficulty] ?? 99) - (order[b?.difficulty] ?? 99));
  
  const recoError = isError ? "Failed to load recommended plans" : null;

  const useThisPlan = async (plan) => {
    console.log("Plan activation handled by Recom component:", plan);
  };

  const weekOneDays = (plan) => {
    if (!plan?.weeks?.length) return [];
    const week1 = plan.weeks.find((w) => w.weekNumber === 1) || plan.weeks[0];
    return Array.isArray(week1?.days) ? week1.days : [];
  };

  const { mutate: addNewWorkout, isPending: buttonLoading } = useMutation({
    mutationFn: async () => {
      const formattedWorkoutString = workout.trim();
      if (!formattedWorkoutString.includes('#')) {
        throw new Error("Format Error");
      }
      return await axiosInstance.post("/user/workout", { workoutString: formattedWorkoutString });
    },
    onSuccess: () => {
      addToast({ type: "success", title: "Workout Added", message: "Your workout has been logged successfully." });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.todaysWorkouts("") });
      setWorkout(`#Legs\n-Back Squat\n-5 setsX15 reps\n-30 kg\n-10 min`);
    },
    onError: (error) => {
      if (error.message === "Format Error") {
        addToast({ type: "error", title: "Format Error", message: "Please include a workout category starting with # (e.g., #Legs)" });
      }
    }
  });

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
      <div className="flex-1 h-full flex items-center justify-center bg-void">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="flex-1 h-full bg-void overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header Section (dynamic) */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {missed ? (
              <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Off Track</span>
            ) : (
              <>
                {header.level === "new" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">New Journey</span>
                )}
                {header.level === "progress" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Making Progress</span>
                )}
                {header.level === "crushing" && (
                  <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">On a Streak</span>
                )}
              </>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-text mb-1">{(missed?.title) || header.title}</h1>
          <p className="text-muted text-base md:text-lg">{(missed?.sub) || header.sub}</p>
        </div>
        
        {/* Stats Cards Grid */}
        <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.isArray(counts) && counts.map((item, index) => (
            <StaggerItem key={index} variant="scaleUp">
              <CountsCard item={item} data={data} stepsData={weeklyStepsData} index={index} />
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Charts and Add Workout Section */}
        <ScrollReveal variant="fadeUp" delay={0.2} className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
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
        </ScrollReveal>

        {/* Recommended Plans */}
        {recoError && (
          <ScrollReveal variant="fadeUp">
            <div className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl p-4 mb-4 text-sm">{recoError}</div>
          </ScrollReveal>
        )}
        <ScrollReveal variant="fadeUp" delay={0.3}>
          <Recom
            recommendedPlans={recommendedPlans}
            recoLoading={recoLoading}
            onUsePlan={useThisPlan}
            getWeekOneDays={weekOneDays}
            activePlan={activePlan}
            refreshActivePlan={fetchActivePlan}
          />
        </ScrollReveal>

        {/* Today's Workouts Section */}
        <ScrollReveal variant="fadeUp" delay={0.4}>
          <div className="glass-panel rounded-2xl p-6 mt-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-text">Today's Workouts</h2>
              <div className="bg-primary/10 text-primary border border-primary/20 px-4 py-2 rounded-full text-sm font-medium">
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
                <div className="w-24 h-24 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
                  <Dumbbell className="h-12 w-12 text-muted" />
                </div>
                <h3 className="text-xl font-semibold text-text mb-2">No workouts logged yet</h3>
                <p className="text-muted mb-4">Start your fitness journey by adding your first workout!</p>
                <div className="text-sm text-muted/50">Use the "Add New Workout" card above to get started</div>
              </div>
            )}
          </div>
        </div>
        </ScrollReveal>

        {/* Past Plans Section */}
        {pastPlans.length > 0 && (
          <ScrollReveal variant="fadeUp" delay={0.5}>
            <div className="glass-panel rounded-2xl p-6 mt-6">
              <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-display font-bold text-text">Past Plans</h2>
              <div className="text-sm text-muted">Your completed and terminated plans</div>
            </div>
            
            {pastPlansLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pastPlans.map((plan, index) => (
                  <div key={plan._id || index} className="border border-white/5 rounded-xl p-4 hover:border-primary/20 transition-all bg-white/[0.02]">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-text mb-1">{plan.planName}</h3>
                        <p className="text-sm text-muted mb-2">
                          {plan.planId?.description || 'No description available'}
                        </p>
                        <div className="flex items-center space-x-2 text-xs text-muted">
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
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                      }`}>
                        {plan.status === 'completed' ? 'Completed' : 'Terminated'}
                      </span>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted mb-1">
                        <span>Progress</span>
                        <span>{Math.round((plan.totalWorkoutsCompleted / 30) * 100)}%</span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-500 ${
                            plan.status === 'completed' 
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                              : 'bg-gradient-to-r from-orange-500 to-orange-400'
                          }`}
                          style={{ width: `${(plan.totalWorkoutsCompleted / 30) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div>
                        <div className="text-lg font-semibold text-primary">
                          {plan.totalCaloriesBurned || 0}
                        </div>
                        <div className="text-xs text-muted">Calories</div>
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-accent">
                          {plan.currentStreak || 0}
                        </div>
                        <div className="text-xs text-muted">Best Streak</div>
                      </div>
                    </div>
                    
                    {/* Date Range */}
                    <div className="mt-3 pt-3 border-t border-white/5">
                      <div className="text-xs text-muted text-center">
                        {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
    </PageTransition>
  );
};

export default Dashboard;