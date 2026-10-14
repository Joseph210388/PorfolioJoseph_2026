import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Locale } from '../i18n/translations';
import type { SocialNetwork } from '../utils/socialNetworks';
import {
    cvUrlWithCacheBust,
    fetchSiteSettings,
    resolveAvailability,
    resolveContactEmail,
    resolveCvUrl,
    resolveDisplayName,
    resolveIsAvailable,
    resolveLocation,
    resolveProfileImageUrl,
    resolveSocialLinks,
    type SiteSettings,
} from '../utils/siteSettings';

interface SiteSettingsContextValue {
    settings: SiteSettings | null;
    loading: boolean;
    getCvUrl: (locale: Locale) => string;
    getDisplayName: () => string;
    getContactEmail: () => string;
    getLocation: (locale: Locale) => string;
    getAvailability: (locale: Locale) => string;
    isAvailable: boolean;
    getProfileImageUrl: () => string;
    getSocialLinks: () => SocialNetwork[];
    refresh: () => Promise<void>;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null);

export const SiteSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);

    const refresh = useCallback(async () => {
        try {
            setSettings(await fetchSiteSettings());
        } catch {
            setSettings(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const getCvUrl = useCallback(
        (locale: Locale) => {
            const base = resolveCvUrl(locale, settings);
            const version = settings?.updated_at ?? null;
            return cvUrlWithCacheBust(base, version);
        },
        [settings],
    );

    const getDisplayName = useCallback(() => resolveDisplayName(settings), [settings]);
    const getContactEmail = useCallback(() => resolveContactEmail(settings), [settings]);
    const getLocation = useCallback((locale: Locale) => resolveLocation(locale, settings), [settings]);
    const getAvailability = useCallback((locale: Locale) => resolveAvailability(locale, settings), [settings]);
    const isAvailable = resolveIsAvailable(settings);
    const getProfileImageUrl = useCallback(() => {
        const base = resolveProfileImageUrl(settings);
        return cvUrlWithCacheBust(base, settings?.updated_at);
    }, [settings]);
    const getSocialLinks = useCallback(() => resolveSocialLinks(settings), [settings]);

    const value = useMemo(
        () => ({
            settings,
            loading,
            getCvUrl,
            getDisplayName,
            getContactEmail,
            getLocation,
            getAvailability,
            isAvailable,
            getProfileImageUrl,
            getSocialLinks,
            refresh,
        }),
        [
            settings,
            loading,
            getCvUrl,
            getDisplayName,
            getContactEmail,
            getLocation,
            getAvailability,
            isAvailable,
            getProfileImageUrl,
            getSocialLinks,
            refresh,
        ],
    );

    return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
};

export function useSiteSettings(): SiteSettingsContextValue {
    const ctx = useContext(SiteSettingsContext);
    if (!ctx) {
        throw new Error('useSiteSettings debe usarse dentro de SiteSettingsProvider');
    }
    return ctx;
}
