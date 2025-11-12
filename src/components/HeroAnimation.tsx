import React, { useEffect, useRef } from 'react';

type Props = {
  className?: string;
  mountId?: string; // optional external mount target id
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
};

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const HeroAnimation: React.FC<Props> = ({ className, mountId }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const container = mountId ? (document.getElementById(mountId) as HTMLDivElement | null) : containerRef.current;
    if (!container) return;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvasRef.current = canvas;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0, height = 0;
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    let rafId = 0;
    let particles: Particle[] = [];
    const countBase = 60; // particle density base

    const brandA = { r: 79, g: 70, b: 229 };  // indigo-600 #4f46e5
    const brandB = { r: 6,  g: 182, b: 212 }; // cyan-500   #06b6d4

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // reinit particles proportional to area
      const targetCount = Math.min(120, Math.max(40, Math.floor((width * height) / 9000)));
      particles = new Array(targetCount).fill(0).map(() => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        r: 1.1 + Math.random() * 1.9,
      }));
      // draw one frame when reduced motion
      if (prefersReduced) draw(0);
    };

    const gradientAt = (x: number) => {
      const t = width > 0 ? x / width : 0.5;
      const r = Math.round(lerp(brandA.r, brandB.r, t));
      const g = Math.round(lerp(brandA.g, brandB.g, t));
      const b = Math.round(lerp(brandA.b, brandB.b, t));
      return `rgb(${r}, ${g}, ${b})`;
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);

      // soft background glow
      const radial = ctx.createRadialGradient(width * 0.7, height * 0.3, 20, width * 0.7, height * 0.3, Math.max(width, height));
      radial.addColorStop(0, 'rgba(79,70,229,0.10)');
      radial.addColorStop(1, 'rgba(6,182,212,0.05)');
      ctx.fillStyle = radial;
      ctx.fillRect(0, 0, width, height);

      // update and draw particles
      for (const p of particles) {
        if (!prefersReduced) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = gradientAt(p.x);
        ctx.fill();
      }

      // draw connective lines between near particles
      const maxDist = 120;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < maxDist) {
            const alpha = 1 - dist / maxDist;
            ctx.strokeStyle = `rgba(79,70,229,${0.10 * alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      if (!prefersReduced) rafId = requestAnimationFrame(draw);
    };

    const onResize = () => resize();
    resize();
    if (!prefersReduced) rafId = requestAnimationFrame(draw);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      if (rafId) cancelAnimationFrame(rafId);
      if (canvas.parentElement) canvas.parentElement.removeChild(canvas);
    };
  }, [mountId]);

  // If using internal mount, render container; if external, render nothing
  if (mountId) return null;
  return (
    <div ref={containerRef} className={className} />
  );
};

export default HeroAnimation;
