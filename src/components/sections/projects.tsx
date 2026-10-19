import { ExternalLink, Github, FolderGit2, ShieldAlert } from "lucide-react";
import type { ProjectWithDetails } from "@/types";

interface ProjectsProps {
  projects: ProjectWithDetails[];
}

export function Projects({ projects }: ProjectsProps) {
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
                  <h3 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
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

                {/* Footer Links */}
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

                  <span className="text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
                    View Architecture &rarr;
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
