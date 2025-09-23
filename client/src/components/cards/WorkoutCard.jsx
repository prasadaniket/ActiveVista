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

  const completeWorkout = async () => {
    try {
      if (!workout._id) return;
      await axiosInstance.post(`/user/workout/${workout._id}/complete`);
      window.dispatchEvent(new CustomEvent('workout:completed'));
      alert('Workout completed!');
    } catch (e) {
      console.error('Failed to complete workout', e);
      if (e?.response) {
        const status = e.response.status;
        if (status === 404) {
          alert('Workout not found. Please refresh the page.');
        } else if (status >= 500) {
          alert('Server error. Please try again later.');
        } else {
          alert(e.response.data?.message || 'Unexpected error while completing workout.');
        }
      } else if (e?.request) {
        alert('Could not connect to server. Please ensure backend is running.');
      } else {
        alert(`Error: ${e.message}`);
      }
    }
  };
  
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
    <Card className="group bg-white shadow-modern border-0 card-hover overflow-hidden">
      <div className={`h-1 ${getWorkoutTypeColor(title)}`}></div>
      
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl ${getWorkoutTypeColor(title)} flex items-center justify-center text-white`}>
              {React.createElement(getWorkoutIcon(title), { className: "h-5 w-5" })}
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                {title}
              </CardTitle>
              <div className="flex items-center text-sm text-gray-500 mt-1">
                <Calendar className="h-4 w-4 mr-1" />
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
                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
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
              <div key={index} className="flex items-center text-sm text-gray-700 bg-gray-50 rounded-lg p-2 group-hover:bg-indigo-50 transition-colors">
                <div className="w-2 h-2 bg-indigo-500 rounded-full mr-3 flex-shrink-0"></div>
                <span className="truncate">{exercise}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <Zap className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No exercises recorded</p>
            </div>
          )}
        </div>
        
        {/* Workout Stats */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>
                {new Date(workout.date || workout.createdAt || Date.now()).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center">
              <Target className="h-3 w-3 mr-1" />
              <span>{isCompleted ? 'Successful' : 'In Process'}</span>
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            {isCompleted ? (
              <Button size="sm" className="bg-green-600 text-white px-3" disabled>
                Task Completed
              </Button>
            ) : (
              <Button size="sm" className="gradient-primary text-white px-3" onClick={completeWorkout}>
                Mark as Completed
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutCard;

