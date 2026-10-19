"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  FolderGit2,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Upload,
  ExternalLink,
  Github,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { uploadFile } from "@/lib/storage";
import { feedback } from "@/lib/feedback";
import type { Project, Profile } from "@/types";

export default function ProjectsDashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal / Editing Form states
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Security Engineering");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("published");
  const [sortOrder, setSortOrder] = useState<number>(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setIsLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let p: Profile | null = null;
    if (user) {
      setUserId(user.id);
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
      const { data: projs } = await supabase
        .from("projects")
        .select("*")
        .eq("profile_id", p.id)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      setProjects(projs || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewForm = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setCategory("Security Engineering");
    setGithubUrl("");
    setLiveUrl("");
    setThumbnailUrl(null);
    setStatus("published");
    setSortOrder(projects.length + 1);
    setIsEditing(true);
  };

  const openEditForm = (p: Project) => {
    setEditingId(p.id);
    setTitle(p.title);
    setSlug(p.slug);
    setDescription(p.description);
    setCategory(p.category);
    setGithubUrl(p.github_url || "");
    setLiveUrl(p.live_url || "");
    setThumbnailUrl(p.thumbnail_url || null);
    setStatus(p.status);
    setSortOrder(p.sort_order);
    setIsEditing(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingId) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setIsUploading(true);
    try {
      const res = await uploadFile("projects", file, userId);
      if (res.error) {
        feedback.error("Upload Error", res.error);
      } else {
        setThumbnailUrl(res.url);
        feedback.success("Image Uploaded", "Thumbnail has been attached.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) {
      feedback.error("Profile Not Found", "Please configure your profile first.");
      return;
    }

    setIsSaving(true);
    const supabase = createClient();

    try {
      const payload = {
        profile_id: profile.id,
        title: title.trim(),
        slug: slug.trim(),
        description: description.trim(),
        category: category.trim(),
        github_url: githubUrl.trim() || null,
        live_url: liveUrl.trim() || null,
        thumbnail_url: thumbnailUrl,
        status,
        sort_order: sortOrder,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
        feedback.success("Project Updated", "Project details saved.");
      } else {
        const { error } = await supabase.from("projects").insert(payload);
        if (error) throw error;
        feedback.success("Project Created", "New security project added.");
      }

      setIsEditing(false);
      await loadData();
    } catch (err: any) {
      feedback.error("Save Failed", err?.message || "Could not save project.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("projects")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      feedback.success("Project Deleted", `"${title}" has been removed.`);
      await loadData();
    } catch (err: any) {
      feedback.error("Delete Failed", err?.message || "Could not delete project.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
        Loading projects...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
            Security Projects & Case Studies
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-mono mt-1">
            Manage IDS/IPS deployments, security audits, and penetration testing projects
          </p>
        </div>

        <button
          onClick={openNewForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
        </button>
      </div>

      {/* Editor Modal / Panel */}
      {isEditing && (
        <div className="rounded-2xl border-2 border-primary/40 bg-card p-6 sm:p-8 space-y-6 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="font-mono font-bold text-base text-foreground">
              {editingId ? "Edit Project" : "New Security Project"}
            </h2>
            <button
              onClick={() => setIsEditing(false)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-foreground">Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. IDS/IPS Network Defense"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-sans focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-foreground">Slug *</label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="ids-ips-network-defense"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-sans focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-foreground">
                Description *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="High-level security summary..."
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-sans focus:border-primary focus:outline-none resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-foreground">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Network Security"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-sans focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-foreground">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-sans focus:border-primary focus:outline-none"
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-foreground">Sort Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(parseInt(e.target.value) || 1)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-sans focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-foreground">
                  GitHub URL (Optional)
                </label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-sans focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-foreground">
                  Live URL (Optional)
                </label>
                <input
                  type="url"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-sans focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Thumbnail Upload */}
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-xs font-mono font-medium text-foreground">
                Project Image / Architecture Diagram
              </label>
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-background hover:bg-card text-xs font-mono text-foreground"
                >
                  <Upload className="w-3.5 h-3.5 text-primary" />
                  <span>Upload Image</span>
                </button>
                {thumbnailUrl && (
                  <span className="text-xs font-mono text-emerald-500">Image attached</span>
                )}
                {isUploading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl border border-border text-xs font-mono hover:bg-background"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-semibold uppercase tracking-wider hover:opacity-90"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>Save Project</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl text-muted-foreground text-xs font-mono space-y-2">
          <ShieldAlert className="w-8 h-8 text-primary mx-auto" />
          <p>No projects configured. Click &quot;Add Project&quot; above to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="p-5 rounded-2xl border border-border bg-card/60 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-background border border-border text-primary uppercase">
                    {p.category}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                      p.status === "published"
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <h3 className="font-mono font-bold text-base text-foreground">{p.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {p.description}
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  {p.github_url && (
                    <a
                      href={p.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {p.live_url && (
                    <a
                      href={p.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditForm(p)}
                    className="p-1.5 rounded-lg border border-border bg-background hover:bg-card text-muted-foreground hover:text-foreground"
                    title="Edit project"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.title)}
                    className="p-1.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
