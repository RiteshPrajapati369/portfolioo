import { createClient as createBrowserSupabase } from "@/lib/supabase-browser";
import { createClient as createServerSupabase } from "@/lib/supabase-server";
import type {
  Profile,
  NavLink,
  ProjectWithDetails,
  Skill,
  Service,
  BlogPost,
  SocialLink,
  SiteSettings,
  SeoSettings,
} from "@/types";

export class ContentService {
  /**
   * Helper to determine appropriate Supabase client (server vs browser).
   */
  private static getClient() {
    if (typeof window === "undefined") {
      return createServerSupabase();
    }
    return createBrowserSupabase();
  }

  /**
   * Resolves the primary portfolio profile deterministically.
   * 1. Uses NEXT_PUBLIC_PORTFOLIO_PROFILE_ID if set.
   * 2. Otherwise selects the first-created published profile.
   */
  static async getProfile(): Promise<Profile | null> {
    try {
      const supabase = this.getClient();
      const configuredId = process.env.NEXT_PUBLIC_PORTFOLIO_PROFILE_ID;

      if (configuredId) {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", configuredId)
          .eq("status", "published")
          .is("deleted_at", null)
          .maybeSingle();

        if (error) {
          console.error("Failed to load profile by configured ID:", error);
          return null;
        }
        if (data) return data;
      }

      // Fallback: earliest created non-deleted published profile
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("status", "published")
        .is("deleted_at", null)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Failed to query public profile:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Unexpected error in getProfile:", err);
      return null;
    }
  }

  /**
   * Fetches active navigation links for the profile.
   * Navbar: Home · Work · Blog · Contact
   */
  static async getNavLinks(profileId?: string): Promise<NavLink[]> {
    try {
      const supabase = this.getClient();
      const targetProfileId = profileId || (await this.getProfile())?.id;

      if (!targetProfileId) return [];

      const { data: nav } = await supabase
        .from("navigation")
        .select("id")
        .eq("profile_id", targetProfileId)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle();

      const navRecord = nav as { id: string } | null;
      if (!navRecord?.id) return [];

      const { data: links, error } = await supabase
        .from("nav_links")
        .select("*")
        .eq("navigation_id", navRecord.id)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Failed to load nav links:", error);
        return [];
      }

      return links || [];
    } catch (err) {
      console.error("Error in getNavLinks:", err);
      return [];
    }
  }

  /**
   * Fetches published projects including linked technologies and images.
   */
  static async getProjects(profileId?: string): Promise<ProjectWithDetails[]> {
    try {
      const supabase = this.getClient();
      const targetProfileId = profileId || (await this.getProfile())?.id;

      if (!targetProfileId) return [];

      const { data: projects, error } = await supabase
        .from("projects")
        .select(`
          *,
          project_images (*),
          project_technologies (
            technologies (*)
          )
        `)
        .eq("profile_id", targetProfileId)
        .eq("status", "published")
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Failed to fetch projects:", error);
        return [];
      }

      return (projects || []).map((p: any) => ({
        ...p,
        images: p.project_images || [],
        technologies: (p.project_technologies || [])
          .map((pt: any) => pt.technologies)
          .filter(Boolean),
      }));
    } catch (err) {
      console.error("Error in getProjects:", err);
      return [];
    }
  }

  /**
   * Fetches published skills (e.g. Pentesting / Bug Hunting, HTML, CSS, JS, PHP).
   */
  static async getSkills(profileId?: string): Promise<Skill[]> {
    try {
      const supabase = this.getClient();
      const targetProfileId = profileId || (await this.getProfile())?.id;

      if (!targetProfileId) return [];

      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .eq("profile_id", targetProfileId)
        .eq("status", "published")
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Failed to fetch skills:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Error in getSkills:", err);
      return [];
    }
  }

  /**
   * Fetches published cybersecurity services.
   */
  static async getServices(profileId?: string): Promise<Service[]> {
    try {
      const supabase = this.getClient();
      const targetProfileId = profileId || (await this.getProfile())?.id;

      if (!targetProfileId) return [];

      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("profile_id", targetProfileId)
        .eq("status", "published")
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Failed to fetch services:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Error in getServices:", err);
      return [];
    }
  }

  /**
   * Fetches published blog posts.
   */
  static async getBlogPosts(profileId?: string, limit?: number): Promise<BlogPost[]> {
    try {
      const supabase = this.getClient();
      const targetProfileId = profileId || (await this.getProfile())?.id;

      if (!targetProfileId) return [];

      let query = supabase
        .from("blog_posts")
        .select("*")
        .eq("profile_id", targetProfileId)
        .eq("status", "published")
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Failed to fetch blog posts:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Error in getBlogPosts:", err);
      return [];
    }
  }

  /**
   * Fetches a single published blog post by slug.
   */
  static async getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const supabase = this.getClient();

      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .is("deleted_at", null)
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch blog post by slug:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Error in getBlogPostBySlug:", err);
      return null;
    }
  }

  /**
   * Fetches active social links for the owner.
   * If empty, footer will show only "Design by Ritesh Prajapati".
   */
  static async getSocialLinks(profileId?: string): Promise<SocialLink[]> {
    try {
      const supabase = this.getClient();
      const targetProfileId = profileId || (await this.getProfile())?.id;

      if (!targetProfileId) return [];

      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .eq("profile_id", targetProfileId)
        .eq("is_active", true)
        .is("deleted_at", null)
        .order("sort_order", { ascending: true });

      if (error) {
        console.error("Failed to fetch social links:", error);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error("Error in getSocialLinks:", err);
      return [];
    }
  }

  /**
   * Fetches site settings (title, tagline, hero badge, footer text).
   */
  static async getSiteSettings(profileId?: string): Promise<SiteSettings | null> {
    try {
      const supabase = this.getClient();
      const targetProfileId = profileId || (await this.getProfile())?.id;

      if (!targetProfileId) return null;

      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .eq("profile_id", targetProfileId)
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch site settings:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Error in getSiteSettings:", err);
      return null;
    }
  }

  /**
   * Fetches SEO metadata settings.
   */
  static async getSeoSettings(profileId?: string): Promise<SeoSettings | null> {
    try {
      const supabase = this.getClient();
      const targetProfileId = profileId || (await this.getProfile())?.id;

      if (!targetProfileId) return null;

      const { data, error } = await supabase
        .from("seo_settings")
        .select("*")
        .eq("profile_id", targetProfileId)
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch SEO settings:", error);
        return null;
      }

      return data;
    } catch (err) {
      console.error("Error in getSeoSettings:", err);
      return null;
    }
  }
}
