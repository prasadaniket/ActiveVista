/*
  components/cards/AIRecoveryCard.jsx
  ActiveVista — AI Physiological Recovery & Fatigue Telemetry Card
  Connects to Python AI Microservice / Node Gateway (/api/ai/recovery)
*/
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Activity, ShieldCheck, Droplet, Flame, Clock, RefreshCw, Cpu } from "lucide-react";
import axiosInstance from "../../api/axiosInstance";
import { useToast } from "../ui/Toast";

const AIRecoveryCard = ({ profileData, dashboardData }) => {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const payload = {
        weight_kg: parseFloat(profileData?.weight) || 75.0,
        height_cm: parseFloat(profileData?.height) || 178.0,
        age: parseInt(profileData?.age) || 25,
        gender: profileData?.gender || "male",
        activity_level: profileData?.activityLevel || "moderate",
        weekly_workout_count: parseInt(dashboardData?.totalWorkouts) || 4,
        avg_session_duration_mins: 50,
        recent_intensity_rating: 7.5
      };

      const res = await axiosInstance.post("/ai/recovery", payload);
      if (res.data?.success && res.data?.data) {
        setTelemetry(res.data.data);
      }
    } catch (err) {
      console.warn("Could not fetch AI telemetry:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, [profileData, dashboardData]);

  if (!telemetry && !loading) return null;

  const getStatusColor = (score) => {
    if (score < 40) return "text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score < 70) return "text-primary border-primary/30 bg-primary/10";
    if (score < 85) return "text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-rose-400 border-rose-500/30 bg-rose-500/10";
  };

  return (
    <Card className="glass-card border border-primary/20 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-base font-display font-bold text-text">
              AI Physiological Telemetry
            </CardTitle>
            <p className="text-xs text-muted">Python FastAPI Intelligence Engine</p>
          </div>
        </div>

        <button
          onClick={fetchTelemetry}
          disabled={loading}
          className="p-2 rounded-lg bg-white/[0.03] border border-white/10 hover:border-primary/40 text-muted hover:text-text transition-all disabled:opacity-50"
          title="Recalculate Telemetry"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
        </button>
      </CardHeader>

      <CardContent className="space-y-5 pt-1">
        {/* Readiness Status Banner */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-2 border-primary/30 flex items-center justify-center font-display font-bold text-sm text-text">
                {telemetry?.fatigue_score || 0}%
              </div>
            </div>
            <div>
              <div className="text-xs text-muted uppercase tracking-wider font-semibold">Neuromuscular Fatigue</div>
              <div className="text-sm font-display font-bold text-text">
                {telemetry?.recovery_status || "Calculating Readiness..."}
              </div>
            </div>
          </div>

          <span className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${getStatusColor(telemetry?.fatigue_score || 0)}`}>
            {telemetry?.recommended_rest_hours || 24}h Recovery Window
          </span>
        </div>

        {/* Metabolic Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
              <Flame className="w-3.5 h-3.5 text-warm" />
              <span>BMR Output</span>
            </div>
            <div className="text-lg font-display font-bold text-text">{telemetry?.bmr_kcal || 1750} <span className="text-xs font-normal text-muted">kcal</span></div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
              <Activity className="w-3.5 h-3.5 text-primary" />
              <span>TDEE Burn</span>
            </div>
            <div className="text-lg font-display font-bold text-text">{telemetry?.tdee_kcal || 2450} <span className="text-xs font-normal text-muted">kcal</span></div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
              <Droplet className="w-3.5 h-3.5 text-accent" />
              <span>Hydration</span>
            </div>
            <div className="text-lg font-display font-bold text-text">{telemetry?.hydration_target_liters || 3.2} <span className="text-xs font-normal text-muted">L / day</span></div>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Protein Target</span>
            </div>
            <div className="text-lg font-display font-bold text-text">{telemetry?.daily_protein_target_grams || 150} <span className="text-xs font-normal text-muted">g / day</span></div>
          </div>
        </div>

        {/* Tactical Recommendation Bullet */}
        {telemetry?.tactical_recommendations?.length > 0 && (
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/15 space-y-1.5">
            <div className="text-xs font-bold text-primary uppercase tracking-wider">Tactical Directive</div>
            <p className="text-xs text-text/80 leading-relaxed">
              {telemetry.tactical_recommendations[0]}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIRecoveryCard;
