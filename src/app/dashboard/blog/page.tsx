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
  ImagePlus,
  Eye,
  PenLine,
  Copy,
  Check,
  Code,
  ListOrdered,
  AlertTriangle,
  ExternalLink,
  Columns,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  Link2,
  FileCode,
  List,
} from "lucide-react";
import { feedback } from "@/lib/feedback";
import { formatDate } from "@/lib/utils";
import { MarkdownContent } from "@/components/blog/markdown-content";
import type { BlogPost } from "@/types";

interface UploadedPoCImage {
  url: string;
  name: string;
}

export default function BlogDashboardPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingInline, setIsUploadingInline] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Editor View Mode: "write" | "split" | "preview"
  const [editorTab, setEditorTab] = useState<"write" | "split" | "preview">("write");

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [readingTime, setReadingTime] = useState("5 min read");
  const [tagsInput, setTagsInput] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("published");

  // Track PoC Images uploaded during this session
  const [pocImages, setPocImages] = useState<UploadedPoCImage[]>([]);
  const [copiedImageUrl, setCopiedImageUrl] = useState<string | null>(null);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const inlineImageInputRef = useRef<HTMLInputElement>(null);
  const contentTextareaRef = useRef<HTMLTextAreaElement>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/dashboard/blog", {
        headers: { "Cache-Control": "no-cache" },
      });
      const data = (await res.json()) as any;
      if (res.ok && data.posts) {
        setPosts(data.posts);
      } else {
        feedback.error("Failed to load articles", data.error || "Could not retrieve posts.");
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
    setSummary("");
    setContent("");
    setReadingTime("5 min read");
    setTagsInput("Penetration Testing, Vulnerability Research, Bug Bounty");
    setCoverImageUrl(null);
    setStatus("published");
    setPocImages([]);
    setEditorTab("write");
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
    setEditorTab("write");

    // Extract any existing markdown images from content for quick access
    const extractedImages: UploadedPoCImage[] = [];
    const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
    let match;
    while ((match = imgRegex.exec(p.content)) !== null) {
      extractedImages.push({ name: match[1] || "Screenshot", url: match[2] });
    }
    setPocImages(extractedImages);
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

  // Upload Cover Image via server-side /api/dashboard/upload
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "blog");

      const res = await fetch("/api/dashboard/upload", {
        method: "POST",
        body: formData,
      });

      const data = (await res.json()) as any;
      if (!res.ok || data.error) {
        feedback.error("Upload Failed", data.error || "Could not upload cover image.");
      } else {
        setCoverImageUrl(data.url);
        feedback.success("Cover Attached", "Cover photo uploaded successfully.");
      }
    } catch (err: any) {
      feedback.error("Upload Error", err?.message || "Network error during upload.");
    } finally {
      setIsUploadingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  };

  // Insert text into content textarea at current cursor position
  const insertAtCursor = (textToInsert: string) => {
    const textarea = contentTextareaRef.current;
    if (!textarea) {
      setContent((prev) => prev + textToInsert);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = content.substring(0, start);
    const after = content.substring(end, content.length);

    setContent(before + textToInsert + after);

    // Reposition cursor right after inserted text
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + textToInsert.length, start + textToInsert.length);
    }, 50);
  };

  // Upload inline images and insert markdown tag at cursor
  const uploadInlineFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) {
      feedback.info("No Images Found", "Please select or drop image files.");
      return;
    }

    setIsUploadingInline(true);
    try {
      for (const file of fileArray) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", "blog");

        const res = await fetch("/api/dashboard/upload", {
          method: "POST",
          body: formData,
        });

        const data = (await res.json()) as any;
        if (!res.ok || data.error) {
          feedback.error("Upload Failed", data.error || `Could not upload ${file.name}`);
        } else {
          const imageName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
          const markdownTag = `\n\n![Figure: ${imageName}](${data.url})\n\n`;

          insertAtCursor(markdownTag);
          setPocImages((prev) => [...prev, { name: imageName, url: data.url }]);
          feedback.success("Image Inserted", `"${file.name}" uploaded and inserted into article.`);
        }
      }
    } catch (err: any) {
      feedback.error("Upload Error", err?.message || "Network error while uploading image.");
    } finally {
      setIsUploadingInline(false);
      if (inlineImageInputRef.current) inlineImageInputRef.current.value = "";
    }
  };

  // Handle Drag & Drop inside Content Editor
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingOver) setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadInlineFiles(e.dataTransfer.files);
    }
  };

  // Handle Clipboard Paste (Ctrl+V) for screenshots
  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles: File[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf("image") !== -1) {
        const file = item.getAsFile();
        if (file) {
          // Give pasted screenshot an informative name
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
          const customFile = new File([file], `Poc_Screenshot_${timestamp}.png`, {
            type: file.type || "image/png",
          });
          imageFiles.push(customFile);
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      feedback.info("Uploading Screenshot", "Processing pasted image from clipboard...");
      await uploadInlineFiles(imageFiles);
    }
  };

  // Save Article (Create or Update) via server-side /api/dashboard/blog
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !slug.trim() || !content.trim()) {
      feedback.error("Required Fields Missing", "Please provide title, slug, and content.");
      return;
    }

    setIsSaving(true);
    try {
      const tagsArray = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        id: editingId || undefined,
        title: title.trim(),
        slug: slug.trim(),
        summary: summary.trim(),
        content: content.trim(),
        reading_time: readingTime.trim(),
        tags: tagsArray,
        cover_image_url: coverImageUrl,
        status,
      };

      const res = await fetch("/api/dashboard/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as any;

      if (!res.ok || data.error) {
        feedback.error("Save Failed", data.error || "Could not save article.");
      } else {
        feedback.success(
          editingId ? "Article Updated" : "Article Published",
          `"${title}" has been saved successfully.`
        );
        setIsEditing(false);
        await loadData();
      }
    } catch (err: any) {
      feedback.error("Network Error", err?.message || "Failed to reach server.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Article
  const handleDelete = async (id: string, postTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${postTitle}"?`)) return;

    try {
      const res = await fetch(`/api/dashboard/blog?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as any;

      if (!res.ok || data.error) {
        feedback.error("Delete Failed", data.error || "Could not delete article.");
      } else {
        feedback.success("Article Deleted", `"${postTitle}" has been removed.`);
        await loadData();
      }
    } catch (err: any) {
      feedback.error("Delete Error", err?.message || "Failed to delete article.");
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
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
            Blog & Security Research Notes
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-mono mt-1">
            Write Bugcrowd-style write-ups, vulnerability reports, and reproduction steps with inline images, drag &amp; drop, and clipboard paste (Ctrl+V)
          </p>
        </div>

        <button
          onClick={openNewForm}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity shrink-0 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Write-up / Article</span>
        </button>
      </div>

      {/* Editor Modal / Panel */}
      {isEditing && (
        <div className="rounded-2xl border-2 border-primary/40 bg-card p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="font-mono font-bold text-base text-foreground">
                {editingId ? "Edit Research Note" : "New Security Research Write-up"}
              </h2>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Switcher: Write | Split | Preview */}
              <div className="inline-flex rounded-lg border border-border bg-background p-1 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setEditorTab("write")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    editorTab === "write"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Editor Only"
                >
                  <PenLine className="w-3.5 h-3.5" />
                  <span>Write</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab("split")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    editorTab === "split"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Side-by-side Editor and Live Preview"
                >
                  <Columns className="w-3.5 h-3.5" />
                  <span>Split View</span>
                </button>
                <button
                  type="button"
                  onClick={() => setEditorTab("preview")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    editorTab === "preview"
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Full Live Preview"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground border border-transparent hover:border-border cursor-pointer"
                title="Close Editor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Title & Slug */}
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
                  placeholder="e.g. Account Takeover via JWT Misconfiguration"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-foreground">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="account-takeover-via-jwt-misconfiguration"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-mono focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Executive Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-medium text-foreground">
                Executive Summary / Problem Statement *
              </label>
              <textarea
                rows={2}
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="High-level vulnerability overview, affected endpoint, and potential risk to organization..."
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:border-primary focus:outline-none resize-y"
              />
            </div>

            {/* Content Area with Rich Formatting & Inline Image Support */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
                <label className="text-xs font-mono font-semibold text-foreground flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span>Article Content &amp; Reproduction Steps *</span>
                </label>

                {/* Rich Markdown Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Inline Image Upload File Input */}
                  <input
                    ref={inlineImageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) uploadInlineFiles(e.target.files);
                    }}
                    className="hidden"
                  />

                  {/* Primary "Upload & Insert Image" button */}
                  <button
                    type="button"
                    onClick={() => inlineImageInputRef.current?.click()}
                    disabled={isUploadingInline}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-mono font-semibold hover:opacity-90 transition-opacity cursor-pointer shadow-xs disabled:opacity-50"
                    title="Upload image(s) from computer or screenshot"
                  >
                    {isUploadingInline ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ImagePlus className="w-3.5 h-3.5" />
                    )}
                    <span>{isUploadingInline ? "Uploading Image..." : "Upload & Insert Image"}</span>
                  </button>

                  <div className="h-4 w-px bg-border mx-1" />

                  {/* Quick Formatting Buttons */}
                  <button
                    type="button"
                    onClick={() => insertAtCursor("## ")}
                    className="p-1.5 rounded-lg border border-border bg-background hover:bg-card text-muted-foreground hover:text-foreground text-xs cursor-pointer"
                    title="Heading 2 (##)"
                  >
                    <Heading2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertAtCursor("### ")}
                    className="p-1.5 rounded-lg border border-border bg-background hover:bg-card text-muted-foreground hover:text-foreground text-xs cursor-pointer"
                    title="Heading 3 (###)"
                  >
                    <Heading3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertAtCursor("**Bold Text**")}
                    className="p-1.5 rounded-lg border border-border bg-background hover:bg-card text-muted-foreground hover:text-foreground text-xs cursor-pointer"
                    title="Bold (**text**)"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertAtCursor("*Italic Text*")}
                    className="p-1.5 rounded-lg border border-border bg-background hover:bg-card text-muted-foreground hover:text-foreground text-xs cursor-pointer"
                    title="Italic (*text*)"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertAtCursor("`code`")}
                    className="p-1.5 rounded-lg border border-border bg-background hover:bg-card text-muted-foreground hover:text-foreground text-xs cursor-pointer"
                    title="Inline Code (`code`)"
                  >
                    <Code className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertAtCursor("\n```bash\n# Terminal Command\ncurl -i https://target.com\n```\n")}
                    className="p-1.5 rounded-lg border border-border bg-background hover:bg-card text-muted-foreground hover:text-foreground text-xs cursor-pointer"
                    title="Code Block"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertAtCursor("\n> **Security Impact:** \n")}
                    className="p-1.5 rounded-lg border border-border bg-background hover:bg-card text-muted-foreground hover:text-foreground text-xs cursor-pointer"
                    title="Callout / Quote (>)"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertAtCursor("\n- Item 1\n- Item 2\n")}
                    className="p-1.5 rounded-lg border border-border bg-background hover:bg-card text-muted-foreground hover:text-foreground text-xs cursor-pointer"
                    title="Bullet List (-)"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertAtCursor("[Link Title](https://example.com)")}
                    className="p-1.5 rounded-lg border border-border bg-background hover:bg-card text-muted-foreground hover:text-foreground text-xs cursor-pointer"
                    title="Hyperlink"
                  >
                    <Link2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="h-4 w-px bg-border mx-1" />

                  {/* Bugcrowd Structured Templates */}
                  <button
                    type="button"
                    onClick={() =>
                      insertAtCursor(
                        "\n\n### Step: [Vulnerability Action]\n1. Navigate to target endpoint...\n2. Intercept the request with Burp Suite...\n\n"
                      )
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-card text-muted-foreground hover:text-foreground text-xs font-mono cursor-pointer"
                    title="Insert step-by-step reproduction block"
                  >
                    <ListOrdered className="w-3.5 h-3.5 text-primary" />
                    <span>+ Step</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      insertAtCursor(
                        '\n\n```http\nPOST /api/v1/auth/reset HTTP/1.1\nHost: target.com\nContent-Type: application/json\n\n{"email": "victim@target.com"}\n```\n\n'
                      )
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-background hover:bg-card text-muted-foreground hover:text-foreground text-xs font-mono cursor-pointer"
                    title="Insert raw HTTP request snippet"
                  >
                    <Code className="w-3.5 h-3.5 text-primary" />
                    <span>+ HTTP</span>
                  </button>
                </div>
              </div>

              {/* Drag and Drop Zone Container */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative rounded-xl transition-all ${
                  isDraggingOver
                    ? "ring-2 ring-primary ring-offset-2 ring-offset-background bg-primary/5"
                    : ""
                }`}
              >
                {/* Drag Overlay Notice */}
                {isDraggingOver && (
                  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-card/90 backdrop-blur-sm rounded-xl border-2 border-dashed border-primary p-6 text-center pointer-events-none">
                    <ImagePlus className="w-12 h-12 text-primary animate-bounce mb-2" />
                    <p className="font-mono text-sm font-bold text-foreground">
                      Drop Image Here
                    </p>
                    <p className="font-mono text-xs text-muted-foreground mt-1">
                      It will be uploaded and inserted into the article automatically
                    </p>
                  </div>
                )}

                {/* View 1: Write (Full editor) */}
                {editorTab === "write" && (
                  <div className="space-y-2">
                    <textarea
                      ref={contentTextareaRef}
                      rows={16}
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      onPaste={handlePaste}
                      placeholder={`# Title\n\n### Vulnerability Overview\nExplain the security flaw found in the system...\n\n### Steps to Reproduce (Bugcrowd Style)\n1. Navigate to target endpoint.\n2. Intercept with Burp Suite.\n\n![Figure: Burp Intercept Screenshot](https://...url...)\n\n3. Notice the unauthorized token in the response.\n\n### Impact & Remediation\nDescribe how engineers can patch this issue...`}
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground font-mono text-xs sm:text-sm focus:border-primary focus:outline-none resize-y leading-relaxed font-normal"
                    />
                    <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground font-mono">
                      <span>
                        Tip: Drag &amp; drop images directly into the box, or paste screenshots from clipboard (Ctrl+V).
                      </span>
                      <span>{content.length} characters</span>
                    </div>
                  </div>
                )}

                {/* View 2: Split View (Side-by-side Editor & Live Preview) */}
                {editorTab === "split" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
                        Markdown Source
                      </div>
                      <textarea
                        ref={contentTextareaRef}
                        rows={18}
                        required
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        onPaste={handlePaste}
                        placeholder="Write markdown here... images will preview on the right"
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground font-mono text-xs sm:text-sm focus:border-primary focus:outline-none resize-y leading-relaxed"
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1">
                        Live Rendered Preview
                      </div>
                      <div className="p-5 rounded-xl bg-background border border-border h-[430px] overflow-y-auto">
                        {content.trim() ? (
                          <MarkdownContent content={content} />
                        ) : (
                          <div className="text-center py-12 text-muted-foreground font-mono text-xs italic">
                            Live preview will appear here as you type or drop images.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* View 3: Full Live Preview */}
                {editorTab === "preview" && (
                  <div className="p-6 sm:p-8 rounded-xl bg-background border border-border min-h-[380px] max-h-[650px] overflow-y-auto">
                    {content.trim() ? (
                      <MarkdownContent content={content} />
                    ) : (
                      <div className="text-center py-12 text-muted-foreground font-mono text-xs italic">
                        No content written yet. Switch to &quot;Write&quot; mode to author your reproduction steps and insert PoC screenshots.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Uploaded PoC Screenshots Gallery */}
              {pocImages.length > 0 && (
                <div className="p-4 rounded-xl bg-background/50 border border-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-foreground flex items-center gap-1.5">
                      <ImagePlus className="w-3.5 h-3.5 text-primary" />
                      <span>Article Images ({pocImages.length})</span>
                    </span>
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Click &quot;Insert Tag&quot; to place image markdown at cursor
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {pocImages.map((img, i) => (
                      <div
                        key={i}
                        className="group relative rounded-lg border border-border bg-card p-2 space-y-2 hover:border-primary/50 transition-colors"
                      >
                        <div className="relative w-full aspect-video rounded overflow-hidden bg-background">
                          <Image src={img.url} alt={img.name} fill className="object-contain" />
                        </div>
                        <p className="text-[11px] font-mono text-foreground truncate" title={img.name}>
                          {img.name}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => insertAtCursor(`\n\n![Figure: ${img.name}](${img.url})\n\n`)}
                            className="w-full py-1 rounded bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-mono font-semibold transition-colors cursor-pointer"
                          >
                            Insert Tag
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(`![Figure: ${img.name}](${img.url})`);
                              setCopiedImageUrl(img.url);
                              setTimeout(() => setCopiedImageUrl(null), 2000);
                            }}
                            className="p-1 rounded border border-border hover:bg-background text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Copy Markdown"
                          >
                            {copiedImageUrl === img.url ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Metadata (Reading Time, Tags, Status) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-2 border-t border-border">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-foreground">
                  Reading Time
                </label>
                <input
                  type="text"
                  value={readingTime}
                  onChange={(e) => setReadingTime(e.target.value)}
                  placeholder="5 min read"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-foreground">
                  Tags (Comma-separated)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="Bug Bounty, Web Security, OWASP"
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:border-primary focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-medium text-foreground">
                  Publication Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm focus:border-primary focus:outline-none"
                >
                  <option value="published">Published (Public)</option>
                  <option value="draft">Draft (Private)</option>
                </select>
              </div>
            </div>

            {/* Optional Header Cover Photo Upload */}
            <div className="space-y-2 pt-2 border-t border-border">
              <label className="text-xs font-mono font-medium text-foreground">
                Header Cover Photo (Optional)
              </label>
              <div className="flex items-center gap-4">
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={isUploadingCover}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-background hover:bg-card text-xs font-mono text-foreground cursor-pointer disabled:opacity-50"
                >
                  {isUploadingCover ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                  ) : (
                    <Upload className="w-3.5 h-3.5 text-primary" />
                  )}
                  <span>{isUploadingCover ? "Uploading Cover..." : "Upload Cover Image"}</span>
                </button>
                {coverImageUrl && (
                  <span className="text-xs font-mono text-emerald-500">Cover photo attached</span>
                )}
              </div>
            </div>

            {/* Save / Cancel Action Bar */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-5 py-2.5 rounded-xl border border-border text-xs font-mono hover:bg-background cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{editingId ? "Update Write-up" : "Publish Write-up"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Published Articles List */}
      {posts.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl text-muted-foreground text-xs font-mono space-y-2">
          <ShieldAlert className="w-8 h-8 text-primary mx-auto" />
          <p>No write-ups published yet. Click &quot;New Write-up / Article&quot; to write your first vulnerability research note.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-5 rounded-2xl border border-border bg-card/60 flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-primary" />
                    <span>{formatDate(post.published_at || post.created_at)}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                      post.status === "published"
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {post.status}
                  </span>
                </div>

                <h3 className="font-mono font-bold text-base text-foreground line-clamp-2">
                  {post.title}
                </h3>

                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {post.summary}
                </p>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 rounded text-[10px] font-mono bg-background border border-border text-foreground/80"
                      >
                        {tag}
                      </span>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="text-[10px] font-mono text-muted-foreground self-center">
                        +{post.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <a
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Public Page</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditForm(post)}
                    className="p-1.5 rounded-lg border border-border bg-background hover:bg-card text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Edit article"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id, post.title)}
                    className="p-1.5 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 cursor-pointer"
                    title="Delete article"
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
