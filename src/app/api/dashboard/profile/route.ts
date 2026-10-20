import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { hasOwnerSession } from "@/lib/owner-auth";

export const dynamic = "force-dynamic";

/**
 * GET: Fetch profile for the dashboard
 */
export async function GET(request: NextRequest) {
  try {
    if (!hasOwnerSession(request)) {
      return NextResponse.json({ error: "Unauthorized. Owner session required." }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data: profile, error } = await admin
      .from("profiles")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Fetch profile error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, profile });
  } catch (error: any) {
    console.error("GET profile route exception:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

/**
 * POST: Create or Update profile
 */
export async function POST(request: NextRequest) {
  try {
    if (!hasOwnerSession(request)) {
      return NextResponse.json({ error: "Unauthorized. Owner session required." }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, any>;
    const {
      id,
      user_id = "e76d3223-c0ac-4662-b3df-a50ad34f4e84",
      full_name,
      headline,
      bio,
      about_description,
      avatar_url,
      email,
      phone,
      location,
      resume_url,
      status = "published",
    } = body;

    const admin = createAdminClient();

    const payload = {
      user_id,
      full_name: (full_name || "Ritesh Prajapati").trim(),
      headline: (headline || "Cybersecurity Specialist & Penetration Tester").trim(),
      bio: (bio || "").trim(),
      about_description: (about_description || "").trim(),
      avatar_url: avatar_url || null,
      email: (email || "panditritesh005@gmail.com").trim(),
      phone: phone ? phone.trim() : null,
      location: location ? location.trim() : null,
      resume_url: resume_url || null,
      status,
      updated_at: new Date().toISOString(),
    };

    let targetProfileId = id;
    if (!targetProfileId) {
      const { data: existing } = await admin
        .from("profiles")
        .select("id")
        .limit(1)
        .maybeSingle();
      if (existing?.id) {
        targetProfileId = existing.id;
      }
    }

    let savedProfile: any = null;

    if (targetProfileId) {
      const { data, error } = await admin
        .from("profiles")
        .update(payload)
        .eq("id", targetProfileId)
        .select()
        .single();

      if (error) {
        console.error("Update profile error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      savedProfile = data;
    } else {
      const { data, error } = await admin
        .from("profiles")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.error("Insert profile error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      savedProfile = data;
    }

    return NextResponse.json({ success: true, profile: savedProfile });
  } catch (error: any) {
    console.error("POST profile route exception:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to save profile" },
      { status: 500 }
    );
  }
}
