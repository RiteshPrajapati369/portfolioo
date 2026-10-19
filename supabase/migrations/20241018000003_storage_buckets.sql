-- Create standard storage buckets if they do not exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('avatars', 'avatars', true),
    ('resumes', 'resumes', true),
    ('projects', 'projects', true),
    ('blog', 'blog', true),
    ('media', 'media', true),
    ('testimonials', 'testimonials', true)
ON CONFLICT (id) DO NOTHING;

-- Public Read Policies on all buckets
CREATE POLICY "Public Read Avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Public Read Resumes" ON storage.objects
    FOR SELECT USING (bucket_id = 'resumes');

CREATE POLICY "Public Read Projects" ON storage.objects
    FOR SELECT USING (bucket_id = 'projects');

CREATE POLICY "Public Read Blog" ON storage.objects
    FOR SELECT USING (bucket_id = 'blog');

CREATE POLICY "Public Read Media" ON storage.objects
    FOR SELECT USING (bucket_id = 'media');

CREATE POLICY "Public Read Testimonials" ON storage.objects
    FOR SELECT USING (bucket_id = 'testimonials');

-- Authenticated Owner Write Policies (path convention: /<user-id>/...)
CREATE POLICY "Owner Upload Avatars" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owner Upload Resumes" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owner Upload Projects" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'projects' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owner Upload Blog" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'blog' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owner Upload Media" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'media' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Owner Update and Delete policies
CREATE POLICY "Owner Update Objects" ON storage.objects
    FOR UPDATE TO authenticated
    USING ((storage.foldername(name))[1] = auth.uid()::text)
    WITH CHECK ((storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Owner Delete Objects" ON storage.objects
    FOR DELETE TO authenticated
    USING ((storage.foldername(name))[1] = auth.uid()::text);
