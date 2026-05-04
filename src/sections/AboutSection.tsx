import React from 'react';
import TechnologyCarousel from '../components/TechnologyCarousel';
import type { Translation } from '../i18n/translations';
import {
    frontendTechnologies,
    backendTechnologies,
    databaseTechnologies,
    toolsTechnologies,
    otherLanguagesTechnologies,
    iaToolsTechnologies,
} from '../data/technologies';

type AboutCopy = Translation['about'];

export const AboutContent: React.FC<{ t: AboutCopy }> = ({ t }) => (
    <div className="max-w-4xl mx-auto text-lg text-text-secondary space-y-4">
        <p>{t.p1}</p>
        <p>{t.p2}</p>
        <div className="space-y-12 pt-8">
            <div>
                <h3 className="text-2xl font-bold text-text-primary mb-4 text-center">{t.frontend}</h3>
                <TechnologyCarousel technologies={frontendTechnologies} />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-text-primary mb-4 text-center">{t.backend}</h3>
                <TechnologyCarousel technologies={backendTechnologies} />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-text-primary mb-4 text-center">{t.databases}</h3>
                <TechnologyCarousel technologies={databaseTechnologies} />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-text-primary mb-4 text-center">{t.tools}</h3>
                <TechnologyCarousel technologies={toolsTechnologies} />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-text-primary mb-4 text-center">{t.otherLanguages}</h3>
                <TechnologyCarousel technologies={otherLanguagesTechnologies} />
            </div>
            <div>
                <h3 className="text-2xl font-bold text-text-primary mb-4 text-center">{t.iaTools}</h3>
                <TechnologyCarousel technologies={iaToolsTechnologies} />
            </div>
        </div>
    </div>
);
