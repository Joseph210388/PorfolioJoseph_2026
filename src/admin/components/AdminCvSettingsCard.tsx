import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ExternalLink, FileText, Loader2, Upload } from 'lucide-react';
import { CV_PDF_FALLBACK } from '../../constants/cvFallback';
import { fetchSiteSettings, uploadPortfolioCvFile, type SiteSettings } from '../../utils/siteSettings';
import { cn } from '@/lib/utils';

const MAX_CV_BYTES = 5 * 1024 * 1024;

type CvLocale = 'es' | 'en';

const localeLabels: Record<CvLocale, string> = {
    es: 'Español',
    en: 'Inglés',
};

interface AdminCvSettingsCardProps {
    /** Compacto para columna lateral del dashboard. */
    compact?: boolean;
    className?: string;
}

export const AdminCvSettingsCard: React.FC<AdminCvSettingsCardProps> = ({ compact = false, className }) => {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState<CvLocale | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const inputEsRef = useRef<HTMLInputElement>(null);
    const inputEnRef = useRef<HTMLInputElement>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setSettings(await fetchSiteSettings());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'No se pudo cargar la configuración');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void load();
    }, [load]);

    const handlePick = (locale: CvLocale) => {
        if (locale === 'es') inputEsRef.current?.click();
        else inputEnRef.current?.click();
    };

    const handleFile = async (locale: CvLocale, file: File | undefined) => {
        if (!file) return;

        // El CV público debe ser PDF (visores y descarga); HTML no sirve aquí.
        const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
        if (!isPdf) {
            setError('Solo se permiten archivos PDF (.pdf). No uses HTML ni otros formatos.');
            return;
        }
        if (file.size > MAX_CV_BYTES) {
            setError('El PDF no puede superar 5 MB.');
            return;
        }

        setUploading(locale);
        setError(null);
        setMessage(null);
        try {
            await uploadPortfolioCvFile(locale, file);
            await load();
            setMessage(`CV ${localeLabels[locale]} actualizado.`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al subir el CV');
        } finally {
            setUploading(null);
        }
    };

    const currentUrl = (locale: CvLocale) => {
        const stored = locale === 'es' ? settings?.cv_url_es : settings?.cv_url_en;
        return stored?.trim() || CV_PDF_FALLBACK[locale];
    };

    return (
        <section
            className={cn(
                'rounded-2xl border border-[var(--admin-border)] bg-white shadow-sm',
                compact ? 'flex h-full flex-col p-4 sm:p-5' : 'p-5 sm:p-6',
                className,
            )}
        >
            <div className={cn('mb-3 flex items-start gap-3', compact ? 'justify-between' : 'mb-4')}>
                <div className="min-w-0">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                        Currículum (CV)
                    </h2>
                    <p className={cn('mt-1 text-[var(--admin-text-secondary)]', compact ? 'text-xs leading-relaxed' : 'max-w-prose text-sm')}>
                        {compact
                            ? 'PDFs del hero y Contacto. Solo .pdf (máx. 5 MB).'
                            : 'Los PDFs se usan en el hero y en Contacto. No hace falta una página aparte: súbelos aquí desde Inicio.'}
                    </p>
                </div>
                <FileText
                    className={cn('shrink-0 text-[var(--admin-accent)]', compact ? 'h-6 w-6' : 'hidden h-8 w-8 sm:block')}
                    aria-hidden
                />
            </div>

            {error ? (
                <p
                    className={cn(
                        'mb-3 rounded-xl border border-red-200 bg-red-50 text-red-600',
                        compact ? 'px-3 py-2 text-xs' : 'mb-4 px-4 py-3 text-sm',
                    )}
                    role="alert"
                >
                    {error}
                </p>
            ) : null}
            {message ? (
                <p
                    className={cn(
                        'mb-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700',
                        compact ? 'px-3 py-2 text-xs' : 'mb-4 px-4 py-3 text-sm',
                    )}
                    role="status"
                >
                    {message}
                </p>
            ) : null}

            {loading ? (
                <div className="flex flex-1 justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-[var(--admin-accent)]" aria-label="Cargando" />
                </div>
            ) : (
                <ul className={cn('space-y-3', compact && 'flex-1')}>
                    {(['es', 'en'] as const).map((locale) => (
                        <li
                            key={locale}
                            className={cn(
                                'rounded-xl border border-[var(--admin-border)] bg-slate-50/60',
                                compact ? 'flex flex-col gap-2 p-3' : 'flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between',
                            )}
                        >
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-[var(--admin-text)]">{localeLabels[locale]}</p>
                                <a
                                    href={currentUrl(locale)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-0.5 inline-flex max-w-full items-center gap-1 truncate text-xs text-[var(--admin-accent)] hover:underline"
                                >
                                    Ver PDF
                                    <ExternalLink className="h-3 w-3 shrink-0" aria-hidden />
                                </a>
                            </div>
                            <div className="flex shrink-0">
                                <input
                                    ref={locale === 'es' ? inputEsRef : inputEnRef}
                                    type="file"
                                    accept="application/pdf"
                                    className="sr-only"
                                    onChange={(e) => {
                                        void handleFile(locale, e.target.files?.[0]);
                                        e.target.value = '';
                                    }}
                                />
                                <button
                                    type="button"
                                    disabled={uploading !== null}
                                    onClick={() => handlePick(locale)}
                                    className={cn(
                                        'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--admin-accent)] text-sm font-semibold text-white transition-colors',
                                        'hover:bg-[var(--admin-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60',
                                        compact ? 'px-3 py-2' : 'px-4 py-2.5',
                                    )}
                                >
                                    {uploading === locale ? (
                                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                    ) : (
                                        <Upload className="h-4 w-4" aria-hidden />
                                    )}
                                    Subir PDF
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
};
