"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Plus,
  Trash2,
  Save,
  Shield,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { feedback } from "@/lib/feedback";
import type { Skill, Service, Profile } from "@/types";

export default function SkillsServicesDashboardPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // New Skill form
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState("Security");
  const [newSkillProficiency, setNewSkillProficiency] = useState(90);

  // New Service form
  const [newServiceTitle, setNewServiceTitle] = useState("");
  const [newServiceDescription, setNewServiceDescription] = useState("");

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
      const [{ data: sList }, { data: srvList }] = await Promise.all([
        supabase
          .from("skills")
          .select("*")
          .eq("profile_id", p.id)
          .is("deleted_at", null)
          .order("sort_order", { ascending: true }),
        supabase
          .from("services")
          .select("*")
          .eq("profile_id", p.id)
          .is("deleted_at", null)
          .order("sort_order", { ascending: true }),
      ]);

      setSkills(sList || []);
      setServices(srvList || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !newSkillName.trim()) return;

    const supabase = createClient();
    try {
      const { error } = await supabase.from("skills").insert({
        profile_id: profile.id,
        name: newSkillName.trim(),
        category: newSkillCategory.trim(),
        proficiency: Number(newSkillProficiency),
        sort_order: skills.length + 1,
        status: "published",
      });

      if (error) throw error;
      feedback.success("Skill Added", `Added ${newSkillName}`);
      setNewSkillName("");
      await loadData();
    } catch (err: any) {
      feedback.error("Failed to Add Skill", err?.message);
    }
  };

  const handleDeleteSkill = async (id: string, name: string) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("skills")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      feedback.success("Skill Removed", `${name} deleted.`);
      await loadData();
    } catch (err: any) {
      feedback.error("Failed", err?.message);
    }
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id || !newServiceTitle.trim()) return;

    const supabase = createClient();
    try {
      const { error } = await supabase.from("services").insert({
        profile_id: profile.id,
        title: newServiceTitle.trim(),
        description: newServiceDescription.trim(),
        sort_order: services.length + 1,
        status: "published",
      });

      if (error) throw error;
      feedback.success("Service Added", `Added ${newServiceTitle}`);
      setNewServiceTitle("");
      setNewServiceDescription("");
      await loadData();
    } catch (err: any) {
      feedback.error("Failed to Add Service", err?.message);
    }
  };

  const handleDeleteService = async (id: string, title: string) => {
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("services")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      feedback.success("Service Removed", `${title} deleted.`);
      await loadData();
    } catch (err: any) {
      feedback.error("Failed", err?.message);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
        Loading skills and services...
      </div>
    );
  }

  return (
    <div className="space-y-12 max-w-5xl">
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
          Skills & Services Console
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-mono mt-1">
          Manage technical proficiencies and offensive/defensive consulting offerings
        </p>
      </div>

      {/* 1. Skills Management */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Shield className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold font-mono text-foreground">Technical Skills</h2>
        </div>

        {/* Add Skill Form */}
        <form
          onSubmit={handleAddSkill}
          className="p-5 rounded-2xl border border-border bg-card/60 grid grid-cols-1 sm:grid-cols-12 gap-4 items-end"
        >
          <div className="sm:col-span-5 space-y-1">
            <label className="text-xs font-mono font-medium text-foreground">Skill Name *</label>
            <input
              type="text"
              required
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g. Penetesting / Bug Hunting"
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs font-mono text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="sm:col-span-3 space-y-1">
            <label className="text-xs font-mono font-medium text-foreground">Category</label>
            <input
              type="text"
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value)}
              placeholder="Security"
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs font-mono text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-mono font-medium text-foreground">Proficiency %</label>
            <input
              type="number"
              min="1"
              max="100"
              value={newSkillProficiency}
              onChange={(e) => setNewSkillProficiency(Number(e.target.value))}
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs font-mono text-foreground focus:border-primary focus:outline-none"
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
        </form>

        {/* Current Skills List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="p-4 rounded-xl border border-border bg-card/60 flex items-center justify-between"
            >
              <div>
                <div className="font-mono text-sm font-bold text-foreground">{skill.name}</div>
                <div className="text-[11px] font-mono text-muted-foreground">
                  {skill.category} &bull; {skill.proficiency}%
                </div>
              </div>
              <button
                onClick={() => handleDeleteSkill(skill.id, skill.name)}
                className="p-1.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
                title="Delete skill"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Services Management */}
      <div className="space-y-6 pt-6 border-t border-border">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold font-mono text-foreground">Services Offered</h2>
        </div>

        {/* Add Service Form */}
        <form
          onSubmit={handleAddService}
          className="p-5 rounded-2xl border border-border bg-card/60 space-y-4"
        >
          <div className="space-y-1">
            <label className="text-xs font-mono font-medium text-foreground">Service Title *</label>
            <input
              type="text"
              required
              value={newServiceTitle}
              onChange={(e) => setNewServiceTitle(e.target.value)}
              placeholder="e.g. Web Application Penetration Testing"
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs font-mono text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono font-medium text-foreground">
              Scope & Description *
            </label>
            <textarea
              rows={3}
              required
              value={newServiceDescription}
              onChange={(e) => setNewServiceDescription(e.target.value)}
              placeholder="Detailed explanation of engagement deliverables and audit methodology..."
              className="w-full px-3.5 py-2 rounded-xl bg-background border border-border text-xs font-sans text-foreground focus:border-primary focus:outline-none resize-y"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 py-2 px-5 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-semibold uppercase hover:opacity-90"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Service</span>
            </button>
          </div>
        </form>

        {/* Current Services List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((srv) => (
            <div
              key={srv.id}
              className="p-5 rounded-2xl border border-border bg-card/60 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h3 className="font-mono font-bold text-sm text-foreground">{srv.title}</h3>
                  <button
                    onClick={() => handleDeleteService(srv.id, srv.title)}
                    className="p-1.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
                    title="Delete service"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{srv.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
