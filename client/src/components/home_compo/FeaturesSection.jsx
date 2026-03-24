/*
  FeaturesSection.jsx — Staggered feature cards with 3D hover
*/
import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Zap, Target, Shield, Brain, Smartphone } from 'lucide-react';
import ScrollReveal, { StaggerContainer, StaggerItem } from '../ScrollReveal';

const features = [
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description: 'Live dashboards tracking every metric that matters — calories, reps, duration, and progression curves.',
    gradient: 'from-primary to-primary-light',
  },
  {
    icon: Zap,
    title: 'Smart Workout Plans',
    description: '30-day intelligent programs that adapt to your fitness level and evolve as you progress.',
    gradient: 'from-accent to-primary',
  },
  {
    icon: Target,
    title: 'Goal Tracking',
    description: 'Set ambitious targets and watch your progress unfold with visual completion trackers and streaks.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Brain,
    title: 'AI Recommendations',
    description: 'Personalized plan suggestions based on your goals, experience, and available equipment.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: Smartphone,
    title: 'Steps Integration',
    description: 'Log daily steps, track weekly trends, and see how your walking activity contributes to your goals.',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Bank-grade encryption protects your fitness journey. Your data is yours — always.',
    gradient: 'from-rose-500 to-red-500',
  },
];

const FeaturesSection = () => {
  return (
    <div className="relative py-32 overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[200px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-0 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <ScrollReveal variant="fadeUp" className="text-center mb-20">
          <span className="text-[10px] font-bold tracking-[0.5em] text-primary uppercase mb-4 block">
            System Capabilities
          </span>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-text mb-6 leading-tight">
            Everything You Need<br />
            <span className="text-gradient-blue">To Evolve</span>
          </h2>
          <p className="text-muted text-lg max-w-2xl mx-auto">
            A complete fitness intelligence system designed to track, analyze, and amplify 
            every aspect of your training.
          </p>
        </ScrollReveal>

        <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <StaggerItem key={i} variant="fadeUp">
              <motion.div
                whileHover={{ y: -8, rotateX: 2, rotateY: -2 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="glass-hero p-8 group cursor-default h-full"
                style={{ transformStyle: 'preserve-3d', perspective: '800px' }}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg transition-all duration-500`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-display font-bold text-text mb-3 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted leading-relaxed text-sm">
                  {feature.description}
                </p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
};

export default FeaturesSection;
