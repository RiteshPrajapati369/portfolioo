export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          full_name: string;
          headline: string;
          bio: string;
          about_description: string | null;
          avatar_url: string | null;
          email: string;
          phone: string | null;
          location: string | null;
          resume_url: string | null;
          status: string;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          full_name: string;
          headline: string;
          bio: string;
          about_description?: string | null;
          avatar_url?: string | null;
          email: string;
          phone?: string | null;
          location?: string | null;
          resume_url?: string | null;
          status?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          full_name?: string;
          headline?: string;
          bio?: string;
          about_description?: string | null;
          avatar_url?: string | null;
          email?: string;
          phone?: string | null;
          location?: string | null;
          resume_url?: string | null;
          status?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      navigation: {
        Row: {
          id: string;
          profile_id: string;
          name: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          name: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          name?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      nav_links: {
        Row: {
          id: string;
          navigation_id: string;
          label: string;
          href: string;
          is_external: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          navigation_id: string;
          label: string;
          href: string;
          is_external?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          navigation_id?: string;
          label?: string;
          href?: string;
          is_external?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          id: string;
          profile_id: string;
          site_title: string;
          tagline: string;
          hero_badge_text: string;
          is_available: boolean;
          copyright_text: string;
          footer_text: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          site_title?: string;
          tagline?: string;
          hero_badge_text?: string;
          is_available?: boolean;
          copyright_text?: string;
          footer_text?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          site_title?: string;
          tagline?: string;
          hero_badge_text?: string;
          is_available?: boolean;
          copyright_text?: string;
          footer_text?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      seo_settings: {
        Row: {
          id: string;
          profile_id: string;
          meta_title: string;
          meta_description: string;
          meta_keywords: string[] | null;
          og_image_url: string | null;
          canonical_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          meta_title?: string;
          meta_description?: string;
          meta_keywords?: string[] | null;
          og_image_url?: string | null;
          canonical_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          meta_title?: string;
          meta_description?: string;
          meta_keywords?: string[] | null;
          og_image_url?: string | null;
          canonical_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          slug: string;
          description: string;
          content: string | null;
          thumbnail_url: string | null;
          live_url: string | null;
          github_url: string | null;
          category: string;
          status: string;
          is_featured: boolean;
          sort_order: number;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          title: string;
          slug: string;
          description: string;
          content?: string | null;
          thumbnail_url?: string | null;
          live_url?: string | null;
          github_url?: string | null;
          category?: string;
          status?: string;
          is_featured?: boolean;
          sort_order?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          title?: string;
          slug?: string;
          description?: string;
          content?: string | null;
          thumbnail_url?: string | null;
          live_url?: string | null;
          github_url?: string | null;
          category?: string;
          status?: string;
          is_featured?: boolean;
          sort_order?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      technologies: {
        Row: {
          id: string;
          name: string;
          icon_name: string | null;
          category: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          icon_name?: string | null;
          category?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          icon_name?: string | null;
          category?: string | null;
        };
        Relationships: [];
      };
      project_technologies: {
        Row: {
          project_id: string;
          technology_id: string;
        };
        Insert: {
          project_id: string;
          technology_id: string;
        };
        Update: {
          project_id?: string;
          technology_id?: string;
        };
        Relationships: [];
      };
      project_images: {
        Row: {
          id: string;
          project_id: string;
          image_url: string;
          caption: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          image_url: string;
          caption?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          image_url?: string;
          caption?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      skills: {
        Row: {
          id: string;
          profile_id: string;
          name: string;
          category: string;
          proficiency: number;
          icon_name: string | null;
          sort_order: number;
          status: string;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          name: string;
          category?: string;
          proficiency?: number;
          icon_name?: string | null;
          sort_order?: number;
          status?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          name?: string;
          category?: string;
          proficiency?: number;
          icon_name?: string | null;
          sort_order?: number;
          status?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          description: string;
          icon_name: string | null;
          sort_order: number;
          status: string;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          title: string;
          description: string;
          icon_name?: string | null;
          sort_order?: number;
          status?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          title?: string;
          description?: string;
          icon_name?: string | null;
          sort_order?: number;
          status?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      blog_posts: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          slug: string;
          summary: string;
          content: string;
          cover_image_url: string | null;
          reading_time: string | null;
          published_at: string | null;
          status: string;
          tags: string[] | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          title: string;
          slug: string;
          summary: string;
          content: string;
          cover_image_url?: string | null;
          reading_time?: string | null;
          published_at?: string | null;
          status?: string;
          tags?: string[] | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          title?: string;
          slug?: string;
          summary?: string;
          content?: string;
          cover_image_url?: string | null;
          reading_time?: string | null;
          published_at?: string | null;
          status?: string;
          tags?: string[] | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      blog_images: {
        Row: {
          id: string;
          blog_post_id: string | null;
          profile_id: string;
          image_url: string;
          alt_text: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          blog_post_id?: string | null;
          profile_id: string;
          image_url: string;
          alt_text?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          blog_post_id?: string | null;
          profile_id?: string;
          image_url?: string;
          alt_text?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      social_links: {
        Row: {
          id: string;
          profile_id: string;
          platform: string;
          url: string;
          label: string;
          icon_name: string | null;
          is_active: boolean;
          sort_order: number;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          platform: string;
          url: string;
          label: string;
          icon_name?: string | null;
          is_active?: boolean;
          sort_order?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          platform?: string;
          url?: string;
          label?: string;
          icon_name?: string | null;
          is_active?: boolean;
          sort_order?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          profile_id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          ip_address: string | null;
          user_agent: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          name: string;
          email: string;
          subject: string;
          message: string;
          ip_address?: string | null;
          user_agent?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          name?: string;
          email?: string;
          subject?: string;
          message?: string;
          ip_address?: string | null;
          user_agent?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      media_library: {
        Row: {
          id: string;
          profile_id: string;
          file_name: string;
          file_url: string;
          bucket_name: string;
          file_size: number | null;
          mime_type: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          file_name: string;
          file_url: string;
          bucket_name: string;
          file_size?: number | null;
          mime_type?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          file_name?: string;
          file_url?: string;
          bucket_name?: string;
          file_size?: number | null;
          mime_type?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      login_attempts: {
        Row: {
          id: string;
          email: string;
          attempt_time: string;
          success: boolean;
          ip_address: string | null;
          user_agent: string | null;
          locked_until: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          attempt_time?: string;
          success?: boolean;
          ip_address?: string | null;
          user_agent?: string | null;
          locked_until?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          attempt_time?: string;
          success?: boolean;
          ip_address?: string | null;
          user_agent?: string | null;
          locked_until?: string | null;
        };
        Relationships: [];
      };
      mfa_factors: {
        Row: {
          id: string;
          user_id: string;
          factor_type: string;
          friendly_name: string | null;
          status: string;
          secret: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          factor_type?: string;
          friendly_name?: string | null;
          status?: string;
          secret?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          factor_type?: string;
          friendly_name?: string | null;
          status?: string;
          secret?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
