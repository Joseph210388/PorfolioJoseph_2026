import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, Download, Mail, MapPin } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './icons';
import { cn } from '@/lib/utils';
import type { Locale } from '../i18n/translations';

const CONTACT_EMAIL = 'josephvalderrama2103@icloud.com';

const CV_PDF_BY_LANG = {
    es: '/pdf/CVJosephValderrama_ES.pdf',
    en: '/pdf/CVJosephValderrama_EN.pdf',
} as const;

const SOCIAL_LINKS = [
    { href: 'https://github.com/Joseph210388', label: 'GitHub', icon: <GithubIcon /> },
    { href: 'https://es.linkedin.com/in/joseph-valderrama', label: 'LinkedIn', icon: <LinkedinIcon /> },
] as const;

interface ContactCardsCopy {
    contactInfo: {
        title: string;
        location: string;
    };
    availability: {
        title: string;
        status: string;
    };
    resume: {
        title: string;
        downloadButton: string;
    };
    social: {
        title: string;
    };
    copyEmail: string;
    copySuccess: string;
}

interface ContactInfoCardsProps {
    t: ContactCardsCopy;
    locale: Locale;
}

const cardClass =
    'rounded-2xl border border-border bg-card-background p-5 sm:p-6 transition-colors hover:border-accent/40';

const ContactInfoCards: React.FC<ContactInfoCardsProps> = ({ t, locale }) => {
    const [emailCopied, setEmailCopied] = useState(false);

    const handleCopyEmail = useCallback(async () => {
        try {
            await navigator.clipboard.writeText(CONTACT_EMAIL);
            setEmailCopied(true);
            window.setTimeout(() => setEmailCopied(false), 2000);
        } catch {
            // Fallback silencioso si el portapapeles no está disponible
        }
    }, []);

    return (
        <div className="flex flex-col gap-4">
            <motion.article
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className={cardClass}
            >
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-accent">
                    {t.contactInfo.title}
                </h3>
                <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                        <Mail className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
                        <a
                            href={`mailto:${CONTACT_EMAIL}`}
                            title={CONTACT_EMAIL}
                            className="min-w-0 flex-1 truncate text-sm text-text-secondary transition-colors hover:text-accent"
                        >
                            {CONTACT_EMAIL}
                        </a>
                        <button
                            type="button"
                            onClick={handleCopyEmail}
                            aria-label={emailCopied ? t.copySuccess : t.copyEmail}
                            className="shrink-0 rounded-xl p-1.5 text-text-muted transition-colors hover:bg-background hover:text-accent"
                        >
                            {emailCopied ? (
                                <Check className="h-4 w-4 text-accent" aria-hidden />
                            ) : (
                                <Copy className="h-4 w-4" aria-hidden />
                            )}
                        </button>
                    </li>
                    <li className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 shrink-0 text-text-muted" aria-hidden />
                        <span className="text-sm text-text-secondary">{t.contactInfo.location}</span>
                    </li>
                </ul>
            </motion.article>

            <motion.article
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className={cardClass}
            >
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-accent">
                    {t.availability.title}
                </h3>
                <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5" aria-hidden>
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/60 opacity-75" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                    </span>
                    <p className="text-sm text-text-secondary">{t.availability.status}</p>
                </div>
            </motion.article>

            <motion.article
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className={cardClass}
            >
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-accent">
                    {t.resume.title}
                </h3>
                <a
                    href={CV_PDF_BY_LANG[locale]}
                    download
                    className={cn(
                        'inline-flex w-full items-center justify-center gap-2 rounded-xl border border-accent/60',
                        'px-4 py-2.5 text-sm font-medium text-accent transition-colors',
                        'hover:border-accent hover:bg-accent/10',
                    )}
                >
                    <Download className="h-4 w-4" aria-hidden />
                    {t.resume.downloadButton}
                </a>
            </motion.article>

            <motion.article
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className={cardClass}
            >
                <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-accent">
                    {t.social.title}
                </h3>
                <div className="flex flex-wrap gap-3">
                    {SOCIAL_LINKS.map((social) => (
                        <a
                            key={social.label}
                            href={social.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={social.label}
                            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-text-muted transition-colors hover:border-accent/50 hover:text-accent"
                        >
                            {social.icon}
                        </a>
                    ))}
                </div>
            </motion.article>
        </div>
    );
};

export default ContactInfoCards;
