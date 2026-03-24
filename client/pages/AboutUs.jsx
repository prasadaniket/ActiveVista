/*
  pages/AboutUs.jsx
  Premium About Us page with cinematic parallax, team section, mission & values
  Inspired by marsrejects.com bold visuals and thetinypod.com clean reveals
*/
import React, { useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, Heart, Shield, Users, TrendingUp, Award, Rocket } from 'lucide-react';
import ScrollReveal, { StaggerContainer, StaggerItem } from '../src/components/ScrollReveal';
import ParticleField from '../src/components/ParticleField';
import AnimatedCounter from '../src/components/AnimatedCounter';
import PageTransition from '../src/components/PageTransition';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import AboutHero from '../src/components/AboutHero';

const teamMembers = [
  { name: 'Aniket Prasad', role: 'Founder & CEO', avatar: 'AP', color: 'from-primary to-accent' },
  { name: 'Amit Ghosalkar', role: 'Co-Founder', avatar: 'AG', color: 'from-emerald-500 to-teal-500' },
  { name: 'Muskan Jaiswal', role: 'UIxUX designer', avatar: 'MJ', color: 'from-orange-500 to-amber-500' },
  { name: 'Priya Desai', role: 'Head of Product', avatar: 'PD', color: 'from-purple-500 to-pink-500' },
];

const values = [
  {
    icon: Target,
    title: 'Precision Tracking',
    description: 'Every rep, every step, every calorie tracked with scientific accuracy. Your data drives your evolution.',
    gradient: 'from-primary to-primary-light',
  },
  {
    icon: Zap,
    title: 'Real-Time Intelligence',
    description: 'Live dashboards and instant feedback loops that adapt to your performance patterns in real-time.',
    gradient: 'from-accent to-primary',
  },
  {
    icon: Heart,
    title: 'Human-First Design',
    description: 'Built by athletes, for athletes. Every interaction is designed to motivate, not overwhelm.',
    gradient: 'from-rose-500 to-pink-500',
  },
  {
    icon: Shield,
    title: 'Trusted & Secure',
    description: 'Bank-grade encryption for your fitness data. Your progress is yours — always private, always protected.',
    gradient: 'from-emerald-500 to-teal-500',
  },
];

const stats = [
  { value: 50000, suffix: '+', label: 'Active Athletes', icon: Users },
  { value: 2, suffix: 'M+', label: 'Workouts Logged', icon: TrendingUp },
  { value: 98, suffix: '%', label: 'User Satisfaction', icon: Award },
  { value: 150, suffix: '+', label: 'Countries', icon: Rocket },
];

const AboutUs = ({ currentUser }) => {
  const token = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('fittrack-app-token');
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <PageTransition>
      <div className="bg-void min-h-screen text-white overflow-x-hidden">
        <Navbar currentUser={currentUser} />

        {/* ═══ HERO SECTION ═══ */}
        <section id="hero" className="scroll-mt-16">
          <AboutHero token={token} />
        </section>


        {/* ═══ MISSION SECTION ═══ */}
        <section className="relative py-24">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <ScrollReveal variant="fadeLeft">
                <div>
                  <span className="text-[10px] font-bold tracking-[0.5em] text-primary uppercase mb-4 block">
                    Our Mission
                  </span>
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-text mb-6 leading-tight">
                    Where Science Meets
                    <span className="text-gradient-electric block">Determination</span>
                  </h2>
                  <p className="text-muted text-lg leading-relaxed mb-6">
                    We believe that fitness isn't just about lifting weights or counting steps — it's about 
                    understanding your body, tracking your evolution, and building habits that last a lifetime.
                  </p>
                  <p className="text-muted leading-relaxed">
                    ActiveVista combines cutting-edge tracking technology with intuitive design to create 
                    a platform that doesn't just record your workouts — it understands them. Our algorithms 
                    learn from your patterns, adapt to your goals, and guide you toward your best self.
                  </p>
                </div>
              </ScrollReveal>
              
              <ScrollReveal variant="fadeRight" delay={0.2}>
                <div className="relative">
                  <div className="glass-hero p-8 relative overflow-hidden">
                    <div className="absolute inset-0 gradient-mesh opacity-30" />
                    <div className="relative z-10 space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Zap className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="text-2xl font-display font-bold text-text">
                            <AnimatedCounter target={99.9} suffix="%" decimals={1} />
                          </div>
                          <div className="text-sm text-muted">Tracking Accuracy</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-2xl font-display font-bold text-text">
                            <AnimatedCounter target={3} suffix="x" />
                          </div>
                          <div className="text-sm text-muted">Faster Goal Achievement</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                          <Heart className="w-6 h-6 text-accent" />
                        </div>
                        <div>
                          <div className="text-2xl font-display font-bold text-text">
                            <AnimatedCounter target={24} suffix="/7" />
                          </div>
                          <div className="text-sm text-muted">Real-Time Sync</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* ═══ VALUES SECTION ═══ */}
        <section className="relative py-24">
          <div className="max-w-6xl mx-auto px-6">
            <ScrollReveal variant="fadeUp" className="text-center mb-16">
              <span className="text-[10px] font-bold tracking-[0.5em] text-primary uppercase mb-4 block">
                What Drives Us
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-text">Our Core Values</h2>
            </ScrollReveal>

            <StaggerContainer staggerDelay={0.12} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, i) => (
                <StaggerItem key={i} variant="scaleUp">
                  <div className="glass-hero p-8 group cursor-default">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                      <value.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-text mb-3">{value.title}</h3>
                    <p className="text-muted leading-relaxed">{value.description}</p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ═══ TEAM SECTION ═══ */}
        <section className="relative py-24">
          <div className="max-w-6xl mx-auto px-6">
            <ScrollReveal variant="fadeUp" className="text-center mb-16">
              <span className="text-[10px] font-bold tracking-[0.5em] text-primary uppercase mb-4 block">
                The Team
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-text mb-4">
                Built by Athletes,<br />
                <span className="text-gradient-blue">For Athletes</span>
              </h2>
              <p className="text-muted text-lg max-w-xl mx-auto">
                A passionate team of developers, designers, and fitness enthusiasts dedicated to your success.
              </p>
            </ScrollReveal>

            <StaggerContainer staggerDelay={0.1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, i) => (
                <StaggerItem key={i} variant="fadeUp">
                  <motion.div
                    whileHover={{ y: -8 }}
                    className="glass-hero p-8 text-center group"
                  >
                    <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${member.color} flex items-center justify-center text-white font-display font-bold text-xl mb-5 group-hover:shadow-[0_0_40px_rgba(18,97,160,0.3)] transition-shadow duration-500`}>
                      {member.avatar}
                    </div>
                    <h3 className="text-lg font-display font-bold text-text mb-1">{member.name}</h3>
                    <p className="text-sm text-muted">{member.role}</p>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* ═══ CTA ═══ */}
        <section className="relative py-24">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ScrollReveal variant="scaleUp">
              <div className="glass-hero p-12 md:p-16 relative overflow-hidden">
                <div className="absolute inset-0 gradient-mesh opacity-20" />
                <div className="relative z-10">
                  <h2 className="text-3xl md:text-5xl font-display font-bold text-text mb-6">
                    Ready to Transform<br />Your Fitness Journey?
                  </h2>
                  <p className="text-muted text-lg mb-8 max-w-lg mx-auto">
                    Join thousands of athletes who trust ActiveVista to track, analyze, and amplify their performance.
                  </p>
                  <motion.a
                    href="/auth"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="inline-flex btn-futuristic text-white px-10 py-4 rounded-2xl text-sm"
                  >
                    Get Started Free
                  </motion.a>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default AboutUs;
