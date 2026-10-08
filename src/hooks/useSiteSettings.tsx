import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Locale } from '../i18n/translations';
import {
    cvUrlWithCacheBust,
    fetchSiteSettings,
    resolveCvUrl,
    type SiteSettings,
} from '../utils/siteSettings';

interface SiteSettingsContextValue {
    settings: SiteSettings | null;
    loading: boolean;
    getCvUrl: (locale: Locale) => string;
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

    const value = useMemo(
        () => ({
            settings,
            loading,
            getCvUrl,
            refresh,
        }),
        [settings, loading, getCvUrl, refresh],
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
