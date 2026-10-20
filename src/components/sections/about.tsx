import Image from "next/image";
import Link from "next/link";
import { Shield, CheckCircle2, Award, Download, ShieldCheck } from "lucide-react";
import { getTechIcon } from "@/data/tech-icons";
import type { Skill, Service, Profile } from "@/types";

interface AboutProps {
  profile?: Profile | null;
  skills: Skill[];
  services: Service[];
}

export function About({ profile, skills, services }: AboutProps) {
  const avatarUrl = profile?.avatar_url || "/images/profile.png";
  const resumeUrl = profile?.resume_url;
  const location = profile?.location || "Nepal / Global";
  const fullName = profile?.full_name || "Ritesh Prajapati";

  return (
    <section
      id="about"
      className="py-24 sm:py-32 px-4 sm:px-6 border-t border-border/80 bg-background relative overflow-hidden"
    >
      <div className="max-w-6xl mx-auto space-y-24">
        {/* 1. Two-Column About Showcase (Left: Bio & Stats, Right: Large Photo) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Heading, Long Bio, Action Buttons, and Stats */}
          <div className="lg:col-span-7 space-y-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-border bg-card/80 text-xs font-semibold text-primary uppercase tracking-widest shadow-sm">
              <Award className="w-3.5 h-3.5" />
              <span>About Me</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.15]">
                {fullName}
              </h2>
              <div className="text-base sm:text-xl font-bold text-primary tracking-wide">
                {profile?.headline || "Cybersecurity Specialist & Penetration Tester"}
              </div>
            </div>

            <div className="space-y-4 text-base sm:text-lg text-muted-foreground leading-relaxed font-normal">
              {(profile?.bio ||
                "I am a cybersecurity specialist with a dedicated focus on offensive penetration testing, bug hunting, and defensive perimeter engineering. I actively analyze threat vectors, identify high-risk vulnerabilities, and conduct thorough security assessments across modern web architectures and network infrastructures."
              )
                .split(/\n\s*\n/)
                .map((paragraph, index) => (
                  <p key={`bio-${index}`} className="whitespace-pre-line">
                    {paragraph.trim()}
                  </p>
                ))}
              {(profile?.about_description ||
                "With practical experience configuring rule-based Intrusion Detection and Prevention Systems (Snort/Suricata), architecting secure authentication workflows with multi-factor verification, and performing code-level audits across HTML, CSS, JavaScript, and PHP, my objective is to fortify systems before adversaries can exploit them."
              )
                .split(/\n\s*\n/)
                .map((paragraph, index) => (
                  <p key={`desc-${index}`} className="text-sm sm:text-base text-muted-foreground/90 leading-relaxed whitespace-pre-line">
                    {paragraph.trim()}
                  </p>
                ))}
            </div>

            {/* Action Buttons: Download CV + Contact */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href={resumeUrl || "/#contact"}
                target={resumeUrl ? "_blank" : undefined}
                rel={resumeUrl ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-2.5 px-7 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-md group"
              >
                <Download className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
                <span>DOWNLOAD CV</span>
              </a>

              <Link
                href="/#contact"
                className="inline-flex items-center gap-2 px-7 py-3 rounded-full border border-border bg-card/80 hover:bg-card text-foreground text-sm font-semibold tracking-wider hover:border-primary/50 transition-all"
              >
                <span>GET IN TOUCH</span>
              </Link>
            </div>

            {/* Small Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-border/80">
              <div className="p-4 rounded-2xl border border-border bg-card/60 backdrop-blur-sm shadow-xs">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">
                  4+
                </div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                  Core Projects
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-card/60 backdrop-blur-sm shadow-xs">
                <div className="text-2xl sm:text-3xl font-bold text-foreground truncate">
                  {location}
                </div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                  Based In
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-card/60 backdrop-blur-sm shadow-xs col-span-2 sm:col-span-1">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  100%
                </div>
                <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-1">
                  Ethical Standard
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Profile Photo in Circular Frame */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative group">
              {/* Subtle ambient cyber glow behind circular frame */}
              <div className="absolute -inset-2 rounded-full bg-primary/10 blur-xl opacity-75 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-88 md:h-88 rounded-full p-2 border-2 border-border group-hover:border-primary/60 transition-all duration-300 shadow-2xl bg-card flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <div className="relative w-full h-full rounded-full overflow-hidden">
                    <Image
                      src={avatarUrl}
                      alt={fullName}
                      fill
                      sizes="(max-width: 768px) 260px, 350px"
                      className="object-cover rounded-full transition-transform duration-500 group-hover:scale-105"
                      priority
                    />
                  </div>
                ) : (
                  <div className="w-full h-full rounded-full bg-background flex flex-col items-center justify-center p-6 text-center border border-dashed border-border/70 group-hover:border-primary/40 transition-colors">
                    <div className="w-16 h-16 rounded-full bg-card border border-border flex items-center justify-center text-primary mb-3 shadow-xs">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div className="text-base font-bold text-foreground">
                      {fullName}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 tracking-wider uppercase font-semibold">
                      Cybersecurity Specialist
                    </div>
                    <div className="text-[10px] text-primary/80 mt-1 font-mono">
                      [RP / Verified]
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Security Practitioner Badge */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full border border-border/90 bg-card/95 backdrop-blur-md shadow-lg flex items-center gap-2 text-xs font-semibold text-foreground whitespace-nowrap">
                <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                <span>Verified Security Practitioner</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Technical Skills Grid (Clean technical display without percentages or progress bars) */}
        <div className="space-y-6 pt-10 border-t border-border/80">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <Shield className="w-5 h-5 text-primary" />
              <span>Technical Skills</span>
            </h3>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Domains & Competencies
            </span>
          </div>

          {skills.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground text-sm font-medium">
              No skills registered yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill) => {
                const IconComponent = getTechIcon(skill.name);
                return (
                  <div
                    key={skill.id}
                    className="p-4 sm:p-5 rounded-2xl border border-border bg-card/70 hover:bg-card hover:border-primary/50 transition-all duration-200 flex items-center justify-between group shadow-sm"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-background border border-border flex items-center justify-center text-primary group-hover:border-primary/60 transition-colors shadow-xs shrink-0">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                          {skill.name}
                        </div>
                        <div className="text-xs font-medium text-muted-foreground mt-0.5">
                          {skill.category}
                        </div>
                      </div>
                    </div>

                    <span className="px-2.5 py-1 rounded-md bg-background border border-border/70 text-[11px] font-mono text-muted-foreground/80 group-hover:text-primary transition-colors shrink-0">
                      Active
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Services Grid */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span>Services & Consulting</span>
            </h3>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Assessment & Defense
            </span>
          </div>

          {services.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-xl text-muted-foreground text-sm font-medium">
              No services registered yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className="p-7 rounded-2xl border border-border bg-card/70 hover:bg-card hover:border-primary/50 transition-all duration-200 space-y-3 group shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">
                      {`Service 0${index + 1}`}
                    </span>
                    <Shield className="w-4 h-4 text-primary group-hover:rotate-12 transition-transform" />
                  </div>
                  <h4 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                    {service.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                    {service.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
