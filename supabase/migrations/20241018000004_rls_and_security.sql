-- Enable Row Level Security on all application tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nav_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mfa_factors ENABLE ROW LEVEL SECURITY;

-- Helper function: Is user the owner of the profile
CREATE OR REPLACE FUNCTION public.is_profile_owner(target_profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = target_profile_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. PROFILES POLICIES
-- Anon can read published, non-deleted profiles
CREATE POLICY "Public Read Profiles" ON public.profiles
    FOR SELECT TO anon, authenticated
    USING (status = 'published' AND deleted_at IS NULL);

-- Owner full access to their own profile
CREATE POLICY "Owner Read Own Profile" ON public.profiles
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Owner Update Own Profile" ON public.profiles
    FOR UPDATE TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 2. NAVIGATION & NAV LINKS
CREATE POLICY "Public Read Navigation" ON public.navigation
    FOR SELECT TO anon, authenticated
    USING (is_active = true);

CREATE POLICY "Owner Manage Navigation" ON public.navigation
    FOR ALL TO authenticated
    USING (public.is_profile_owner(profile_id))
    WITH CHECK (public.is_profile_owner(profile_id));

CREATE POLICY "Public Read Nav Links" ON public.nav_links
    FOR SELECT TO anon, authenticated
    USING (true);

CREATE POLICY "Owner Manage Nav Links" ON public.nav_links
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.navigation n
            JOIN public.profiles p ON p.id = n.profile_id
            WHERE n.id = nav_links.navigation_id AND p.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.navigation n
            JOIN public.profiles p ON p.id = n.profile_id
            WHERE n.id = nav_links.navigation_id AND p.user_id = auth.uid()
        )
    );

-- 3. SITE SETTINGS & SEO
CREATE POLICY "Public Read Site Settings" ON public.site_settings
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Owner Manage Site Settings" ON public.site_settings
    FOR ALL TO authenticated
    USING (public.is_profile_owner(profile_id))
    WITH CHECK (public.is_profile_owner(profile_id));

CREATE POLICY "Public Read SEO Settings" ON public.seo_settings
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Owner Manage SEO Settings" ON public.seo_settings
    FOR ALL TO authenticated
    USING (public.is_profile_owner(profile_id))
    WITH CHECK (public.is_profile_owner(profile_id));

-- 4. PROJECTS, TECHNOLOGIES, IMAGES
CREATE POLICY "Public Read Projects" ON public.projects
    FOR SELECT TO anon, authenticated
    USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "Owner Manage Projects" ON public.projects
    FOR ALL TO authenticated
    USING (public.is_profile_owner(profile_id))
    WITH CHECK (public.is_profile_owner(profile_id));

CREATE POLICY "Public Read Technologies" ON public.technologies
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Authenticated Manage Technologies" ON public.technologies
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Project Technologies" ON public.project_technologies
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Owner Manage Project Technologies" ON public.project_technologies
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_technologies.project_id AND public.is_profile_owner(p.profile_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_technologies.project_id AND public.is_profile_owner(p.profile_id)
        )
    );

CREATE POLICY "Public Read Project Images" ON public.project_images
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Owner Manage Project Images" ON public.project_images
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_images.project_id AND public.is_profile_owner(p.profile_id)
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.projects p
            WHERE p.id = project_images.project_id AND public.is_profile_owner(p.profile_id)
        )
    );

-- 5. SKILLS
CREATE POLICY "Public Read Skills" ON public.skills
    FOR SELECT TO anon, authenticated
    USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "Owner Manage Skills" ON public.skills
    FOR ALL TO authenticated
    USING (public.is_profile_owner(profile_id))
    WITH CHECK (public.is_profile_owner(profile_id));

-- 6. SERVICES
CREATE POLICY "Public Read Services" ON public.services
    FOR SELECT TO anon, authenticated
    USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "Owner Manage Services" ON public.services
    FOR ALL TO authenticated
    USING (public.is_profile_owner(profile_id))
    WITH CHECK (public.is_profile_owner(profile_id));

-- 7. BLOG POSTS & IMAGES
CREATE POLICY "Public Read Blog Posts" ON public.blog_posts
    FOR SELECT TO anon, authenticated
    USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "Owner Manage Blog Posts" ON public.blog_posts
    FOR ALL TO authenticated
    USING (public.is_profile_owner(profile_id))
    WITH CHECK (public.is_profile_owner(profile_id));

CREATE POLICY "Public Read Blog Images" ON public.blog_images
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Owner Manage Blog Images" ON public.blog_images
    FOR ALL TO authenticated
    USING (public.is_profile_owner(profile_id))
    WITH CHECK (public.is_profile_owner(profile_id));

-- 8. SOCIAL LINKS
CREATE POLICY "Public Read Social Links" ON public.social_links
    FOR SELECT TO anon, authenticated
    USING (is_active = true AND deleted_at IS NULL);

CREATE POLICY "Owner Manage Social Links" ON public.social_links
    FOR ALL TO authenticated
    USING (public.is_profile_owner(profile_id))
    WITH CHECK (public.is_profile_owner(profile_id));

-- 9. CONTACT MESSAGES (Public anonymous insert only with status='new')
CREATE POLICY "Anon Submit Contact Message" ON public.contact_messages
    FOR INSERT TO anon, authenticated
    WITH CHECK (status = 'new');

CREATE POLICY "Owner Read Contact Messages" ON public.contact_messages
    FOR SELECT TO authenticated
    USING (public.is_profile_owner(profile_id));

CREATE POLICY "Owner Update Contact Messages" ON public.contact_messages
    FOR UPDATE TO authenticated
    USING (public.is_profile_owner(profile_id))
    WITH CHECK (public.is_profile_owner(profile_id));

-- 10. MEDIA LIBRARY
CREATE POLICY "Owner Manage Media Library" ON public.media_library
    FOR ALL TO authenticated
    USING (public.is_profile_owner(profile_id))
    WITH CHECK (public.is_profile_owner(profile_id));

-- 11. LOGIN ATTEMPTS (Admin only for read/write, anonymous insert allowed via secure server-side action or service-role)
-- Keep closed to anon for SELECT
CREATE POLICY "Service and Authenticated Read Login Attempts" ON public.login_attempts
    FOR SELECT TO authenticated
    USING (true);

-- 12. MFA FACTORS
CREATE POLICY "Owner Manage MFA Factors" ON public.mfa_factors
    FOR ALL TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
