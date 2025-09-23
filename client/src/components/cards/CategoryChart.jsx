/*
  components/cards/CategoryChart.jsx
  Purpose: Display calories by category as a donut chart; always shows Cardio/Strength/Flexibility/Other.
  Inputs:
    - data.categories: [{ name, value }]
    - stepsData.weeklySteps: adds today's steps calories to Cardio
*/
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { PieChart } from "lucide-react";

const CategoryChart = ({ data, stepsData }) => {
  // Always show all 4 categories
  const defaults = [
    { name: "Cardio", value: 0, color: "#3b82f6" },
    { name: "Strength", value: 0, color: "#10b981" },
    { name: "Flexibility", value: 0, color: "#f59e0b" },
    { name: "Other", value: 0, color: "#ef4444" },
  ];

  // Start with defaults and update with server data
  let categories = [...defaults];

  // Update categories with server data if available
  if (Array.isArray(data?.categories) && data.categories.length > 0) {
    data.categories.forEach(serverCat => {
      const categoryIndex = categories.findIndex(cat => cat.name === serverCat.name);
      if (categoryIndex !== -1) {
        categories[categoryIndex].value = serverCat.value || 0;
      }
    });
  }

  // Add steps data to Cardio category (walking counts as cardio)
  if (stepsData?.weeklySteps) {
    // Get today's steps from the weekly data
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const todaySteps = stepsData.weeklySteps.find(day => day.day === today);
    const todayStepsCount = todaySteps ? todaySteps.steps : 0;
    
    if (todayStepsCount > 0) {
      const stepsCalories = Math.round(todayStepsCount * 0.04); // Convert steps to calories
      
      // Add to Cardio category
      const cardioIndex = categories.findIndex(cat => cat.name === "Cardio");
      if (cardioIndex !== -1) {
        categories[cardioIndex].value += stepsCalories;
      }
    }
  }

  const total = categories.reduce((sum, c) => sum + (Number(c.value) || 0), 0);
  const safeTotal = Math.max(total, 1); // avoid divide-by-zero

  // Donut settings
  const size = 160;
  const stroke = 20;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  // Build segments using strokeDasharray offsets
  let cumulative = 0;
  const segments = categories.map((c, idx) => {
    const val = Math.max(0, Number(c.value) || 0);
    const fraction = val / safeTotal;
    const length = fraction * circumference;
    const dashArray = `${length} ${circumference - length}`;
    const dashOffset = circumference - cumulative * circumference;
    cumulative += fraction;
    return { color: c.color, dashArray, dashOffset, name: c.name, value: val };
  });

  const most = [...categories].sort((a, b) => (b.value || 0) - (a.value || 0))[0];

  return (
    <Card className="bg-white shadow-modern border-0 card-hover">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
            <PieChart className="h-5 w-5 mr-2 text-indigo-600" />
            Workout Categories
          </CardTitle>
          <div className="gradient-secondary text-white px-3 py-1 rounded-full text-sm font-medium">
            {total} cal
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-6">
          {/* Donut */}
          <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {/* Background ring */}
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke="#e5e7eb"
                strokeWidth={stroke}
              />
              {/* Segments */}
              <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                {segments.map((s, i) => (
                  <circle
                    key={i}
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="transparent"
                    stroke={s.color}
                    strokeWidth={stroke}
                    strokeDasharray={s.dashArray}
                    strokeDashoffset={s.dashOffset}
                    strokeLinecap="butt"
                  />
                ))}
              </g>
            </svg>
            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-500">calories</div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 grid grid-cols-1 gap-3">
            {categories.map((c, idx) => {
              const pct = safeTotal > 0 ? Math.round(((Number(c.value) || 0) / safeTotal) * 100) : 0;
              return (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="inline-block w-3 h-3 rounded-sm" style={{ backgroundColor: c.color }} />
                    <span className="text-sm font-medium text-gray-900">{c.name}</span>
                  </div>
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold mr-1">{c.value} cal</span>
                    <span className="text-gray-400">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-indigo-600">{most?.value || 0} cal</div>
              <div className="text-gray-600">Top category</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{categories.length}</div>
              <div className="text-gray-600">Active categories</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CategoryChart;
