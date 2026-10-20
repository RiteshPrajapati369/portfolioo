import Link from "next/link";
import { BookOpen, Calendar, Clock, ArrowRight, ShieldAlert } from "lucide-react";
import { ContentService } from "@/lib/services";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog & Cybersecurity Research | Ritesh Prajapati",
  description:
    "Security write-ups, vulnerability assessment notes, penetration testing methodologies, and defensive engineering research by Ritesh Prajapati.",
  alternates: {
    canonical: "https://riteshprajapati.com.np/blog",
  },
  openGraph: {
    title: "Blog & Cybersecurity Research | Ritesh Prajapati",
    description:
      "Technical write-ups, threat analysis, and penetration testing methodologies by Ritesh Prajapati.",
    url: "https://riteshprajapati.com.np/blog",
    type: "website",
  },
};

export default async function BlogPage() {
  const [profile, navLinks, blogPosts, socialLinks, settings] = await Promise.all([
    ContentService.getProfile(),
    ContentService.getNavLinks(),
    ContentService.getBlogPosts(),
    ContentService.getSocialLinks(),
    ContentService.getSiteSettings(),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar navLinks={navLinks} profileName={profile?.full_name} />

      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto space-y-16">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-border bg-card/80 text-xs font-semibold text-primary uppercase tracking-widest shadow-sm">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Technical Notes & Write-ups</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
              Cybersecurity Research
            </h1>
            <p className="text-muted-foreground max-w-2xl text-base leading-relaxed font-normal">
              Dissections of security vulnerabilities, offensive tactics, threat actor behaviors, and
              resilient defensive engineering practices.
            </p>
          </div>

          {/* Posts List */}
          {blogPosts.length === 0 ? (
            <div className="p-16 text-center border border-dashed border-border rounded-2xl text-muted-foreground text-sm font-medium space-y-3">
              <ShieldAlert className="w-10 h-10 text-primary mx-auto" />
              <p className="text-base font-semibold text-foreground">No published write-ups yet.</p>
              <p className="text-xs max-w-md mx-auto">
                Articles and penetration testing research notes will appear here once published from
                the dashboard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogPosts.map((post) => (
                <article
                  key={post.id}
                  className="rounded-2xl border border-border bg-card/70 hover:bg-card hover:border-primary/50 transition-all duration-300 p-8 flex flex-col justify-between group shadow-sm"
                >
                  <div className="space-y-4">
                    {/* Metadata bar */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        <span>{formatDate(post.published_at || post.created_at)}</span>
                      </div>
                      {post.reading_time && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          <span>{post.reading_time}</span>
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                      <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                    </h2>

                    {/* Summary */}
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed font-normal">
                      {post.summary}
                    </p>

                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-0.5 rounded-md bg-background border border-border text-xs font-medium text-foreground/80 shadow-2xs"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Read Article link */}
                  <div className="pt-6 mt-6 border-t border-border flex items-center justify-between">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
                    >
                      <span>READ ARTICLE</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer
        socialLinks={socialLinks}
        settings={settings}
        profileName={profile?.full_name}
      />
    </div>
  );
}
