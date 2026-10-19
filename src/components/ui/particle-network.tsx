"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  alpha: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  vx: number;
  vy: number;
  alpha: number;
  decay: number;
}

interface Airplane {
  active: boolean;
  x: number;
  y: number;
  speed: number;
  direction: 1 | -1;
  strobeTimer: number;
}

interface ParticleNetworkProps {
  className?: string;
  forcedDark?: boolean;
}

export function ParticleNetwork({
  className = "absolute inset-0 w-full h-full pointer-events-none z-0 opacity-75 dark:opacity-90",
  forcedDark = false,
}: ParticleNetworkProps = {}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const getDimensions = () => {
      const parent = canvas.parentElement;
      const w = parent && parent.clientWidth > 0 ? parent.clientWidth : window.innerWidth;
      const h = parent && parent.clientHeight > 0 ? parent.clientHeight : window.innerHeight;
      return { w, h };
    };

    let { w: width, h: height } = getDimensions();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Initial canvas sizing and crisp DPI scaling
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const isDark = () => document.documentElement.classList.contains("dark");

    // 1. Star / Dot particles uniformly distributed across the entire viewport
    const calculateTargetCount = (w: number, h: number) =>
      Math.floor(Math.max(120, Math.min((w * h) / 2200, 480)));

    let particleCount = calculateTargetCount(width, height);
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const baseAlpha = Math.random() * 0.45 + 0.2;
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 1.3 + 0.8,
        alpha: baseAlpha,
        baseAlpha,
        twinkleSpeed: Math.random() * 0.02 + 0.008,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }

    // 2. Mouse tracking for nearest 10 dots
    const mouse = {
      x: -1000,
      y: -1000,
      active: false,
      radius: 140,
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const parent = canvas.parentElement || window;
    parent.addEventListener("mousemove", handleMouseMove as EventListener);
    parent.addEventListener("mouseleave", handleMouseLeave as EventListener);

    // 3. Shooting stars in Night mode
    const shootingStars: ShootingStar[] = [];
    let nextShootingStarTime = Date.now() + Math.random() * 3000 + 2000;

    const spawnShootingStar = () => {
      const startX = Math.random() * width * 0.8 + width * 0.1;
      const startY = Math.random() * (height * 0.4);
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3;
      const speed = Math.random() * 5 + 6;
      shootingStars.push({
        x: startX,
        y: startY,
        length: Math.random() * 80 + 70,
        speed,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: Math.random() * 0.012 + 0.015,
      });
    };

    // 4. Occasionally flying airplane with navigation lights
    const airplane: Airplane = {
      active: false,
      x: -100,
      y: 120,
      speed: 0.65,
      direction: 1,
      strobeTimer: 0,
    };

    let nextPlaneTime = Date.now() + Math.random() * 10000 + 6000;

    const spawnAirplane = () => {
      airplane.direction = Math.random() > 0.5 ? 1 : -1;
      airplane.x = airplane.direction === 1 ? -60 : width + 60;
      airplane.y = Math.random() * (height * 0.35) + 60;
      airplane.speed = (Math.random() * 0.3 + 0.5) * airplane.direction;
      airplane.active = true;
      airplane.strobeTimer = 0;
    };

    // 5. Robust Viewport Resize Listener with Proportional Particle Scaling
    const handleResize = () => {
      if (!canvas) return;
      const prevWidth = width;
      const prevHeight = height;

      const { w: newWidth, h: newHeight } = getDimensions();
      if (newWidth <= 0 || newHeight <= 0) return;

      width = newWidth;
      height = newHeight;

      // Update canvas buffer and styling
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Reset transform before re-applying DPR scale to prevent cumulative scaling
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Proportionally redistribute existing particles across new viewport dimensions
      if (prevWidth > 0 && prevHeight > 0) {
        const scaleX = width / prevWidth;
        const scaleY = height / prevHeight;

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x = p.x * scaleX;
          p.y = p.y * scaleY;
          // Guard to keep strictly within new viewport bounds
          if (p.x < 0 || p.x > width) p.x = Math.random() * width;
          if (p.y < 0 || p.y > height) p.y = Math.random() * height;
        }
      }

      // Dynamically adjust particle density for current viewport
      const targetCount = calculateTargetCount(width, height);
      while (particles.length < targetCount) {
        const baseAlpha = Math.random() * 0.45 + 0.2;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          radius: Math.random() * 1.3 + 0.8,
          alpha: baseAlpha,
          baseAlpha,
          twinkleSpeed: Math.random() * 0.02 + 0.008,
          twinklePhase: Math.random() * Math.PI * 2,
        });
      }
      if (particles.length > targetCount) {
        particles.splice(targetCount);
      }
    };

    window.addEventListener("resize", handleResize);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && canvas.parentElement) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(canvas.parentElement);
    }

    // 6. Animation Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const dark = forcedDark || isDark();
      const now = Date.now();

      // Dot color: Sand/rose-gold on dark (#CAAA98), warm stone on light (#4B4038)
      const dotR = dark ? 202 : 75;
      const dotG = dark ? 170 : 64;
      const dotB = dark ? 152 : 56;

      // In day mode, draw a subtle subset for a clean aesthetic
      const visibleParticlesCount = dark ? particles.length : Math.floor(particles.length * 0.35);

      // Update and draw stars/dots
      for (let i = 0; i < visibleParticlesCount; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;

        // Wrap boundaries seamlessly across full width and height
        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        // Subtle twinkling effect in night mode
        if (dark) {
          p.twinklePhase += p.twinkleSpeed;
          p.alpha = p.baseAlpha + Math.sin(p.twinklePhase) * 0.22;
        } else {
          p.alpha = p.baseAlpha * 0.8;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${dotR}, ${dotG}, ${dotB}, ${Math.max(0.1, p.alpha)})`;
        ctx.fill();

        // Connect only close neighbors
        for (let j = i + 1; j < Math.min(i + 4, visibleParticlesCount); j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const maxDist = 70;

          if (dist < maxDist) {
            const lineAlpha = (1 - dist / maxDist) * (dark ? 0.12 : 0.08);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${dotR}, ${dotG}, ${dotB}, ${lineAlpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Connect to mouse if active: STRICTLY only the nearest 10 dots
      if (mouse.active) {
        const nearby: { x: number; y: number; dist: number }[] = [];
        for (let i = 0; i < visibleParticlesCount; i++) {
          const p = particles[i];
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouse.radius) {
            nearby.push({ x: p.x, y: p.y, dist });
          }
        }

        nearby.sort((a, b) => a.dist - b.dist);
        const nearest10 = nearby.slice(0, 10);

        for (let k = 0; k < nearest10.length; k++) {
          const item = nearest10[k];
          const lineAlpha = (1 - item.dist / mouse.radius) * (dark ? 0.45 : 0.35);
          ctx.beginPath();
          ctx.moveTo(item.x, item.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(${dotR}, ${dotG}, ${dotB}, ${lineAlpha})`;
          ctx.lineWidth = 0.85;
          ctx.stroke();
        }
      }

      // 7. Update and render Shooting Stars (Night mode)
      if (dark) {
        if (now > nextShootingStarTime) {
          spawnShootingStar();
          nextShootingStarTime = now + Math.random() * 6000 + 4000;
        }

        for (let s = shootingStars.length - 1; s >= 0; s--) {
          const star = shootingStars[s];
          star.x += star.vx;
          star.y += star.vy;
          star.alpha -= star.decay;

          if (star.alpha <= 0 || star.x > width + 100 || star.y > height + 100) {
            shootingStars.splice(s, 1);
            continue;
          }

          const tailX = star.x - (star.vx / star.speed) * star.length;
          const tailY = star.y - (star.vy / star.speed) * star.length;

          const grad = ctx.createLinearGradient(tailX, tailY, star.x, star.y);
          grad.addColorStop(0, `rgba(255, 255, 255, 0)`);
          grad.addColorStop(0.7, `rgba(${dotR}, ${dotG}, ${dotB}, ${star.alpha * 0.4})`);
          grad.addColorStop(1, `rgba(255, 255, 255, ${star.alpha * 0.95})`);

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(star.x, star.y);
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.25;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(star.x, star.y, 1.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
          ctx.fill();
        }
      }

      // 8. Update and render Airplane
      if (now > nextPlaneTime && !airplane.active) {
        spawnAirplane();
        nextPlaneTime = now + Math.random() * 25000 + 20000;
      }

      if (airplane.active) {
        airplane.x += airplane.speed;
        airplane.strobeTimer += 0.05;

        if (
          (airplane.direction === 1 && airplane.x > width + 80) ||
          (airplane.direction === -1 && airplane.x < -80)
        ) {
          airplane.active = false;
        } else {
          ctx.save();
          ctx.translate(airplane.x, airplane.y);
          if (airplane.direction === -1) {
            ctx.scale(-1, 1);
          }

          ctx.fillStyle = dark ? "rgba(220, 215, 210, 0.55)" : "rgba(80, 70, 65, 0.5)";
          // Body
          ctx.beginPath();
          ctx.ellipse(0, 0, 7, 1.2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Wings
          ctx.beginPath();
          ctx.moveTo(-1, 0);
          ctx.lineTo(-4, -6);
          ctx.lineTo(-2, -6);
          ctx.lineTo(2, 0);
          ctx.lineTo(-2, 6);
          ctx.lineTo(-4, 6);
          ctx.closePath();
          ctx.fill();

          // Tail
          ctx.beginPath();
          ctx.moveTo(-6, 0);
          ctx.lineTo(-8, -2.5);
          ctx.lineTo(-7, -2.5);
          ctx.lineTo(-5, 0);
          ctx.closePath();
          ctx.fill();

          // Red beacon strobe
          const strobe = Math.sin(airplane.strobeTimer * 6) > 0.4;
          if (strobe) {
            ctx.beginPath();
            ctx.arc(0, -1.8, 1.4, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(239, 68, 68, 0.95)";
            ctx.fill();
          }

          // Green nav light
          ctx.beginPath();
          ctx.arc(-2.5, 6, 0.9, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(16, 185, 129, 0.85)";
          ctx.fill();

          ctx.restore();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      parent.removeEventListener("mousemove", handleMouseMove as EventListener);
      parent.removeEventListener("mouseleave", handleMouseLeave as EventListener);
    };
  }, [forcedDark]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      aria-hidden="true"
    />
  );
}
