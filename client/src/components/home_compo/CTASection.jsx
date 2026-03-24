/*
  CTASection.jsx — Full-bleed gradient CTA with magnetic button
*/
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollReveal from '../ScrollReveal';
import ParticleField from '../ParticleField';

const CTASection = () => {
  return (
    <div className="relative py-32 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-void via-abyss to-void" />
      <ParticleField count={20} color="rgba(18, 97, 160, 0.15)" />
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <ScrollReveal variant="scaleUp">
          <div className="relative glass-hero p-12 md:p-20 text-center overflow-hidden">
            {/* Background mesh */}
            <div className="absolute inset-0 gradient-mesh opacity-30" />
            
            {/* Animated border glow */}
            <div className="absolute inset-0 rounded-[1.5rem] border border-primary/20 animate-glow-pulse" />
            
            <div className="relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                viewport={{ once: true }}
                className="w-16 h-16 mx-auto mb-8 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center"
              >
                <Sparkles className="w-8 h-8 text-primary" />
              </motion.div>

              <h2 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-text mb-6 leading-tight">
                Your Best Self<br />
                <span className="text-gradient-electric">Starts Today</span>
              </h2>
              
              <p className="text-muted text-lg max-w-lg mx-auto mb-10 leading-relaxed">
                Join the ActiveVista community and start tracking your evolution. 
                Free to start, powerful enough to transform.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/auth">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-futuristic text-white px-12 py-4 rounded-2xl text-sm flex items-center gap-3 group"
                  >
                    Create Free Account
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </motion.button>
                </Link>
                <Link to="/about">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    className="text-muted hover:text-text text-sm font-medium transition-colors duration-300 flex items-center gap-2"
                  >
                    Learn More →
                  </motion.button>
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default CTASection;
