"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  User,
  Upload,
  Save,
  Loader2,
  FileText,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { uploadFile } from "@/lib/storage";
import { feedback } from "@/lib/feedback";
import type { Profile } from "@/types";

const DEFAULT_DETAILED_ABOUT =
  "With practical experience configuring rule-based Intrusion Detection and Prevention Systems (Snort/Suricata), architecting secure authentication workflows with multi-factor verification, and performing code-level audits across HTML, CSS, JavaScript, and PHP, my objective is to fortify systems before adversaries can exploit them.";

export default function ProfileDashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingResume, setIsUploadingResume] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [aboutDescription, setAboutDescription] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      let targetUserId: string | null = null;
      let p: any = null;

      // 1. Try server-side dashboard profile API first
      try {
        const res = await fetch("/api/dashboard/profile");
        if (res.ok) {
          const json = (await res.json()) as any;
          if (json.profile) {
            p = json.profile;
            targetUserId = p.user_id;
          }
        }
      } catch (apiErr) {
        console.warn("Could not fetch profile via API route, falling back to Supabase client:", apiErr);
      }

      // 2. Fallback to client-side Supabase
      if (!p) {
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user?.id) {
            targetUserId = user.id;
            const { data } = await supabase
              .from("profiles")
              .select("*")
              .eq("user_id", targetUserId)
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
            if (p?.user_id) {
              targetUserId = p.user_id;
            }
          }
        } catch (supabaseErr) {
          console.warn("Client supabase query error:", supabaseErr);
        }
      }

      setUserId(targetUserId || "e76d3223-c0ac-4662-b3df-a50ad34f4e84");

      if (p) {
        setProfile(p);
        setFullName(p.full_name || "Ritesh Prajapati");
        setHeadline(p.headline || "Cybersecurity Specialist & Penetration Tester");
        setBio(p.bio || "");
        setAboutDescription(p.about_description ?? DEFAULT_DETAILED_ABOUT);
        setAvatarUrl(p.avatar_url || null);
        setEmail(p.email || "panditritesh005@gmail.com");
        setPhone(p.phone || "");
        setLocation(p.location || "Kathmandu, Nepal");
        setResumeUrl(p.resume_url || null);
      } else {
        setEmail("panditritesh005@gmail.com");
        setFullName("Ritesh Prajapati");
        setHeadline("Cybersecurity Specialist & Penetration Tester");
        setAboutDescription(DEFAULT_DETAILED_ABOUT);
      }

      setIsLoading(false);
    }

    loadData();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setIsUploadingAvatar(true);
    try {
      const res = await uploadFile("avatars", file, userId);
      if (res.error) {
        feedback.error("Avatar Upload Failed", res.error);
      } else {
        setAvatarUrl(res.url);
        feedback.success("Avatar Uploaded", "Remember to click Save Changes to persist.");
      }
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setIsUploadingResume(true);
    try {
      const res = await uploadFile("resumes", file, userId);
      if (res.error) {
        feedback.error("Resume Upload Failed", res.error);
      } else {
        setResumeUrl(res.url);
        feedback.success("Resume Uploaded", "Remember to click Save Changes to persist.");
      }
    } finally {
      setIsUploadingResume(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setIsSaving(true);

    const payload = {
      id: profile?.id,
      user_id: userId,
      full_name: fullName.trim(),
      headline: headline.trim(),
      bio: bio.trim(),
      about_description: aboutDescription.trim(),
      avatar_url: avatarUrl,
      email: email.trim(),
      phone: phone.trim() || null,
      location: location.trim() || null,
      resume_url: resumeUrl,
      status: "published",
      updated_at: new Date().toISOString(),
    };

    try {
      // 1. Try server API route first
      let saved = false;
      try {
        const res = await fetch("/api/dashboard/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const json = (await res.json()) as any;
          if (json.profile) {
            setProfile(json.profile);
            saved = true;
          }
        }
      } catch (apiErr) {
        console.warn("Profile save via API failed, attempting client fallback:", apiErr);
      }

      // 2. Fallback to direct client Supabase
      if (!saved) {
        const supabase = createClient();
        if (profile?.id) {
          const { error } = await supabase
            .from("profiles")
            .update(payload)
            .eq("id", profile.id);

          if (error) throw error;
        } else {
          const { data: newProfile, error } = await supabase
            .from("profiles")
            .insert(payload)
            .select()
            .single();

          if (error) throw error;
          setProfile(newProfile);
        }
      }

      feedback.success("Profile Updated", "All About section changes are now live on your portfolio.");
    } catch (err: any) {
      console.error("Save error:", err);
      feedback.error("Save Failed", err?.message || "Could not update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
        Loading profile data...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
          Profile & About Section
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-mono mt-1">
          Manage your personal brand, About section content, circular headshot, credentials, and resume
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Visual Identity Row */}
        <div className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8 space-y-6 shadow-sm">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-primary">
            Visual Identity
          </h2>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Circular Frame Preview */}
            <div className="relative group">
              <div className="w-28 h-28 rounded-full p-1 border-2 border-border group-hover:border-primary transition-colors bg-background flex items-center justify-center overflow-hidden shadow">
                {avatarUrl || "/images/profile.png" ? (
                  <Image
                    src={avatarUrl || "/images/profile.png"}
                    alt={fullName || "Profile"}
                    width={112}
                    height={112}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              {isUploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center text-white">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              )}
            </div>

            {/* Avatar upload controls */}
            <div className="space-y-2 text-center sm:text-left">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={isUploadingAvatar}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border hover:border-primary text-xs font-mono font-medium text-foreground transition-colors disabled:opacity-50"
              >
                <Upload className="w-3.5 h-3.5 text-primary" />
                <span>Upload Circular Avatar</span>
              </button>
              <p className="text-[11px] font-mono text-muted-foreground">
                PNG, JPG or WebP. Automatically displayed in a modern circular frame on the public About & Hero sections.
              </p>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>CV / Resume Document (PDF)</span>
              </span>
              <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                {resumeUrl ? "A resume document is currently active." : "No resume uploaded yet."}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={resumeInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => resumeInputRef.current?.click()}
                disabled={isUploadingResume}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border bg-background hover:bg-card text-xs font-mono text-foreground transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-primary" />
                <span>Upload PDF</span>
              </button>
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-mono text-primary hover:underline"
                >
                  View
                </a>
              )}
            </div>
          </div>
        </div>

        {/* About Section & Biographical Content */}
        <div className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-primary">
              About Section & Biographical Content
            </h2>
            <span className="text-[11px] font-mono text-muted-foreground">
              Fully editable public About content
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label htmlFor="fullName" className="text-xs font-mono font-medium text-foreground">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ritesh Prajapati"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-sans focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="headline" className="text-xs font-mono font-medium text-foreground">
                Headline / Title
              </label>
              <input
                id="headline"
                type="text"
                required
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                placeholder="Cybersecurity Specialist & Penetration Tester"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-sans focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* 1. Short Bio (Lead Introductory Paragraph) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label htmlFor="bio" className="text-xs font-mono font-medium text-foreground">
                About Section: Short Bio (Introductory Summary)
              </label>
              <span className="text-[11px] font-mono text-primary/80">Paragraph 1</span>
            </div>
            <textarea
              id="bio"
              rows={4}
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Cybersecurity professional specializing in Penetration Testing..."
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-sans focus:border-primary focus:outline-none resize-y"
            />
            <p className="text-[11px] font-mono text-muted-foreground">
              This is the prominent lead summary paragraph displayed directly under your name and title in the public About section.
            </p>
          </div>

          {/* 2. Detailed Description & Practical Experience (Longer Paragraph) */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label htmlFor="aboutDescription" className="text-xs font-mono font-medium text-foreground">
                About Section: Detailed Description & Practical Experience (Longer Paragraph)
              </label>
              <span className="text-[11px] font-mono text-primary/80">Paragraph 2+</span>
            </div>
            <textarea
              id="aboutDescription"
              rows={6}
              value={aboutDescription}
              onChange={(e) => setAboutDescription(e.target.value)}
              placeholder="With practical experience configuring rule-based Intrusion Detection..."
              className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-sans focus:border-primary focus:outline-none resize-y"
            />
            <p className="text-[11px] font-mono text-muted-foreground">
              This is the detailed description paragraph in the About section detailing your practical tools, certifications, audits, and technical focus. You can write multiple paragraphs by separating them with a blank line.
            </p>
          </div>

          {/* Contact and Location Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-3 border-t border-border/80">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-mono font-medium text-foreground">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-sans focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="phone" className="text-xs font-mono font-medium text-foreground">
                Phone
              </label>
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+977 9800000000"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-sans focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="location" className="text-xs font-mono font-medium text-foreground">
                Location
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Kathmandu, Nepal"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-sans focus:border-primary focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-semibold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>SAVING CHANGES...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>SAVE PROFILE CHANGES</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
