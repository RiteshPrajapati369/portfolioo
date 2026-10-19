"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowDown } from "lucide-react";
import { ParticleNetwork } from "@/components/ui/particle-network";
import { CelestialOrb } from "@/components/ui/celestial-orb";
import type { TechUpdate } from "@/lib/tech-news";
import type { Profile, SiteSettings } from "@/types";

interface HeroProps {
  profile?: Profile | null;
  settings?: SiteSettings | null;
  techUpdates?: TechUpdate[];
}

const DEFAULT_UPDATE: TechUpdate = {
  id: "thn-latest",
  title:
    "OpenCode Console Breach May Have Exposed OpenAI, Anthropic, and Google API Keys",
  url: "https://thehackernews.com/2026/10/opencode-console-breach-may-have.html",
  source: "The Hacker News",
  timeAgo: "today",
  category: "Cybersecurity",
};

// Curated Cybersecurity Awareness Quotes & Principles
const CYBER_AWARENESS_QUOTES = [
  "Zero Trust Architecture: Never trust, always verify every request, identity, and access boundary.",
  "Security is not a product, but a continuous cycle of verification, vigilance, and defense-in-depth.",
  "Defenders think in lists; attackers think in graphs. Think like an adversary to secure perimeters.",
  "Proactive cyber hygiene and least privilege are infinitely stronger than reactive incident response.",
  "Simplicity and rigorous input validation are the foundations of reliable, breach-resistant systems.",
  "The goal of cybersecurity is not an impenetrable perimeter, but early detection and rapid containment.",
  "Human vigilance combined with automated telemetry builds the most durable defense posture.",
  "Every external input must be considered hostile until cryptographically verified and sanitized.",
];

/**
 * Removes noisy prefixes like "Show HN:", "Ask HN:", "Tell HN:" from news titles
 */
function cleanNewsTitle(title: string): string {
  return title.replace(/^(Show HN|Ask HN|Tell HN):\s*/i, "").trim();
}

export function Hero({ techUpdates = [] }: HeroProps) {
  const latestNews =
    techUpdates && techUpdates.length > 0 ? techUpdates[0] : DEFAULT_UPDATE;

  const cleanTitle = cleanNewsTitle(latestNews.title);

  // Randomly select either a Quote or News item for each visitor
  // Default to "news" for consistent initial server-side hydration
  const [mode, setMode] = useState<"news" | "quote">("news");
  const [activeQuote, setActiveQuote] = useState(CYBER_AWARENESS_QUOTES[0]);

  useEffect(() => {
    // 50% chance of showing a Quote vs 50% chance of showing Latest News
    const isQuote = Math.random() < 0.5;
    if (isQuote) {
      setMode("quote");
      const randomIndex = Math.floor(
        Math.random() * CYBER_AWARENESS_QUOTES.length
      );
      setActiveQuote(CYBER_AWARENESS_QUOTES[randomIndex]);
    } else {
      setMode("news");
    }
  }, []);

  const isQuoteMode = mode === "quote";

  return (
    <section
      id="hero"
      className="relative min-h-[90vh] sm:min-h-screen flex flex-col justify-center items-center text-center px-4 pt-28 pb-20 overflow-hidden bg-background text-foreground transition-colors duration-300"
    >
      {/* Rich Interactive Particle Network with stars, shooting stars, and airplane */}
      <ParticleNetwork
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-75 dark:opacity-90"
        forcedDark={false}
      />

      {/* Celestial body (Sun in Day, Full Moon in Night) slowly traveling from left to right across the sky */}
      <CelestialOrb />

      {/* Subtle ambient radial glow */}
      <div
        className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_35%,rgba(202,170,152,0.12)_0%,rgba(0,0,0,0)_70%)] dark:bg-[radial-gradient(circle_at_50%_35%,rgba(75,64,56,0.45)_0%,rgba(0,0,0,0)_70%)]"
        aria-hidden="true"
      />

      <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10 px-4 w-full">
        {/* Top Indicator Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/80 bg-background/50 backdrop-blur-sm text-xs font-semibold tracking-wider mb-6 shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-foreground uppercase tracking-widest text-[11px] font-bold">
            {isQuoteMode ? "Cyber Awareness" : "Live Tech Feed"}
          </span>
        </div>

        {/* Dynamic Main Heading */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground mb-6 font-sans leading-tight">
          {isQuoteMode ? "Cyber Awareness" : "Latest Tech Update"}
        </h1>

        {/* Dynamic Content (Either Quote OR Latest News - Never both) */}
        <div className="max-w-2xl mx-auto mb-10 text-center px-4 min-h-[3.5rem] flex items-center justify-center">
          {isQuoteMode ? (
            /* Mode 1: Cybersecurity Awareness Quote (Plain text, no links, no icons, no underlines) */
            <p className="text-base sm:text-lg text-foreground/85 font-normal leading-relaxed text-center italic">
              “{activeQuote}”
            </p>
          ) : (
            /* Mode 2: Latest Tech News (Clean plain-text title, clickable, no underlines, no external icons) */
            <a
              href={latestNews.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base sm:text-lg text-foreground/85 hover:text-primary transition-colors font-normal leading-relaxed text-center block no-underline"
            >
              {cleanTitle}
            </a>
          )}
        </div>

        {/* Two Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/#work"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-primary text-primary-foreground text-sm font-bold tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md group"
          >
            <span>VIEW WORK</span>
            <ArrowDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
          </Link>

          <Link
            href="/#about"
            className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full border border-border bg-card/80 hover:bg-card text-foreground text-sm font-bold tracking-wider hover:border-primary/60 active:scale-95 transition-all shadow-sm backdrop-blur-sm"
          >
            <span>ABOUT RITESH</span>
          </Link>
        </div>
      </div>

      {/* Subtle Scroll Cue at bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity pointer-events-none">
        <span className="text-[10px] tracking-widest uppercase text-muted-foreground font-semibold">
          Scroll
        </span>
        <ArrowDown className="w-3.5 h-3.5 text-primary animate-bounce" />
      </div>

      {/* Subtle bottom transition into the About section */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-b from-transparent to-background/50 pointer-events-none" />
    </section>
  );
}
