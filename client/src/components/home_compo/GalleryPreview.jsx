/*
  GalleryPreview.jsx — Small gallery section for home page
*/
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Image } from 'lucide-react';
import { Link } from 'react-router-dom';
import ScrollReveal from '../ScrollReveal';
import { cn } from '../../lib/utils';

const previewImages = [
  { src: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800', title: 'Power Training' },
  { src: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800', title: 'Wellness' },
  { src: 'https://images.unsplash.com/photo-1597452485669-2c7bb5fef90d?auto=format&fit=crop&q=80&w=800', title: 'Community' },
  { src: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&q=80&w=800', title: 'Performance' },
  { src: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=800', title: 'Transformation' },
];

const GalleryPreview = () => {
  const [isPaused, setIsPaused] = React.useState(false);
  
  // Mobile loop items (doubled for seamless animation)
  const mobileImages = [...previewImages, ...previewImages];

  return (
    <div className="relative py-24 md:py-32 overflow-hidden bg-void">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-12">
          <ScrollReveal variant="fadeLeft">
            <div>
              <span className="text-[10px] font-bold tracking-[0.5em] text-primary uppercase mb-4 block">
                Visual Stories
              </span>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-text">
                From Our <span className="text-gradient-blue">Gallery</span>
              </h2>
            </div>
          </ScrollReveal>
          
          <ScrollReveal variant="fadeRight">
            <Link to="/gallery">
              <motion.button
                whileHover={{ x: 4 }}
                className="flex items-center gap-2 text-primary font-display font-bold text-sm uppercase tracking-wider group bg-primary/5 px-6 py-2.5 rounded-full border border-primary/20 hover:bg-primary/10 transition-all duration-300"
              >
                View All
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </Link>
          </ScrollReveal>
        </div>

        {/* — Desktop & Tablet: Expandable Gallery — */}
        <div className="hidden md:flex h-[450px] lg:h-[500px] w-full gap-4">
          {previewImages.map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              viewport={{ once: true }}
              className={cn(
                "relative flex h-full flex-1 cursor-pointer overflow-hidden rounded-3xl transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] hover:flex-[3]",
                "border border-white/5 shadow-2xl group",
                i >= 3 ? "hidden lg:flex" : "flex" // Only 3 photos on Tablet (md), 5 on Desktop (lg)
              )}
            >
              <Link to="/gallery" className="absolute inset-0">
                <img
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  src={img.src}
                  alt={img.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-40 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute bottom-8 left-8 p-4 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 z-10">
                  <h3 className="text-2xl font-display font-bold text-white mb-1 whitespace-nowrap">{img.title}</h3>
                  <p className="text-sm text-primary-glow font-bold tracking-widest uppercase">Explore Story</p>
                </div>
                
                {/* Decorative line */}
                <div className="absolute bottom-6 left-6 right-6 h-[1px] bg-gradient-to-r from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* — Mobile: Auto-Scrolling Looping Gallery — */}
        <div className="md:hidden -mx-6 overflow-hidden relative active:cursor-grabbing">
          <motion.div 
            className="flex gap-4 w-max px-6"
            animate={isPaused ? {} : { x: [0, -1480] }} // Loop through the first set of images
            transition={{ 
              duration: 30, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            {mobileImages.map((img, i) => (
              <Link 
                key={i} 
                to="/gallery" 
                className="relative w-[280px] h-[380px] overflow-hidden rounded-2xl border border-white/5 flex-shrink-0 group"
              >
                <img
                  className="absolute inset-0 h-full w-full object-cover"
                  src={img.src}
                  alt={img.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-6 left-6 right-6 z-10">
                  <h3 className="text-xl font-display font-bold text-white mb-1">{img.title}</h3>
                  <div className="w-8 h-[2px] bg-primary rounded-full transition-all group-hover:w-full" />
                </div>
              </Link>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GalleryPreview;
