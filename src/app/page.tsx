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

  const siteTitle =
    seo?.meta_title || settings?.site_title || `${profile?.full_name || "Ritesh Prajapati"} | Cybersecurity Portfolio`;
  const description =
    seo?.meta_description ||
    settings?.tagline ||
    profile?.bio ||
    "Cybersecurity portfolio of Ritesh Prajapati, specialized in Penetration Testing, Bug Hunting, IDS/IPS, and Secure Systems Architecture.";

  return {
    title: siteTitle,
    description,
    keywords: seo?.meta_keywords || [
      "Cybersecurity",
      "Penetration Testing",
      "Bug Hunting",
      "IDS/IPS",
      "Ritesh Prajapati",
    ],
    openGraph: {
      title: siteTitle,
      description,
      images: seo?.og_image_url ? [{ url: seo.og_image_url }] : [],
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
