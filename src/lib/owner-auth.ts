import crypto from "crypto";
import fs from "fs";
import path from "path";
import { cookies } from "next/headers";

export const OWNER_EMAIL = "panditritesh005@gmail.com";
const DEFAULT_INITIAL_PASSWORD = "12345678";
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

    // Initialize with default owner configuration
    const salt = generateSalt();
    const passwordHash = hashPassword(DEFAULT_INITIAL_PASSWORD, salt);
    const initialConfig: OwnerConfig = {
      email: OWNER_EMAIL,
      salt,
      passwordHash,
      mfaEnabled: false,
      totpSecret: "JBSWY3DPEHPK3PXP", // Base32 default TOTP secret
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
      mfaEnabled: false,
      totpSecret: "JBSWY3DPEHPK3PXP",
      updatedAt: new Date().toISOString(),
    };
  }
}

export function getOwnerConfig(): OwnerConfig {
  return ensureOwnerConfig();
}

export function verifyOwnerPassword(email: string, passwordAttempt: string): boolean {
  if (email.trim().toLowerCase() !== OWNER_EMAIL) {
    return false;
  }
  const config = getOwnerConfig();
  const calculated = hashPassword(passwordAttempt, config.salt);
  return crypto.timingSafeEqual(
    Buffer.from(calculated, "hex"),
    Buffer.from(config.passwordHash, "hex")
  );
}

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

    // Session valid for 7 days
    const timestamp = parseInt(timestampStr, 10);
    const maxAge = 7 * 24 * 60 * 60 * 1000;
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
