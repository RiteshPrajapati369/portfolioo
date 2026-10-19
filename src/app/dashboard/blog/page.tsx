"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Upload,
  Clock,
  Calendar,
  Loader2,
  Tag,
  ShieldAlert,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { uploadFile } from "@/lib/storage";
import { feedback } from "@/lib/feedback";
import { formatDate } from "@/lib/utils";
import type { BlogPost, Profile } from "@/types";

export default function BlogDashboardPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [readingTime, setReadingTime] = useState("5 min read");
  const [tagsInput, setTagsInput] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("published");

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
      const { data: bPosts } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("profile_id", p.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      setPosts(bPosts || []);
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
    setSummary("");
    setContent("");
    setReadingTime("5 min read");
    setTagsInput("Penetration Testing, Security");
    setCoverImageUrl(null);
    setStatus("published");
    setIsEditing(true);
  };

  const openEditForm = (p: BlogPost) => {
    setEditingId(p.id);
    setTitle(p.title);
    setSlug(p.slug);
    setSummary(p.summary);
    setContent(p.content);
    setReadingTime(p.reading_time || "5 min read");
    setTagsInput((p.tags || []).join(", "));
    setCoverImageUrl(p.cover_image_url || null);
    setStatus(p.status);
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setIsUploading(true);
    try {
      const res = await uploadFile("blog", file, userId);
      if (res.error) {
        feedback.error("Upload Error", res.error);
      } else {
        setCoverImageUrl(res.url);
        feedback.success("Image Uploaded", "Cover photo attached.");
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
      const tagsArray = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        profile_id: profile.id,
        title: title.trim(),
        slug: slug.trim(),
        summary: summary.trim(),
        content: content.trim(),
        reading_time: readingTime.trim(),
        tags: tagsArray,
        cover_image_url: coverImageUrl,
        status,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", editingId);

        if (error) throw error;
        feedback.success("Article Updated", "Blog post updated successfully.");
      } else {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
        feedback.success("Article Published", "New research article created.");
      }

      setIsEditing(false);
      await loadData();
    } catch (err: any) {
      feedback.error("Save Failed", err?.message || "Could not save article.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      feedback.success("Article Removed", `"${title}" has been deleted.`);
      await loadData();
    } catch (err: any) {
      feedback.error("Delete Failed", err?.message || "Could not delete article.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
        Loading articles...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
            Blog & Technical Notes
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-mono mt-1">
            Publish write-ups, vulnerability research notes, and case study breakdowns
          </p>
        </div>

        <button
          onClick={openNewForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Article</span>
        </button>
      </div>

      {/* Editor Modal / Panel */}
      {isEditing && (
        <div className="rounded-2xl border-2 border-primary/40 bg-card p-6 sm:p-8 space-y-6 shadow-md animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <h2 className="font-mono font-bold text-base text-foreground">
              {editingId ? "Edit Article" : "Write Technical Article"}
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
                <label className="text-xs font-mono font-medium text-foreground">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Reverse Engineering Network Protocols"
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
                  placeholder="reverse-engineering-network-protocols"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-sans focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-foreground">
                Summary / Abstract *
              </label>
              <textarea
                rows={2}
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Brief abstract displayed on listings and metadata..."
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-sans focus:border-primary focus:outline-none resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-foreground">
                  Reading Time
                </label>
                <input
                  type="text"
                  value={readingTime}
                  onChange={(e) => setReadingTime(e.target.value)}
                  placeholder="5 min read"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-sans focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-foreground">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Pentesting, Bug Hunting, Suricata"
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
            </div>

            {/* Markdown Content */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-foreground">
                Article Body (Markdown Supported) *
              </label>
              <textarea
                rows={12}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your research write-up, commands, findings, and PoCs here..."
                className="w-full font-mono text-xs px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:border-primary focus:outline-none leading-relaxed resize-y"
              />
            </div>

            {/* Cover Image Upload */}
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-xs font-mono font-medium text-foreground">
                Cover Photo (Supabase Storage: /blog)
              </label>
              <div className="flex items-center gap-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-background hover:bg-card text-xs font-mono text-foreground"
                >
                  <Upload className="w-3.5 h-3.5 text-primary" />
                  <span>Upload Cover Image</span>
                </button>
                {coverImageUrl && (
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
                <span>Save Article</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      {posts.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl text-muted-foreground text-xs font-mono space-y-2">
          <ShieldAlert className="w-8 h-8 text-primary mx-auto" />
          <p>No write-ups published yet. Click &quot;New Article&quot; above to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-5 rounded-2xl border border-border bg-card/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary/40 transition-colors"
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      post.status === "published"
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {post.status}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {formatDate(post.published_at || post.created_at)}
                  </span>
                  {post.reading_time && (
                    <span className="text-[11px] font-mono text-primary">&bull; {post.reading_time}</span>
                  )}
                </div>
                <h3 className="font-mono font-bold text-base text-foreground">{post.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-1">{post.summary}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openEditForm(post)}
                  className="p-2 rounded-lg border border-border bg-background hover:bg-card text-muted-foreground hover:text-foreground"
                  title="Edit article"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(post.id, post.title)}
                  className="p-2 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
                  title="Delete article"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
