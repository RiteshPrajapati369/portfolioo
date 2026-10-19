"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Upload,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { uploadFile } from "@/lib/storage";
import { feedback } from "@/lib/feedback";
import type { MediaItem, Profile } from "@/types";

export default function MediaDashboardPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadMedia = async () => {
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
      const { data: items } = await supabase
        .from("media_library")
        .select("*")
        .eq("profile_id", p.id)
        .order("created_at", { ascending: false });

      setMedia(items || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadMedia();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId || !profile?.id) return;

    setIsUploading(true);
    try {
      const res = await uploadFile("media", file, userId);
      if (res.error) {
        feedback.error("Upload Error", res.error);
      } else {
        const supabase = createClient();
        await supabase.from("media_library").insert({
          profile_id: profile.id,
          file_name: file.name,
          file_url: res.url,
          bucket_name: "media",
          file_size: file.size,
          mime_type: file.type,
        });

        feedback.success("Media Saved", "Asset uploaded and indexed in media library.");
        await loadMedia();
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.file_url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
    feedback.info("Copied", "Public asset URL copied to clipboard.");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this asset from media library?")) return;

    const supabase = createClient();
    try {
      const { error } = await supabase.from("media_library").delete().eq("id", id);
      if (error) throw error;
      feedback.success("Asset Removed", "Asset deleted from library.");
      await loadMedia();
    } catch (err: any) {
      feedback.error("Delete Failed", err?.message);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
        Loading media library...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
            Media Library & Assets
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-mono mt-1">
            Upload and copy CDN URLs for diagrams, write-up screenshots, and assets
          </p>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-semibold uppercase tracking-wider hover:opacity-90 disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span>Upload Media</span>
          </button>
        </div>
      </div>

      {/* Media Grid */}
      {media.length === 0 ? (
        <div className="p-16 text-center border border-dashed border-border rounded-2xl text-muted-foreground text-xs font-mono space-y-2">
          <ImageIcon className="w-8 h-8 text-primary mx-auto" />
          <p>No media files uploaded yet. Click &quot;Upload Media&quot; above to store assets.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {media.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-border bg-card/60 p-3 space-y-2.5 flex flex-col justify-between group hover:border-primary/40 transition-colors shadow-sm"
            >
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-background border border-border flex items-center justify-center">
                {item.mime_type?.startsWith("image/") ? (
                  <Image
                    src={item.file_url}
                    alt={item.file_name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                )}
              </div>

              <div className="space-y-1">
                <div className="text-xs font-mono font-medium text-foreground truncate" title={item.file_name}>
                  {item.file_name}
                </div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase">
                  {item.bucket_name} &bull; {Math.round((item.file_size || 0) / 1024)} KB
                </div>
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between">
                <button
                  onClick={() => handleCopyUrl(item)}
                  className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground hover:text-primary transition-colors"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedId === item.id ? "Copied" : "Copy URL"}</span>
                </button>

                <div className="flex items-center gap-1">
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-muted-foreground hover:text-foreground"
                    title="Open asset"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1 text-destructive/70 hover:text-destructive"
                    title="Delete"
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
