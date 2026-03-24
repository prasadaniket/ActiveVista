/*
  components/cards/Recom.jsx
  Purpose: Show recommended workout plans with activation flow and confirmation if a plan is active.
  Behavior:
    - Activates plan via POST /user/use-plan
    - Emits plan:activated and optionally calls refreshActivePlan
    - Displays Week 1 preview and weekly summary
*/
import React, { useState } from "react";
import { Flame, Clock, Target, Calendar, Users, Zap, TrendingUp, AlertTriangle, CheckCircle, X } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { useToast } from "../ui/Toast";

const Recom = ({ recommendedPlans = [], recoLoading = false, onUsePlan, getWeekOneDays, activePlan = null, refreshActivePlan }) => {
  const { addToast } = useToast();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isActivating, setIsActivating] = useState(false);

  const handleUsePlan = async (plan) => {
    setSelectedPlan(plan);
    
    // Check if user already has an active plan
    if (activePlan) {
      setShowConfirmDialog(true);
    } else {
      await activatePlan(plan);
    }
  };

  const activatePlan = async (plan) => {
    setIsActivating(true);
    try {
      // Call the backend API to activate the plan
      const response = await axiosInstance.post("/user/use-plan", {
        planId: plan._id
      });

      if (response.data.success) {
        // Show success message with plan switching info
        const message = response.data.terminatedPlan 
          ? `"${response.data.terminatedPlan.name}" (${response.data.terminatedPlan.daysCompleted}/30 days) moved to past plans. "${plan.name}" is now active.`
          : `"${plan.name}" is now your active 30-day plan. Your journey starts today!`;
        
        addToast({ type: "success", title: "Plan Activated", message });
        
        // Refresh the active plan in Dashboard
        if (refreshActivePlan) {
          refreshActivePlan();
        }
        
        // Dispatch plan activated event for other components
        window.dispatchEvent(new CustomEvent('plan:activated', {
          detail: { plan: response.data.plan }
        }));
        
        // Also call the original onUsePlan if provided
        if (onUsePlan) {
          onUsePlan(plan);
        }
      }
    } catch (error) {
      console.error("Error activating plan:", error);
      if (error.response?.data?.message) {
        addToast({ type: "error", title: "Activation Failed", message: error.response.data.message });
      } else {
        addToast({ type: "error", title: "Activation Failed", message: "Failed to activate plan. Please try again." });
      }
    } finally {
      setIsActivating(false);
      setShowConfirmDialog(false);
    }
  };

  const confirmSwitchPlan = async () => {
    if (selectedPlan) {
      await activatePlan(selectedPlan);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-text">Recommended Plans</h2>
        <div className="text-sm text-muted">Personalized templates to get you started</div>
      </div>

      {/* Active Plan Status */}
      {activePlan && (
        <div className="mb-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-text">Active Plan: {activePlan.planName}</h3>
                <p className="text-sm text-muted">
                  Day {activePlan.totalWorkoutsCompleted + 1} of 30 • {activePlan.currentStreak} day streak
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {Math.round((activePlan.totalWorkoutsCompleted / 30) * 100)}%
              </div>
              <div className="text-xs text-muted">Complete</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-white/10 rounded-full h-2">
              <div 
                className="gradient-primary shadow-[0_0_10px_var(--color-primary)] h-2 rounded-full transition-all duration-500"
                style={{ width: `${(activePlan.totalWorkoutsCompleted / 30) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {recoLoading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {(!Array.isArray(recommendedPlans) || recommendedPlans.length === 0) ? (
            <div className="text-center py-10">
              <p className="text-muted">No recommendations yet. Log a few workouts and we will suggest a plan tailored to you.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {recommendedPlans.map((plan, idx) => (
                <div key={plan._id || idx} className="border border-white/10 rounded-xl p-4 hover:shadow-[0_0_15px_rgba(18,97,160,0.3)] hover:border-primary/50 transition-all duration-300 bg-white/[0.02]">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-text mb-1">{plan.name}</h3>
                      <p className="text-sm text-muted mb-2">{plan.description}</p>
                      <div className="flex items-center space-x-2 text-xs text-muted">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>30 days</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{plan.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${plan.difficulty === 'beginner' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : plan.difficulty === 'intermediate' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {plan.difficulty}
                    </span>
                  </div>

                  {/* Week 1 preview */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-text">Week 1 Preview</span>
                    </div>
                    {getWeekOneDays(plan).slice(0, 7).map((day) => {
                      const totalCalories = Array.isArray(day.workouts) 
                        ? day.workouts.reduce((sum, workout) => sum + (workout.estimatedCalories || 0), 0)
                        : 0;
                      const workoutCount = Array.isArray(day.workouts) ? day.workouts.length : 0;
                      return (
                        <div key={`${plan._id}-${day.dayNumber}`} className="flex items-center justify-between bg-gradient-to-r from-white/5 to-white/10 rounded-lg px-3 py-2 hover:from-primary/10 hover:to-accent/10 transition-colors">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-text">Day {day.dayNumber}</div>
                            <div className="text-xs text-muted/70">{day.dayName}</div>
                          </div>
                          <div className="flex items-center space-x-3 text-xs">
                            <div className="flex items-center space-x-1 text-muted">
                              <Zap className="h-3 w-3" />
                              <span>{workoutCount} workout{workoutCount !== 1 ? 's' : ''}</span>
                            </div>
                            {totalCalories > 0 && (
                              <div className="flex items-center space-x-1 text-orange-500">
                                <Flame className="h-3 w-3" />
                                <span>~{totalCalories} cal</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Weekly summary */}
                  <div className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Flame className="h-4 w-4 text-primary" />
                        <span className="font-medium text-text">Weekly Summary</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          {getWeekOneDays(plan).reduce((sum, day) => 
                            sum + (Array.isArray(day.workouts) 
                              ? day.workouts.reduce((daySum, workout) => daySum + (workout.estimatedCalories || 0), 0)
                              : 0), 0
                          )} cal
                        </div>
                        <div className="text-xs text-muted/70">estimated</div>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-muted">
                      <span>30-day structured plan</span>
                      <span>Monday start</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleUsePlan(plan)}
                    className="w-full btn-futuristic px-4 py-3 rounded-lg text-white text-sm font-medium flex items-center justify-center space-x-2"
                  >
                    <Target className="h-4 w-4" />
                    <span>Start 30-Day Plan</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50">
          <div className="glass-panel rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-xl font-bold text-text">Switch Plan?</h3>
              </div>
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-muted" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-muted mb-4">
                You currently have an active plan: <span className="font-semibold text-text">"{activePlan?.planName}"</span>
              </p>
              
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-text">Current Progress</span>
                  <span className="text-sm text-muted">{activePlan?.totalWorkoutsCompleted || 0}/30 days</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="gradient-primary shadow-[0_0_10px_var(--color-primary)] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((activePlan?.totalWorkoutsCompleted || 0) / 30) * 100}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-muted mb-4">
                If you switch to <span className="font-semibold text-primary">"{selectedPlan?.name}"</span>, your current plan will be:
              </p>
              
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-medium text-orange-200/90">Automatically moved to Past Plans</span>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-medium text-orange-200/90">New 30-day plan starts fresh from today</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-orange-400" />
                  <span className="text-sm font-medium text-orange-200/90">All progress preserved in history</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 bg-white/5 hover:bg-white/10 text-text px-4 py-3 rounded-lg font-medium transition-colors border border-white/10"
                disabled={isActivating}
              >
                Cancel
              </button>
              <button
                onClick={confirmSwitchPlan}
                disabled={isActivating}
                className="flex-1 btn-futuristic text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isActivating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Switching...</span>
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4" />
                    <span>Switch Plan</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recom;


