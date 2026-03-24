/*
  components/cards/WorkoutCard.jsx
  Purpose: Present a single workout (current or historical) with context, stats, and actions.
  Inputs:
    - workout: object supporting legacy (workoutString) and structured fields
    - onDelete(id): optional handler to delete workout
    - showDelete: toggle delete action
  Behavior:
    - Derives title/exercises from provided data
    - Allows marking a workout as completed (emits workout:completed)
*/
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Clock, Dumbbell, Target, Calendar, Zap, Heart, Activity, Trash2, BicepsFlexed, Bed } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../api/queries";
import { useToast } from "../ui/Toast";

const WorkoutCard = ({ workout, onDelete, showDelete = false }) => {
  if (!workout) return null;
  
  // Handle both old format (workoutString) and new format (direct properties)
  const getWorkoutData = () => {
    if (workout.workoutString) {
      // Old format - parse workoutString
      const lines = workout.workoutString.split('\n').filter(line => line.trim());
      const title = lines[0]?.replace('#', '') || "Workout";
      const exercises = lines.slice(1).map(line => line.replace('-', '').trim());
      return { title, exercises };
    } else {
      // New format - direct properties from backend
      return {
        title: workout.category || "Workout",
        exercises: [
          `Exercise: ${workout.workoutName || 'N/A'}`,
          `Sets: ${workout.sets || 0}, Reps: ${workout.reps || 0}`,
          `Weight: ${workout.weight || 0} kg`,
          `Duration: ${workout.duration || 0} min`,
          `Calories: ${workout.caloriesBurned || 0}`
        ]
      };
    }
  };
  
  const { title, exercises } = getWorkoutData();

  const isCompleted = Boolean(
    workout.completed || workout.status === 'completed' || workout.completedAt
  );

  const queryClient = useQueryClient();
  const { addToast } = useToast();

  const { mutate: completeWorkout, isPending: completing } = useMutation({
    mutationFn: async () => {
      if (!workout._id) throw new Error("Invalid workout ID");
      return await axiosInstance.post(`/user/workout/${workout._id}/complete`);
    },
    onSuccess: () => {
      window.dispatchEvent(new CustomEvent('workout:completed'));
      addToast({ type: "success", title: "Success", message: "Workout completed!" });
      queryClient.invalidateQueries({ queryKey: queryKeys.todaysWorkouts("") });
      queryClient.invalidateQueries({ queryKey: queryKeys.workoutHistory("") });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
    },
    onError: (e) => {
      console.error('Failed to complete workout', e);
      if (e?.response) {
        const status = e.response.status;
        if (status === 404) {
          addToast({ type: "error", title: "Not Found", message: "Workout not found. It may have already been completed." });
          // Force a refetch anyway to sync UI and remove the ghost workout
          queryClient.invalidateQueries({ queryKey: queryKeys.todaysWorkouts("") });
        } else if (status >= 500) {
          addToast({ type: "error", title: "Server Error", message: "Server error. Please try again later." });
        } else {
          addToast({ type: "error", title: "Error", message: e.response.data?.message || 'Unexpected error while completing workout.' });
        }
      } else if (e?.request) {
        addToast({ type: "error", title: "Network Error", message: "Could not connect to server. Please ensure backend is running." });
      } else {
        addToast({ type: "error", title: "Error", message: e.message });
      }
    }
  });
  
  // Get workout type color
  const getWorkoutTypeColor = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('cardio') || lowerTitle.includes('running')) return 'gradient-blue';
    if (lowerTitle.includes('strength') || lowerTitle.includes('upper') || lowerTitle.includes('lower')) return 'gradient-orange';
    if (lowerTitle.includes('legs') || lowerTitle.includes('squat')) return 'gradient-green';
    return 'gradient-primary';
  };

  const getWorkoutIcon = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('cardio') || lowerTitle.includes('running')) return Heart;
    if (lowerTitle.includes('strength') || lowerTitle.includes('upper')) return Dumbbell;
    if (lowerTitle.includes('legs') || lowerTitle.includes('squat')) return Dumbbell;
    if (lowerTitle.includes('arms') || lowerTitle.includes('triceps') || lowerTitle.includes('shoulder')) return BicepsFlexed;
    if (lowerTitle.includes('rest')) return Bed;
    if (lowerTitle.includes('yoga') || lowerTitle.includes('flexibility')) return Activity;
    return Zap;
  };
  
  return (
    <Card className="group glass-panel border-0 card-hover overflow-hidden">
      <div className={`h-1 ${getWorkoutTypeColor(title)} shadow-[0_0_10px_currentColor]`}></div>
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl ${getWorkoutTypeColor(title)} flex items-center justify-center text-white`}>
              {React.createElement(getWorkoutIcon(title), { className: "h-5 w-5" })}
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-text group-hover:text-primary transition-colors">
                {title}
              </CardTitle>
              <div className="flex items-center text-sm text-muted mt-1">
                <Calendar className="h-4 w-4 mr-1 text-primary/70" />
                {new Date(workout.date || workout.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className="gradient-primary text-white px-2 py-1 rounded-full text-xs font-medium">
              {isCompleted ? 'Close to the goal' : `${exercises.length} exercises`}
            </div>
            {showDelete && onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(workout._id)}
                className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-1"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {exercises.length > 0 ? (
            exercises.map((exercise, index) => (
              <div key={index} className="flex items-center text-sm text-muted bg-white/5 rounded-lg p-2 group-hover:bg-primary/10 transition-colors">
                <div className="w-2 h-2 gradient-primary rounded-full mr-3 flex-shrink-0"></div>
                <span className="truncate">{exercise}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <Zap className="h-8 w-8 text-muted/30 mx-auto mb-2" />
              <p className="text-sm text-muted">No exercises recorded</p>
            </div>
          )}
        </div>
        
        {/* Workout Stats */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-xs text-muted">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1 text-primary/70" />
              <span>
                {new Date(workout.date || workout.createdAt || Date.now()).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center">
              <Target className="h-3 w-3 mr-1 text-primary/70" />
              <span>{isCompleted ? 'Successful' : 'In Process'}</span>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            {isCompleted ? (
              <Button size="sm" className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 px-3 border border-emerald-500/20" disabled>
                Task Completed
              </Button>
            ) : (
              <Button size="sm" className="btn-futuristic text-white px-3" onClick={() => completeWorkout()} disabled={completing}>
                {completing ? "Completing..." : "Mark as Completed"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutCard;

