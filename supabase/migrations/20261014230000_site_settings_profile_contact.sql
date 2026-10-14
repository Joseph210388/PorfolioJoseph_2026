-- Perfil público (nombre, correo, ubicación, disponibilidad, redes)
-- editable desde el admin; el sitio público lee el singleton id = 1.

ALTER TABLE public.site_settings
    ADD COLUMN IF NOT EXISTS display_name text,
    ADD COLUMN IF NOT EXISTS contact_email text,
    ADD COLUMN IF NOT EXISTS location_es text,
    ADD COLUMN IF NOT EXISTS location_en text,
    ADD COLUMN IF NOT EXISTS is_available boolean NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS availability_es text,
    ADD COLUMN IF NOT EXISTS availability_en text,
    ADD COLUMN IF NOT EXISTS github_url text,
    ADD COLUMN IF NOT EXISTS linkedin_url text;

UPDATE public.site_settings
SET
    display_name = COALESCE(NULLIF(TRIM(display_name), ''), 'Joseph Valderrama'),
    contact_email = COALESCE(NULLIF(TRIM(contact_email), ''), 'josephvalderrama2103@gmail.com'),
    location_es = COALESCE(NULLIF(TRIM(location_es), ''), 'Asturias, España'),
    location_en = COALESCE(NULLIF(TRIM(location_en), ''), 'Asturias, Spain'),
    availability_es = COALESCE(NULLIF(TRIM(availability_es), ''), 'Abierto a nuevas oportunidades'),
    availability_en = COALESCE(NULLIF(TRIM(availability_en), ''), 'Open to new opportunities'),
    github_url = COALESCE(NULLIF(TRIM(github_url), ''), 'https://github.com/Joseph210388'),
    linkedin_url = COALESCE(NULLIF(TRIM(linkedin_url), ''), 'https://es.linkedin.com/in/joseph-valderrama')
WHERE id = 1;
