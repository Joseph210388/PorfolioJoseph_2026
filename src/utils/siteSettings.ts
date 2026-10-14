import { CV_PDF_FALLBACK } from '../constants/cvFallback';
import type { Locale } from '../i18n/translations';
import {
    DEFAULT_SOCIAL_LINKS,
    parseSocialLinks,
    type SocialNetwork,
} from './socialNetworks';
import { supabase } from './supabase';

export type SiteSettings = {
    id: number;
    cv_url_es: string | null;
    cv_url_en: string | null;
    display_name: string | null;
    contact_email: string | null;
    location_es: string | null;
    location_en: string | null;
    is_available: boolean | null;
    availability_es: string | null;
    availability_en: string | null;
    github_url: string | null;
    linkedin_url: string | null;
    profile_image_url: string | null;
    social_links: SocialNetwork[] | null;
    updated_at: string | null;
};

export type SiteSettingsPatch = Partial<Omit<SiteSettings, 'id' | 'updated_at'>>;

export const CV_STORAGE_BUCKET = 'portfolio-cv';
export const PROFILE_STORAGE_BUCKET = 'portfolio-profile';
export const PROFILE_IMAGE_FALLBACK = '/img/profile.jpeg';

const SITE_SETTINGS_ROW_ID = 1;

const SITE_SETTINGS_COLUMNS =
    'id, cv_url_es, cv_url_en, display_name, contact_email, location_es, location_en, is_available, availability_es, availability_en, github_url, linkedin_url, profile_image_url, social_links, updated_at';

const MAX_PROFILE_BYTES = 3 * 1024 * 1024;

/** Valores usados si la fila está vacía o la migración aún no existe. */
export const PROFILE_FALLBACK = {
    displayName: 'Joseph Valderrama',
    contactEmail: 'josephvalderrama2103@gmail.com',
    locationEs: 'Asturias, España',
    locationEn: 'Asturias, Spain',
    isAvailable: true,
    availabilityEs: 'Abierto a nuevas oportunidades',
    availabilityEn: 'Open to new opportunities',
    socialLinks: DEFAULT_SOCIAL_LINKS,
    profileImageUrl: PROFILE_IMAGE_FALLBACK,
} as const;

function trimmedOrNull(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
}

export function resolveCvUrl(locale: Locale, settings: SiteSettings | null): string {
    const fromDb = locale === 'es' ? settings?.cv_url_es : settings?.cv_url_en;
    const trimmed = fromDb?.trim();
    if (trimmed) {
        return trimmed;
    }
    return CV_PDF_FALLBACK[locale];
}

export function resolveDisplayName(settings: SiteSettings | null): string {
    return trimmedOrNull(settings?.display_name) ?? PROFILE_FALLBACK.displayName;
}

export function resolveContactEmail(settings: SiteSettings | null): string {
    return trimmedOrNull(settings?.contact_email) ?? PROFILE_FALLBACK.contactEmail;
}

export function resolveLocation(locale: Locale, settings: SiteSettings | null): string {
    const fromDb = locale === 'es' ? settings?.location_es : settings?.location_en;
    return trimmedOrNull(fromDb) ?? (locale === 'es' ? PROFILE_FALLBACK.locationEs : PROFILE_FALLBACK.locationEn);
}

export function resolveIsAvailable(settings: SiteSettings | null): boolean {
    return settings?.is_available ?? PROFILE_FALLBACK.isAvailable;
}

export function resolveAvailability(locale: Locale, settings: SiteSettings | null): string {
    const fromDb = locale === 'es' ? settings?.availability_es : settings?.availability_en;
    return (
        trimmedOrNull(fromDb) ??
        (locale === 'es' ? PROFILE_FALLBACK.availabilityEs : PROFILE_FALLBACK.availabilityEn)
    );
}

export function resolveProfileImageUrl(settings: SiteSettings | null): string {
    return trimmedOrNull(settings?.profile_image_url) ?? PROFILE_FALLBACK.profileImageUrl;
}

export function resolveSocialLinks(settings: SiteSettings | null): SocialNetwork[] {
    if (!settings) return [...PROFILE_FALLBACK.socialLinks];
    const fromJson = parseSocialLinks(settings.social_links);
    if (fromJson.length > 0) return fromJson;

    // Compatibilidad si aún no hay JSON y quedan las columnas viejas.
    const legacy: SocialNetwork[] = [];
    const github = trimmedOrNull(settings.github_url);
    const linkedin = trimmedOrNull(settings.linkedin_url);
    if (github) legacy.push({ id: 'github', kind: 'github', label: 'GitHub', href: github });
    if (linkedin) legacy.push({ id: 'linkedin', kind: 'linkedin', label: 'LinkedIn', href: linkedin });
    return legacy.length > 0 ? legacy : [...PROFILE_FALLBACK.socialLinks];
}

/** Iniciales para el avatar del admin a partir del nombre público. */
export function initialsFromDisplayName(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'JV';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

/** Añade versión para evitar caché del navegador tras una subida. */
export function cvUrlWithCacheBust(url: string, version: string | null | undefined): string {
    if (!version) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}v=${encodeURIComponent(version)}`;
}

function isMissingSchemaError(error: { code?: string }): boolean {
    return error.code === '42P01' || error.code === 'PGRST205' || error.code === 'PGRST204' || error.code === '42703';
}

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
    const { data, error } = await supabase
        .from('site_settings')
        .select(SITE_SETTINGS_COLUMNS)
        .eq('id', SITE_SETTINGS_ROW_ID)
        .maybeSingle();

    if (error) {
        if (isMissingSchemaError(error)) {
            return null;
        }
        throw error;
    }

    return data as SiteSettings | null;
}

export async function upsertSiteSettings(patch: SiteSettingsPatch): Promise<void> {
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

function profileImageExtension(file: File): 'jpg' | 'png' | 'webp' {
    if (file.type === 'image/png' || file.name.toLowerCase().endsWith('.png')) return 'png';
    if (file.type === 'image/webp' || file.name.toLowerCase().endsWith('.webp')) return 'webp';
    return 'jpg';
}

export async function uploadPortfolioProfileImage(file: File): Promise<string> {
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!isImage) {
        throw new Error('Solo se permiten imágenes JPG, PNG o WebP.');
    }
    if (file.size > MAX_PROFILE_BYTES) {
        throw new Error('La foto no puede superar 3 MB.');
    }

    const ext = profileImageExtension(file);
    const path = `avatar.${ext}`;
    const contentType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    const { error: uploadError } = await supabase.storage.from(PROFILE_STORAGE_BUCKET).upload(path, file, {
        upsert: true,
        contentType,
        cacheControl: '3600',
    });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(PROFILE_STORAGE_BUCKET).getPublicUrl(path);
    const publicUrl = data.publicUrl;

    await upsertSiteSettings({ profile_image_url: publicUrl });

    return publicUrl;
}
