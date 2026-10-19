import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { ContentService } from "@/lib/services";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const post = await ContentService.getBlogPostBySlug(params.slug);
  if (!post) {
    return { title: "Post Not Found | Ritesh Prajapati" };
  }
  return {
    title: `${post.title} | Ritesh Prajapati`,
    description: post.summary,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const [post, profile, navLinks, socialLinks, settings] = await Promise.all([
    ContentService.getBlogPostBySlug(params.slug),
    ContentService.getProfile(),
    ContentService.getNavLinks(),
    ContentService.getSocialLinks(),
    ContentService.getSiteSettings(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <Navbar navLinks={navLinks} profileName={profile?.full_name} />

      <main className="flex-1 pt-32 pb-24 px-4 sm:px-6">
        <article className="max-w-3xl mx-auto space-y-10">
          {/* Back Navigation */}
          <div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>BACK TO ARTICLES</span>
            </Link>
          </div>

          {/* Article Header */}
          <header className="space-y-4">
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground">
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

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground leading-tight">
              {post.title}
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed border-l-2 border-primary/60 pl-4 py-1 italic font-normal">
              {post.summary}
            </p>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-card border border-border text-xs font-medium text-foreground"
                  >
                    <Tag className="w-3 h-3 text-primary" />
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Cover Image if present */}
          {post.cover_image_url && (
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-border bg-card">
              <Image
                src={post.cover_image_url}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Post Content */}
          <div className="pt-6 border-t border-border">
            <div className="space-y-6 text-foreground leading-relaxed font-sans text-base">
              {post.content.split("\n\n").map((paragraph, index) => {
                if (paragraph.startsWith("# ")) {
                  return (
                    <h2 key={index} className="text-2xl font-bold text-foreground pt-4">
                      {paragraph.replace("# ", "")}
                    </h2>
                  );
                }
                if (paragraph.startsWith("## ")) {
                  return (
                    <h3 key={index} className="text-xl font-bold text-foreground pt-3">
                      {paragraph.replace("## ", "")}
                    </h3>
                  );
                }
                if (paragraph.startsWith("### ")) {
                  return (
                    <h4 key={index} className="text-lg font-bold text-foreground pt-2">
                      {paragraph.replace("### ", "")}
                    </h4>
                  );
                }
                return (
                  <p key={index} className="text-muted-foreground leading-relaxed font-normal">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </div>
        </article>
      </main>

      <Footer
        socialLinks={socialLinks}
        settings={settings}
        profileName={profile?.full_name}
      />
    </div>
  );
}
