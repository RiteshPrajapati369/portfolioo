import Link from "next/link";
import {
  Github,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  MessageCircle,
  Mail,
  Phone,
  Globe,
  Shield,
  type LucideIcon,
} from "lucide-react";
import type { SocialLink, SiteSettings } from "@/types";

interface FooterProps {
  socialLinks?: SocialLink[];
  settings?: SiteSettings | null;
  profileName?: string;
}

const SOCIAL_ICON_MAP: Record<string, LucideIcon> = {
  github: Github,
  linkedin: Linkedin,
  twitter: Twitter,
  x: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  whatsapp: MessageCircle,
  email: Mail,
  phone: Phone,
};

export function Footer({
  socialLinks = [],
  settings,
  profileName = "Ritesh Prajapati",
}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const copyrightText = settings?.copyright_text || `© ${currentYear} ${profileName}. All rights reserved.`;
  const footerDesign = settings?.footer_text || "Design by Ritesh Prajapati";

  // Filter active links
  const activeLinks = socialLinks.filter((link) => link.is_active && link.url);

  const getHref = (link: SocialLink) => {
    const platform = link.platform.toLowerCase();
    if (platform === "email" && !link.url.startsWith("mailto:")) {
      return `mailto:${link.url}`;
    }
    if (platform === "phone" && !link.url.startsWith("tel:")) {
      return `tel:${link.url}`;
    }
    if (platform === "whatsapp" && !link.url.startsWith("http")) {
      return `https://wa.me/${link.url.replace(/\D/g, "")}`;
    }
    return link.url;
  };

  return (
    <footer className="border-t border-border bg-background py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs">
        {/* Left Branding & Design text */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
          <Link
            href="/#hero"
            className="inline-flex items-center gap-1.5 font-bold tracking-wide text-foreground hover:text-primary transition-colors uppercase text-sm"
          >
            <Shield className="w-4 h-4 text-primary" />
            <span>{profileName}</span>
          </Link>
          <span className="hidden sm:inline text-border">|</span>
          <span className="text-muted-foreground font-medium">{footerDesign}</span>
        </div>

        {/* Center: Social Links (Rendered ONLY if they exist) */}
        {activeLinks.length > 0 && (
          <div className="flex items-center gap-2.5">
            {activeLinks.map((link) => {
              const platformKey = link.platform.toLowerCase();
              const Icon = SOCIAL_ICON_MAP[platformKey] || Globe;
              const href = getHref(link);
              const isExternal = !href.startsWith("mailto:") && !href.startsWith("tel:");

              return (
                <a
                  key={link.id}
                  href={href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  aria-label={link.label || link.platform}
                  className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-2xs"
                  title={link.label || link.platform}
                >
                  <Icon className="w-4 h-4" />
                </a>
              );
            })}
          </div>
        )}

        {/* Right: Copyright */}
        <div className="text-muted-foreground font-medium text-center sm:text-right">
          {copyrightText}
        </div>
      </div>
    </footer>
  );
}
