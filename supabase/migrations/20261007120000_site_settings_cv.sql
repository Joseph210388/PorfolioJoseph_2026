-- Configuración del sitio (singleton): URLs del CV por idioma.
-- Ejecutar en el proyecto Supabase del portfolio (SQL Editor o CLI).

CREATE TABLE IF NOT EXISTS public.site_settings (
    id integer PRIMARY KEY CHECK (id = 1),
    cv_url_es text,
    cv_url_en text,
    updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_settings_public_read" ON public.site_settings;
CREATE POLICY "site_settings_public_read"
    ON public.site_settings FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "site_settings_auth_insert" ON public.site_settings;
CREATE POLICY "site_settings_auth_insert"
    ON public.site_settings FOR INSERT
    TO authenticated
    WITH CHECK (id = 1);

DROP POLICY IF EXISTS "site_settings_auth_update" ON public.site_settings;
CREATE POLICY "site_settings_auth_update"
    ON public.site_settings FOR UPDATE
    TO authenticated
    USING (id = 1)
    WITH CHECK (id = 1);

-- Bucket público para PDFs del CV (lectura anónima, escritura autenticada).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'portfolio-cv',
    'portfolio-cv',
    true,
    5242880,
    ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "portfolio_cv_public_read" ON storage.objects;
CREATE POLICY "portfolio_cv_public_read"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'portfolio-cv');

DROP POLICY IF EXISTS "portfolio_cv_auth_insert" ON storage.objects;
CREATE POLICY "portfolio_cv_auth_insert"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'portfolio-cv');

DROP POLICY IF EXISTS "portfolio_cv_auth_update" ON storage.objects;
CREATE POLICY "portfolio_cv_auth_update"
    ON storage.objects FOR UPDATE
    TO authenticated
    USING (bucket_id = 'portfolio-cv');

DROP POLICY IF EXISTS "portfolio_cv_auth_delete" ON storage.objects;
CREATE POLICY "portfolio_cv_auth_delete"
    ON storage.objects FOR DELETE
    TO authenticated
    USING (bucket_id = 'portfolio-cv');
