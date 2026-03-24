/*
  components/AddWorkout.jsx
  Purpose: Capture a new workout using a simple markdown-like template; provides quick examples.
  Props:
    - workout (string), setWorkout(fn), addNewWorkout(fn), buttonLoading(boolean)
*/
import React, { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Plus, Loader2, Zap, Clock, Target, Dumbbell, Heart, Activity, Bed, BicepsFlexed, Flame } from "lucide-react";

const AddWorkout = ({ workout, setWorkout, addNewWorkout, buttonLoading }) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);

  const exampleWorkouts = [
    {
      title: "Chest (Day 1)",
      content: `#Chest
-Bench press
-3 setsX12 reps
-40 kg
-60 min`,
      icon: Dumbbell,
      calories: "~280 cal"
    },
    {
      title: "Back & Core (Day 2)",
      content: `#Back & Core
-Bent-over rows
-3 setsX12 reps
-30 kg
-60 min`,
      icon: Dumbbell,
      calories: "~310 cal"
    },
    {
      title: "Yoga Flow (Day 3)",
      content: `#Yoga
-Sun salutations
-1 setsX1 reps
-0 kg
-45 min`,
      icon: Heart,
      calories: "~180 cal"
    },
    {
      title: "Shoulders & Traps (Day 4)",
      content: `#Shoulders & Traps
-Military press
-3 setsX12 reps
-20 kg
-60 min`,
      icon: BicepsFlexed,
      calories: "~280 cal"
    },
    {
      title: "Legs (Day 5)",
      content: `#Legs
-Back squats
-3 setsX10 reps
-60 kg
-60 min`,
      icon: Dumbbell,
      calories: "~360 cal"
    },
    {
      title: "Core & Abs (Day 6)",
      content: `#Core
-Plank variations
-3 setsX1 reps
-0 kg
-30 min`,
      icon: Target,
      calories: "~200 cal"
    },
    {
      title: "Stretching (Day 7)",
      content: `#Stretching
-Full body stretch
-1 setsX1 reps
-0 kg
-30 min`,
      icon: Activity,
      calories: "~120 cal"
    }
  ];

  return (
    <Card className="glass-panel border-0 card-hover">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-text flex items-center">
          <div className="gradient-primary shadow-[0_0_10px_var(--color-primary)] p-2 rounded-xl mr-3">
            <Plus className="h-5 w-5 text-white" />
          </div>
          Add New Workout
        </CardTitle>
        <p className="text-sm text-muted mt-2">Log your workout details and track your progress</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="workout" className="text-sm font-semibold text-text">
              Workout Details
            </Label>
            {workout.trim() && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setWorkout("");
                  setTimeout(() => textareaRef.current?.focus(), 0);
                }}
                className="h-8 px-2 text-xs"
                aria-label="Clear workout input"
              >
                Clear
              </Button>
            )}
          </div>
          <div className="relative">
            <Textarea
              id="workout"
              placeholder="Enter your workout details...
Example:
#Legs
-Back Squat
-5 setsX15 reps
-30 kg
-10 min"
              value={workout}
              onChange={(e) => setWorkout(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              ref={textareaRef}
              className={`min-h-[140px] resize-none transition-all duration-200 input-dark ${
                isFocused ? 'ring-2 ring-primary border-primary/50' : ''
              }`}
            />
            {isFocused && (
              <div className="absolute -top-2 right-2 bg-primary/20 border border-primary/30 text-primary px-2 py-1 rounded-full text-xs font-medium">
                <Zap className="h-3 w-3 inline mr-1" />
                Live
              </div>
            )}
          </div>
        </div>

        {/* Quick Examples (templates only; hidden once typing starts) */}
        {!workout.trim() && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-text">Quick Examples</Label>
              <span className="text-xs text-muted">Templates only — disappear once you start typing</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {exampleWorkouts.map((example, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setWorkout(example.content);
                    setTimeout(() => textareaRef.current?.focus(), 0);
                  }}
                  className="text-left p-3 rounded-lg border border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all duration-200 group"
                  aria-label={`Use template: ${example.title}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <example.icon className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-muted group-hover:text-text">
                        {example.title}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-muted/70 group-hover:text-primary">
                      <Flame className="h-3 w-3" />
                      <span>{example.calories}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        
        <Button 
          onClick={addNewWorkout} 
          disabled={buttonLoading || !workout.trim()}
          className="w-full gradient-primary hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50"
        >
          {buttonLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding Workout...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Workout
            </>
          )}
        </Button>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Clock className="h-4 w-4 text-primary" />
            </div>
            <div className="text-xs text-muted">Time</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Target className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-xs text-muted">Goals</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-xs text-muted">Progress</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddWorkout;
