/*
  ScrollReveal.jsx — Cinematic scroll-triggered reveal animations
  Inspired by thetinypod.com and airpods-gen2.dora.run
  
  Usage:
    <ScrollReveal variant="fadeUp" delay={0.2}>
      <YourComponent />
    </ScrollReveal>
*/
import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const variants = {
  fadeUp: {
    hidden: { opacity: 0, y: 60, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
  },
  fadeDown: {
    hidden: { opacity: 0, y: -60, filter: 'blur(8px)' },
    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
  },
  fadeLeft: {
    hidden: { opacity: 0, x: -80 },
    visible: { opacity: 1, x: 0 },
  },
  fadeRight: {
    hidden: { opacity: 0, x: 80 },
    visible: { opacity: 1, x: 0 },
  },
  scaleUp: {
    hidden: { opacity: 0, scale: 0.85, filter: 'blur(10px)' },
    visible: { opacity: 1, scale: 1, filter: 'blur(0px)' },
  },
  blurIn: {
    hidden: { opacity: 0, filter: 'blur(20px)' },
    visible: { opacity: 1, filter: 'blur(0px)' },
  },
  slideReveal: {
    hidden: { opacity: 0, y: 100, rotateX: 10 },
    visible: { opacity: 1, y: 0, rotateX: 0 },
  },
  clipUp: {
    hidden: { opacity: 0, clipPath: 'inset(100% 0 0 0)' },
    visible: { opacity: 1, clipPath: 'inset(0% 0 0 0)' },
  },
  clipLeft: {
    hidden: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
    visible: { opacity: 1, clipPath: 'inset(0 0% 0 0)' },
  },
};

const ScrollReveal = ({
  children,
  variant = 'fadeUp',
  delay = 0,
  duration = 0.8,
  once = true,
  threshold = 0.15,
  className = '',
  staggerChildren = 0,
  as = 'div',
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });
  const MotionComponent = motion[as] || motion.div;

  const selectedVariant = variants[variant] || variants.fadeUp;

  return (
    <MotionComponent
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={selectedVariant}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
        ...(staggerChildren > 0 && {
          staggerChildren,
        }),
      }}
      className={className}
    >
      {children}
    </MotionComponent>
  );
};

// Staggered children wrapper
export const StaggerContainer = ({
  children,
  staggerDelay = 0.1,
  delay = 0,
  once = true,
  threshold = 0.1,
  className = '',
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: threshold });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren: delay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Individual stagger item
export const StaggerItem = ({
  children,
  variant = 'fadeUp',
  className = '',
  duration = 0.6,
}) => {
  const selectedVariant = variants[variant] || variants.fadeUp;

  return (
    <motion.div
      variants={selectedVariant}
      transition={{ duration, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default ScrollReveal;
