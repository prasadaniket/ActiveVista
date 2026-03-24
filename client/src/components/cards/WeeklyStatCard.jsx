/*
  components/cards/WeeklyStatCard.jsx
  Purpose: Weekly activity bar chart, combining workout intensity with steps-derived calories.
  Inputs:
    - data.weeklyStats: [{ day, value(0-100) }]
    - stepsData.weeklyStats: steps % per day, converted to calories and blended
*/
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar, Flame } from "lucide-react";

const WeeklyStatCard = ({ data, stepsData }) => {
  // Expect data.weeklyStats as [{ day: 'Mon', value: number(0-100) }, ...]
  const defaultStats = [
    { day: "Mon", value: 0 },
    { day: "Tue", value: 0 },
    { day: "Wed", value: 0 },
    { day: "Thu", value: 0 },
    { day: "Fri", value: 0 },
    { day: "Sat", value: 0 },
    { day: "Sun", value: 0 },
  ];

  // Use server data if available, otherwise use defaults
  let weeklyStats = Array.isArray(data?.weeklyStats) && data.weeklyStats.length > 0
    ? data.weeklyStats
    : defaultStats;

  // Combine with steps data if available
  if (stepsData?.weeklyStats && Array.isArray(stepsData.weeklyStats)) {
    weeklyStats = weeklyStats.map((stat, index) => {
      const stepsStat = stepsData.weeklyStats[index];
      if (stepsStat) {
        // Combine workout calories and steps calories (steps * 0.04)
        const stepsCalories = Math.round((stepsStat.value / 100) * 10000 * 0.04); // Convert percentage back to steps then to calories
        const combinedValue = Math.min(stat.value + (stepsCalories / 5), 100); // Cap at 100%
        return {
          ...stat,
          value: Math.round(combinedValue)
        };
      }
      return stat;
    });
  }

  const maxValue = Math.max(1, ...weeklyStats.map((s) => Number(s.value) || 0));
  const avg = Math.round(
    weeklyStats.reduce((sum, s) => sum + (Number(s.value) || 0), 0) / weeklyStats.length
  );

  return (
    <Card className="glass-panel border-0 card-hover">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-text flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-primary" />
            Weekly Activity
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div className="gradient-primary shadow-[0_0_10px_var(--color-primary)] opacity-90 text-white px-3 py-1 rounded-full text-sm font-medium">
              {avg}% avg
            </div>
            <div className="flex items-center space-x-1 text-orange-600 text-sm">
              <Flame className="h-4 w-4" />
              <span>Calories</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Bar graph */}
        <div className="flex items-end justify-between h-40 gap-3">
          {weeklyStats.map((stat, idx) => {
            const val = Math.max(0, Math.min(100, Number(stat.value) || 0));
            const heightPct = maxValue > 0 ? (val / maxValue) * 100 : 0;
            return (
              <div key={`${stat.day}-${idx}`} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-white/5 rounded-t-md rounded-b h-32 relative overflow-hidden">
                  <div
                    className="absolute bottom-0 left-0 right-0 gradient-primary rounded-t-md transition-all duration-700 shadow-[0_-5px_15px_rgba(18,97,160,0.5)]"
                    style={{ height: `${heightPct}%` }}
                  >
                  </div>
                </div>
                <div className="mt-2 text-xs font-medium text-muted">{stat.day}</div>
                <div className="text-[10px] text-muted/50">{val}%</div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">This week's progress</span>
            <div className="flex items-center space-x-4">
              <span className="font-semibold text-primary">
                {weeklyStats.filter((s) => (Number(s.value) || 0) > 0).length}/7 days logged
              </span>
              <div className="flex items-center space-x-1 text-orange-600">
                <Flame className="h-3 w-3" />
                <span className="text-xs">
                  {Math.round(weeklyStats.reduce((sum, s) => sum + (Number(s.value) || 0), 0) * 5)} cal
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyStatCard;
