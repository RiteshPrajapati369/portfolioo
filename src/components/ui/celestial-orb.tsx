"use client";

import { useEffect, useState } from "react";
import { Sun } from "lucide-react";

export function CelestialOrb() {
  const [isDark, setIsDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkDark = () => document.documentElement.classList.contains("dark");
    setIsDark(checkDark());

    // Observe theme toggle class changes on <html>
    const observer = new MutationObserver(() => {
      setIsDark(checkDark());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div
      className="absolute top-8 sm:top-12 left-0 right-0 w-full pointer-events-none z-0 select-none overflow-hidden h-28"
      aria-hidden="true"
    >
      {/* Sky Transit Container: Travels continuously across the sky from left to right */}
      <div className="absolute top-4 left-0 animate-[skyTransit_75s_linear_infinite] will-change-transform">
        {/* Subtle local floating / bobbing */}
        <div className="relative w-5 h-5 flex items-center justify-center animate-[celestialFloatOrbit_8s_ease-in-out_infinite]">
          {/* 1. SUN (Day Mode) - Exact same size as navbar toggle icon (w-4 h-4 / 16px) */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-800 ease-[cubic-bezier(0.34,1.4,0.64,1)] ${
              !isDark
                ? "opacity-100 translate-y-0 translate-x-0 rotate-0 scale-100"
                : "opacity-0 translate-y-8 translate-x-4 rotate-45 scale-50 pointer-events-none"
            }`}
          >
            {/* Delicate solar glow aura */}
            <div className="absolute w-8 h-8 rounded-full bg-amber-400/25 blur-sm animate-pulse" />
            <Sun className="w-4 h-4 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.7)] relative z-10 shrink-0" />
          </div>

          {/* 2. FULL MOON (Night Mode) - Full circular moon disk (w-4 h-4 / 16px) with authentic craters & subtle glow */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-800 ease-[cubic-bezier(0.34,1.4,0.64,1)] ${
              isDark
                ? "opacity-100 translate-y-0 translate-x-0 rotate-0 scale-100"
                : "opacity-0 -translate-y-8 -translate-x-4 -rotate-45 scale-50 pointer-events-none"
            }`}
          >
            {/* Delicate lunar halo glow */}
            <div className="absolute w-8 h-8 rounded-full bg-[#CAAA98]/25 blur-sm animate-pulse" />

            {/* Full Moon SVG disk */}
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4 drop-shadow-[0_0_8px_rgba(202,170,152,0.85)] relative z-10 shrink-0"
              aria-label="Full Moon"
            >
              {/* Luminous Full Moon Sphere */}
              <circle
                cx="12"
                cy="12"
                r="10"
                fill="#EFE9E3"
                stroke="#D9CFC7"
                strokeWidth="0.8"
              />
              {/* Authentic subtle lunar maria & craters */}
              <circle cx="8" cy="8.5" r="1.8" fill="#B0A195" opacity="0.45" />
              <circle cx="15" cy="13.5" r="2.2" fill="#9E8E81" opacity="0.4" />
              <circle cx="14" cy="7.5" r="1.3" fill="#B0A195" opacity="0.35" />
              <circle cx="8.5" cy="15" r="1.4" fill="#A8988B" opacity="0.35" />
              <circle cx="11.5" cy="12" r="1" fill="#B0A195" opacity="0.25" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
