/*
  ParticleField.jsx — Ambient floating particles background
  Creates a subtle depth effect like marsrejects.com
*/
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const ParticleField = ({
  count = 30,
  color = 'rgba(18, 97, 160, 0.3)',
  className = '',
  minSize = 1,
  maxSize = 3,
}) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: minSize + Math.random() * (maxSize - minSize),
      duration: 15 + Math.random() * 25,
      delay: Math.random() * 10,
      drift: 20 + Math.random() * 40,
    }));
  }, [count, minSize, maxSize]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: color,
          }}
          animate={{
            y: [-p.drift, p.drift, -p.drift],
            x: [-p.drift * 0.5, p.drift * 0.5, -p.drift * 0.5],
            opacity: [0.2, 0.8, 0.2],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
};

export default ParticleField;
