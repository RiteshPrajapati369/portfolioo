"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  KeyRound,
  Copy,
  Check,
  Loader2,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { enrollMfa, confirmMfaEnrollment } from "@/lib/auth-actions";
import { feedback } from "@/lib/feedback";

export default function MfaEnrollmentPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function startEnrollment() {
      setIsLoading(true);
      setErrorMsg(null);
      try {
        const res = await enrollMfa();
        if (res.error) {
          setErrorMsg(res.error);
        } else if (res.factorId && res.qrCode && res.secret) {
          setFactorId(res.factorId);
          setQrCode(res.qrCode);
          setSecret(res.secret);
        }
      } catch (err) {
        setErrorMsg("Failed to initiate MFA enrollment.");
      } finally {
        setIsLoading(false);
      }
    }

    startEnrollment();
  }, []);

  const handleCopySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      feedback.info("Copied", "Secret key copied to clipboard.");
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;

    setIsConfirming(true);
    setErrorMsg(null);

    try {
      const res = await confirmMfaEnrollment(factorId, code);
      if (res.error) {
        setErrorMsg(res.error);
        feedback.error("MFA Activation Failed", res.error);
      } else {
        feedback.success("MFA Activated", "Google Authenticator is now protecting your account.");
        router.push("/dashboard");
      }
    } catch (err) {
      setErrorMsg("Failed to activate MFA code.");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-background text-foreground">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-card border border-border flex items-center justify-center text-primary mx-auto shadow-sm">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-foreground">
            MFA Enrollment
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Protect your admin account with Google Authenticator (TOTP)
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive text-xs leading-relaxed flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {isLoading ? (
          <div className="rounded-2xl border border-border bg-card/60 p-12 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-xs font-mono text-muted-foreground">Generating TOTP Secret Key...</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card/60 p-7 sm:p-8 space-y-6 shadow-sm backdrop-blur-sm">
            {/* Step 1: Scan QR Code */}
            <div className="space-y-3 text-center">
              <span className="text-xs font-mono font-bold text-primary uppercase tracking-wider">
                Step 1: Scan with Authenticator App
              </span>

              {qrCode && (
                <div className="w-48 h-48 mx-auto p-2 bg-white rounded-xl border border-border shadow-sm flex items-center justify-center overflow-hidden">
                  <Image
                    src={qrCode}
                    alt="MFA QR Code"
                    width={180}
                    height={180}
                    unoptimized
                    className="w-full h-full object-contain"
                  />
                </div>
              )}

              {/* Secret Key manual fallback */}
              {secret && (
                <div className="pt-2">
                  <div className="text-[11px] font-mono text-muted-foreground mb-1">
                    Or enter manual secret key:
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-background border border-border">
                    <code className="text-xs font-mono font-semibold text-primary break-all">
                      {secret}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="p-1.5 rounded-lg hover:bg-card text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      title="Copy secret"
                    >
                      {copied ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Confirm Code */}
            <form onSubmit={handleVerify} className="space-y-4 pt-4 border-t border-border">
              <div className="space-y-1.5 text-center">
                <label
                  htmlFor="code"
                  className="text-xs font-mono font-bold text-primary uppercase tracking-wider block"
                >
                  Step 2: Enter 6-Digit Code
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoFocus
                  disabled={isConfirming}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456"
                  className="w-full text-center tracking-[0.5em] text-2xl font-mono px-4 py-2.5 rounded-xl bg-background border border-border text-foreground focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isConfirming || code.length !== 6}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-mono text-sm font-semibold tracking-wider hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50"
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>ENROLLING MFA...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>ACTIVATE & PROCEED</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        <div className="text-center">
          <Link
            href="/dashboard"
            className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors"
          >
            Skip for now &rarr; Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
