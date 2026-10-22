-- Escritura autenticada en la tabla puente de tecnologías.
-- El 403 / 42501 al guardar un proyecto venía de INSERT en project_technologies.

ALTER TABLE public.project_technologies ENABLE ROW LEVEL SECURITY;

GRANT SELECT ON TABLE public.project_technologies TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON TABLE public.project_technologies TO authenticated;

DO $$
DECLARE
    pol record;
BEGIN
    FOR pol IN
        SELECT policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'project_technologies'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.project_technologies', pol.policyname);
    END LOOP;
END $$;

CREATE POLICY "project_technologies_public_read"
    ON public.project_technologies FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "project_technologies_auth_insert"
    ON public.project_technologies FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "project_technologies_auth_update"
    ON public.project_technologies FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "project_technologies_auth_delete"
    ON public.project_technologies FOR DELETE
    TO authenticated
    USING (true);
