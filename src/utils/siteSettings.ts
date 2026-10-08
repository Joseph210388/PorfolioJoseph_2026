import { CV_PDF_FALLBACK } from '../constants/cvFallback';
import type { Locale } from '../i18n/translations';
import { supabase } from './supabase';

export type SiteSettings = {
    id: number;
    cv_url_es: string | null;
    cv_url_en: string | null;
    updated_at: string | null;
};

export const CV_STORAGE_BUCKET = 'portfolio-cv';

const SITE_SETTINGS_ROW_ID = 1;

export function resolveCvUrl(locale: Locale, settings: SiteSettings | null): string {
    const fromDb = locale === 'es' ? settings?.cv_url_es : settings?.cv_url_en;
    const trimmed = fromDb?.trim();
    if (trimmed) {
        return trimmed;
    }
    return CV_PDF_FALLBACK[locale];
}

/** Añade versión para evitar caché del navegador tras una subida. */
export function cvUrlWithCacheBust(url: string, version: string | null | undefined): string {
    if (!version) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${encodeURIComponent(version)}`;
}

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
    const { data, error } = await supabase
        .from('site_settings')
        .select('id, cv_url_es, cv_url_en, updated_at')
        .eq('id', SITE_SETTINGS_ROW_ID)
        .maybeSingle();

    if (error) {
        // Tabla aún no migrada: el sitio sigue con PDFs estáticos.
        if (error.code === '42P01' || error.code === 'PGRST205') {
            return null;
        }
        throw error;
    }

    return data;
}

export async function upsertSiteSettings(patch: Partial<Pick<SiteSettings, 'cv_url_es' | 'cv_url_en'>>): Promise<void> {
    const { error } = await supabase.from('site_settings').upsert({
        id: SITE_SETTINGS_ROW_ID,
        ...patch,
        updated_at: new Date().toISOString(),
    });

    if (error) throw error;
}

export async function uploadPortfolioCvFile(locale: Locale, file: File): Promise<string> {
    const path = `cv-${locale}.pdf`;
    const { error: uploadError } = await supabase.storage.from(CV_STORAGE_BUCKET).upload(path, file, {
        upsert: true,
        contentType: 'application/pdf',
        cacheControl: '3600',
    });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(CV_STORAGE_BUCKET).getPublicUrl(path);
    const publicUrl = data.publicUrl;

    await upsertSiteSettings(locale === 'es' ? { cv_url_es: publicUrl } : { cv_url_en: publicUrl });

    return publicUrl;
}
