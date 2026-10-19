"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  LogOut,
  Menu,
  X,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { DASHBOARD_NAV_ITEMS } from "@/config/dashboard-nav";
import { logoutAction } from "@/lib/auth-actions";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface DashboardNavProps {
  userEmail?: string;
}

export function DashboardNav({ userEmail }: DashboardNavProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-card border-b border-border shadow-sm">
        <Link href="/dashboard" className="flex items-center gap-2 font-mono font-bold text-sm">
          <div className="w-7 h-7 rounded-lg bg-background border border-border flex items-center justify-center text-primary">
            <Shield className="w-4 h-4" />
          </div>
          <span>CMS Portal</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg border border-border bg-background"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar for Desktop & Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Brand header */}
          <div className="p-6 border-b border-border flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 font-mono font-bold tracking-tight text-foreground"
            >
              <div className="w-9 h-9 rounded-xl bg-background border border-border flex items-center justify-center text-primary shadow-sm">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-wider">ADMIN CMS</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Cybersecurity Portfolio
                </span>
              </div>
            </Link>
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {DASHBOARD_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-mono text-xs tracking-wider transition-all duration-150 ${
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.title}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer User & Actions */}
          <div className="p-4 border-t border-border space-y-3 bg-background/40">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-muted-foreground truncate max-w-[150px]">
                {userEmail || "owner"}
              </span>
              <ThemeToggle />
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/"
                target="_blank"
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-border bg-card hover:bg-card/80 text-[11px] font-mono text-foreground transition-colors"
                title="View live portfolio"
              >
                <span>Live Site</span>
                <ExternalLink className="w-3 h-3 text-primary" />
              </Link>

              <form action={logoutAction} className="flex-1">
                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border border-destructive/40 bg-destructive/10 hover:bg-destructive/20 text-destructive text-[11px] font-mono transition-colors"
                  title="Sign out securely"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Logout</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
        />
      )}
    </>
  );
}
