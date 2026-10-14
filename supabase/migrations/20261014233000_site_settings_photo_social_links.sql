-- Foto pública y listado de redes (JSON) para editarlas desde popups del admin.

ALTER TABLE public.site_settings
    ADD COLUMN IF NOT EXISTS profile_image_url text,
    ADD COLUMN IF NOT EXISTS social_links jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.site_settings
SET social_links = jsonb_build_array(
    jsonb_build_object(
        'id', 'github',
        'kind', 'github',
        'label', 'GitHub',
        'href', COALESCE(NULLIF(TRIM(github_url), ''), 'https://github.com/Joseph210388')
    ),
    jsonb_build_object(
        'id', 'linkedin',
        'kind', 'linkedin',
        'label', 'LinkedIn',
        'href', COALESCE(NULLIF(TRIM(linkedin_url), ''), 'https://es.linkedin.com/in/joseph-valderrama')
    )
)
WHERE id = 1 AND (social_links = '[]'::jsonb OR social_links IS NULL);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'portfolio-profile',
    'portfolio-profile',
    true,
    3145728,
    ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "portfolio_profile_public_read" ON storage.objects;
CREATE POLICY "portfolio_profile_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'portfolio-profile');

DROP POLICY IF EXISTS "portfolio_profile_auth_insert" ON storage.objects;
CREATE POLICY "portfolio_profile_auth_insert"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'portfolio-profile');

DROP POLICY IF EXISTS "portfolio_profile_auth_update" ON storage.objects;
CREATE POLICY "portfolio_profile_auth_update"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'portfolio-profile');

DROP POLICY IF EXISTS "portfolio_profile_auth_delete" ON storage.objects;
CREATE POLICY "portfolio_profile_auth_delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'portfolio-profile');
