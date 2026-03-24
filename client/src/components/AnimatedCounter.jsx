/*
  AnimatedCounter.jsx — Smooth number count-up with glow effect
  Inspired by airpods-gen2.dora.run tech specs
*/
import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

const AnimatedCounter = ({
  target = 0,
  duration = 2000,
  prefix = '',
  suffix = '',
  className = '',
  decimals = 0,
  separator = ',',
  once = true,
}) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.3 });

  useEffect(() => {
    if (!isInView || (once && hasAnimated)) return;
    setHasAnimated(true);

    const start = 0;
    const end = Number(target);
    if (start === end) {
      setCount(end);
      return;
    }

    const startTime = performance.now();
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const currentCount = start + (end - start) * easedProgress;

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isInView, target, duration, once, hasAnimated]);

  const formatNumber = (num) => {
    const fixed = num.toFixed(decimals);
    if (!separator) return fixed;
    const parts = fixed.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join('.');
  };

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}{formatNumber(count)}{suffix}
    </span>
  );
};

export default AnimatedCounter;
