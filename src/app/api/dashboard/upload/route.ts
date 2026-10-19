import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { hasOwnerSession } from "@/lib/owner-auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate Owner Session
    if (!hasOwnerSession(request)) {
      return NextResponse.json(
        { error: "Unauthorized. Please log in to the owner dashboard." },
        { status: 401 }
      );
    }

    // 2. Parse Multipart Form Data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const bucket = (formData.get("bucket") as string) || "projects";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided for upload." },
        { status: 400 }
      );
    }

    // Check file size (max 20MB)
    const MAX_FILE_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File exceeds maximum size limit (20MB)." },
        { status: 400 }
      );
    }

    // 3. Prepare File Buffer & Path
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const timestamp = Date.now();
    const folder = bucket === "projects" ? "projects" : "articles";
    const filePath = `${folder}/${timestamp}_${cleanFileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 4. Upload with Supabase Admin Client (Bypasses RLS)
    const admin = createAdminClient();
    let uploadBucket = bucket;

    let { data, error: uploadError } = await admin.storage
      .from(uploadBucket)
      .upload(filePath, buffer, {
        contentType: file.type || "image/png",
        cacheControl: "31536000",
        upsert: true,
      });

    // Fallback: If target bucket failed, try "blog" bucket
    if (uploadError && uploadBucket !== "blog") {
      console.warn(`Upload to ${uploadBucket} failed, falling back to blog bucket:`, uploadError);
      uploadBucket = "blog";
      const fallbackPath = `uploads/${timestamp}_${cleanFileName}`;
      const fallbackResult = await admin.storage
        .from("blog")
        .upload(fallbackPath, buffer, {
          contentType: file.type || "image/png",
          cacheControl: "31536000",
          upsert: true,
        });
      data = fallbackResult.data;
      uploadError = fallbackResult.error;
    }

    if (uploadError || !data) {
      console.error("Storage upload failed:", uploadError);
      return NextResponse.json(
        { error: uploadError?.message || "Storage upload failed." },
        { status: 500 }
      );
    }

    // 5. Get Public URL
    const {
      data: { publicUrl },
    } = admin.storage.from(uploadBucket).getPublicUrl(data.path);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: cleanFileName,
      path: data.path,
    });
  } catch (error: any) {
    console.error("Upload route exception:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error during upload." },
      { status: 500 }
    );
  }
}
