/*
  Workout.jsx
  Purpose: Full workout management page: date selection, daily steps tracking, active plan overview,
           30-day calendar, plan switching, today's workouts and history.
  Data Flow:
    - GET /user/workout, /user/workout-history, /user/steps, /user/active-plan, /user/recommended-plans
    - POST /user/steps, /user/use-plan, /user/complete-plan-workout, /user/complete-individual-workout
    - Emits/handles custom events to keep pages in sync.
  UI Structure:
    - Sidebar: date picker, steps card, active plan snapshot, plan switching
    - Main: current workouts, 30-day schedule, history
*/
import React, { useEffect, useState } from "react";
import WorkoutCard from "../src/components/cards/WorkoutCard";
import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
  useTodaysWorkouts,
  useWorkoutHistory,
  useDailySteps,
  useActivePlan,
  useRecommendedPlans,
  queryKeys
} from "../src/api/queries";
import Recom from "../src/components/cards/Recom";
import axiosInstance from "../src/api/axiosInstance";
import { Card, CardContent, CardHeader, CardTitle } from "../src/components/ui/card";
import { Button } from "../src/components/ui/button";
import { CalendarDays, Trash2, History, CheckCircle, Clock, Trophy, Flame, Dumbbell as DumbbellIcon, Footprints, Plus, Minus, Target, RefreshCw, ArrowLeft } from "lucide-react";
import { useToast } from "../src/components/ui/Toast";
import ScrollReveal, { StaggerContainer, StaggerItem } from "../src/components/ScrollReveal";
import PageTransition from "../src/components/PageTransition";

const Workouts = () => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  
  const { data: todaysWorkoutsRaw, isLoading: loading } = useTodaysWorkouts(date);
  const { data: workoutHistoryRaw, isLoading: historyLoading } = useWorkoutHistory(date);
  const { data: dailyStepsRaw, isLoading: stepsLoading } = useDailySteps(date);
  const { data: activePlan } = useActivePlan();
  const { data: recommendedPlansRaw, isLoading: recoLoading } = useRecommendedPlans();

  const todaysWorkouts = Array.isArray(todaysWorkoutsRaw) ? todaysWorkoutsRaw : [];
  const workoutHistory = Array.isArray(workoutHistoryRaw) ? workoutHistoryRaw : [];
  const recommendedPlans = Array.isArray(recommendedPlansRaw) ? recommendedPlansRaw : [];

  const totalCalories = workoutHistory.reduce((sum, workout) => sum + (workout.caloriesBurned || 0), 0);
  
  // Local state for optimistic step updates
  const [localSteps, setLocalSteps] = useState(0);
  useEffect(() => {
    if (dailyStepsRaw !== undefined) {
      setLocalSteps(dailyStepsRaw);
    }
  }, [dailyStepsRaw]);
  const dailySteps = localSteps;

  const [now, setNow] = useState(new Date());
  const [showHistory, setShowHistory] = useState(false);
  const [switchingPlan, setSwitchingPlan] = useState(false);

  const { mutate: updateStepsMutate } = useMutation({
    mutationFn: async (newSteps) => {
      return await axiosInstance.post(`/user/steps`, { date: date, steps: newSteps });
    },
    onSuccess: (res, newSteps) => {
      queryClient.setQueryData(queryKeys.dailySteps(date), newSteps);
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    },
    onError: () => {
      addToast({ type: "error", title: "Update Failed", message: "Failed to update steps. Please try again." });
      // Revert optimism
      setLocalSteps(dailyStepsRaw || 0);
    }
  });

  const updateSteps = (newSteps) => {
    setLocalSteps(newSteps);
    updateStepsMutate(newSteps);
  };

  const saveDailySteps = async () => {
    if (dailySteps === 0) {
      addToast({ type: "warning", title: "Missing Steps", message: "Please add some steps before saving!" });
      return;
    }
    updateStepsMutate(dailySteps);
    addToast({ type: "success", title: "Steps Saved", message: `Successfully saved ${dailySteps.toLocaleString()} steps!` });
  };

  const incrementSteps = () => updateSteps(dailySteps + 100);
  const decrementSteps = () => updateSteps(Math.max(0, dailySteps - 100));

  const { mutate: handleSwitchPlan } = useMutation({
    mutationFn: async (plan) => {
      if (!window.confirm(`Switching will terminate your current plan "${activePlan?.planName}" (${activePlan?.totalWorkoutsCompleted || 0}/30 days completed). Continue?`)) {
        throw new Error("Cancelled");
      }
      setSwitchingPlan(true);
      return await axiosInstance.post("/user/use-plan", { planId: plan._id });
    },
    onSuccess: (res, plan) => {
      const message = res.data.terminatedPlan 
        ? `"${res.data.terminatedPlan.name}" (${res.data.terminatedPlan.daysCompleted}/30 days) moved to past plans. "${plan.name}" is now active.`
        : `"${plan.name}" is now your active 30-day plan.`;
      addToast({ type: "success", title: "Plan Activated", message });
      queryClient.invalidateQueries({ queryKey: queryKeys.activePlan });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      setSwitchingPlan(false);
    },
    onError: (error) => {
      if (error.message !== "Cancelled") {
        addToast({ type: "error", title: "Switch Failed", message: error.response?.data?.message || "Failed to switch plan." });
        setSwitchingPlan(false);
      }
    }
  });

  const completePlanWorkout = async (dayNumber) => {
    if (!activePlan) return;
    const planDay = activePlan.dayMapping.find(d => d.dayNumber === dayNumber);
    if (!planDay || planDay.completed) return;
    try {
      const res = await axiosInstance.post("/user/complete-plan-workout", {
        dayNumber: dayNumber,
        actualCalories: planDay.caloriesBurned,
        actualDuration: planDay.totalDuration
      });
      if (res.data.success) {
        addToast({ type: "success", title: `Day ${dayNumber} Completed!`, message: `Progress: ${res.data.progress.totalCompleted}/30 days | Streak: ${res.data.progress.currentStreak} days` });
        queryClient.invalidateQueries({ queryKey: queryKeys.activePlan });
        queryClient.invalidateQueries({ queryKey: queryKeys.todaysWorkouts(date) });
        queryClient.invalidateQueries({ queryKey: queryKeys.workoutHistory(date) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      }
    } catch {
      addToast({ type: "error", title: "Completion Failed", message: "Failed to complete workout. Please try again." });
    }
  };

  const completeIndividualWorkout = async (dayNumber, workoutIndex) => {
    if (!activePlan) return;
    const planDay = activePlan.dayMapping.find(d => d.dayNumber === dayNumber);
    if (!planDay || !planDay.workouts || !planDay.workouts[workoutIndex]) return;
    const workout = planDay.workouts[workoutIndex];
    if (workout.completed) return;
    try {
      const res = await axiosInstance.post("/user/complete-individual-workout", {
        dayNumber: dayNumber,
        workoutIndex: workoutIndex,
        actualCalories: workout.estimatedCalories,
        actualDuration: workout.duration
      });
      if (res.data.success) {
        addToast({ type: "success", title: "Workout Completed", message: `Progress: ${res.data.progress.totalCompleted}/30 days` });
        queryClient.invalidateQueries({ queryKey: queryKeys.activePlan });
        queryClient.invalidateQueries({ queryKey: queryKeys.todaysWorkouts(date) });
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      }
    } catch {
      addToast({ type: "error", title: "Completion Failed", message: "Failed to complete workout." });
    }
  };

  const deleteWorkout = async (workoutId, isHistory = false) => {
    if (!window.confirm("Are you sure you want to delete this workout?")) return;
    try {
      if (isHistory) {
        await axiosInstance.delete(`/user/workout-history/${workoutId}`);
      } else {
        await axiosInstance.delete(`/user/workout/${workoutId}`);
      }
      addToast({ type: "info", title: "Workout Deleted", message: "Workout deleted successfully." });
      queryClient.invalidateQueries({ queryKey: queryKeys.todaysWorkouts(date) });
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutHistory(date) });
    } catch {
      addToast({ type: "error", title: "Deletion Failed", message: "Failed to delete workout." });
    }
  };

  // Live clock for displaying current day/date/time
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <PageTransition>
      <div className="flex-1 h-full bg-void overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Motivational Hero */}
        <div className="mb-6">
          <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-light text-white p-6 flex items-center justify-between shadow-modern-lg">
            <div>
              <div className="text-sm opacity-90">Show up. Put in the reps.</div>
              <h1 className="text-3xl font-bold">Your Workout Arena</h1>
              <p className="text-white/90 mt-1">Crush today’s session and keep the streak alive.</p>
              <div className="mt-3 flex gap-3 text-xs">
                <span className="px-2 py-1 rounded-full bg-white/15 flex items-center gap-1"><Flame className="h-3 w-3"/> Stay consistent</span>
                <span className="px-2 py-1 rounded-full bg-white/15 flex items-center gap-1"><Trophy className="h-3 w-3"/> Progress over perfection</span>
              </div>
              
              {/* Mobile stats */}
              <div className="md:hidden mt-4 grid grid-cols-3 gap-3">
                <div className="bg-white/15 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold">{todaysWorkouts.length}</div>
                  <div className="text-xs">Workouts</div>
                </div>
                <div className="bg-white/15 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold flex items-center justify-center">
                    <Flame className="h-4 w-4 mr-1" />
                    {totalCalories}
                  </div>
                  <div className="text-xs">Calories</div>
                </div>
                <div className="bg-white/15 rounded-lg p-2 text-center">
                  <div className="text-lg font-bold">{workoutHistory.length}</div>
                  <div className="text-xs">History</div>
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <div className="bg-white/15 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold">{todaysWorkouts.length}</div>
                <div className="text-xs">Workouts Today</div>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold flex items-center justify-center">
                  <Flame className="h-5 w-5 mr-1" />
                  {totalCalories}
                </div>
                <div className="text-xs">Calories Burned</div>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold">{workoutHistory.length}</div>
                <div className="text-xs">In History</div>
              </div>
              <div className="bg-white/15 rounded-xl p-3 text-center min-w-[160px]">
                <div className="text-sm font-semibold">
                  {now.toLocaleDateString(undefined, { weekday: 'long' })}
                </div>
                <div className="text-xs opacity-90">{now.toLocaleDateString()}</div>
                <div className="text-xs opacity-90">{now.toLocaleTimeString()}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Date Selection Sidebar */}
          <div className="lg:col-span-1">
            <Card className="glass-panel border-0 card-hover sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-text flex items-center">
                  <div className="bg-gradient-to-r from-primary to-primary-light p-2 rounded-xl mr-3">
                    <CalendarDays className="h-5 w-5 text-white" />
                  </div>
                  Select Date
                </CardTitle>
                <p className="text-sm text-muted mt-2">Choose a date to view your workouts</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 border border-white/5 rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-indigo-300 transition-all duration-200 bg-white/[0.02] focus:bg-white"
                  />
                  <div className="text-xs text-muted">
                    {`Showing workouts for ${new Date(date).toLocaleDateString()} (${new Date(date).toLocaleDateString(undefined, { weekday: 'long' })})`}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <DumbbellIcon className="h-4 w-4 text-primary"/>
                    Tip: Mark workouts completed to move them into history.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Steps Tracking Card */}
            <Card className="glass-panel border-0 card-hover mt-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-text flex items-center">
                  <div className="gradient-green p-2 rounded-xl mr-3">
                    <Footprints className="h-5 w-5 text-white" />
                  </div>
                  Daily Steps
                </CardTitle>
                <p className="text-sm text-muted mt-2">Track your daily walking activity</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Steps Display */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-text mb-2">
                      {stepsLoading ? (
                        <div className="animate-pulse bg-white/5 h-12 w-32 mx-auto rounded"></div>
                      ) : (
                        dailySteps.toLocaleString()
                      )}
                    </div>
                    <div className="text-sm text-muted">steps today</div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-white/5 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((dailySteps / 10000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-muted text-center">
                    {Math.round((dailySteps / 10000) * 100)}% of 10,000 goal
                  </div>

                  {/* Control Buttons */}
                  <div className="flex items-center justify-between gap-3">
                    <Button
                      onClick={decrementSteps}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      disabled={stepsLoading}
                    >
                      <Minus className="h-4 w-4" />
                      -100
                    </Button>
                    <div className="text-xs text-muted text-center">
                      {new Date(date).toLocaleDateString(undefined, { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <Button
                      onClick={incrementSteps}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                      disabled={stepsLoading}
                    >
                      <Plus className="h-4 w-4" />
                      +100
                    </Button>
                  </div>

                  {/* Save Button */}
                  <div className="pt-3 border-t border-white/5">
                    <Button
                      onClick={saveDailySteps}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                      disabled={stepsLoading || dailySteps === 0}
                    >
                      <Footprints className="h-4 w-4 mr-2" />
                      Save Daily Steps
                    </Button>
                    <p className="text-xs text-muted text-center mt-2">
                      Save your steps to track progress across all charts
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-white/5">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-emerald-400">
                        {Math.round(dailySteps * 0.0005)} km
                      </div>
                      <div className="text-xs text-muted">Distance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {Math.round(dailySteps * 0.04)} cal
                      </div>
                      <div className="text-xs text-muted">Burned</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Plan Section */}
            {activePlan && (
              <Card className="glass-panel border-0 card-hover mt-6">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-text flex items-center">
                        <div className="bg-gradient-to-r from-primary to-primary-light p-2 rounded-xl mr-3">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        Active Plan
                      </CardTitle>
                      <p className="text-sm text-muted mt-2">
                        {activePlan.planName} • {activePlan.totalWorkoutsCompleted}/30 days completed
                      </p>
                    </div>
                    <Button
                      onClick={() => setSwitchingPlan(true)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-red-400 border-red-200 hover:bg-red-500/100/10"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Switch Plan
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-muted mb-2">
                      <span>Progress</span>
                      <span>{Math.round((activePlan.totalWorkoutsCompleted / 30) * 100)}%</span>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-primary to-primary-light h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(activePlan.totalWorkoutsCompleted / 30) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Today's Workout */}
                  {(() => {
                    const today = new Date();
                    const startDate = new Date(activePlan.startDate);
                    const dayNumber = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
                    const todayWorkout = activePlan.dayMapping.find(d => d.dayNumber === dayNumber);
                    
                    if (todayWorkout && dayNumber <= 30) {
                      return (
                        <div className="glass-panel bg-white/5 rounded-lg p-4 border border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-text">Day {dayNumber}: {todayWorkout.weekday}</h3>
                              <p className="text-sm text-muted">{todayWorkout.workoutName}</p>
                            </div>
                            {todayWorkout.completed ? (
                              <div className="flex items-center text-emerald-400">
                                <CheckCircle className="h-5 w-5 mr-1" />
                                <span className="text-sm font-medium">Completed</span>
                              </div>
                            ) : (
                              <Button
                                onClick={() => completePlanWorkout(dayNumber)}
                                size="sm"
                                className="bg-gradient-to-r from-primary to-primary-light hover:from-indigo-600 hover:to-purple-700 text-white"
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                          
                          {/* Individual Workouts */}
                          {todayWorkout.workouts && todayWorkout.workouts.length > 0 && (
                            <div className="space-y-3">
                              <p className="text-sm font-medium text-text/80">Today's Workouts:</p>
                              <div className="space-y-2">
                                {todayWorkout.workouts.map((workout, idx) => (
                                  <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                                    <div className="flex items-center justify-between mb-2">
                                      <div>
                                        <h4 className={`font-medium ${workout.completed ? "line-through text-muted/60" : "text-text"}`}>
                                          {workout.name}
                                        </h4>
                                        <div className="text-xs text-muted">
                                          {workout.duration} min • ~{workout.estimatedCalories} cal
                                        </div>
                                      </div>
                                      <div>
                                        {!workout.completed ? (
                                          <Button
                                            onClick={() => completeIndividualWorkout(dayNumber, idx)}
                                            size="sm"
                                            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                          >
                                            Complete
                                          </Button>
                                        ) : (
                                          <div className="flex items-center text-emerald-400">
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            <span className="text-sm font-medium">Done</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {workout.exercises && workout.exercises.length > 0 && (
                                      <div className="space-y-1">
                                        <p className="text-xs font-medium text-muted">Exercises:</p>
                                        <div className="space-y-1">
                                          {workout.exercises.slice(0, 2).map((exercise, exerciseIdx) => (
                                            <div key={exerciseIdx} className="text-xs text-muted flex justify-between">
                                              <span>{exercise.name}</span>
                                              <span>{exercise.sets}x{exercise.reps} {exercise.weight > 0 && `${exercise.weight}kg`}</span>
                                            </div>
                                          ))}
                                          {workout.exercises.length > 2 && (
                                            <p className="text-xs text-muted/60">+{workout.exercises.length - 2} more</p>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Fallback to old exercises display if no individual workouts */}
                          {(!todayWorkout.workouts || todayWorkout.workouts.length === 0) && todayWorkout.exercises && todayWorkout.exercises.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-sm font-medium text-text/80">Exercises:</p>
                              <div className="space-y-1">
                                {todayWorkout.exercises.slice(0, 3).map((exercise, idx) => (
                                  <div key={idx} className="text-sm text-muted flex justify-between">
                                    <span>{exercise.name}</span>
                                    <span>{exercise.sets}x{exercise.reps} {exercise.weight > 0 && `${exercise.weight}kg`}</span>
                                  </div>
                                ))}
                                {todayWorkout.exercises.length > 3 && (
                                  <p className="text-xs text-muted">+{todayWorkout.exercises.length - 3} more exercises</p>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-indigo-200">
                            <div className="flex items-center text-sm text-muted">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{todayWorkout.totalDuration} min</span>
                            </div>
                            <div className="flex items-center text-sm text-orange-600">
                              <Flame className="h-4 w-4 mr-1" />
                              <span>{todayWorkout.caloriesBurned} cal</span>
                            </div>
                          </div>
                        </div>
                      );
                    } else if (dayNumber > 30) {
                      return (
                        <div className="bg-emerald-500/10 rounded-lg p-4 border border-emerald-500/20 text-center">
                          <div className="flex items-center justify-center text-emerald-400 mb-2">
                            <CheckCircle className="h-6 w-6 mr-2" />
                            <span className="font-semibold">Plan Completed!</span>
                          </div>
                          <p className="text-sm text-muted">
                            Congratulations! You've completed your 30-day journey.
                          </p>
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-center py-4 text-muted">
                          <p className="text-sm">Plan starts in {dayNumber} days</p>
                        </div>
                      );
                    }
                  })()}

                  {/* Plan Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/5">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-primary">
                        {activePlan.currentStreak}
                      </div>
                      <div className="text-xs text-muted">Current Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">
                        {activePlan.totalCaloriesBurned}
                      </div>
                      <div className="text-xs text-muted">Total Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-emerald-400">
                        {30 - activePlan.totalWorkoutsCompleted}
                      </div>
                      <div className="text-xs text-muted">Days Left</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            

            {/* Plan Switching Section */}
            {switchingPlan && (
              <Card className="glass-panel border-0 card-hover mt-6">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-text flex items-center">
                      <div className="bg-gradient-to-r from-primary to-primary-light p-2 rounded-xl mr-3">
                        <RefreshCw className="h-5 w-5 text-white" />
                      </div>
                      Switch Plan
                    </CardTitle>
                    <Button
                      onClick={() => setSwitchingPlan(false)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </Button>
                  </div>
                  <p className="text-sm text-muted mt-2">
                    Choose a new plan to replace your current active plan
                  </p>
                </CardHeader>
                <CardContent>
                  <Recom
                    recommendedPlans={recommendedPlans}
                    recoLoading={recoLoading}
                    onUsePlan={handleSwitchPlan}
                    getWeekOneDays={(plan) => {
                      if (!plan?.weeks?.length) return [];
                      const week1 = plan.weeks.find((w) => w.weekNumber === 1) || plan.weeks[0];
                      return Array.isArray(week1?.days) ? week1.days : [];
                    }}
                    activePlan={activePlan}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Workouts Section */}
          <div className="lg:col-span-3">
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-text">Workouts</h1>
                  <p className="text-muted mt-1">Track and manage today’s session. Finish strong.</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={() => setShowHistory(!showHistory)}
                    variant={showHistory ? "default" : "outline"}
                    className="flex items-center"
                  >
                    <History className="h-4 w-4 mr-2" />
                    {showHistory ? "Hide History" : "Show History"}
                  </Button>
                  <div className="bg-gradient-to-r from-primary to-primary-light text-white px-4 py-2 rounded-full text-sm font-medium">
                    {todaysWorkouts.length} workouts
                  </div>
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted">Loading workouts...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Current Workouts */}
                  <div>
                    <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-primary" />
                      Current Workouts
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-6">
                      {todaysWorkouts.length > 0 ? (
                        todaysWorkouts.map((workout, index) => (
                          <WorkoutCard 
                            key={index} 
                            workout={workout} 
                            onDelete={deleteWorkout}
                            showDelete={true}
                          />
                        ))
                      ) : (
                        <div className="col-span-full text-center py-16">
                          <div className="w-24 h-24 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                            <CalendarDays className="h-12 w-12 text-muted/60" />
                          </div>
                          <h3 className="text-xl font-semibold text-text mb-2">No workouts found</h3>
                          <p className="text-muted mb-4">
                            {date ? 'No workouts found for the selected date' : 'No workouts logged yet'}
                          </p>
                          <div className="text-sm text-muted/60">
                            {date ? 'Try selecting a different date' : 'Start by adding your first workout from the dashboard'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 30-Day Calendar View */}
                  {activePlan && (
                    <Card className="glass-panel border-0 card-hover">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold text-text flex items-center">
                          <div className="bg-gradient-to-r from-primary to-primary-light p-2 rounded-xl mr-3">
                            <CalendarDays className="h-5 w-5 text-white" />
                          </div>
                          30-Day Schedule
                        </CardTitle>
                        <p className="text-sm text-muted mt-2">
                          Complete workout schedule for your active plan
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {activePlan.dayMapping && activePlan.dayMapping.map((day) => {
                            const isToday = (() => {
                              const today = new Date();
                              const startDate = new Date(activePlan.startDate);
                              const dayNumber = Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
                              return dayNumber === day.dayNumber;
                            })();
                            
                            const isPast = day.dayNumber < (() => {
                              const today = new Date();
                              const startDate = new Date(activePlan.startDate);
                              return Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
                            })();
                            
                            const isFuture = day.dayNumber > (() => {
                              const today = new Date();
                              const startDate = new Date(activePlan.startDate);
                              return Math.floor((today - startDate) / (1000 * 60 * 60 * 24)) + 1;
                            })();

                            return (
                              <div
                                key={day.dayNumber}
                                className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                                  isToday
                                    ? 'border-indigo-500 bg-primary/10 shadow-lg'
                                    : day.completed
                                    ? 'border-emerald-500/30 bg-emerald-500/10'
                                    : isPast
                                    ? 'border-white/10 bg-white/[0.02]'
                                    : 'border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10 hover:shadow-md'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-sm font-semibold ${
                                      isToday ? 'text-primary' : day.completed ? 'text-emerald-400' : 'text-text/80'
                                    }`}>
                                      Day {day.dayNumber}
                                    </span>
                                    {isToday && (
                                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                        Today
                                      </span>
                                    )}
                                  </div>
                                  {day.completed && (
                                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                                  )}
                                </div>
                                
                                <div className="text-xs font-medium text-muted mb-1">
                                  {day.weekday}
                                </div>
                                
                                <div className="text-xs text-muted mb-2">
                                  {new Date(day.date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="text-sm font-medium text-text truncate">
                                    {day.workoutName}
                                  </div>
                                  
                                  {day.workouts && day.workouts.length > 0 && (
                                    <div className="text-xs text-muted">
                                      {day.workouts.length} workout{day.workouts.length !== 1 ? 's' : ''}
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center justify-between text-xs text-muted">
                                    <span>{day.totalDuration} min</span>
                                    <span>{day.caloriesBurned} cal</span>
                                  </div>
                                </div>
                                
                                {/* Individual workouts preview */}
                                {day.workouts && day.workouts.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {day.workouts.slice(0, 2).map((workout, workoutIdx) => (
                                      <div key={workoutIdx} className={`text-xs p-1 rounded ${
                                        workout.completed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-muted'
                                      }`}>
                                        <div className="flex items-center justify-between">
                                          <span className="truncate">{workout.name}</span>
                                          {workout.completed && (
                                            <CheckCircle className="h-3 w-3 text-emerald-400" />
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                    {day.workouts.length > 2 && (
                                      <div className="text-xs text-muted/60 text-center">
                                        +{day.workouts.length - 2} more
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Complete Button */}
                                {!day.completed && !isFuture && (
                                  <div className="mt-3">
                                    <Button
                                      onClick={() => completePlanWorkout(day.dayNumber)}
                                      size="sm"
                                      className="w-full bg-gradient-to-r from-primary to-primary-light hover:from-indigo-600 hover:to-purple-700 text-white text-xs py-1"
                                    >
                                      Mark Complete
                                    </Button>
                                  </div>
                                )}

                                {day.completed && (
                                  <div className="mt-3 text-center">
                                    <div className="flex items-center justify-center text-emerald-400 text-xs font-medium">
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                      Completed
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        
                        {/* Summary Stats */}
                        <div className="mt-6 pt-4 border-t border-white/5">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">
                                {activePlan.totalWorkoutsCompleted}
                              </div>
                              <div className="text-xs text-muted">Completed</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {activePlan.totalCaloriesBurned}
                              </div>
                              <div className="text-xs text-muted">Calories</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-emerald-400">
                                {activePlan.currentStreak}
                              </div>
                              <div className="text-xs text-muted">Streak</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {30 - activePlan.totalWorkoutsCompleted}
                              </div>
                              <div className="text-xs text-muted">Days Left</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Workout History */}
                  {showHistory && (
                    <div>
                      <h2 className="text-xl font-semibold text-text mb-4 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-emerald-400" />
                        Workout History
                      </h2>
                      {historyLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        </div>
                      ) : (
                <div className="grid grid-cols-1 md:grid-cols-1 xl:grid-cols-2 gap-6">
                          {workoutHistory.length > 0 ? (
                            workoutHistory.map((workout, index) => (
                              <WorkoutCard 
                                key={index} 
                                workout={workout} 
                                onDelete={(id) => deleteWorkout(id, true)}
                                showDelete={true}
                              />
                            ))
                          ) : (
                            <div className="col-span-full text-center py-8">
                              <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
                                <History className="h-8 w-8 text-muted/60" />
                              </div>
                              <h3 className="text-lg font-semibold text-text mb-2">No workout history</h3>
                              <p className="text-muted text-sm">
                                Complete some workouts to see your history here
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
};

export default Workouts;