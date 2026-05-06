import React, { useState, useRef } from 'react';
import useOnScreen from '../hooks/useOnScreen';
import {
    AngularIcon,
    BootstrapIcon,
    JavaScriptIcon,
    MySqlIcon,
    SqlIcon,
    TypeScriptIcon,
    NestJsIcon,
    NodeJsIcon,
    SqlServerIcon,
} from '../components/icons';
import { useWorkExperience, type Locale } from '../hooks/useSupabaseData';
import { translations } from '../i18n/translations';

type ExperienceCopy = typeof translations['es']['experience'];
type Study = ExperienceCopy['studiesData'][number];

type WorkJobBase = {
    title: string;
    company: string;
    date: string;
    tasks: string[];
    tech?: string;
    icons?: string[];
};
type JobWithIcons = Omit<WorkJobBase, 'icons'> & {
    icons: { name: string; component: React.ReactElement }[];
};

const formatDateRange = (dateStart: string, dateEnd: string | null, locale: Locale) => {
    const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
    const formatter = new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', formatOptions);
    const start = formatter.format(new Date(dateStart)).toUpperCase();
    const end = dateEnd ? formatter.format(new Date(dateEnd)).toUpperCase() : locale === 'es' ? 'ACTUALIDAD' : 'PRESENT';
    return `${start} – ${end}`;
};

const ExperienceItem: React.FC<{ item: JobWithIcons; index: number }> = ({ item, index }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref, '-100px');

    return (
        <div
            ref={ref}
            className={`bg-card-background p-6 rounded-lg shadow-lg transition-all duration-500 ease-out transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
            style={{ transitionDelay: `${index * 150}ms` }}
        >
            <h3 className="text-xl font-bold text-text-primary">{item.title}</h3>
            <p className="text-md text-accent font-semibold">{item.company}</p>
            <p className="text-sm text-text-muted font-mono mb-2">{item.date}</p>
            <ul className="list-disc list-inside text-text-secondary space-y-2 mt-4">
                {item.tasks.map((task, i) => (
                    <li key={i}>{task}</li>
                ))}
            </ul>
            {item.icons.length > 0 && (
                <div className="flex items-center gap-4 mt-6">
                    {item.icons.map((icon) => (
                        <div key={icon.name} title={icon.name} className="transform hover:scale-110 transition-transform duration-200">
                            {icon.component}
                        </div>
                    ))}
                </div>
            )}
            {item.tech && <p className="text-sm text-text-muted mt-4 font-mono">{item.tech}</p>}
        </div>
    );
};

const ExperienceContent: React.FC<{ jobs: JobWithIcons[] }> = ({ jobs }) => (
    <div className="space-y-8">
        {jobs.map((job, index) => (
            <ExperienceItem item={job} index={index} key={`${job.company}-${index}`} />
        ))}
    </div>
);

const StudyItem: React.FC<{ item: Study; index: number }> = ({ item, index }) => {
    const ref = useRef<HTMLDivElement>(null);
    const isVisible = useOnScreen(ref, '-100px');

    return (
        <div
            ref={ref}
            className={`bg-card-background p-6 rounded-lg shadow-lg transition-all duration-500 ease-out transform ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
            }`}
            style={{ transitionDelay: `${index * 150}ms` }}
        >
            <h3 className="text-xl font-bold text-text-primary">{item.title}</h3>
            <p className="text-md text-accent font-semibold">{item.institution}</p>
            <p className="text-sm text-text-muted font-mono">{item.date}</p>
        </div>
    );
};

const StudiesContent: React.FC<{ studies: Study[] }> = ({ studies }) => (
    <div className="space-y-8">
        {studies.map((study, index) => (
            <StudyItem item={study} index={index} key={`${study.title}-${index}`} />
        ))}
    </div>
);

function mapWorkIcons(job: WorkJobBase): JobWithIcons {
    return {
        ...job,
        icons: (job.icons || [])
            .map((iconName) => {
                switch (iconName) {
                    case 'Angular':
                        return { name: 'Angular', component: <AngularIcon className="w-7 h-7" /> };
                    case 'MySQL':
                        return { name: 'MySQL', component: <MySqlIcon className="w-7 h-7" /> };
                    case 'Bootstrap':
                        return { name: 'Bootstrap', component: <BootstrapIcon className="w-7 h-7" /> };
                    case 'JavaScript':
                        return { name: 'JavaScript', component: <JavaScriptIcon className="w-7 h-7" /> };
                    case 'SQL':
                        return { name: 'SQL', component: <SqlIcon className="w-7 h-7 text-text-muted" /> };
                    case 'TypeScript':
                        return { name: 'TypeScript', component: <TypeScriptIcon className="w-7 h-7" /> };
                    case 'NestJS':
                        return { name: 'NestJS', component: <NestJsIcon className="w-7 h-7" /> };
                    case 'Node.js':
                        return { name: 'Node.js', component: <NodeJsIcon className="w-7 h-7" /> };
                    case 'SQL Server':
                        return { name: 'SQL Server', component: <SqlServerIcon className="w-7 h-7" /> };
                    default:
                        return null;
                }
            })
            .filter((x): x is NonNullable<typeof x> => x != null),
    };
}

export const ExperienceTabs: React.FC<{ locale: Locale }> = ({ locale }) => {
    const t = translations[locale].experience;
    const [activeTab, setActiveTab] = useState('laboral');
    const { experience, loading, error } = useWorkExperience(locale);

    const tabButtonClasses =
        'px-6 py-2 rounded-t-lg text-lg font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background focus:ring-accent';
    const activeTabClasses = 'bg-card-background text-text-primary';
    const inactiveTabClasses =
        'bg-transparent text-text-muted hover:bg-gray-500/10 hover:text-text-secondary transform hover:-translate-y-1';

    const dataExperience = experience.length
        ? experience.map((exp) => ({
              title: exp.translations?.title ?? '',
              company: exp.company,
              date: formatDateRange(exp.date_start, exp.date_end, locale),
              tasks: exp.translations?.tasks || [],
              tech: '',
              icons: [],
          }))
        : [];

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex border-b border-border mb-8" role="tablist" aria-label={t.tabsLabel}>
                <button
                    className={`${tabButtonClasses} ${activeTab === 'laboral' ? activeTabClasses : inactiveTabClasses}`}
                    onClick={() => setActiveTab('laboral')}
                    role="tab"
                    aria-selected={activeTab === 'laboral'}
                    aria-controls="panel-laboral"
                    id="tab-laboral"
                >
                    {t.work}
                </button>
                <button
                    className={`${tabButtonClasses} ${activeTab === 'estudios' ? activeTabClasses : inactiveTabClasses}`}
                    onClick={() => setActiveTab('estudios')}
                    role="tab"
                    aria-selected={activeTab === 'estudios'}
                    aria-controls="panel-estudios"
                    id="tab-estudios"
                >
                    {t.studies}
                </button>
            </div>
            {loading && <p className="text-text-secondary mb-6">{locale === 'es' ? 'Cargando experiencia...' : 'Loading experience...'}</p>}
            {error && <p className="text-red-500 mb-6">{error}</p>}
            <div>
                {activeTab === 'laboral' && (
                    <div id="panel-laboral" role="tabpanel" tabIndex={0} aria-labelledby="tab-laboral">
                        <ExperienceContent jobs={dataExperience.map(mapWorkIcons)} />
                    </div>
                )}
                {activeTab === 'estudios' && (
                    <div id="panel-estudios" role="tabpanel" tabIndex={0} aria-labelledby="tab-estudios">
                        <StudiesContent studies={t.studiesData} />
                    </div>
                )}
            </div>
        </div>
    );
};
