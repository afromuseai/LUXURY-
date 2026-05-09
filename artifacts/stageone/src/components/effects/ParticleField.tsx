import React, { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  opacityTarget: number;
  opacitySpeed: number;
  gold: boolean;
}

interface ParticleFieldProps {
  count?: number;
  className?: string;
}

export function ParticleField({ count = 55, className = "" }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -1000, y: -1000 });

  const initParticles = useCallback((w: number, h: number) => {
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      radius: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.05,
      opacityTarget: Math.random() * 0.4 + 0.05,
      opacitySpeed: Math.random() * 0.005 + 0.002,
      gold: Math.random() < 0.3,
    }));
  }, [count]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = canvas.parentElement?.clientWidth ?? window.innerWidth;
    let h = canvas.parentElement?.clientHeight ?? window.innerHeight;
    canvas.width = w;
    canvas.height = h;
    initParticles(w, h);

    const handleResize = () => {
      w = canvas.parentElement?.clientWidth ?? window.innerWidth;
      h = canvas.parentElement?.clientHeight ?? window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      initParticles(w, h);
    };

    const handleMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    window.addEventListener("resize", handleResize);
    canvas.parentElement?.addEventListener("mousemove", handleMouse);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const particles = particlesRef.current;

      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.06;
            ctx.beginPath();
            ctx.strokeStyle = a.gold || b.gold
              ? `rgba(201,168,76,${alpha * 2})`
              : `rgba(255,255,255,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }

        // Mouse repulsion/attraction
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const mdx = a.x - mx;
        const mdy = a.y - my;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 100) {
          const force = (100 - mDist) / 100;
          a.vx += (mdx / mDist) * force * 0.08;
          a.vy += (mdy / mDist) * force * 0.08;
        }

        // Update opacity
        if (Math.abs(a.opacity - a.opacityTarget) < a.opacitySpeed) {
          a.opacityTarget = Math.random() * 0.4 + 0.05;
        } else {
          a.opacity += a.opacity < a.opacityTarget ? a.opacitySpeed : -a.opacitySpeed;
        }

        // Move
        a.x += a.vx;
        a.y += a.vy;

        // Dampen velocity
        a.vx *= 0.98;
        a.vy *= 0.98;

        // Wrap edges
        if (a.x < 0) a.x = w;
        if (a.x > w) a.x = 0;
        if (a.y < 0) a.y = h;
        if (a.y > h) a.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
        if (a.gold) {
          ctx.fillStyle = `rgba(201,168,76,${a.opacity * 1.5})`;
          // Glow for gold particles
          ctx.shadowBlur = 6;
          ctx.shadowColor = "rgba(201,168,76,0.6)";
        } else {
          ctx.fillStyle = `rgba(255,255,255,${a.opacity})`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", handleResize);
      canvas.parentElement?.removeEventListener("mousemove", handleMouse);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ opacity: 0.7 }}
    />
  );
}
