"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  KeyRound,
  Lock,
  Clock,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Save,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { feedback } from "@/lib/feedback";
import {
  changeOwnerPasswordAction,
  toggleOwnerMfaAction,
  getOwnerMfaStatusAction,
} from "@/lib/auth-actions";
import type { LoginAttempt } from "@/types";

export default function SecurityDashboardPage() {
  const [mfaEnrolled, setMfaEnrolled] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Change Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isTogglingMfa, setIsTogglingMfa] = useState(false);

  useEffect(() => {
    async function loadSecurityData() {
      setIsLoading(true);
      try {
        const isOwnerMfaOn = await getOwnerMfaStatusAction();
        const supabase = createClient();
        const [{ data: factors }, { data: attempts }] = await Promise.all([
          supabase.auth.mfa.listFactors(),
          supabase
            .from("login_attempts")
            .select("*")
            .order("attempt_time", { ascending: false })
            .limit(15),
        ]);

        const hasVerified = factors?.totp?.some((f) => f.status === "verified");
        setMfaEnrolled(Boolean(isOwnerMfaOn || hasVerified));
        setLoginAttempts(attempts || []);
      } catch {
        // Fallback when Supabase is not connected yet
      } finally {
        setIsLoading(false);
      }
    }

    loadSecurityData();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      feedback.error("Password Mismatch", "Passwords do not match.");
      return;
    }
    if (newPassword.length < 8) {
      feedback.error("Weak Password", "Password must be at least 8 characters long.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changeOwnerPasswordAction(newPassword);
      if (res.error) {
        feedback.error("Failed to Change Password", res.error);
      } else {
        feedback.success("Password Updated", "Your owner account password has been changed successfully.");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      feedback.error("Error", "An unexpected error occurred while updating password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleToggleMfa = async () => {
    setIsTogglingMfa(true);
    try {
      const nextState = !mfaEnrolled;
      const res = await toggleOwnerMfaAction(nextState);
      setMfaEnrolled(res.mfaEnabled);
      if (res.mfaEnabled) {
        feedback.success("MFA Enabled", "Two-factor authentication is now required on login.");
      } else {
        feedback.info("MFA Disabled", "Two-factor authentication is now optional.");
      }
    } catch {
      feedback.error("Error", "Failed to update MFA settings.");
    } finally {
      setIsTogglingMfa(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-xs font-mono text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto mb-2" />
        Auditing security parameters...
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="border-b border-border pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
          Security Architecture & Account Controls
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-mono mt-1">
          Manage your owner password, MFA enforcement, and inspect 24-hour lockout defenses
        </p>
      </div>

      {/* 1. Change Owner Password Card */}
      <div className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-center gap-2.5 font-mono font-bold text-sm text-foreground">
          <Lock className="w-4 h-4 text-primary" />
          <span>Change Owner Password</span>
        </div>
        <p className="text-xs text-muted-foreground font-mono">
          Update the password for your portfolio administrative account (panditritesh005@gmail.com).
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-xl pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label
                htmlFor="newPassword"
                className="text-xs font-mono font-medium text-foreground"
              >
                New Password
              </label>
              <input
                id="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-sans focus:border-primary focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="text-xs font-mono font-medium text-foreground"
              >
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm font-sans focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-semibold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>UPDATING...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>UPDATE PASSWORD</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* 2. MFA (Google Authenticator) Toggle Card */}
      <div className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                mfaEnrolled
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500"
                  : "bg-amber-500/10 border-amber-500/30 text-amber-500"
              }`}
            >
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-mono font-bold text-base text-foreground">
                  Two-Factor Authentication (MFA)
                </h2>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                    mfaEnrolled
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                      : "bg-amber-500/10 text-amber-500 border border-amber-500/30"
                  }`}
                >
                  {mfaEnrolled ? "ENABLED" : "DISABLED"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {mfaEnrolled
                  ? "MFA is currently enabled. Login requires a 6-digit TOTP code."
                  : "MFA is currently disabled. Toggle to enable Google Authenticator protection."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleMfa}
              disabled={isTogglingMfa}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider transition-all shadow-sm ${
                mfaEnrolled
                  ? "border border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20"
                  : "bg-primary text-primary-foreground hover:opacity-90"
              }`}
            >
              {isTogglingMfa ? "UPDATING..." : mfaEnrolled ? "DISABLE MFA" : "ENABLE MFA"}
            </button>
            <Link
              href="/auth/mfa"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border bg-background hover:bg-card text-xs font-mono text-foreground transition-colors"
            >
              <span>Setup Key</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 3. 24-Hour Brute Force Lockout Policy Card */}
      <div className="rounded-2xl border border-border bg-card/60 p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 font-mono font-bold text-sm text-foreground">
          <Lock className="w-4 h-4 text-primary" />
          <span>Account Lockout Defense: 3 Attempts &rarr; 24-Hour Lock</span>
        </div>
        <div className="p-4 rounded-xl bg-background border border-border text-xs font-mono space-y-2 text-muted-foreground leading-relaxed">
          <p>
            <span className="font-bold text-foreground">Server-side Enforcement:</span> If 3
            consecutive failed password attempts occur for the owner email, the account is locked for
            exactly 24 hours.
          </p>
          <p>
            <span className="font-bold text-foreground">Account-wide Scope:</span> The lockout is
            enforced at the account database level. Changing IP, browser, or device does not bypass
            the lock.
          </p>
        </div>
      </div>

      {/* 4. Login Attempts Audit Table */}
      <div className="rounded-2xl border border-border bg-card/60 p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <h2 className="font-mono font-bold text-sm text-foreground">
              Recent Authentication Attempts Audit Log
            </h2>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            login_attempts audit
          </span>
        </div>

        {loginAttempts.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-muted-foreground">
            No authentication attempts logged yet.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {loginAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      attempt.success ? "bg-emerald-500" : "bg-destructive"
                    }`}
                  />
                  <div>
                    <span className="font-semibold text-foreground">{attempt.email}</span>
                    <span className="text-muted-foreground text-[11px] ml-2">
                      IP: {attempt.ip_address || "127.0.0.1"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      attempt.success
                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                        : "bg-destructive/10 text-destructive border border-destructive/30"
                    }`}
                  >
                    {attempt.success ? "SUCCESS" : "FAILED"}
                  </span>
                  {attempt.locked_until && (
                    <span className="px-2 py-0.5 rounded text-[10px] bg-destructive text-destructive-foreground font-bold uppercase">
                      LOCKED
                    </span>
                  )}
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(attempt.attempt_time).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
