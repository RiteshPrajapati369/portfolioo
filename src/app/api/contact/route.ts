import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase-admin";

// In-memory rate limiter: max 5 requests per IP per 10 minutes
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;
const ipRequestHistory = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = ipRequestHistory.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    ipRequestHistory.set(ip, validTimestamps);
    return true;
  }

  validTimestamps.push(now);
  ipRequestHistory.set(ip, validTimestamps);
  return false;
}

// Zod Schema for strict validation and injection protection
const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(80, "Name cannot exceed 80 characters")
    .regex(/^[a-zA-Z0-9\s.,'’\-]+$/, "Name contains invalid characters"),
  email: z
    .string()
    .trim()
    .email("Invalid email address format")
    .max(120, "Email cannot exceed 120 characters"),
  subject: z
    .string()
    .trim()
    .min(3, "Subject must be at least 3 characters")
    .max(150, "Subject cannot exceed 150 characters")
    .transform((val) => val.replace(/[<>]/g, "")),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters")
    .max(3000, "Message cannot exceed 3000 characters")
    .transform((val) => val.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Cloudflare-safe IP resolution
    const cfIp = request.headers.get("cf-connecting-ip");
    const forwardedFor = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const clientIp = cfIp || realIp || (forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1");
    const userAgent = request.headers.get("user-agent") || "unknown";

    // 2. Rate limiting check
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes before trying again." },
        { status: 429 }
      );
    }

    // 3. Body parse and Zod validation
    const rawBody = await request.json();
    const parseResult = contactSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors.map((e) => e.message).join(". ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { name, email, subject, message } = parseResult.data;

    // 4. Resolve owner profile_id server-side
    const admin = createAdminClient();
    let targetProfileId = process.env.NEXT_PUBLIC_PORTFOLIO_PROFILE_ID;

    if (!targetProfileId) {
      const { data: firstProfile } = await admin
        .from("profiles")
        .select("id")
        .eq("status", "published")
        .is("deleted_at", null)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      targetProfileId = firstProfile?.id;
    }

    if (!targetProfileId) {
      return NextResponse.json(
        { error: "Contact service is currently unavailable. Please try again later." },
        { status: 503 }
      );
    }

    // 5. Insert into contact_messages table
    const { error: insertError } = await admin.from("contact_messages").insert({
      profile_id: targetProfileId,
      name,
      email,
      subject,
      message,
      ip_address: clientIp,
      user_agent: userAgent.slice(0, 255),
      status: "new",
    });

    if (insertError) {
      console.error("Failed to insert contact message:", insertError);
      return NextResponse.json(
        { error: "An unexpected database error occurred while sending your message." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your message has been securely submitted. I will review it shortly.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Contact API internal failure:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
