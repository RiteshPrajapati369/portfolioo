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

/**
 * Dispatches an email notification to the portfolio owner.
 * Supports Resend API (cloud-native edge fetch) and Webhooks.
 */
async function dispatchEmailNotification(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
  ip: string;
}) {
  const ownerEmail = process.env.OWNER_EMAIL || "panditritesh005@gmail.com";
  const resendApiKey = process.env.RESEND_API_KEY;
  const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL;

  // 1. Send via Resend if API key is provided
  if (resendApiKey) {
    try {
      const fromEmail = process.env.EMAIL_FROM || "Portfolio Alert <onboarding@resend.dev>";
      const htmlBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 24px; margin: 0; }
            .container { max-width: 600px; margin: 0 auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 32px; }
            .badge { display: inline-block; padding: 4px 10px; background-color: #3b82f620; border: 1px solid #3b82f640; color: #60a5fa; border-radius: 6px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 16px; }
            h2 { color: #ffffff; margin-top: 0; font-size: 20px; font-weight: 700; }
            .field { margin-bottom: 16px; }
            .label { font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
            .value { font-size: 14px; color: #f1f5f9; }
            .message-box { background-color: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 16px; font-size: 14px; line-height: 1.6; color: #e2e8f0; white-space: pre-wrap; margin-top: 16px; }
            .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #334155; font-size: 12px; color: #64748b; }
            .btn { display: inline-block; margin-top: 16px; padding: 10px 20px; background-color: #3b82f6; color: #ffffff !important; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 13px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="badge">Portfolio Contact Inquiry</div>
            <h2>New Message Received</h2>
            
            <div class="field">
              <div class="label">Sender Name</div>
              <div class="value">${payload.name}</div>
            </div>

            <div class="field">
              <div class="label">Sender Email</div>
              <div class="value"><a href="mailto:${payload.email}" style="color: #60a5fa;">${payload.email}</a></div>
            </div>

            <div class="field">
              <div class="label">Subject</div>
              <div class="value">${payload.subject}</div>
            </div>

            <div class="field">
              <div class="label">Message</div>
              <div class="message-box">${payload.message}</div>
            </div>

            <a href="mailto:${payload.email}?subject=Re: ${encodeURIComponent(payload.subject)}" class="btn">Reply Directly to ${payload.name}</a>

            <div class="footer">
              Submitted from IP: ${payload.ip} &bull; Timestamp: ${new Date().toUTCString()}<br>
              This message was securely saved to your Supabase Admin Dashboard.
            </div>
          </div>
        </body>
        </html>
      `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [ownerEmail],
          reply_to: payload.email,
          subject: `[Portfolio Inquiry] ${payload.subject} from ${payload.name}`,
          text: `New contact submission from ${payload.name} (${payload.email}):\n\nSubject: ${payload.subject}\n\nMessage:\n${payload.message}\n\nSender IP: ${payload.ip}\nSent to: ${ownerEmail}`,
          html: htmlBody,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Resend API delivery error:", errorText);
      } else {
        console.log(`[Contact] Email alert successfully forwarded to ${ownerEmail}`);
      }
    } catch (err) {
      console.error("Failed to forward contact email via Resend:", err);
    }
  } else {
    console.info(
      `[Contact Dispatch] Note: Message saved to Supabase database. To enable immediate email delivery to ${ownerEmail}, configure RESEND_API_KEY in your environment.`
    );
  }

  // 2. Optional Webhook dispatch (e.g. Discord, Slack, Zapier)
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `📬 **New Portfolio Inquiry**\n**From:** ${payload.name} (${payload.email})\n**Subject:** ${payload.subject}\n**Message:**\n${payload.message}`,
        }),
      });
    } catch (err) {
      console.error("Webhook notification error:", err);
    }
  }
}

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

    // 5. Insert into contact_messages table (visible in Admin Dashboard)
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

    // 6. Forward notification to owner email asynchronously
    dispatchEmailNotification({
      name,
      email,
      subject,
      message,
      ip: clientIp,
    }).catch((err) => console.error("Email dispatch unhandled:", err));

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
