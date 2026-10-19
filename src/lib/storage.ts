import { createClient } from "./supabase-browser";

export type StorageBucket = "avatars" | "resumes" | "projects" | "blog" | "media";

/**
 * Uploads a file to Supabase Storage using the required owner-scoped path prefix: /<user-id>/...
 */
export async function uploadFile(
  bucket: StorageBucket,
  file: File,
  userId: string,
  customPrefix?: string
): Promise<{ url: string; path: string; error?: string }> {
  try {
    const supabase = createClient();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const timestamp = Date.now();
    const folder = customPrefix ? `${customPrefix}/` : "";
    const filePath = `${userId}/${folder}${timestamp}_${cleanFileName}`;

    const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (error || !data) {
      console.error("Storage upload error:", error);
      return { url: "", path: "", error: error?.message || "File upload failed" };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(data.path);

    return {
      url: publicUrl,
      path: data.path,
    };
  } catch (err: any) {
    console.error("Storage upload exception:", err);
    return { url: "", path: "", error: err?.message || "Unexpected upload failure" };
  }
}
