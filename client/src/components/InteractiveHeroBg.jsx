/*
  InteractiveHeroBg.jsx
  Cursor-reactive particle constellation canvas with flowing energy waves.
  - Particles drift with gentle sine-wave motion
  - Mouse creates a gravitational pull / repulsion field
  - Connection lines form between nearby particles (neural network effect)
  - Larger glowing orbs float independently
  - All colors derived from #1261A0
*/
import React, { useRef, useEffect, useCallback } from "react";

const InteractiveHeroBg = ({ className = "" }) => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef(null);
  const particlesRef = useRef([]);
  const orbsRef = useRef([]);
  const timeRef = useRef(0);

  const PARTICLE_COUNT = 90;
  const ORB_COUNT = 5;
  const CONNECTION_DIST = 150;
  const MOUSE_RADIUS = 200;

  const initParticles = useCallback((w, h) => {
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        baseX: Math.random() * w,
        baseY: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.8,
        alpha: Math.random() * 0.5 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.5 + 0.2,
      });
    }

    const orbs = [];
    for (let i = 0; i < ORB_COUNT; i++) {
      orbs.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 60 + 40,
        alpha: Math.random() * 0.06 + 0.02,
        phase: Math.random() * Math.PI * 2,
        speedX: (Math.random() - 0.5) * 0.15,
        speedY: (Math.random() - 0.5) * 0.15,
      });
    }

    particlesRef.current = particles;
    orbsRef.current = orbs;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let w, h;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.scale(dpr, dpr);
      initParticles(w, h);
    };

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const onMouseLeave = () => {
      mouseRef.current.x = -1000;
      mouseRef.current.y = -1000;
    };

    const draw = () => {
      timeRef.current += 0.008;
      const t = timeRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.clearRect(0, 0, w, h);

      // --- Draw background orbs (large glowing circles) ---
      for (const orb of orbsRef.current) {
        orb.x += orb.speedX + Math.sin(t + orb.phase) * 0.2;
        orb.y += orb.speedY + Math.cos(t + orb.phase) * 0.15;

        // Wrap around
        if (orb.x < -orb.size) orb.x = w + orb.size;
        if (orb.x > w + orb.size) orb.x = -orb.size;
        if (orb.y < -orb.size) orb.y = h + orb.size;
        if (orb.y > h + orb.size) orb.y = -orb.size;

        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.size);
        grad.addColorStop(0, `rgba(18, 97, 160, ${orb.alpha * 1.5})`);
        grad.addColorStop(0.5, `rgba(18, 97, 160, ${orb.alpha * 0.5})`);
        grad.addColorStop(1, "rgba(18, 97, 160, 0)");
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // --- Update & draw particles ---
      const particles = particlesRef.current;
      for (const p of particles) {
        // Gentle sine drift
        p.x += p.vx + Math.sin(t * p.speed + p.phase) * 0.3;
        p.y += p.vy + Math.cos(t * p.speed + p.phase) * 0.2;

        // Mouse interaction: push particles away from cursor
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MOUSE_RADIUS && dist > 0) {
          const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS;
          const angle = Math.atan2(dy, dx);
          p.x += Math.cos(angle) * force * 3;
          p.y += Math.sin(angle) * force * 3;
        }

        // Wrap around edges
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(26, 127, 204, ${p.alpha})`;
        ctx.fill();

        // Small glow
        if (p.size > 1.5) {
          const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4);
          pg.addColorStop(0, `rgba(18, 97, 160, ${p.alpha * 0.3})`);
          pg.addColorStop(1, "rgba(18, 97, 160, 0)");
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2);
          ctx.fillStyle = pg;
          ctx.fill();
        }
      }

      // --- Draw connection lines ---
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(18, 97, 160, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // --- Mouse glow effect ---
      if (mx > 0 && my > 0) {
        const mg = ctx.createRadialGradient(mx, my, 0, mx, my, MOUSE_RADIUS * 0.8);
        mg.addColorStop(0, "rgba(18, 97, 160, 0.06)");
        mg.addColorStop(0.5, "rgba(0, 212, 255, 0.02)");
        mg.addColorStop(1, "rgba(18, 97, 160, 0)");
        ctx.beginPath();
        ctx.arc(mx, my, MOUSE_RADIUS * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = mg;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-auto ${className}`}
      style={{ zIndex: 1 }}
    />
  );
};

export default InteractiveHeroBg;
