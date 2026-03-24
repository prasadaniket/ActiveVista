/*
  pages/Home.jsx
  ActiveVista — Cinematic Homepage
  Structure: Hero → Stats → Features → How It Works → Showcase → Gallery Preview → Testimonials → CTA
*/
import React, { useEffect, useMemo } from 'react';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import PageTransition from '../src/components/PageTransition';

import {
  HeroSection,
  StatsBar,
  FeaturesSection,
  HowItWorks,
  ShowcaseSection,
  GalleryPreview,
  TestimonialsSection,
  CTASection,
} from '../src/components/home_compo';

const Home = ({ currentUser }) => {
  const token = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('fittrack-app-token');
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <PageTransition>
      <div className="bg-void selection:bg-primary/30 min-h-screen text-white font-sans overflow-x-hidden antialiased">
        <Navbar currentUser={currentUser} />

        {/* ═══ 1. HERO ════════════════════════════════════ */}
        <section id="hero" className="scroll-mt-16">
          <HeroSection token={token} />
        </section>

        {/* ═══ 2. STATS ════════════════════════════════════ */}
        <section id="stats" className="scroll-mt-16">
          <StatsBar />
        </section>

        {/* ═══ 3. FEATURES ═════════════════════════════════ */}
        <section id="features" className="scroll-mt-16">
          <FeaturesSection />
        </section>

        {/* ═══ 4. HOW IT WORKS ═════════════════════════════ */}
        <section id="how-it-works" className="scroll-mt-16">
          <HowItWorks />
        </section>

        {/* ═══ 5. SHOWCASE ═════════════════════════════════ */}
        <section id="showcase" className="scroll-mt-16">
          <ShowcaseSection token={token} />
        </section>

        {/* ═══ 6. GALLERY PREVIEW ══════════════════════════ */}
        <section id="gallery" className="scroll-mt-16">
          <GalleryPreview />
        </section>

        {/* ═══ 7. TESTIMONIALS ═════════════════════════════ */}
        <section id="testimonials" className="scroll-mt-16">
          <TestimonialsSection />
        </section>

        {/* ═══ 8. CTA ══════════════════════════════════════ */}
        <section id="cta" className="scroll-mt-16">
          <CTASection />
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Home;
