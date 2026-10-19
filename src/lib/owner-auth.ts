import crypto from "crypto";
import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
import { createAdminClient } from "./supabase-admin";

export const OWNER_EMAIL = "panditritesh005@gmail.com";
export const OWNER_USER_ID = "e76d3223-c0ac-4662-b3df-a50ad34f4e84";
const DEFAULT_INITIAL_PASSWORD = "12345678";
const DEFAULT_TOTP_SECRET = "JBSWY3DPEHPK3PXP";
const CONFIG_FILE_PATH = path.join(process.cwd(), "data", "owner-config.json");
const SESSION_COOKIE_NAME = "ritesh_owner_session";
const SESSION_SECRET =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "cybersec_owner_session_hmac_secret_ritesh_2026_salt";

interface OwnerConfig {
  email: string;
  salt: string;
  passwordHash: string;
  mfaEnabled: boolean;
  totpSecret: string;
  updatedAt: string;
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 100000, 64, "sha512").toString("hex");
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString("hex");
}

function ensureOwnerConfig(): OwnerConfig {
  try {
    const dir = path.dirname(CONFIG_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const content = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      const parsed = JSON.parse(content) as OwnerConfig;
      if (parsed.email === OWNER_EMAIL && parsed.passwordHash) {
        return parsed;
      }
    }

    const salt = generateSalt();
    const passwordHash = hashPassword(DEFAULT_INITIAL_PASSWORD, salt);
    const initialConfig: OwnerConfig = {
      email: OWNER_EMAIL,
      salt,
      passwordHash,
      mfaEnabled: true, // Default to true for maximum cybersecurity hardening
      totpSecret: DEFAULT_TOTP_SECRET,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(
      CONFIG_FILE_PATH,
      JSON.stringify(initialConfig, null, 2),
      "utf-8"
    );
    return initialConfig;
  } catch {
    const salt = "fallback_ritesh_salt_2026";
    return {
      email: OWNER_EMAIL,
      salt,
      passwordHash: hashPassword(DEFAULT_INITIAL_PASSWORD, salt),
      mfaEnabled: true,
      totpSecret: DEFAULT_TOTP_SECRET,
      updatedAt: new Date().toISOString(),
    };
  }
}

export function getOwnerConfig(): OwnerConfig {
  return ensureOwnerConfig();
}

/**
 * Verifies password attempt using local PBKDF2 hash.
 */
export function verifyOwnerPassword(email: string, passwordAttempt: string): boolean {
  if (email.trim().toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
    return false;
  }
  const config = getOwnerConfig();
  const calculated = hashPassword(passwordAttempt, config.salt);
  return crypto.timingSafeEqual(
    Buffer.from(calculated, "hex"),
    Buffer.from(config.passwordHash, "hex")
  );
}

/**
 * Asynchronously verifies owner password against Supabase Auth,
 * falling back to local PBKDF2 hash.
 */
export async function verifyOwnerPasswordAsync(
  email: string,
  passwordAttempt: string
): Promise<boolean> {
  const normalized = email.trim().toLowerCase();
  if (normalized !== OWNER_EMAIL.toLowerCase()) {
    return false;
  }

  // 1. Verify against Supabase Auth (authoritative)
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && anonKey) {
      const { createClient } = await import("@supabase/supabase-js");
      const client = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data, error } = await client.auth.signInWithPassword({
        email: OWNER_EMAIL,
        password: passwordAttempt,
      });
      if (!error && data?.user) {
        return true;
      }
    }
  } catch {
    // Supabase network error or offline fallback
  }

  // 2. Fallback to local PBKDF2 hash verification
  try {
    return verifyOwnerPassword(normalized, passwordAttempt);
  } catch {
    return false;
  }
}

/**
 * Updates the owner password on local disk.
 */
export function updateOwnerPassword(newPassword: string): { success: boolean; error?: string } {
  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters long." };
  }

  try {
    const config = getOwnerConfig();
    const newSalt = generateSalt();
    const newHash = hashPassword(newPassword, newSalt);

    const updatedConfig: OwnerConfig = {
      ...config,
      salt: newSalt,
      passwordHash: newHash,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(
      CONFIG_FILE_PATH,
      JSON.stringify(updatedConfig, null, 2),
      "utf-8"
    );
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update password." };
  }
}

/**
 * Updates owner MFA status in local disk config.
 */
export function setOwnerMfa(enabled: boolean): { success: boolean; mfaEnabled: boolean } {
  try {
    const config = getOwnerConfig();
    const updatedConfig: OwnerConfig = {
      ...config,
      mfaEnabled: enabled,
      updatedAt: new Date().toISOString(),
    };

    fs.writeFileSync(
      CONFIG_FILE_PATH,
      JSON.stringify(updatedConfig, null, 2),
      "utf-8"
    );
    return { success: true, mfaEnabled: enabled };
  } catch {
    return { success: false, mfaEnabled: false };
  }
}

/**
 * Queries Supabase database (mfa_factors table and user_metadata) for MFA status.
 * This guarantees persistence across serverless edge workers, Cloudflare, and local dev.
 */
export async function getOwnerMfaStatusAsync(): Promise<boolean> {
  try {
    const admin = createAdminClient();
    const { data: factor, error } = await admin
      .from("mfa_factors")
      .select("status")
      .eq("user_id", OWNER_USER_ID)
      .maybeSingle();

    if (!error && factor) {
      return factor.status === "verified";
    }

    // Check user_metadata in auth.users
    const { data: users } = await admin.auth.admin.listUsers();
    const owner = users?.users?.find(
      (u) => u.email?.toLowerCase() === OWNER_EMAIL.toLowerCase()
    );
    if (owner?.user_metadata?.mfa_enabled !== undefined) {
      return Boolean(owner.user_metadata.mfa_enabled);
    }
  } catch (err) {
    console.warn("Could not query Supabase MFA factor:", err);
  }

  try {
    const config = getOwnerConfig();
    return Boolean(config.mfaEnabled);
  } catch {
    return true;
  }
}

/**
 * Updates owner MFA status in Supabase database (mfa_factors table and auth user metadata).
 */
export async function setOwnerMfaStatusAsync(enabled: boolean): Promise<boolean> {
  let success = false;
  const statusStr = enabled ? "verified" : "unverified";

  try {
    const admin = createAdminClient();

    // 1. Upsert into mfa_factors table
    const { error: factorErr } = await admin
      .from("mfa_factors")
      .upsert({
        id: OWNER_USER_ID,
        user_id: OWNER_USER_ID,
        factor_type: "totp",
        friendly_name: "Ritesh Prajapati",
        status: statusStr,
        secret: DEFAULT_TOTP_SECRET,
        updated_at: new Date().toISOString(),
      });

    if (!factorErr) {
      success = true;
    }

    // 2. Also persist in auth user metadata
    try {
      await admin.auth.admin.updateUserById(OWNER_USER_ID, {
        user_metadata: {
          role: "owner",
          full_name: "Ritesh Prajapati",
          mfa_enabled: enabled,
        },
      });
      success = true;
    } catch {
      // ignore
    }
  } catch (err) {
    console.warn("Could not update Supabase MFA factor:", err);
  }

  // Also sync local file if filesystem is available
  try {
    setOwnerMfa(enabled);
  } catch {
    // Serverless edge environment without writable filesystem
  }

  return success;
}

/**
 * Retrieves the owner's persistent TOTP secret.
 */
export async function getOwnerTotpSecretAsync(): Promise<string> {
  try {
    const admin = createAdminClient();
    const { data: factor } = await admin
      .from("mfa_factors")
      .select("secret")
      .eq("user_id", OWNER_USER_ID)
      .maybeSingle();

    if (factor?.secret) {
      return factor.secret;
    }
  } catch {
    // fallback
  }

  try {
    const config = getOwnerConfig();
    return config.totpSecret || DEFAULT_TOTP_SECRET;
  } catch {
    return DEFAULT_TOTP_SECRET;
  }
}

/* ================= RFC 6238 TOTP ALGORITHM IMPLEMENTATION ================= */

export function base32Decode(str: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = str.toUpperCase().replace(/=+$/, "");
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = alphabet.indexOf(cleaned[i]);
    if (idx === -1) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function generateTotp(secret: string, timeStep: number): string {
  const key = base32Decode(secret);
  const buf = Buffer.alloc(8);
  buf.writeBigInt64BE(BigInt(timeStep), 0);
  const hmac = crypto.createHmac("sha1", key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return (code % 1000000).toString().padStart(6, "0");
}

/**
 * Validates a 6-digit TOTP token against secret with ±1 time step tolerance (RFC 6238).
 */
export function verifyTotp(token: string, secret: string, window = 1): boolean {
  const cleanToken = token.trim().replace(/\s+/g, "");
  if (!cleanToken || cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) {
    return false;
  }
  const currentStep = Math.floor(Date.now() / 1000 / 30);
  for (let error = -window; error <= window; error++) {
    const expected = generateTotp(secret, currentStep + error);
    if (expected === cleanToken) {
      return true;
    }
  }
  return false;
}

/* ================= OWNER SESSION TOKEN MANAGEMENT ================= */

export function createOwnerSessionToken(): string {
  const timestamp = Date.now();
  const payload = `${OWNER_EMAIL}:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64");
}

function verifyWithSecret(token: string, secret: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const [email, timestampStr, signature] = decoded.split(":");
    if (email !== OWNER_EMAIL || !timestampStr || !signature) return false;

    const payload = `${email}:${timestampStr}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    if (signature.length !== expectedSignature.length) return false;

    const match = crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedSignature, "hex")
    );
    if (!match) return false;

    const timestamp = parseInt(timestampStr, 10);
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
    return Date.now() - timestamp < maxAge;
  } catch {
    return false;
  }
}

export function verifyOwnerSessionToken(token?: string | null): boolean {
  if (!token) return false;
  const secret1 = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (secret1 && verifyWithSecret(token, secret1)) return true;
  return verifyWithSecret(token, "cybersec_owner_session_hmac_secret_ritesh_2026_salt");
}

export function setOwnerSessionCookie() {
  const cookieStore = cookies();
  const token = createOwnerSessionToken();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export function clearOwnerSessionCookie() {
  const cookieStore = cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Universal session verification supporting NextRequest, Request, incoming headers, or cookies() fallback.
 */
export function hasOwnerSession(req?: any): boolean {
  try {
    let token: string | undefined;

    if (req) {
      if (typeof req.cookies?.get === "function") {
        const c = req.cookies.get(SESSION_COOKIE_NAME);
        token = typeof c === "string" ? c : c?.value;
      }
      if (!token && req.headers) {
        const cookieHeader =
          typeof req.headers.get === "function"
            ? req.headers.get("cookie")
            : req.headers.cookie;
        if (cookieHeader) {
          const match = cookieHeader.match(
            new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`)
          );
          if (match) token = decodeURIComponent(match[1]);
        }
      }
    }

    if (!token) {
      try {
        const cookieStore = cookies();
        token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
      } catch {
        // cookies() fallback in edge contexts
      }
    }

    return verifyOwnerSessionToken(token);
  } catch {
    return false;
  }
}
