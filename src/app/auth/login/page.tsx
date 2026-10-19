"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Lock,
  Mail,
  KeyRound,
  Loader2,
  ArrowRight,
  X,
  AlertCircle,
} from "lucide-react";
import { authenticatePassword, verifyTotpCode } from "@/lib/auth-actions";

export default function LoginPage() {
  const router = useRouter();

  // Form states
  const [step, setStep] = useState<"password" | "mfa">("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaFactorId, setMfaFactorId] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "error" | "info";
    message: string;
  } | null>(null);

  // Auto-dismiss notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Step 1: Submit email & password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    // Security hardening: clear password from component state immediately
    setPassword("");

    try {
      const res = await authenticatePassword(formData);

      if (res.error) {
        if (res.isLocked) {
          setNotification({
            type: "error",
            message: "Access temporarily restricted. Please try again later.",
          });
        } else {
          setNotification({
            type: "error",
            message: "Authentication failed. Invalid email or password.",
          });
        }
      } else if (res.requiresMfa && res.factorId) {
        setMfaFactorId(res.factorId);
        setStep("mfa");
        setNotification({
          type: "info",
          message: "Two-Factor authentication code required.",
        });
      } else if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
      }
    } catch {
      setNotification({
        type: "error",
        message: "Unable to process request. Please check connection.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Submit 6-digit TOTP MFA code
  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setNotification(null);

    try {
      const res = await verifyTotpCode(mfaFactorId, mfaCode);

      if (res.error) {
        setNotification({
          type: "error",
          message: "Invalid verification code. Please check your authenticator.",
        });
      } else if (res.redirectUrl) {
        window.location.href = res.redirectUrl;
      }
    } catch {
      setNotification({
        type: "error",
        message: "Failed to verify authentication code.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-background text-foreground relative">
      {/* Centered Top Floating Notification Bar (API-testing tool style) */}
      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-3 duration-300">
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-full border border-border bg-card/95 backdrop-blur-md shadow-lg text-xs font-medium text-foreground max-w-md">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                notification.type === "error" ? "bg-destructive" : "bg-primary"
              }`}
            />
            <span className="leading-snug">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="p-1 rounded-full text-muted-foreground hover:text-foreground transition-colors ml-1"
              aria-label="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Subtle Background Texture */}
      <div
        className="absolute inset-0 -z-10 opacity-[0.03] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(currentColor 1px, transparent 1px)`,
          backgroundSize: "28px 28px",
        }}
      />

      <div className="w-full max-w-md space-y-8">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-foreground hover:text-primary transition-colors tracking-tight"
          >
            <div className="w-10 h-10 rounded-xl bg-card border border-border flex items-center justify-center text-primary shadow-sm">
              <Shield className="w-5 h-5" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Sign In
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {step === "password"
              ? "Access the administrative portfolio dashboard"
              : "Enter your two-factor verification code"}
          </p>
        </div>

        {/* Step 1: Email and Password Form */}
        {step === "password" && (
          <form
            onSubmit={handlePasswordSubmit}
            autoComplete="off"
            spellCheck={false}
            className="rounded-2xl border border-border bg-card/70 p-7 sm:p-8 space-y-5 shadow-sm backdrop-blur-sm"
          >
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-primary" />
                <span>Email Address</span>
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="off"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-xs font-semibold text-foreground flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-primary" />
                <span>Password</span>
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                spellCheck={false}
                autoCorrect="off"
                autoCapitalize="none"
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold tracking-wider hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>SIGNING IN...</span>
                </>
              ) : (
                <>
                  <span>CONTINUE</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: TOTP MFA Challenge Form */}
        {step === "mfa" && (
          <form
            onSubmit={handleMfaSubmit}
            className="rounded-2xl border border-border bg-card/70 p-7 sm:p-8 space-y-5 shadow-sm backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200"
          >
            <div className="text-center space-y-1">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 text-primary mx-auto flex items-center justify-center mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-base font-bold text-foreground">
                Authenticator Code
              </h2>
              <p className="text-xs text-muted-foreground">
                Enter the 6-digit TOTP code generated by Google Authenticator
              </p>
            </div>

            <div className="space-y-1.5">
              <input
                id="mfaCode"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                autoFocus
                autoComplete="one-time-code"
                spellCheck={false}
                disabled={isLoading}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                className="w-full text-center tracking-[0.5em] text-2xl px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || mfaCode.length !== 6}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold tracking-wider hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 shadow-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>VERIFYING...</span>
                </>
              ) : (
                <>
                  <span>VERIFY & ENTER</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("password");
                setMfaCode("");
                setNotification(null);
              }}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              &larr; Back to password
            </button>
          </form>
        )}

        {/* Footer Navigation Link */}
        <div className="text-center">
          <Link
            href="/"
            className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
          >
            &larr; Return to Public Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
