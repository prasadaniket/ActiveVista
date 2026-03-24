/*
  ShowcaseSection.jsx — Dashboard preview with floating UI elements
*/
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Flame, Footprints, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollReveal from '../ScrollReveal';
import AnimatedCounter from '../AnimatedCounter';

const ShowcaseSection = ({ token }) => {
  return (
    <div className="relative py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Text */}
          <ScrollReveal variant="fadeLeft">
            <div>
              <span className="text-[10px] font-bold tracking-[0.5em] text-primary uppercase mb-4 block">
                Command Center
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-text mb-6 leading-tight">
                Your Fitness<br />
                <span className="text-gradient-electric">At a Glance</span>
              </h2>
              <p className="text-muted text-lg leading-relaxed mb-8">
                A powerful dashboard that puts every metric at your fingertips. 
                Track workouts, monitor calories, count steps, and follow 
                30-day smart plans — all in real-time.
              </p>
              <Link to={token ? "/dashboard" : "/auth"}>
                <motion.button
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-3 text-primary font-display font-bold text-sm uppercase tracking-wider group"
                >
                  {token ? "Open Dashboard" : "Get Started"}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </motion.button>
              </Link>
            </div>
          </ScrollReveal>

          {/* Right: Floating dashboard preview */}
          <ScrollReveal variant="fadeRight" delay={0.2}>
            <div className="relative">
              {/* Main dashboard card */}
              <div className="glass-hero p-6 relative">
                <div className="absolute inset-0 gradient-mesh opacity-20 rounded-[1.5rem]" />
                <div className="relative z-10">
                  {/* Mini header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                        <BarChart3 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-text">Weekly Overview</span>
                    </div>
                    <span className="text-xs text-muted">This week</span>
                  </div>

                  {/* Bar chart preview */}
                  <div className="flex items-end gap-2 h-32 mb-6">
                    {[40, 65, 45, 80, 55, 70, 90].map((height, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        transition={{ duration: 0.6, delay: i * 0.1 }}
                        viewport={{ once: true }}
                        className="flex-1 rounded-t-lg bg-gradient-to-t from-primary/60 to-primary"
                      />
                    ))}
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                      <div className="text-lg font-display font-bold text-primary">
                        <AnimatedCounter target={1247} duration={2000} />
                      </div>
                      <div className="text-[9px] text-muted uppercase tracking-wider">Calories</div>
                    </div>
                    <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                      <div className="text-lg font-display font-bold text-emerald-400">
                        <AnimatedCounter target={8432} duration={2000} />
                      </div>
                      <div className="text-[9px] text-muted uppercase tracking-wider">Steps</div>
                    </div>
                    <div className="bg-white/[0.03] rounded-xl p-3 text-center">
                      <div className="text-lg font-display font-bold text-accent">
                        <AnimatedCounter target={12} duration={2000} />
                      </div>
                      <div className="text-[9px] text-muted uppercase tracking-wider">Workouts</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating mini-cards */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-6 -right-6 glass-card p-4 shadow-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-text">Streak</div>
                    <div className="text-xs text-muted">7 days 🔥</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-4 -left-6 glass-card p-4 shadow-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-text">Progress</div>
                    <div className="text-xs text-emerald-400">+23% this month</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};

export default ShowcaseSection;
