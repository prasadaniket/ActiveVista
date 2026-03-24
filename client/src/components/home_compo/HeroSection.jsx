/*
  HeroSection.jsx — Cinematic parallax hero with cursor-reactive background
  Inspired by thetinypod.com bold type + marsrejects.com depth
  Uses InteractiveHeroBg (canvas) for the cursor-following particle constellation
*/
import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Play, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import InteractiveHeroBg from '../InteractiveHeroBg';
import AnimatedCounter from '../AnimatedCounter';

/* ── Magnetic button wrapper ─────────────────────────────────────── */
const MagneticBtn = ({ children, className = '', strength = 0.35 }) => {
  const ref = useRef(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const handleMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const { left, top, width, height } = el.getBoundingClientRect();
    const cx = left + width / 2;
    const cy = top + height / 2;
    setPos({
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
    });
  };

  const handleLeave = () => setPos({ x: 0, y: 0 });

  return (
    <motion.div
      ref={ref}
      className={`relative inline-block ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      animate={{ x: pos.x, y: pos.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 18, mass: 0.6 }}
    >
      {children}
    </motion.div>
  );
};

/* ── HeroSection ─────────────────────────────────────────────────── */
const HeroSection = ({ token }) => {
  const { scrollYProgress } = useScroll();
  const textY   = useTransform(scrollYProgress, [0, 0.3], [0, -120]);
  const opacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const scale   = useTransform(scrollYProgress, [0, 0.3], [1, 0.96]);

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* ── Layer 0: atmospheric cosmos bg ── */}
      <div className="absolute inset-0 bg-cosmos bg-noise bg-scanlines" />

      {/* ── Layer 1: cursor-reactive canvas (the interactive part!) ── */}
      <InteractiveHeroBg className="z-[1]" />

      {/* ── Layer 2: ambient gradient orbs ── */}
      <div className="absolute top-1/4 -left-32 w-[600px] h-[600px] bg-primary/6 rounded-full blur-[200px] pointer-events-none animate-breathe z-[2]" />
      <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-accent/4 rounded-full blur-[180px] pointer-events-none animate-breathe stagger-3 z-[2]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[250px] pointer-events-none z-[2]" />

      {/* ── Layer 3: main content ── */}
      <motion.div
        style={{ y: textY, opacity, scale }}
        className="relative z-10 max-w-6xl mx-auto px-6 text-center"
      >
        {/* — Status badge — */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.4em] text-primary uppercase px-5 py-2.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Fitness Intelligence Platform
          </span>
        </motion.div>

        {/* — Main headline — */}
        <motion.h1
          initial={{ opacity: 0, y: 60, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-display font-bold leading-[0.85] mb-8 tracking-tight"
        >
          <span className="text-gradient-hero block">Track.</span>
          <span className="text-white block">Evolve.</span>
          <span className="text-gradient-electric block">Dominate.</span>
        </motion.h1>

        {/* — Subheadline — */}
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="text-lg md:text-xl text-muted max-w-2xl mx-auto leading-relaxed mb-12"
        >
          The next-generation fitness command center that transforms every rep,
          step, and session into actionable intelligence.
        </motion.p>

        {/* — CTA buttons (magnetic) — */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <MagneticBtn strength={0.4}>
            <Link to={token ? '/dashboard' : '/auth'}>
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="btn-futuristic text-white px-10 py-4 rounded-2xl text-sm flex items-center gap-3 group"
              >
                {token ? 'Go to Dashboard' : 'Start Your Journey'}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Link>
          </MagneticBtn>

          <MagneticBtn strength={0.3}>
            <Link to="/gallery">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="btn-outline-glow px-8 py-4 rounded-2xl text-sm flex items-center gap-3 font-display font-bold uppercase tracking-wider"
              >
                <Play className="w-4 h-4" />
                View Gallery
              </motion.button>
            </Link>
          </MagneticBtn>
        </motion.div>

        {/* — Live stat counters — */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex items-center justify-center gap-8 md:gap-16"
        >
          {[
            { value: 50,  suffix: 'K+', label: 'Athletes'  },
            { value: 2,   suffix: 'M+', label: 'Workouts'  },
            { value: 98,  suffix: '%',  label: 'Accuracy'  },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl md:text-3xl font-display font-bold text-text">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} duration={2000} />
              </div>
              <div className="text-[10px] font-bold tracking-[0.3em] text-muted uppercase mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* ── Scroll indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
      >
        <span className="text-[8px] font-bold tracking-[0.5em] text-muted uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-5 h-8 rounded-full border border-white/10 flex justify-center pt-1.5"
        >
          <div className="w-1 h-2 bg-primary rounded-full" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
