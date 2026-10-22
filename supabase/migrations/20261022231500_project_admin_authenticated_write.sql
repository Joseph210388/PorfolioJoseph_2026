-- Lectura pública + escritura autenticada en las tablas que usa el editor de proyectos.
-- Ejecutar en inglés (no traducir CREAR POLÍTICA / EN público...).

DO $$
DECLARE
    t text;
    pol record;
    tables text[] := ARRAY[
        'projects',
        'project_translations',
        'project_media',
        'project_technologies'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('GRANT SELECT ON TABLE public.%I TO anon, authenticated', t);
        EXECUTE format('GRANT INSERT, UPDATE, DELETE ON TABLE public.%I TO authenticated', t);

        FOR pol IN
            SELECT policyname
            FROM pg_policies
            WHERE schemaname = 'public' AND tablename = t
        LOOP
            EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, t);
        END LOOP;

        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR SELECT TO anon, authenticated USING (true)',
            t || '_public_read',
            t
        );
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated WITH CHECK (true)',
            t || '_auth_insert',
            t
        );
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated USING (true) WITH CHECK (true)',
            t || '_auth_update',
            t
        );
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated USING (true)',
            t || '_auth_delete',
            t
        );
    END LOOP;
END $$;
