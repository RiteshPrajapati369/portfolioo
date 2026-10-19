import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { hasOwnerSession } from "@/lib/owner-auth";

export const dynamic = "force-dynamic";

/**
 * GET: Fetch all projects for the dashboard
 */
export async function GET(request: NextRequest) {
  try {
    if (!hasOwnerSession(request)) {
      return NextResponse.json({ error: "Unauthorized. Owner session required." }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: projects, error } = await admin
      .from("projects")
      .select("*")
      .is("deleted_at", null)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Fetch projects error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, projects: projects || [] });
  } catch (error: any) {
    console.error("GET projects route exception:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

/**
 * POST: Create or Update a project
 */
export async function POST(request: NextRequest) {
  try {
    if (!hasOwnerSession(request)) {
      return NextResponse.json({ error: "Unauthorized. Owner session required." }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, any>;
    const {
      id,
      title,
      slug,
      description,
      content,
      category = "Security Engineering",
      github_url,
      live_url,
      thumbnail_url,
      status = "published",
      sort_order = 1,
    } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // 1. Resolve owner profile
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .limit(1)
      .maybeSingle();

    const profileId = profile?.id || "00000000-0000-0000-0000-000000000001";

    // 2. Sanitize slug
    let cleanSlug = (slug || title)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!cleanSlug) {
      cleanSlug = `project-${Date.now()}`;
    }

    const payload = {
      profile_id: profileId,
      title: title.trim(),
      slug: cleanSlug,
      description: description.trim(),
      content: content ? content.trim() : null,
      category: (category || "Security Engineering").trim(),
      github_url: github_url ? github_url.trim() : null,
      live_url: live_url ? live_url.trim() : null,
      thumbnail_url: thumbnail_url || null,
      status: status || "published",
      sort_order: typeof sort_order === "number" ? sort_order : 1,
      updated_at: new Date().toISOString(),
    };

    if (id) {
      const { data, error } = await admin
        .from("projects")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("Update project error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, project: data });
    } else {
      // Check for slug collision on new project
      const { data: existing } = await admin
        .from("projects")
        .select("id")
        .eq("slug", cleanSlug)
        .maybeSingle();

      if (existing) {
        payload.slug = `${cleanSlug}-${Date.now().toString(36)}`;
      }

      const { data, error } = await admin
        .from("projects")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Create project error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, project: data }, { status: 201 });
    }
  } catch (error: any) {
    console.error("POST projects route exception:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error while saving project." },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Soft delete a project
 */
export async function DELETE(request: NextRequest) {
  try {
    if (!hasOwnerSession(request)) {
      return NextResponse.json({ error: "Unauthorized. Owner session required." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing project ID" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await admin
      .from("projects")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.error("Delete project error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE projects route exception:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete project" },
      { status: 500 }
    );
  }
}
