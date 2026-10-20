import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import { ContentService } from "@/lib/services";
import { Navbar } from "@/components/sections/navbar";
import { Footer } from "@/components/sections/footer";
import { formatDate } from "@/lib/utils";
import { MarkdownContent } from "@/components/blog/markdown-content";

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
  const postUrl = `https://riteshprajapati.com.np/blog/${post.slug}`;
  return {
    title: `${post.title} | Ritesh Prajapati`,
    description: post.summary,
    alternates: {
      canonical: postUrl,
    },
    openGraph: {
      title: `${post.title} | Ritesh Prajapati`,
      description: post.summary,
      url: postUrl,
      type: "article",
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      authors: ["Ritesh Prajapati"],
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      creator: "@RiteshPraj8063",
      images: post.cover_image_url ? [post.cover_image_url] : [],
    },
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.summary,
    "datePublished": post.published_at || post.created_at,
    "dateModified": post.updated_at || post.created_at,
    "url": `https://riteshprajapati.com.np/blog/${post.slug}`,
    "image": post.cover_image_url || "https://riteshprajapati.com.np/images/profile.png",
    "author": {
      "@type": "Person",
      "name": "Ritesh Prajapati",
      "url": "https://riteshprajapati.com.np",
    },
    "publisher": {
      "@type": "Person",
      "name": "Ritesh Prajapati",
      "url": "https://riteshprajapati.com.np",
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://riteshprajapati.com.np/blog/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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

          {/* Post Content with PoC Markdown & Image Rendering */}
          <div className="pt-6 border-t border-border">
            <MarkdownContent content={post.content} />
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
