import React, { useMemo } from 'react';
import TechnologyStack from '../components/TechnologyStack';
import AboutStats from '../components/AboutStats';
import type { Locale, Translation } from '../i18n/translations';
import {
    frontendTechnologies,
    backendTechnologies,
    databaseTechnologies,
    toolsTechnologies,
    otherLanguagesTechnologies,
    iaToolsTechnologies,
} from '../data/technologies';

type AboutCopy = Translation['about'];

export const AboutContent: React.FC<{ t: AboutCopy; locale: Locale }> = ({ t, locale }) => {
    const stackCategories = useMemo(
        () => [
            { label: t.frontend, technologies: frontendTechnologies },
            { label: t.backend, technologies: backendTechnologies },
            { label: t.databases, technologies: databaseTechnologies },
            { label: t.tools, technologies: toolsTechnologies },
            { label: t.otherLanguages, technologies: otherLanguagesTechnologies },
            { label: t.iaTools, technologies: iaToolsTechnologies },
        ],
        [t],
    );

    return (
        <div className="mx-auto max-w-6xl space-y-10 sm:space-y-12">
            {/* Texto a la izquierda + cuadros a la derecha */}
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-10 xl:gap-14">
                <div className="space-y-4 text-base leading-relaxed text-text-secondary sm:text-lg">
                    <p>
                        {t.p1Before}
                        <strong className="font-semibold text-text-primary">{t.fullName}</strong>
                        {t.p1After}
                    </p>
                    <p>{t.p2}</p>
                </div>
                <AboutStats t={t.stats} locale={locale} />
            </div>

            {/* Stack de tecnologías a ancho completo debajo */}
            <TechnologyStack categories={stackCategories} />
        </div>
    );
};
