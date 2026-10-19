import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase-middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Refresh Supabase auth session
  const { supabase, user, response } = await updateSession(request);
  const ownerCookieValue = request.cookies.get("ritesh_owner_session")?.value;
  let hasOwnerSession = false;
  if (ownerCookieValue) {
    try {
      const decoded = atob(ownerCookieValue);
      hasOwnerSession = decoded.startsWith("panditritesh005@gmail.com:");
    } catch {
      hasOwnerSession = false;
    }
  }
  const isAuthenticated = hasOwnerSession || Boolean(user);

  // 2. Redirect removed signup page directly to login
  if (pathname === "/auth/signup") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // 3. Dashboard route protection & strict owner authorization
  if (pathname.startsWith("/dashboard")) {
    if (!isAuthenticated) {
      const redirectUrl = new URL("/auth/login", request.url);
      redirectUrl.searchParams.set("next", pathname);
      const redirectResponse = NextResponse.redirect(redirectUrl);
      redirectResponse.cookies.delete("ritesh_owner_session");
      return redirectResponse;
    }

    // Check MFA Authenticator Assurance Level (AAL) if Supabase is active
    if (!hasOwnerSession && supabase && user) {
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData && aalData.nextLevel === "aal2" && aalData.currentLevel !== "aal2") {
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("step", "mfa");
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // 4. Auth login redirect if already logged in
  if (pathname === "/auth/login") {
    // If arriving with ?next= (meaning redirected from an unauthorized check) or ?error,
    // do NOT redirect back to /dashboard. Clear the stale cookie and show the login form!
    if (request.nextUrl.searchParams.has("next") || request.nextUrl.searchParams.has("error")) {
      const loginResponse = NextResponse.next();
      loginResponse.cookies.delete("ritesh_owner_session");
      return loginResponse;
    }

    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 4. Security Headers & Content-Security-Policy (CSP)
  const isProd = process.env.NODE_ENV === "production";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  let supabaseHost = "";
  try {
    if (supabaseUrl) {
      supabaseHost = new URL(supabaseUrl).host;
    }
  } catch {
    // ignore
  }

  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' data: blob: https: ${supabaseHost ? `https://${supabaseHost}` : ""}`,
    "font-src 'self' data:",
    `connect-src 'self' https: wss: ${supabaseHost ? `https://${supabaseHost} wss://${supabaseHost}` : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].filter(Boolean).join("; ");

  response.headers.set("Content-Security-Policy", cspDirectives);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");

  if (isProd) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
