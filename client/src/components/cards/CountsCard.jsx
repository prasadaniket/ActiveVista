/*
  components/cards/CountsCard.jsx
  Purpose: Generic KPI/metric card with responsive gradient hover, progress bar and trend icon.
  Inputs:
    - item: { name, value(key), icon, gradient? }
    - data: dashboard mapped data
    - stepsData: used to override totalSteps with today's steps
*/
import React from "react";
import { Card, CardContent } from "../ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

const CountsCard = ({ item, data, stepsData, index = 0 }) => {
  let value = data?.[item.value] || 0;
  
  // If this is the totalSteps card and we have steps data, use the current day's steps
  if (item.value === "totalSteps" && stepsData?.weeklySteps) {
    // Get today's steps from the weekly data
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short' });
    const todaySteps = stepsData.weeklySteps.find(day => day.day === today);
    value = todaySteps ? todaySteps.steps : 0;
  }
  
  // Use gradient from item data or fallback to index-based
  const getGradientClass = () => {
    return item.gradient || [
      "gradient-primary",
      "gradient-blue", 
      "gradient-green",
      "gradient-orange"
    ][index % 4];
  };

  // Get appropriate icon background color
  const getIconBgClass = () => {
    const bgClasses = [
      "bg-indigo-100",
      "bg-blue-100",
      "bg-green-100", 
      "bg-orange-100"
    ];
    return bgClasses[index % bgClasses.length];
  };

  // Mock trend data (you can replace with real data)
  const trend = Math.random() > 0.5 ? 'up' : 'down';
  const trendValue = Math.floor(Math.random() * 20) + 1;

  return (
    <Card className="group relative overflow-hidden bg-white shadow-modern border-0 card-hover">
      <div className={`absolute inset-0 ${getGradientClass()} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{item.name}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            <div className="flex items-center space-x-1">
              {trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                +{trendValue}%
              </span>
              <span className="text-sm text-gray-500">vs last week</span>
            </div>
          </div>
          <div className={`w-14 h-14 rounded-2xl ${getIconBgClass()} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
            <item.icon className="h-7 w-7 text-gray-700" />
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full ${getGradientClass()} transition-all duration-500`}
            style={{ width: `${Math.min((value / 1000) * 100, 100)}%` }}
          ></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CountsCard;
