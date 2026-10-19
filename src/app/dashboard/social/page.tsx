"use client";

import { useState, useEffect } from "react";
import {
  Share2,
  Plus,
  Trash2,
  Save,
  Globe,
  Loader2,
  Check,
  ShieldAlert,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { feedback } from "@/lib/feedback";
import type { SocialLink, Profile } from "@/types";

const PLATFORMS = [
  "github",
  "linkedin",
  "twitter",
  "facebook",
  "instagram",
  "whatsapp",
  "email",
  "phone",
  "website",
];

export default function SocialLinksDashboardPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New Link fields
  const [platform, setPlatform] = useState("github");
  const [label, setLabel] = useState("GitHub");
  const [url, setUrl] = useState("");

  const loadData = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let p: Profile | null = null;
    if (user) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      p = data;
    }

    if (!p) {
      const { data: firstProfile } = await supabase
        .from("profiles")
        .select("*")
        .limit(1)
        .maybeSingle();
      p = firstProfile;
    }

    if (p) {
      setProfile(p);
      const { data: sLinks } = await supabase
        .from("social_links")
        .select("*")
        .eq("profile_id", p.id)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      setLinks(sLinks || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handlePlatformChange = (p: string) => {
    setPlatform(p);
    const capital = p.charAt(0).toUpperCase() + p.slice(1);
    setLabel(capital);
  };

  const handleAddLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !url.trim()) return;

    const supabase = createClient();
    try {
      const { error } = await supabase.from("social_links").insert({
        profile_id: profile.id,
        platform,
        label: label.trim() || platform,
        url: url.trim(),
        is_active: true,
        sort_order: links.length + 1,
      });

      if (error) throw error;
      feedback.success("Link Added", `Added ${label}`);
      setUrl("");
      await loadData();
    } catch (err: any) {
      feedback.error("Failed to Add Link", err?.message);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("social_links")
        .update({ is_active: !current })
        .eq("id", id);

      if (error) throw error;
      feedback.success("Updated", "Link visibility changed.");
      await loadData();
    } catch (err: any) {
      feedback.error("Update Failed", err?.message);
    }
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("social_links")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      feedback.success("Link Removed", "Link deleted.");
      await loadData();
    } catch (err: any) {
      feedback.error("Delete Failed", err?.message);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
        Loading social links...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
          Social & Direct Contact Links
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-mono mt-1">
          Manage Facebook, Instagram, WhatsApp, GitHub, LinkedIn, email, and phone handles
        </p>
      </div>

      {/* Info notice about footer rendering */}
      <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 text-xs font-mono text-foreground leading-relaxed">
        <span className="font-bold text-primary">Footer Behavior:</span> Active links configured
        here are dynamically rendered in the public footer. If all links are deleted or inactive,
        the footer cleanly displays only &quot;Design by Ritesh Prajapati&quot;.
      </div>

      {/* Add New Link Form */}
      <form
        onSubmit={handleAddLink}
        className="p-6 rounded-2xl border border-border bg-card/60 space-y-4"
      >
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-primary">
          Add New Channel
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-3 space-y-1">
            <label className="text-xs font-mono font-medium text-foreground">Platform</label>
            <select
              value={platform}
              onChange={(e) => handlePlatformChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-mono text-foreground focus:border-primary focus:outline-none capitalize"
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p} className="capitalize">
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="text-xs font-mono font-medium text-foreground">Display Label</label>
            <input
              type="text"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. WhatsApp"
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-mono text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="sm:col-span-4 space-y-1">
            <label className="text-xs font-mono font-medium text-foreground">
              URL / Handle / Number *
            </label>
            <input
              type="text"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://... or +977 9800000000"
              className="w-full px-3 py-2 rounded-xl bg-background border border-border text-xs font-mono text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-semibold uppercase hover:opacity-90"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </form>

      {/* Links List */}
      <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-4">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-muted-foreground">
          Configured Links ({links.length})
        </h2>

        {links.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-muted-foreground">
            No social links configured. Footer is currently displaying only &quot;Design by Ritesh
            Prajapati&quot;.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {links.map((link) => (
              <div
                key={link.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-primary font-mono text-xs uppercase font-bold">
                    {link.platform.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-mono text-xs font-bold text-foreground flex items-center gap-2">
                      <span>{link.label}</span>
                      <span className="text-[10px] text-muted-foreground font-normal uppercase">
                        ({link.platform})
                      </span>
                    </div>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary transition-colors truncate max-w-sm block"
                    >
                      {link.url}
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(link.id, link.is_active)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono border ${
                      link.is_active
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                        : "bg-muted text-muted-foreground border-border"
                    }`}
                  >
                    {link.is_active ? "ACTIVE" : "INACTIVE"}
                  </button>
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="p-1.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
                    title="Delete link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
