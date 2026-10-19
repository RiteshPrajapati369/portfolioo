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
  Layers,
  CheckCircle2,
  Eye,
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
  const [previewProject, setPreviewProject] = useState<Project | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("Security Engineering");
  const [githubUrl, setGithubUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("published");
  const [sortOrder, setSortOrder] = useState<number>(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/dashboard/projects", {
        headers: { "Cache-Control": "no-cache" },
      });
      const data = (await res.json()) as any;
      if (res.ok && data.projects) {
        setProjects(data.projects);
      } else {
        feedback.error("Failed to load projects", data.error || "Could not retrieve projects.");
      }
    } catch (err: any) {
      feedback.error("Connection Error", err?.message || "Failed to contact dashboard API.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNewForm = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setDescription("");
    setContent("");
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
    setContent(p.content || "");
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
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "projects");

      const res = await fetch("/api/dashboard/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as any;
      if (!res.ok || data.error) {
        feedback.error("Upload Error", data.error || "Could not upload image.");
      } else {
        setThumbnailUrl(data.url);
        feedback.success("Image Uploaded", "Thumbnail has been attached.");
      }
    } catch (err: any) {
      feedback.error("Upload Error", err?.message || "Network error during upload.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanTitle = title.trim();
    const cleanDesc = description.trim();
    const cleanSlug = (slug.trim() || cleanTitle)
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!cleanTitle || !cleanDesc) {
      feedback.error("Required Fields Missing", "Please fill in title and description.");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        id: editingId || undefined,
        title: cleanTitle,
        slug: cleanSlug,
        description: cleanDesc,
        content: content.trim() || null,
        category: category.trim(),
        github_url: githubUrl.trim() || null,
        live_url: liveUrl.trim() || null,
        thumbnail_url: thumbnailUrl,
        status,
        sort_order: sortOrder,
      };

      const res = await fetch("/api/dashboard/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as any;
      if (!res.ok || data.error) {
        feedback.error("Save Failed", data.error || "Could not save project.");
      } else {
        feedback.success(
          editingId ? "Project Updated" : "Project Created",
          "Project and architecture details saved."
        );
        setIsEditing(false);
        await loadData();
      }
    } catch (err: any) {
      feedback.error("Save Failed", err?.message || "Could not save project.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, projectTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${projectTitle}"?`)) return;

    try {
      const res = await fetch(`/api/dashboard/projects?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as any;

      if (!res.ok || data.error) {
        feedback.error("Delete Failed", data.error || "Could not delete project.");
      } else {
        feedback.success("Project Deleted", `"${projectTitle}" has been removed.`);
        await loadData();
      }
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
            Manage projects, system architectures, and defense writeups displayed on your portfolio
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
              {editingId ? "Edit Project & Architecture" : "New Security Project"}
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
                Card Description (Summary on Homepage) *
              </label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="High-level security summary..."
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-sans focus:border-primary focus:outline-none resize-y"
              />
            </div>

            {/* Architecture & Research Writeup */}
            <div className="space-y-1.5 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-medium text-foreground flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary" />
                  <span>Architecture & Technical Writeup (Shown when clicking &quot;View Architecture&quot;)</span>
                </label>
                <span className="text-[11px] font-mono text-muted-foreground">Markdown bullet points supported</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Detail the operational flow, packet analysis, threat vectors mitigated, and technical defense controls.
              </p>
              <textarea
                rows={7}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`### System Architecture & Operational Pipeline\n\n- **Packet Ingestion:** Deployed raw socket sniffer utilizing Libpcap...\n- **Rule Matching:** Configured custom Snort & Suricata rule matrices...\n- **Defense Actions:** Automated dynamic firewall iptables dropping...`}
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground font-mono text-xs focus:border-primary focus:outline-none resize-y leading-relaxed"
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
            <div className="space-y-3 pt-2 border-t border-border">
              <label className="text-xs font-mono font-medium text-foreground block">
                Project Image / Architecture Diagram
              </label>
              <div className="flex flex-wrap items-center gap-4">
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-background hover:bg-card text-xs font-mono text-foreground cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5 text-primary" />
                  <span>{isUploading ? "Uploading Image..." : "Upload Image"}</span>
                </button>

                {thumbnailUrl && (
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-16 h-10 rounded-lg overflow-hidden border border-border bg-background">
                      <Image
                        src={thumbnailUrl}
                        alt="Thumbnail preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs font-mono text-emerald-500">Image attached</span>
                    <button
                      type="button"
                      onClick={() => setThumbnailUrl(null)}
                      className="p-1 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Remove image"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
                <span>Save Project & Architecture</span>
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
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-background border border-border text-primary uppercase">
                    {p.category}
                  </span>
                  <div className="flex items-center gap-2">
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
                </div>

                {p.thumbnail_url && (
                  <div className="relative w-full h-36 rounded-xl overflow-hidden border border-border bg-background">
                    <Image src={p.thumbnail_url} alt={p.title} fill className="object-cover" />
                  </div>
                )}

                <h3 className="font-mono font-bold text-base text-foreground">{p.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {p.description}
                </p>

                {/* Architecture writeup status */}
                <div className="pt-1">
                  {p.content ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Architecture Documented ({p.content.length} chars)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      <Layers className="w-3 h-3" />
                      <span>No architecture writeup yet</span>
                    </span>
                  )}
                </div>
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
                    onClick={() => setPreviewProject(p)}
                    className="p-1.5 rounded-lg border border-border bg-background hover:bg-card text-muted-foreground hover:text-foreground flex items-center gap-1 text-[11px] font-mono px-2"
                    title="Preview Architecture"
                  >
                    <Eye className="w-3.5 h-3.5 text-primary" />
                    <span>Preview</span>
                  </button>
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

      {/* Admin Architecture Quick Preview Modal */}
      {previewProject && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
          onClick={() => setPreviewProject(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl max-h-[85vh] bg-card border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden"
          >
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-primary uppercase font-bold">
                  {previewProject.category}
                </span>
                <h3 className="font-mono font-bold text-lg text-foreground">
                  {previewProject.title} — Architecture Preview
                </h3>
              </div>
              <button
                onClick={() => setPreviewProject(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 font-mono text-xs leading-relaxed text-muted-foreground">
              <div className="p-3 bg-background rounded-xl border border-border text-foreground">
                <p className="font-sans text-sm">{previewProject.description}</p>
              </div>
              <div className="space-y-2 whitespace-pre-wrap font-sans text-sm p-4 bg-background rounded-xl border border-border text-foreground/90">
                {previewProject.content || "No architecture writeup configured yet. Click 'Edit' to add one."}
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end">
              <button
                onClick={() => setPreviewProject(null)}
                className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-mono text-xs uppercase"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
