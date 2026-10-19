"use client";

import { useState } from "react";
import { Mail, Send, MapPin, Phone, ShieldCheck, Loader2 } from "lucide-react";
import { feedback } from "@/lib/feedback";
import type { Profile } from "@/types";

interface ContactProps {
  profile?: Profile | null;
}

export function Contact({ profile }: ContactProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        feedback.error("Submission Failed", result.error || "Please check your inputs and try again.");
      } else {
        feedback.success("Message Sent", result.message || "Thank you. Your message has been received.");
        setFormData({ name: "", email: "", subject: "", message: "" });
      }
    } catch (err) {
      feedback.error("Network Error", "Unable to connect to the server. Please verify your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-24 px-4 sm:px-6 border-t border-border/80 bg-background/50">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/80 text-xs font-semibold text-primary uppercase tracking-widest shadow-sm">
            <Mail className="w-3.5 h-3.5" />
            <span>Communication</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Get in Touch
          </h2>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed font-normal">
            Interested in security audits, penetration testing engagements, or consulting? Send an
            inquiry through the secure dispatch channel below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Direct Info & Security Notice */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-border bg-card/70 p-6 sm:p-8 space-y-6 shadow-sm">
              <h3 className="text-xl font-bold text-foreground">Direct Inquiries</h3>
              <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                Direct messages are received securely and audited regularly for client engagements.
              </p>

              <div className="space-y-4 pt-2">
                {profile?.email && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary shadow-2xs">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Email</div>
                      <a
                        href={`mailto:${profile.email}`}
                        className="text-foreground hover:text-primary transition-colors font-semibold"
                      >
                        {profile.email}
                      </a>
                    </div>
                  </div>
                )}

                {profile?.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary shadow-2xs">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Location</div>
                      <div className="text-foreground font-semibold">
                        {profile.location}
                      </div>
                    </div>
                  </div>
                )}

                {profile?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center text-primary shadow-2xs">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground">Phone</div>
                      <a
                        href={`tel:${profile.phone}`}
                        className="text-foreground hover:text-primary transition-colors font-semibold"
                      >
                        {profile.phone}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Security Banner */}
              <div className="pt-4 border-t border-border">
                <div className="flex items-start gap-3 p-4 rounded-xl bg-background border border-border text-xs leading-relaxed">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="text-muted-foreground font-normal">
                    <span className="font-semibold text-foreground">Protected Channel:</span> All
                    submissions are sanitized against injection attacks, rate-limited, and securely
                    stored.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-border bg-card/70 p-6 sm:p-8 space-y-5 shadow-sm"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-xs font-semibold text-foreground">
                    Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="your name:"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-semibold text-foreground">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="your email address"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-xs font-semibold text-foreground">
                  Subject <span className="text-destructive">*</span>
                </label>
                <input
                  id="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="enter the subject"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-xs font-semibold text-foreground">
                  Message <span className="text-destructive">*</span>
                </label>
                <textarea
                  id="message"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="enter your message"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border text-foreground text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none transition-colors resize-y"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold tracking-wider hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-50 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>SENDING MESSAGE...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>SEND MESSAGE</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
