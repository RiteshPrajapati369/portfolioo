import { Database } from "./database";

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];

export type Profile = Tables<"profiles">;
export type Navigation = Tables<"navigation">;
export type NavLink = Tables<"nav_links">;
export type SiteSettings = Tables<"site_settings">;
export type SeoSettings = Tables<"seo_settings">;
export type Project = Tables<"projects">;
export type Technology = Tables<"technologies">;
export type ProjectImage = Tables<"project_images">;
export type Skill = Tables<"skills">;
export type Service = Tables<"services">;
export type BlogPost = Tables<"blog_posts">;
export type BlogImage = Tables<"blog_images">;
export type SocialLink = Tables<"social_links">;
export type ContactMessage = Tables<"contact_messages">;
export type MediaItem = Tables<"media_library">;
export type LoginAttempt = Tables<"login_attempts">;
export type MfaFactor = Tables<"mfa_factors">;

export interface ProjectWithDetails extends Project {
  technologies?: Technology[];
  images?: ProjectImage[];
}

export interface NavigationWithLinks extends Navigation {
  links: NavLink[];
}

export interface AccountLockoutStatus {
  isLocked: boolean;
  remainingMinutes?: number;
  remainingHours?: number;
  lockedUntil?: string;
  failedAttempts?: number;
}
