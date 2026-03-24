/*
  TestimonialsSection.jsx — Horizontal scroll parallax testimonial cards
*/
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import ScrollReveal, { StaggerContainer, StaggerItem } from '../ScrollReveal';

const testimonials = [
  {
    name: 'Sarah K.',
    role: 'Marathon Runner',
    avatar: 'SK',
    gradient: 'from-rose-500 to-pink-500',
    text: "ActiveVista transformed how I track my training. The real-time step tracking and workout analytics helped me shave 15 minutes off my marathon time.",
    rating: 5,
  },
  {
    name: 'James T.',
    role: 'Powerlifter',
    avatar: 'JT',
    gradient: 'from-primary to-accent',
    text: "The 30-day smart plans are incredible. I've been lifting for years, but the structured approach with daily tracking pushed me to new PRs every month.",
    rating: 5,
  },
  {
    name: 'Mia L.',
    role: 'Fitness Beginner',
    avatar: 'ML',
    gradient: 'from-emerald-500 to-teal-500',
    text: "As someone new to fitness, ActiveVista made everything approachable. The progress tracking keeps me motivated, and I can actually see my improvement.",
    rating: 5,
  },
  {
    name: 'Raj P.',
    role: 'CrossFit Athlete',
    avatar: 'RP',
    gradient: 'from-amber-500 to-orange-500',
    text: "The dashboard analytics are next-level. Being able to track calories, steps, and workout categories in one place changed how I approach my training.",
    rating: 5,
  },
];

const TestimonialsSection = () => {
  return (
    <div className="relative py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6">
        <ScrollReveal variant="fadeUp" className="text-center mb-16">
          <span className="text-[10px] font-bold tracking-[0.5em] text-primary uppercase mb-4 block">
            Athlete Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-text mb-4">
            Trusted by <span className="text-gradient-blue">Thousands</span>
          </h2>
          <p className="text-muted text-lg max-w-xl mx-auto">
            Real results from real athletes who transformed their fitness journey.
          </p>
        </ScrollReveal>

        <StaggerContainer staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <StaggerItem key={i} variant="fadeUp">
              <motion.div
                whileHover={{ y: -6 }}
                className="glass-hero p-8 h-full group"
              >
                {/* Quote icon */}
                <Quote className="w-8 h-8 text-primary/20 mb-4" />
                
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Text */}
                <p className="text-text/80 leading-relaxed mb-6 text-sm">
                  "{t.text}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white text-xs font-bold`}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-text">{t.name}</div>
                    <div className="text-xs text-muted">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </div>
  );
};

export default TestimonialsSection;
