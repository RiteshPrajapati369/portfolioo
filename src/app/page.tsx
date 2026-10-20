import { ContentService } from "@/lib/services";
import { getLatestTechNews } from "@/lib/tech-news";
import { Navbar } from "@/components/sections/navbar";
import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Projects } from "@/components/sections/projects";
import { Contact } from "@/components/sections/contact";
import { Footer } from "@/components/sections/footer";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
  const [profile, settings, seo] = await Promise.all([
    ContentService.getProfile(),
    ContentService.getSiteSettings(),
    ContentService.getSeoSettings(),
  ]);

  const fullName = profile?.full_name || "Ritesh Prajapati";
  const siteTitle =
    seo?.meta_title || settings?.site_title || `${fullName} | Cybersecurity Specialist & Penetration Tester`;
  const description =
    seo?.meta_description ||
    settings?.tagline ||
    profile?.bio ||
    "Official cybersecurity portfolio of Ritesh Prajapati, specialized in Penetration Testing, Bug Hunting, IDS/IPS architectures, and Secure Systems Engineering.";

  const keywords = seo?.meta_keywords && seo.meta_keywords.length > 0
    ? seo.meta_keywords
    : [
        "Ritesh Prajapati",
        "Ritesh Prajapati Cybersecurity",
        "Ritesh Prajapati Portfolio",
        "Ritesh Prajapati Penetration Tester",
        "Ritesh Prajapati Nepal",
        "Cybersecurity Specialist",
        "Penetration Testing",
        "Bug Hunting",
        "IDS/IPS",
        "Snort Suricata",
        "Ethical Hacker Nepal",
      ];

  const ogImage = seo?.og_image_url || "/images/profile.png";

  return {
    title: siteTitle,
    description,
    keywords,
    alternates: {
      canonical: "https://riteshprajapati.com.np",
    },
    openGraph: {
      title: siteTitle,
      description,
      url: "https://riteshprajapati.com.np",
      siteName: `${fullName} Portfolio`,
      images: [
        {
          url: ogImage.startsWith("http") ? ogImage : `https://riteshprajapati.com.np${ogImage}`,
          width: 800,
          height: 800,
          alt: `${fullName} - Cybersecurity Specialist`,
        },
      ],
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description,
      creator: "@RiteshPraj8063",
      images: [ogImage.startsWith("http") ? ogImage : `https://riteshprajapati.com.np${ogImage}`],
    },
  };
}

export default async function HomePage() {
  // Parallel deterministic data fetching via ContentService & tech news service
  const [profile, navLinks, projects, skills, services, socialLinks, settings, techUpdates] =
    await Promise.all([
      ContentService.getProfile(),
      ContentService.getNavLinks(),
      ContentService.getProjects(),
      ContentService.getSkills(),
      ContentService.getServices(),
      ContentService.getSocialLinks(),
      ContentService.getSiteSettings(),
      getLatestTechNews(),
    ]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 selection:text-primary">
      {/* 1. Header / Navbar */}
      <Navbar navLinks={navLinks} profileName={profile?.full_name} />

      <main className="flex-1">
        {/* 2. Hero Section (Dynamic Tech News & Nearest-10 Particle Network) */}
        <Hero
          profile={profile}
          settings={settings}
          techUpdates={techUpdates}
        />

        {/* 3. About Section (Skills + Services) */}
        <About profile={profile} skills={skills} services={services} />

        {/* 4. Projects / Work Section */}
        <Projects projects={projects} />

        {/* 5. Contact Section */}
        <Contact profile={profile} />
      </main>

      {/* 6. Footer (Social links only if configured, otherwise copyright + Design by Ritesh Prajapati) */}
      <Footer
        socialLinks={socialLinks}
        settings={settings}
        profileName={profile?.full_name}
      />
    </div>
  );
}
