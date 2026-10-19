import { createAdminClient } from "./supabase-admin";
import type { AccountLockoutStatus } from "@/types";

const MAX_FAILED_ATTEMPTS = 3;
const LOCKOUT_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours exactly

/**
 * Checks if the given account email is locked out due to excessive failed login attempts.
 * Operates server-side and account-wide.
 */
export async function checkAccountLockout(email: string): Promise<AccountLockoutStatus> {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const admin = createAdminClient();
    const now = new Date();

    // 1. Check if there is an active lockout timestamp
    const { data: activeLock, error: lockErr } = await admin
      .from("login_attempts")
      .select("locked_until")
      .eq("email", normalizedEmail)
      .gt("locked_until", now.toISOString())
      .order("locked_until", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lockErr) {
      console.error("Error querying lockout status:", lockErr);
      return { isLocked: false };
    }

    if (activeLock?.locked_until) {
      const lockEnd = new Date(activeLock.locked_until);
      const remainingMs = lockEnd.getTime() - now.getTime();
      const remainingMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));
      const remainingHours = Math.max(1, Math.ceil(remainingMs / (60 * 60 * 1000)));

      return {
        isLocked: true,
        remainingMinutes,
        remainingHours,
        lockedUntil: activeLock.locked_until,
      };
    }

    return { isLocked: false };
  } catch (error) {
    console.error("Lockout check failure:", error);
    // Safe fallback if database table not yet migrated during dev
    return { isLocked: false };
  }
}

/**
 * Records a failed login attempt and locks the account for 24 hours if 3 consecutive failures are reached.
 */
export async function recordFailedLogin(
  email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<{ isLocked: boolean; attemptsRemaining: number; lockedUntil?: string }> {
  const normalizedEmail = email.trim().toLowerCase();
  const now = new Date();

  try {
    const admin = createAdminClient();

    // Find the timestamp of the last successful login to only count failures since then
    const { data: lastSuccess } = await admin
      .from("login_attempts")
      .select("attempt_time")
      .eq("email", normalizedEmail)
      .eq("success", true)
      .order("attempt_time", { ascending: false })
      .limit(1)
      .maybeSingle();

    const sinceTime = lastSuccess?.attempt_time
      ? new Date(lastSuccess.attempt_time).toISOString()
      : new Date(now.getTime() - LOCKOUT_DURATION_MS).toISOString();

    // Count recent failed attempts
    const { data: recentFailures } = await admin
      .from("login_attempts")
      .select("id")
      .eq("email", normalizedEmail)
      .eq("success", false)
      .gt("attempt_time", sinceTime);

    const currentFailures = (recentFailures?.length || 0) + 1;
    const shouldLock = currentFailures >= MAX_FAILED_ATTEMPTS;
    const lockedUntil = shouldLock
      ? new Date(now.getTime() + LOCKOUT_DURATION_MS).toISOString()
      : null;

    // Record the current failed attempt
    await admin.from("login_attempts").insert({
      email: normalizedEmail,
      success: false,
      attempt_time: now.toISOString(),
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      locked_until: lockedUntil,
    });

    return {
      isLocked: shouldLock,
      attemptsRemaining: Math.max(0, MAX_FAILED_ATTEMPTS - currentFailures),
      lockedUntil: lockedUntil || undefined,
    };
  } catch (error) {
    console.error("Failed to record login attempt:", error);
    return { isLocked: false, attemptsRemaining: 1 };
  }
}

/**
 * Records a successful login attempt, resetting consecutive failures.
 */
export async function recordSuccessfulLogin(
  email: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();
  const now = new Date();

  try {
    const admin = createAdminClient();
    await admin.from("login_attempts").insert({
      email: normalizedEmail,
      success: true,
      attempt_time: now.toISOString(),
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
      locked_until: null,
    });
  } catch (error) {
    console.error("Failed to record successful login:", error);
  }
}
