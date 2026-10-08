import type { Locale } from '../i18n/translations';

/** PDFs estáticos en despliegue si aún no hay URL en Supabase. */
export const CV_PDF_FALLBACK: Record<Locale, string> = {
    es: '/pdf/CV_JosephValderrama_ES.pdf',
    en: '/pdf/CV_JosephValderrama_EN.pdf',
};
