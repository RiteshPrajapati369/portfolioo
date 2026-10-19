"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Shield, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import type { NavLink } from "@/types";

interface NavbarProps {
  navLinks?: NavLink[];
  profileName?: string;
}

const DEFAULT_LINKS = [
  { label: "Home", href: "/#hero" },
  { label: "Work", href: "/#work" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/#contact" },
];

export function Navbar({ navLinks = [], profileName = "Ritesh Prajapati" }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const links = navLinks.length > 0 ? navLinks : DEFAULT_LINKS;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/90 backdrop-blur-md border-b border-border shadow-sm py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="/#hero"
          className="group flex items-center gap-2.5 text-foreground hover:text-primary transition-colors tracking-tight"
        >
          <div className="w-8 h-8 rounded-lg bg-card border border-border flex items-center justify-center text-primary group-hover:border-primary transition-colors">
            <Shield className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm tracking-wide">
              {profileName}
            </span>
            <span className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">
              Cybersecurity
            </span>
          </div>
        </Link>

        {/* Right Section: Desktop Nav + Day/Night Toggle + Mobile Hamburger */}
        <div className="flex items-center gap-3">
          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-card/70 border border-border rounded-full px-5 py-1.5 backdrop-blur-sm shadow-sm">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-xs uppercase tracking-wider font-semibold px-4 py-1.5 rounded-full text-foreground/80 hover:text-foreground hover:bg-background/80 transition-all duration-150"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Day / Night Mode Toggle */}
          <ThemeToggle />

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg border border-border bg-card text-foreground focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-lg px-6 py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium uppercase tracking-wider py-2.5 text-foreground/80 hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
