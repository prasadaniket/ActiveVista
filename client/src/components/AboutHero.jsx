
import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Globe, Shield, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuroraBackground from './AuroraBackground';
import AnimatedCounter from './AnimatedCounter';

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

const AboutHero = ({ token }) => {
  return (
    <AuroraBackground className="overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-24 flex flex-col items-center">
        
        {/* — Status badge — */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.4em] text-primary-glow uppercase px-6 py-2.5 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-md">
            <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
            Empowering Human Evolution
          </span>
        </motion.div>

        {/* — Main headline — */}
        <div className="text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.2 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-bold leading-[1] tracking-tight mb-8"
          >
            We Build The <br />
            <span className="text-gradient-electric">Future of Fitness</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-muted max-w-3xl mx-auto leading-relaxed"
          >
            A collective of designers, engineers, and athletes rewriting the rules of human performance
            through cinematic technology and scientific precision.
          </motion.p>
        </div>

        {/* — CTA Section — */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20"
        >
          <MagneticBtn strength={0.4}>
            <Link to={token ? '/dashboard' : '/auth'}>
              <button className="btn-futuristic text-white px-10 py-4 rounded-2xl text-sm flex items-center gap-3 group">
                {token ? 'Back to Dashboard' : 'Join the Vanguard'}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </Link>
          </MagneticBtn>

          <MagneticBtn strength={0.3}>
            <Link to="/gallery">
              <button className="btn-outline-glow px-10 py-4 rounded-2xl text-sm flex items-center gap-3 font-display font-bold uppercase tracking-wider">
                <Play className="w-4 h-4 fill-current" />
                Our Story
              </button>
            </Link>
          </MagneticBtn>
        </motion.div>

        {/* — Stats Integration — */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full"
        >
          {[
            { label: 'Global Reach', value: 150, suffix: '+', icon: Globe, color: 'text-accent' },
            { label: 'Data Security', value: 99.9, suffix: '%', icon: Shield, color: 'text-emerald-400', decimals: 1 },
            { label: 'Performance', value: 3, suffix: 'X', icon: Zap, color: 'text-primary-glow' },
          ].map((stat, i) => (
            <div key={i} className="glass-hero p-8 flex flex-col items-center text-center group">
              <div className={`w-12 h-12 rounded-xl bg-void/50 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-3xl font-display font-bold text-white mb-2">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} decimals={stat.decimals || 0} />
              </div>
              <div className="text-[10px] font-bold tracking-[0.3em] text-muted uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </AuroraBackground>
  );
};

export default AboutHero;
