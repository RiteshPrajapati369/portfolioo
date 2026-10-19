"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme") as "dark" | "light" | null;
    if (stored) {
      setTheme(stored);
      document.documentElement.classList.toggle("dark", stored === "dark");
    } else {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-full border border-border bg-card/60" />
    );
  }

  const isDay = theme === "light";

  return (
    <button
      onClick={toggleTheme}
      aria-label={
        isDay
          ? "Day mode active. Click to switch to Night mode."
          : "Night mode active. Click to switch to Day mode."
      }
      title={isDay ? "Day mode (click for night)" : "Night mode (click for day)"}
      className="relative w-10 h-10 rounded-full border border-border bg-card/75 hover:bg-card text-foreground flex items-center justify-center overflow-hidden transition-all duration-300 hover:border-primary/60 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 group"
    >
      {/* Sun Icon: Displayed in Day mode with rising sun transition */}
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isDay
            ? "opacity-100 translate-y-0 rotate-0 scale-100"
            : "opacity-0 translate-y-6 rotate-90 scale-50 pointer-events-none"
        }`}
      >
        <Sun className="w-4 h-4 text-amber-600 dark:text-amber-400 drop-shadow-[0_0_6px_rgba(217,119,6,0.5)] transition-transform duration-300 group-hover:rotate-45" />
      </span>

      {/* Moon Icon: Displayed in Night mode with moon setting/rising transition */}
      <span
        className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          !isDay
            ? "opacity-100 translate-y-0 rotate-0 scale-100"
            : "opacity-0 -translate-y-6 -rotate-90 scale-50 pointer-events-none"
        }`}
      >
        <Moon className="w-4 h-4 text-primary drop-shadow-[0_0_6px_rgba(202,170,152,0.4)] transition-transform duration-300 group-hover:-rotate-12" />
      </span>
    </button>
  );
}
