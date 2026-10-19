"use client";

import { useState, useEffect } from "react";
import {
  ExternalLink,
  Github,
  FolderGit2,
  ShieldAlert,
  X,
  Layers,
  ShieldCheck,
  Cpu,
  CheckCircle2,
} from "lucide-react";
import type { ProjectWithDetails } from "@/types";

interface ProjectsProps {
  projects: ProjectWithDetails[];
}

export function Projects({ projects }: ProjectsProps) {
  const [selectedProject, setSelectedProject] = useState<ProjectWithDetails | null>(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedProject(null);
      }
    };
    if (selectedProject) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedProject]);

  return (
    <section id="work" className="py-24 px-4 sm:px-6 border-t border-border/80">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/80 text-xs font-semibold text-primary uppercase tracking-widest shadow-sm">
            <FolderGit2 className="w-3.5 h-3.5" />
            <span>Case Studies</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Featured Projects & Research
          </h2>
          <p className="text-muted-foreground max-w-2xl text-base leading-relaxed font-normal">
            Real-world implementations in intrusion detection, perimeter hardening, vulnerability
            assessment tooling, and zero-trust authentication systems.
          </p>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-2xl text-muted-foreground text-sm font-medium space-y-2">
            <ShieldAlert className="w-8 h-8 text-primary mx-auto" />
            <p>No published projects available at this moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="rounded-2xl border border-border bg-card/70 hover:bg-card hover:border-primary/50 transition-all duration-300 p-8 flex flex-col justify-between group shadow-sm"
              >
                <div className="space-y-4">
                  {/* Category & Index */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-3 py-1 rounded-md bg-background border border-border text-foreground font-semibold uppercase tracking-wider text-[11px]">
                      {project.category}
                    </span>
                    <span className="text-muted-foreground font-semibold text-xs">{`Case 0${index + 1}`}</span>
                  </div>

                  {/* Project Title */}
                  <h3
                    onClick={() => setSelectedProject(project)}
                    className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors tracking-tight cursor-pointer"
                  >
                    {project.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                    {project.description}
                  </p>

                  {/* Technologies */}
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech.id}
                          className="px-2.5 py-1 rounded-md bg-background border border-border text-xs font-medium text-foreground/90 shadow-2xs"
                        >
                          {tech.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Links & Architecture Trigger */}
                <div className="pt-6 mt-6 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`GitHub repository for ${project.title}`}
                        className="p-2.5 rounded-xl bg-background border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-colors shadow-2xs"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Live preview of ${project.title}`}
                        className="p-2.5 rounded-xl bg-background border border-border hover:border-primary text-muted-foreground hover:text-foreground transition-colors shadow-2xs"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 group-hover:translate-x-1 transition-all cursor-pointer bg-primary/10 hover:bg-primary/20 px-3.5 py-2 rounded-xl border border-primary/20"
                    aria-label={`View architecture for ${project.title}`}
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>View Architecture &rarr;</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Architecture & Research Modal */}
      {selectedProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="architecture-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedProject(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl max-h-[90vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-start justify-between gap-4 bg-card/90 sticky top-0 z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[11px] font-mono font-medium text-primary uppercase tracking-wider">
                    {selectedProject.category}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">System Architecture</span>
                </div>
                <h3
                  id="architecture-modal-title"
                  className="text-2xl font-bold text-foreground tracking-tight"
                >
                  {selectedProject.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                aria-label="Close architecture modal"
                className="p-2 rounded-xl border border-border hover:bg-background text-muted-foreground hover:text-foreground transition-colors shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-foreground font-sans">
              {/* Executive Overview */}
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  <span>Executive Overview</span>
                </h4>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground bg-background/60 p-4 rounded-xl border border-border">
                  {selectedProject.description}
                </p>
              </div>

              {/* Technologies Applied */}
              {selectedProject.technologies && selectedProject.technologies.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-primary" />
                    <span>Applied Technologies & Tools</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedProject.technologies.map((tech) => (
                      <span
                        key={tech.id}
                        className="px-3 py-1 rounded-lg bg-background border border-border text-xs font-medium text-foreground"
                      >
                        {tech.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Architecture & Research Writeup */}
              <div className="space-y-3">
                <h4 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary" />
                  <span>Architecture & Defense Mechanisms</span>
                </h4>

                <div className="p-5 sm:p-6 rounded-xl bg-background border border-border space-y-4 text-sm leading-relaxed">
                  {selectedProject.content ? (
                    selectedProject.content.split("\n\n").map((block, i) => {
                      if (block.startsWith("### ")) {
                        return (
                          <h5
                            key={i}
                            className="font-mono font-bold text-base text-foreground pt-2 border-b border-border/60 pb-2"
                          >
                            {block.replace("### ", "")}
                          </h5>
                        );
                      }
                      if (block.includes("- **")) {
                        const items = block.split("\n").filter((line) => line.trim().length > 0);
                        return (
                          <ul key={i} className="space-y-2.5">
                            {items.map((item, j) => {
                              const cleaned = item.replace(/^[-*]\s*/, "");
                              const parts = cleaned.split("**");
                              if (parts.length >= 3) {
                                return (
                                  <li key={j} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground">
                                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                    <span>
                                      <strong className="text-foreground font-semibold">
                                        {parts[1]}
                                      </strong>
                                      {parts.slice(2).join("**")}
                                    </span>
                                  </li>
                                );
                              }
                              return (
                                <li key={j} className="flex items-start gap-2.5 text-xs sm:text-sm text-muted-foreground">
                                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                  <span>{cleaned}</span>
                                </li>
                              );
                            })}
                          </ul>
                        );
                      }
                      return (
                        <p key={i} className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {block}
                        </p>
                      );
                    })
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Detailed system architecture documentation is currently being compiled from technical research notes. You can update this writeup anytime from the Admin Panel.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer with Action Links */}
            <div className="p-6 border-t border-border bg-card/90 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {selectedProject.github_url && (
                  <a
                    href={selectedProject.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border hover:border-primary text-xs font-semibold text-foreground transition-colors"
                  >
                    <Github className="w-4 h-4" />
                    <span>View Repository</span>
                  </a>
                )}
                {selectedProject.live_url && (
                  <a
                    href={selectedProject.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border hover:border-primary text-xs font-semibold text-foreground transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Live Deployment</span>
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
