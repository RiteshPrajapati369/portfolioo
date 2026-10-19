"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "./supabase-server";
import { createAdminClient } from "./supabase-admin";
import {
  checkAccountLockout,
  recordFailedLogin,
  recordSuccessfulLogin,
} from "./auth-lockout";
import {
  OWNER_EMAIL,
  OWNER_USER_ID,
  verifyOwnerPasswordAsync,
  updateOwnerPassword,
  getOwnerMfaStatusAsync,
  setOwnerMfaStatusAsync,
  getOwnerTotpSecretAsync,
  verifyTotp,
  setOwnerSessionCookie,
  clearOwnerSessionCookie,
} from "./owner-auth";

function getClientIp(): string {
  const headerList = headers();
  return (
    headerList.get("cf-connecting-ip") ||
    headerList.get("x-real-ip") ||
    headerList.get("x-forwarded-for")?.split(",")[0].trim() ||
    "127.0.0.1"
  );
}

function getUserAgent(): string {
  const headerList = headers();
  return headerList.get("user-agent") || "unknown";
}

/**
 * Validates owner password authentication and enforces account-wide 24-hour lockout after 3 failed attempts.
 * Supports the fixed owner account: panditritesh005@gmail.com.
 * If MFA is enabled, returns { requiresMfa: true } without issuing an owner session cookie.
 */
export async function authenticatePassword(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please provide both email and password." };
  }

  // 1. Strict single-owner enforcement: Only panditritesh005@gmail.com can access the dashboard
  if (email !== OWNER_EMAIL.toLowerCase()) {
    const clientIp = getClientIp();
    const userAgent = getUserAgent();
    await recordFailedLogin(email, clientIp, userAgent);
    return {
      error: "Authentication failed. Access is restricted exclusively to the portfolio owner.",
    };
  }

  // 2. Account Lockout Pre-check: 24-hour lock after 3 consecutive failures
  const lockoutStatus = await checkAccountLockout(email);
  if (lockoutStatus.isLocked) {
    const hours = lockoutStatus.remainingHours || 24;
    const minutes = lockoutStatus.remainingMinutes || 60;
    return {
      error: `Account is locked for security. 3 consecutive failed login attempts were recorded. Try again in approximately ${
        hours > 1 ? `${hours} hours` : `${minutes} minutes`
      }.`,
      isLocked: true,
      remainingHours: hours,
      remainingMinutes: minutes,
    };
  }

  const clientIp = getClientIp();
  const userAgent = getUserAgent();

  // 3. Verify owner credentials (against Supabase Auth, with PBKDF2 fallback)
  const isOwnerValid = await verifyOwnerPasswordAsync(email, password);

  if (!isOwnerValid) {
    const failureResult = await recordFailedLogin(email, clientIp, userAgent);

    if (failureResult.isLocked) {
      return {
        error:
          "Security Lockout Triggered: 3 consecutive failed attempts reached. This account is now locked for exactly 24 hours across all devices and networks.",
        isLocked: true,
        remainingHours: 24,
      };
    }

    return {
      error: `Invalid email or password. You have ${failureResult.attemptsRemaining} attempt(s) remaining before the account is locked for 24 hours.`,
      attemptsRemaining: failureResult.attemptsRemaining,
    };
  }

  // 4. Password valid -> Reset consecutive failed login attempts
  await recordSuccessfulLogin(email, clientIp, userAgent);

  // 5. Check if MFA is enabled in Supabase persistent store
  const isMfaEnabled = await getOwnerMfaStatusAsync();
  if (isMfaEnabled) {
    // MFA is mandatory on every login: DO NOT set session cookie yet
    return {
      requiresMfa: true,
      factorId: "owner-totp",
      email,
    };
  }

  // 6. Only if MFA is explicitly disabled, establish session cookie directly
  setOwnerSessionCookie();

  // 7. Establish Supabase Auth session if available
  try {
    const supabase = createClient();
    await supabase.auth.signInWithPassword({ email, password });
  } catch {
    // Graceful fallback
  }

  revalidatePath("/", "layout");
  return { success: true, redirectUrl: "/dashboard" };
}

/**
 * Validates the 6-digit TOTP code from Google Authenticator (RFC 6238).
 * Session cookie is ONLY issued upon successful OTP verification.
 */
export async function verifyTotpCode(factorId: string, code: string) {
  const cleanCode = code.trim().replace(/\s+/g, "");

  if (!cleanCode || cleanCode.length !== 6 || !/^\d{6}$/.test(cleanCode)) {
    return { error: "Please enter a valid 6-digit verification code." };
  }

  const secret = await getOwnerTotpSecretAsync();
  const isValid = verifyTotp(cleanCode, secret);

  if (!isValid) {
    return { error: "Invalid verification code. Please check Google Authenticator." };
  }

  // Issue owner authenticated session cookie only on valid OTP verification
  setOwnerSessionCookie();
  revalidatePath("/", "layout");
  return { success: true, redirectUrl: "/dashboard" };
}

/**
 * Initiates MFA enrollment for the owner account with Google Authenticator.
 * Sets the display name strictly to "Ritesh Prajapati".
 */
export async function enrollMfa(): Promise<{
  error?: string;
  factorId?: string;
  qrCode?: string;
  secret?: string;
}> {
  try {
    const secret = await getOwnerTotpSecretAsync();
    const appName = "Ritesh Prajapati";

    // Strictly display "Ritesh Prajapati" in Google Authenticator app
    const otpAuthUri = `otpauth://totp/${encodeURIComponent(appName)}?secret=${secret}&issuer=${encodeURIComponent(appName)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(otpAuthUri)}`;

    return {
      factorId: "owner-totp",
      qrCode: qrCodeUrl,
      secret,
    };
  } catch (err: any) {
    return {
      error: err?.message || "Failed to initiate MFA enrollment.",
    };
  }
}

/**
 * Confirms MFA enrollment for the owner account.
 * Persists status in Supabase database and establishes session.
 */
export async function confirmMfaEnrollment(factorId: string, code: string) {
  const cleanCode = code.replace(/\D/g, "");
  if (cleanCode.length !== 6) {
    return { error: "Please enter a valid 6-digit verification code." };
  }

  const secret = await getOwnerTotpSecretAsync();
  const isValid = verifyTotp(cleanCode, secret);

  if (!isValid) {
    return { error: "Invalid authenticator code. Verification failed." };
  }

  // Persist MFA enabled state in Supabase database
  await setOwnerMfaStatusAsync(true);
  setOwnerSessionCookie();
  return { success: true };
}

/**
 * Checks owner MFA status from Supabase database.
 */
export async function getOwnerMfaStatusAction(): Promise<boolean> {
  return await getOwnerMfaStatusAsync();
}

/**
 * Enables or disables MFA from the Security Dashboard.
 * Persists directly in Supabase database so it takes effect across all devices and serverless workers.
 */
export async function toggleOwnerMfaAction(enabled: boolean) {
  const success = await setOwnerMfaStatusAsync(enabled);
  return { success, mfaEnabled: enabled };
}

/**
 * Changes the owner password from the Admin Panel.
 */
export async function changeOwnerPasswordAction(newPassword: string) {
  if (!newPassword || newPassword.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  try {
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(OWNER_USER_ID, {
      password: newPassword,
      email_confirm: true,
    });
  } catch (err: any) {
    console.warn("Could not update Supabase auth password:", err);
  }

  updateOwnerPassword(newPassword);
  return { success: true, message: "Password updated successfully." };
}

/**
 * Signs the user out by clearing the owner session cookie.
 */
export async function signOutAction() {
  clearOwnerSessionCookie();
  try {
    const supabase = createClient();
    await supabase.auth.signOut();
  } catch {
    // ignore
  }
  revalidatePath("/", "layout");
  redirect("/");
}

export const logoutAction = signOutAction;
