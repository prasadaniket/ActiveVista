/*
  HowItWorks.jsx — Timeline-style sequential reveal
*/
import React from 'react';
import { motion } from 'framer-motion';
import { UserPlus, BarChart3, Dumbbell, Trophy } from 'lucide-react';
import ScrollReveal, { StaggerContainer, StaggerItem } from '../ScrollReveal';

const steps = [
  {
    step: '01',
    icon: UserPlus,
    title: 'Create Your Profile',
    description: 'Sign up in seconds and tell us about your fitness level, goals, and available equipment.',
    gradient: 'from-primary to-primary-light',
  },
  {
    step: '02',
    icon: Dumbbell,
    title: 'Choose a Smart Plan',
    description: 'Pick from intelligently crafted 30-day workout plans or log your own custom sessions.',
    gradient: 'from-accent to-primary',
  },
  {
    step: '03',
    icon: BarChart3,
    title: 'Track Everything',
    description: 'Log workouts, steps, and calories. Watch your real-time analytics evolve every session.',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    step: '04',
    icon: Trophy,
    title: 'Achieve Your Goals',
    description: 'Build streaks, hit milestones, and watch as your data tells the story of your evolution.',
    gradient: 'from-amber-500 to-orange-500',
  },
];

const HowItWorks = () => {
  return (
    <div className="relative py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-void via-abyss/50 to-void" />
      
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        <ScrollReveal variant="fadeUp" className="text-center mb-20">
          <span className="text-[10px] font-bold tracking-[0.5em] text-primary uppercase mb-4 block">
            Getting Started
          </span>
          <h2 className="text-4xl md:text-6xl font-display font-bold text-text leading-tight">
            Four Steps to<br />
            <span className="text-gradient-warm">Transformation</span>
          </h2>
        </ScrollReveal>

        <div className="relative">
          {/* Vertical timeline line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-accent/30 to-primary/50 hidden md:block" />
          
          <StaggerContainer staggerDelay={0.2} className="space-y-12 md:space-y-20">
            {steps.map((step, i) => (
              <StaggerItem key={i} variant={i % 2 === 0 ? 'fadeRight' : 'fadeLeft'}>
                <div className={`flex items-center gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                  {/* Content */}
                  <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="glass-hero p-8 group">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="text-[10px] font-bold tracking-[0.3em] text-primary uppercase opacity-50">
                          Step {step.step}
                        </span>
                      </div>
                      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-500`}>
                        <step.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-display font-bold text-text mb-3">{step.title}</h3>
                      <p className="text-muted leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                  
                  {/* Timeline dot */}
                  <div className="hidden md:flex items-center justify-center shrink-0">
                    <motion.div
                      whileInView={{ scale: [0, 1.2, 1] }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      viewport={{ once: true }}
                      className="w-4 h-4 rounded-full bg-primary glow-blue"
                    />
                  </div>
                  
                  {/* Spacer */}
                  <div className="flex-1 hidden md:block" />
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
