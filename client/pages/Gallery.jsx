/*
  pages/Gallery.jsx
  Filter-based gallery with lightbox, categories, and cinematic animations
  Categories: All, Workouts, Wellness, Community, Transformations
*/
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, Grid3X3, ZoomIn } from 'lucide-react';
import { cn } from '../src/lib/utils';
import ScrollReveal from '../src/components/ScrollReveal';
import ParticleField from '../src/components/ParticleField';
import PageTransition from '../src/components/PageTransition';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import WavyBackground from '../src/components/WavyBackground';

const categories = ['All', 'Workouts', 'Wellness', 'Community', 'Transformations'];

const galleryItems = [
  {
    id: 1,
    src: '/gallery-1.png',
    title: 'Power Squat Session',
    category: 'Workouts',
    description: 'Heavy barbell squats in our state-of-the-art training facility',
  },
  {
    id: 2,
    src: '/gallery-2.png',
    title: 'Morning Yoga Flow',
    category: 'Wellness',
    description: 'Finding inner peace with sunrise yoga on the mountain top',
  },
  {
    id: 3,
    src: '/gallery-3.png',
    title: 'Community Run Club',
    category: 'Community',
    description: 'Our weekly group running sessions bring athletes together',
  },
  {
    id: 4,
    src: '/gallery-4.png',
    title: '12-Week Transformation',
    category: 'Transformations',
    description: 'Incredible progress through consistent training and tracking',
  },
  {
    id: 5,
    src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&h=400&fit=crop',
    title: 'Gym Floor Action',
    category: 'Workouts',
    description: 'High-intensity training session with personal coaching',
  },
  {
    id: 6,
    src: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&h=400&fit=crop',
    title: 'Mindfulness & Recovery',
    category: 'Wellness',
    description: 'Recovery and mindfulness sessions for complete wellness',
  },
  {
    id: 7,
    src: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&h=400&fit=crop',
    title: 'Deadlift PR Day',
    category: 'Workouts',
    description: 'Breaking personal records with proper form and determination',
  },
  {
    id: 8,
    src: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600&h=400&fit=crop',
    title: 'Team Training Event',
    category: 'Community',
    description: 'Annual fitness challenge bringing our community together',
  },
  {
    id: 9,
    src: 'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=600&h=400&fit=crop',
    title: 'Strength Journey',
    category: 'Transformations',
    description: 'From beginner to advanced — the power of consistency',
  },
  {
    id: 10,
    src: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600&h=400&fit=crop',
    title: 'HIIT Class',
    category: 'Workouts',
    description: 'High-energy interval training with our elite coaches',
  },
  {
    id: 11,
    src: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=400&fit=crop',
    title: 'Meditation Space',
    category: 'Wellness',
    description: 'Our dedicated meditation and recovery lounge',
  },
  {
    id: 12,
    src: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=600&h=400&fit=crop',
    title: 'Track & Field',
    category: 'Community',
    description: 'Speed and endurance training on our outdoor track',
  },
];



// Helper to chunk array
const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const GalleryGrid = ({ items, onSelectItem }) => {
  const rowSize = window.innerWidth < 768 ? 2 : (window.innerWidth < 1024 ? 3 : 4);
  const chunks = chunkArray(items, rowSize);

  return (
    <div className="flex flex-col gap-8">
      {chunks.map((chunk, chunkIdx) => (
        <div 
          key={chunkIdx} 
          className="flex h-[400px] w-full gap-4"
        >
          {chunk.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              onClick={() => onSelectItem(item)}
              className={cn(
                "relative flex h-full flex-1 cursor-pointer overflow-hidden rounded-3xl transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] hover:flex-[3]",
                "border border-white/5 shadow-2xl group"
              )}
            >
              <img
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                src={item.src}
                alt={item.title}
                loading="lazy"
              />
              
              {/* Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Content that reveals on expansion/hover */}
              <div className="absolute bottom-8 left-8 right-8 p-2 transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                <span className="text-[9px] font-bold tracking-[0.3em] text-primary uppercase px-3 py-1 rounded-full bg-white/10 backdrop-blur-md mb-3 inline-block">
                  {item.category}
                </span>
                <h3 className="text-xl md:text-2xl font-display font-bold text-white mb-2 leading-tight">
                  {item.title}
                </h3>
                <p className="text-sm text-white/60 line-clamp-2 max-w-[300px]">
                  {item.description}
                </p>
                <div className="mt-4 flex items-center gap-2 text-primary text-[10px] font-bold tracking-widest uppercase">
                  <ZoomIn className="w-4 h-4" />
                  View Close-up
                </div>
              </div>

              {/* Status indicator (always visible) */}
              <div className="absolute top-6 left-6 opacity-100 group-hover:opacity-0 transition-opacity">
                 <div className="w-2 h-2 rounded-full bg-primary/40 animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
};

const Gallery = ({ currentUser }) => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxItem, setLightboxItem] = useState(null);

  const filteredItems = useMemo(() => {
    if (activeCategory === 'All') return galleryItems;
    return galleryItems.filter(item => item.category === activeCategory);
  }, [activeCategory]);

  return (
    <PageTransition>
      <div className="bg-void min-h-screen text-white overflow-x-hidden">
        <Navbar currentUser={currentUser} />

        {/* ═══ HERO ═══ */}
        <WavyBackground 
          containerClassName="min-h-[50vh] pt-20"
          backgroundFill="#030508"
          waveOpacity={0.3}
          colors={["#1261A0", "#1A7FCC", "#00D4FF", "#1261A0", "#080C14"]}
          blur={15}
        >
          <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
            <ScrollReveal variant="blurIn">
              <span className="inline-block text-[10px] font-bold tracking-[0.5em] text-primary uppercase mb-6 px-4 py-2 rounded-full border border-primary/20 bg-primary/5">
                Visual Stories
              </span>
            </ScrollReveal>
            <ScrollReveal variant="fadeUp" delay={0.2}>
              <h1 className="text-5xl md:text-7xl font-display font-bold mb-6">
                <span className="text-gradient-hero">Gallery</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal variant="fadeUp" delay={0.3}>
              <p className="text-lg text-muted max-w-xl mx-auto">
                Explore the moments that define our community — from first reps to personal records.
              </p>
            </ScrollReveal>
          </div>
        </WavyBackground>

        {/* ═══ FILTER BAR ═══ */}
        <section className="py-8 sticky top-16 z-50 bg-void/80 backdrop-blur-xl border-b border-white/5">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                <Filter className="w-4 h-4 text-muted shrink-0" />
                {categories.map(cat => (
                  <motion.button
                    key={cat}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                      activeCategory === cat
                        ? 'bg-primary text-white shadow-[0_0_30px_rgba(18,97,160,0.4)] border-primary'
                        : 'bg-white/[0.03] text-muted hover:text-text hover:bg-white/[0.06] border border-white/5'
                    }`}
                  >
                    {cat}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ GALLERY GRID ═══ */}
        <section className="py-12 pb-32">
          <div className="max-w-7xl mx-auto px-6">
            <AnimatePresence mode="wait">
               <motion.div
                key={activeCategory}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
               >
                  <GalleryGrid items={filteredItems} onSelectItem={setLightboxItem} />
               </motion.div>
            </AnimatePresence>

            {/* Empty state */}
            {filteredItems.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
                  <Grid3X3 className="w-8 h-8 text-muted" />
                </div>
                <h3 className="text-xl font-display font-bold text-text mb-2">No items found</h3>
                <p className="text-muted">Try selecting a different category</p>
              </div>
            )}
          </div>
        </section>

        {/* ═══ LIGHTBOX ═══ */}
        <AnimatePresence>
          {lightboxItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lightbox-overlay"
              onClick={() => setLightboxItem(null)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 30 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 30 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="relative max-w-4xl max-h-[85vh] mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setLightboxItem(null)}
                  className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 backdrop-blur-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors z-10"
                >
                  <X className="w-5 h-5" />
                </button>
                <img
                  src={lightboxItem.src}
                  alt={lightboxItem.title}
                  className="w-full h-auto max-h-[70vh] object-contain rounded-2xl"
                />
                <div className="mt-4 text-center">
                  <h3 className="text-xl font-display font-bold text-white mb-1">{lightboxItem.title}</h3>
                  <p className="text-sm text-white/60">{lightboxItem.description}</p>
                  <span className="inline-block mt-2 text-[9px] font-bold tracking-[0.3em] text-primary uppercase px-3 py-1 rounded-full border border-primary/20 bg-primary/5">
                    {lightboxItem.category}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Gallery;
