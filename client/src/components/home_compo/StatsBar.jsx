/*
  StatsBar.jsx — Animated stat counter reveal on scroll
*/
import React from 'react';
import { Dumbbell, Flame, Footprints, Users } from 'lucide-react';
import ScrollReveal, { StaggerContainer, StaggerItem } from '../ScrollReveal';
import AnimatedCounter from '../AnimatedCounter';

const stats = [
  { icon: Users, value: 50000, suffix: '+', label: 'Active Users', color: 'text-primary', bg: 'bg-primary/10' },
  { icon: Dumbbell, value: 2000000, suffix: '+', label: 'Workouts Tracked', color: 'text-accent', bg: 'bg-accent/10' },
  { icon: Flame, value: 500, suffix: 'M+', label: 'Calories Burned', color: 'text-warm', bg: 'bg-warm/10' },
  { icon: Footprints, value: 10, suffix: 'B+', label: 'Steps Counted', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

const StatsBar = () => {
  return (
    <div className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-void via-abyss to-void" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <StaggerContainer staggerDelay={0.15} className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <StaggerItem key={i} variant="scaleUp">
              <div className="text-center group cursor-default">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl ${stat.bg} border border-white/5 flex items-center justify-center group-hover:scale-110 group-hover:border-primary/20 transition-all duration-500`}>
                  <stat.icon className={`w-7 h-7 ${stat.color}`} />
                </div>
                <div className="text-3xl md:text-4xl font-display font-bold text-text mb-2">
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} duration={2500} />
                </div>
                <div className="text-[10px] font-bold tracking-[0.3em] text-muted uppercase">{stat.label}</div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
};

export default StatsBar;
