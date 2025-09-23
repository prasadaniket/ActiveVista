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
import Recom from "../src/components/cards/Recom";
import axiosInstance from "../src/api/axiosInstance";
import { Card, CardContent, CardHeader, CardTitle } from "../src/components/ui/card";
import { Button } from "../src/components/ui/button";
import { CalendarDays, Trash2, History, CheckCircle, Clock, Trophy, Flame, Dumbbell as DumbbellIcon, Footprints, Plus, Minus, Target, RefreshCw, ArrowLeft } from "lucide-react";

const Workouts = () => {
  const [todaysWorkouts, setTodaysWorkouts] = useState([]);
  const [workoutHistory, setWorkoutHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [date, setDate] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [now, setNow] = useState(new Date());
  const [showHistory, setShowHistory] = useState(false);
  const [totalCalories, setTotalCalories] = useState(0);
  const [dailySteps, setDailySteps] = useState(0);
  const [stepsLoading, setStepsLoading] = useState(false);
  const [activePlan, setActivePlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(false);
  const [recommendedPlans, setRecommendedPlans] = useState([]);
  const [recoLoading, setRecoLoading] = useState(false);
  const [switchingPlan, setSwitchingPlan] = useState(false);

  const getTodaysWorkout = async () => {
    setLoading(true);
    try {
      const query = date ? `?date=${date}` : "";
      const res = await axiosInstance.get(`/user/workout${query}`);
      const workouts = Array.isArray(res?.data?.todaysWorkouts) ? res.data.todaysWorkouts : [];
      setTodaysWorkouts(workouts);
      
      // Calculate total calories for today
      const calories = workouts.reduce((sum, workout) => sum + (workout.caloriesBurned || 0), 0);
      setTotalCalories(calories);
      
      console.log("Workouts data:", res.data);
    } catch (error) {
      console.error("Error fetching workouts:", error);
      setTodaysWorkouts([]);
      setTotalCalories(0);
    } finally {
      setLoading(false);
    }
  };

  const getWorkoutHistory = async () => {
    setHistoryLoading(true);
    try {
      const query = date ? `?date=${date}` : "";
      const res = await axiosInstance.get(`/user/workout-history${query}`);
      setWorkoutHistory(Array.isArray(res?.data?.workoutHistory) ? res.data.workoutHistory : []);
      console.log("Workout history:", res.data);
    } catch (error) {
      console.error("Error fetching workout history:", error);
      setWorkoutHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const getDailySteps = async () => {
    setStepsLoading(true);
    try {
      const query = date ? `?date=${date}` : "";
      const res = await axiosInstance.get(`/user/steps${query}`);
      setDailySteps(res?.data?.steps || 0);
      console.log("Daily steps:", res.data);
    } catch (error) {
      console.error("Error fetching daily steps:", error);
      setDailySteps(0);
    } finally {
      setStepsLoading(false);
    }
  };

  const updateSteps = async (newSteps) => {
    try {
      const res = await axiosInstance.post(`/user/steps`, {
        date: date,
        steps: newSteps
      });
      setDailySteps(newSteps);
      console.log("Steps updated:", res.data);
    } catch (error) {
      console.error("Error updating steps:", error);
      alert("Failed to update steps. Please try again.");
    }
  };

  const saveDailySteps = async () => {
    if (dailySteps === 0) {
      alert("Please add some steps before saving!");
      return;
    }
    
    try {
      const res = await axiosInstance.post(`/user/steps`, {
        date: date,
        steps: dailySteps
      });
      console.log("Daily steps saved:", res.data);
      alert(`Successfully saved ${dailySteps.toLocaleString()} steps for ${new Date(date).toLocaleDateString()}!`);
      
      // Trigger a refresh of dashboard data
      window.dispatchEvent(new CustomEvent('steps:saved'));
    } catch (error) {
      console.error("Error saving daily steps:", error);
      alert("Failed to save steps. Please try again.");
    }
  };

  const incrementSteps = () => {
    const newSteps = dailySteps + 100;
    updateSteps(newSteps);
  };

  const decrementSteps = () => {
    const newSteps = Math.max(0, dailySteps - 100);
    updateSteps(newSteps);
  };

  const getActivePlan = async () => {
    setPlanLoading(true);
    try {
      const res = await axiosInstance.get("/user/active-plan");
      if (res.data.success) {
        setActivePlan(res.data.plan);
        console.log("Active plan:", res.data.plan);
      } else {
        setActivePlan(null);
      }
    } catch (error) {
      console.log("No active plan found (optional).");
      setActivePlan(null);
    } finally {
      setPlanLoading(false);
    }
  };

  const fetchRecommendedPlans = async () => {
    setRecoLoading(true);
    try {
      const res = await axiosInstance.get("/user/recommended-plans");
      if (res.data.success) {
        setRecommendedPlans(res.data.plans || []);
      }
    } catch (error) {
      console.error("Error fetching recommended plans:", error);
      setRecommendedPlans([]);
    } finally {
      setRecoLoading(false);
    }
  };

  const handleSwitchPlan = async (plan) => {
    if (!window.confirm(`Switching will terminate your current plan "${activePlan?.planName}" (${activePlan?.totalWorkoutsCompleted || 0}/30 days completed). Continue?`)) {
      return;
    }

    try {
      setSwitchingPlan(true);
      const res = await axiosInstance.post("/user/use-plan", {
        planId: plan._id
      });

      if (res.data.success) {
        const message = res.data.terminatedPlan 
          ? `🔄 Plan switched successfully!\n\n"${res.data.terminatedPlan.name}" (${res.data.terminatedPlan.daysCompleted}/30 days completed) has been moved to past plans.\n\n"${plan.name}" is now your active 30-day plan.\n\nYour fresh journey starts today!`
          : `🎉 Plan activated successfully!\n\n"${plan.name}" is now your active 30-day plan.\n\nYour journey starts today!`;
        
        alert(message);
        
        // Refresh plan data
        getActivePlan();
        
        // Dispatch plan activated event for dashboard refresh
        window.dispatchEvent(new CustomEvent('plan:activated', {
          detail: { plan: res.data.plan }
        }));
        
        // Close switching mode
        setSwitchingPlan(false);
      }
    } catch (error) {
      console.error("Error switching plan:", error);
      if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("Failed to switch plan. Please try again.");
      }
    } finally {
      setSwitchingPlan(false);
    }
  };

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
        alert(`🎉 Day ${dayNumber} completed!\n\nProgress: ${res.data.progress.totalCompleted}/30 days\nStreak: ${res.data.progress.currentStreak} days`);
        
        // Refresh plan data
        getActivePlan();
        getTodaysWorkout();
        getWorkoutHistory();
        
        // Dispatch workout completed event for dashboard refresh
        window.dispatchEvent(new CustomEvent('workout:completed', {
          detail: { dayNumber, progress: res.data.progress }
        }));
      }
    } catch (error) {
      console.error("Error completing plan workout:", error);
      alert("Failed to complete workout. Please try again.");
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
        const message = res.data.progress.allWorkoutsCompleted 
          ? `🎉 Day ${dayNumber} completed!\n\nAll workouts for this day are done!\nProgress: ${res.data.progress.totalCompleted}/30 days`
          : `✅ Workout completed!\n\nProgress: ${res.data.progress.totalCompleted}/30 days`;
        
        alert(message);
        
        // Refresh plan data
        getActivePlan();
        getTodaysWorkout();
        getWorkoutHistory();
        
        // Dispatch workout completed event for dashboard refresh
        window.dispatchEvent(new CustomEvent('workout:completed', {
          detail: { dayNumber, workoutIndex, progress: res.data.progress }
        }));
      }
    } catch (error) {
      console.error("Error completing individual workout:", error);
      alert("Failed to complete workout. Please try again.");
    }
  };

  const deleteWorkout = async (workoutId, isHistory = false) => {
    if (!window.confirm("Are you sure you want to delete this workout?")) {
      return;
    }

    try {
      if (isHistory) {
        await axiosInstance.delete(`/user/workout-history/${workoutId}`);
      } else {
        await axiosInstance.delete(`/user/workout/${workoutId}`);
      }
      alert("Workout deleted successfully!");
      getTodaysWorkout();
      getWorkoutHistory();
    } catch (error) {
      console.error("Error deleting workout:", error);
      alert("Failed to delete workout. Please try again.");
    }
  };

  useEffect(() => {
    getTodaysWorkout();
    getWorkoutHistory();
    getDailySteps();
    getActivePlan();
    fetchRecommendedPlans();
  // Refresh lists when a workout is completed from any card
  const handler = () => {
    getTodaysWorkout();
    getWorkoutHistory();
    getDailySteps();
  };
  window.addEventListener('workout:completed', handler);
  // Also refresh when new workouts are added from Dashboard
  window.addEventListener('workout:added', handler);
  return () => {
    window.removeEventListener('workout:completed', handler);
    window.removeEventListener('workout:added', handler);
  };
  }, [date]);

  // Listen for plan activation events
  useEffect(() => {
    const handlePlanActivated = () => {
      getActivePlan();
    };

    window.addEventListener('plan:activated', handlePlanActivated);
    return () => {
      window.removeEventListener('plan:activated', handlePlanActivated);
    };
  }, []);

  // Live clock for displaying current day/date/time
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 h-full bg-gradient-to-br from-slate-50 to-blue-50 overflow-y-auto">
      <div className="max-w-7xl mx-auto p-6">
        {/* Motivational Hero */}
        <div className="mb-6">
          <div className="rounded-2xl gradient-primary text-white p-6 flex items-center justify-between shadow-modern-lg">
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
            <Card className="bg-white shadow-modern border-0 card-hover sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <div className="gradient-primary p-2 rounded-xl mr-3">
                    <CalendarDays className="h-5 w-5 text-white" />
                  </div>
                  Select Date
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">Choose a date to view your workouts</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-300 transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                  <div className="text-xs text-gray-500">
                    {`Showing workouts for ${new Date(date).toLocaleDateString()} (${new Date(date).toLocaleDateString(undefined, { weekday: 'long' })})`}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <DumbbellIcon className="h-4 w-4 text-indigo-600"/>
                    Tip: Mark workouts completed to move them into history.
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Steps Tracking Card */}
            <Card className="bg-white shadow-modern border-0 card-hover mt-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <div className="gradient-green p-2 rounded-xl mr-3">
                    <Footprints className="h-5 w-5 text-white" />
                  </div>
                  Daily Steps
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">Track your daily walking activity</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Steps Display */}
                  <div className="text-center">
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {stepsLoading ? (
                        <div className="animate-pulse bg-gray-200 h-12 w-32 mx-auto rounded"></div>
                      ) : (
                        dailySteps.toLocaleString()
                      )}
                    </div>
                    <div className="text-sm text-gray-500">steps today</div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min((dailySteps / 10000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 text-center">
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
                    <div className="text-xs text-gray-500 text-center">
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
                  <div className="pt-3 border-t border-gray-100">
                    <Button
                      onClick={saveDailySteps}
                      className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                      disabled={stepsLoading || dailySteps === 0}
                    >
                      <Footprints className="h-4 w-4 mr-2" />
                      Save Daily Steps
                    </Button>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Save your steps to track progress across all charts
                    </p>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {Math.round(dailySteps * 0.0005)} km
                      </div>
                      <div className="text-xs text-gray-500">Distance</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {Math.round(dailySteps * 0.04)} cal
                      </div>
                      <div className="text-xs text-gray-500">Burned</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Plan Section */}
            {activePlan && (
              <Card className="bg-white shadow-modern border-0 card-hover mt-6">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                        <div className="gradient-primary p-2 rounded-xl mr-3">
                          <Target className="h-5 w-5 text-white" />
                        </div>
                        Active Plan
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-2">
                        {activePlan.planName} • {activePlan.totalWorkoutsCompleted}/30 days completed
                      </p>
                    </div>
                    <Button
                      onClick={() => setSwitchingPlan(true)}
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Switch Plan
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Progress</span>
                      <span>{Math.round((activePlan.totalWorkoutsCompleted / 30) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-500"
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
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">Day {dayNumber}: {todayWorkout.weekday}</h3>
                              <p className="text-sm text-gray-600">{todayWorkout.workoutName}</p>
                            </div>
                            {todayWorkout.completed ? (
                              <div className="flex items-center text-green-600">
                                <CheckCircle className="h-5 w-5 mr-1" />
                                <span className="text-sm font-medium">Completed</span>
                              </div>
                            ) : (
                              <Button
                                onClick={() => completePlanWorkout(dayNumber)}
                                size="sm"
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                          
                          {/* Individual Workouts */}
                          {todayWorkout.workouts && todayWorkout.workouts.length > 0 && (
                            <div className="space-y-3">
                              <p className="text-sm font-medium text-gray-700">Today's Workouts:</p>
                              <div className="space-y-2">
                                {todayWorkout.workouts.map((workout, idx) => (
                                  <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                                    <div className="flex items-center justify-between mb-2">
                                      <div>
                                        <h4 className={`font-medium ${workout.completed ? "line-through text-gray-400" : "text-gray-900"}`}>
                                          {workout.name}
                                        </h4>
                                        <div className="text-xs text-gray-500">
                                          {workout.duration} min • ~{workout.estimatedCalories} cal
                                        </div>
                                      </div>
                                      <div>
                                        {!workout.completed ? (
                                          <Button
                                            onClick={() => completeIndividualWorkout(dayNumber, idx)}
                                            size="sm"
                                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                          >
                                            Complete
                                          </Button>
                                        ) : (
                                          <div className="flex items-center text-green-600">
                                            <CheckCircle className="h-4 w-4 mr-1" />
                                            <span className="text-sm font-medium">Done</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    
                                    {workout.exercises && workout.exercises.length > 0 && (
                                      <div className="space-y-1">
                                        <p className="text-xs font-medium text-gray-600">Exercises:</p>
                                        <div className="space-y-1">
                                          {workout.exercises.slice(0, 2).map((exercise, exerciseIdx) => (
                                            <div key={exerciseIdx} className="text-xs text-gray-500 flex justify-between">
                                              <span>{exercise.name}</span>
                                              <span>{exercise.sets}x{exercise.reps} {exercise.weight > 0 && `${exercise.weight}kg`}</span>
                                            </div>
                                          ))}
                                          {workout.exercises.length > 2 && (
                                            <p className="text-xs text-gray-400">+{workout.exercises.length - 2} more</p>
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
                              <p className="text-sm font-medium text-gray-700">Exercises:</p>
                              <div className="space-y-1">
                                {todayWorkout.exercises.slice(0, 3).map((exercise, idx) => (
                                  <div key={idx} className="text-sm text-gray-600 flex justify-between">
                                    <span>{exercise.name}</span>
                                    <span>{exercise.sets}x{exercise.reps} {exercise.weight > 0 && `${exercise.weight}kg`}</span>
                                  </div>
                                ))}
                                {todayWorkout.exercises.length > 3 && (
                                  <p className="text-xs text-gray-500">+{todayWorkout.exercises.length - 3} more exercises</p>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-3 pt-3 border-t border-indigo-200">
                            <div className="flex items-center text-sm text-gray-600">
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
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 text-center">
                          <div className="flex items-center justify-center text-green-600 mb-2">
                            <CheckCircle className="h-6 w-6 mr-2" />
                            <span className="font-semibold">Plan Completed!</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Congratulations! You've completed your 30-day journey.
                          </p>
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-center py-4 text-gray-500">
                          <p className="text-sm">Plan starts in {dayNumber} days</p>
                        </div>
                      );
                    }
                  })()}

                  {/* Plan Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-indigo-600">
                        {activePlan.currentStreak}
                      </div>
                      <div className="text-xs text-gray-500">Current Streak</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-purple-600">
                        {activePlan.totalCaloriesBurned}
                      </div>
                      <div className="text-xs text-gray-500">Total Calories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">
                        {30 - activePlan.totalWorkoutsCompleted}
                      </div>
                      <div className="text-xs text-gray-500">Days Left</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            

            {/* Plan Switching Section */}
            {switchingPlan && (
              <Card className="bg-white shadow-modern border-0 card-hover mt-6">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                      <div className="gradient-primary p-2 rounded-xl mr-3">
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
                  <p className="text-sm text-gray-600 mt-2">
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
            <div className="bg-white rounded-2xl shadow-modern-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Workouts</h1>
                  <p className="text-gray-600 mt-1">Track and manage today’s session. Finish strong.</p>
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
                  <div className="gradient-primary text-white px-4 py-2 rounded-full text-sm font-medium">
                    {todaysWorkouts.length} workouts
                  </div>
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center py-16">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading workouts...</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Current Workouts */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Clock className="h-5 w-5 mr-2 text-indigo-600" />
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
                          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <CalendarDays className="h-12 w-12 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">No workouts found</h3>
                          <p className="text-gray-500 mb-4">
                            {date ? 'No workouts found for the selected date' : 'No workouts logged yet'}
                          </p>
                          <div className="text-sm text-gray-400">
                            {date ? 'Try selecting a different date' : 'Start by adding your first workout from the dashboard'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 30-Day Calendar View */}
                  {activePlan && (
                    <Card className="bg-white shadow-modern border-0 card-hover">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                          <div className="gradient-primary p-2 rounded-xl mr-3">
                            <CalendarDays className="h-5 w-5 text-white" />
                          </div>
                          30-Day Schedule
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-2">
                          Complete workout schedule for your active plan
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {activePlan.dayMapping && activePlan.dayMapping.map((day, index) => {
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
                                    ? 'border-indigo-500 bg-indigo-50 shadow-lg'
                                    : day.completed
                                    ? 'border-green-500 bg-green-50'
                                    : isPast
                                    ? 'border-gray-300 bg-gray-50'
                                    : 'border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className={`text-sm font-semibold ${
                                      isToday ? 'text-indigo-700' : day.completed ? 'text-green-700' : 'text-gray-700'
                                    }`}>
                                      Day {day.dayNumber}
                                    </span>
                                    {isToday && (
                                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                                        Today
                                      </span>
                                    )}
                                  </div>
                                  {day.completed && (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  )}
                                </div>
                                
                                <div className="text-xs font-medium text-gray-600 mb-1">
                                  {day.weekday}
                                </div>
                                
                                <div className="text-xs text-gray-500 mb-2">
                                  {new Date(day.date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric' 
                                  })}
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="text-sm font-medium text-gray-800 truncate">
                                    {day.workoutName}
                                  </div>
                                  
                                  {day.workouts && day.workouts.length > 0 && (
                                    <div className="text-xs text-gray-500">
                                      {day.workouts.length} workout{day.workouts.length !== 1 ? 's' : ''}
                                    </div>
                                  )}
                                  
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>{day.totalDuration} min</span>
                                    <span>{day.caloriesBurned} cal</span>
                                  </div>
                                </div>
                                
                                {/* Individual workouts preview */}
                                {day.workouts && day.workouts.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    {day.workouts.slice(0, 2).map((workout, workoutIdx) => (
                                      <div key={workoutIdx} className={`text-xs p-1 rounded ${
                                        workout.completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                      }`}>
                                        <div className="flex items-center justify-between">
                                          <span className="truncate">{workout.name}</span>
                                          {workout.completed && (
                                            <CheckCircle className="h-3 w-3 text-green-600" />
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                    {day.workouts.length > 2 && (
                                      <div className="text-xs text-gray-400 text-center">
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
                                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-xs py-1"
                                    >
                                      Mark Complete
                                    </Button>
                                  </div>
                                )}

                                {day.completed && (
                                  <div className="mt-3 text-center">
                                    <div className="flex items-center justify-center text-green-600 text-xs font-medium">
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
                        <div className="mt-6 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-indigo-600">
                                {activePlan.totalWorkoutsCompleted}
                              </div>
                              <div className="text-xs text-gray-500">Completed</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-orange-600">
                                {activePlan.totalCaloriesBurned}
                              </div>
                              <div className="text-xs text-gray-500">Calories</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {activePlan.currentStreak}
                              </div>
                              <div className="text-xs text-gray-500">Streak</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-purple-600">
                                {30 - activePlan.totalWorkoutsCompleted}
                              </div>
                              <div className="text-xs text-gray-500">Days Left</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Workout History */}
                  {showHistory && (
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                        Workout History
                      </h2>
                      {historyLoading ? (
                        <div className="flex justify-center items-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
                              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                <History className="h-8 w-8 text-gray-400" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">No workout history</h3>
                              <p className="text-gray-500 text-sm">
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
  );
};

export default Workouts;