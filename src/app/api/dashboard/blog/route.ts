import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { hasOwnerSession } from "@/lib/owner-auth";

export const dynamic = "force-dynamic";

/**
 * GET: Fetch all blog articles for the dashboard
 */
export async function GET() {
  try {
    if (!hasOwnerSession()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: posts, error } = await admin
      .from("blog_posts")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, posts: posts || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch articles" }, { status: 500 });
  }
}

/**
 * POST: Create or Update a blog article
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate Owner
    if (!hasOwnerSession()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, any>;
    const {
      id,
      title,
      slug,
      summary,
      content,
      reading_time,
      tags,
      cover_image_url,
      status = "published",
    } = body;

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Title, slug, and content are required." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 2. Resolve owner profile
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .limit(1)
      .maybeSingle();

    const profileId = profile?.id || "00000000-0000-0000-0000-000000000001";

    const payload = {
      profile_id: profileId,
      title: title.trim(),
      slug: slug.trim().toLowerCase(),
      summary: (summary || "").trim(),
      content: content.trim(),
      reading_time: (reading_time || "5 min read").trim(),
      tags: Array.isArray(tags) ? tags : [],
      cover_image_url: cover_image_url || null,
      status: status || "published",
      updated_at: new Date().toISOString(),
    };

    // 3. Update or Insert
    if (id) {
      const { data, error } = await admin
        .from("blog_posts")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Update blog post error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, post: data });
    } else {
      const { data, error } = await admin
        .from("blog_posts")
        .insert({
          ...payload,
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error("Create blog post error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, post: data }, { status: 201 });
    }
  } catch (error: any) {
    console.error("Blog post route exception:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error while saving article." },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Soft delete a blog article
 */
export async function DELETE(request: NextRequest) {
  try {
    if (!hasOwnerSession()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing article ID" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("blog_posts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete article" }, { status: 500 });
  }
}
