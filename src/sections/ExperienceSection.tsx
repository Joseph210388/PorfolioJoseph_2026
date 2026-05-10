import React, { useMemo, useState } from 'react';
import { Briefcase, Code, GraduationCap } from 'lucide-react';
import { useWorkExperience, type Locale } from '../hooks/useSupabaseData';
import { translations } from '../i18n/translations';
import { ProfessionalTimeline, type TimelineItemData } from '../components/ProfessionalTimeline';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

type ExperienceCopy = typeof translations['es']['experience'];
type Study = ExperienceCopy['studiesData'][number];

type WorkJob = {
    title: string;
    company: string;
    date: string;
    tasks: string[];
    tech?: string;
};

const formatDateRange = (
    dateStart: string,
    dateEnd: string | null,
    locale: Locale,
    presentLabel: string
) => {
    const formatOptions: Intl.DateTimeFormatOptions = { month: 'short', year: 'numeric' };
    const formatter = new Intl.DateTimeFormat(locale === 'es' ? 'es-ES' : 'en-US', formatOptions);
    const start = formatter.format(new Date(dateStart)).toUpperCase();
    const end = dateEnd ? formatter.format(new Date(dateEnd)).toUpperCase() : presentLabel;
    return `${start} – ${end}`;
};

const ExperienceContent: React.FC<{ jobs: WorkJob[]; locale: Locale; emptyMessage: string }> = ({
    jobs,
    locale,
    emptyMessage,
}) => {
    const data: TimelineItemData[] = useMemo(
        () =>
            jobs.map((job, index) => ({
                id: `work-${index}-${job.company}-${job.title}`.replace(/\s+/g, '-'),
                title: job.title,
                type: job.company,
                duration: job.date,
                icon: Code,
                responsibilities: job.tasks,
                skills: job.tech ? job.tech.split(',').map((s) => s.trim()).filter(Boolean) : [],
            })),
        [jobs]
    );

    if (jobs.length === 0) {
        return <p className="text-text-secondary">{emptyMessage}</p>;
    }

    return <ProfessionalTimeline key={`work-${locale}-${jobs.length}`} data={data} expandMode="multi" />;
};

const StudiesContent: React.FC<{ studies: Study[]; locale: Locale; emptyMessage: string }> = ({
    studies,
    locale,
    emptyMessage,
}) => {
    const data: TimelineItemData[] = useMemo(
        () =>
            studies.map((study, index) => ({
                id: `study-${index}-${study.title}`.replace(/\s+/g, '-'),
                title: study.title,
                type: study.institution,
                duration: study.date,
                icon: GraduationCap,
                responsibilities: [],
                skills: [],
            })),
        [studies]
    );

    if (studies.length === 0) {
        return <p className="text-text-secondary">{emptyMessage}</p>;
    }

    return (
        <ProfessionalTimeline
            key={`studies-${locale}-${studies.length}`}
            data={data}
            expandMode="multi"
            collapsible={false}
        />
    );
};

export const ExperienceTabs: React.FC<{ locale: Locale }> = ({ locale }) => {
    const t = translations[locale].experience;
    const [activeTab, setActiveTab] = useState('laboral');
    const { experience, loading, error } = useWorkExperience(locale);
    const datePresent = t.datePresent;

    // Control segmentado: un solo bloque; el activo usa la misma superficie opaca que las tarjetas
    const segmentBase =
        'flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:px-5 sm:text-base';
    const segmentActive = 'bg-card-background text-text-primary shadow-sm';
    const segmentInactive = 'text-text-muted hover:text-text-secondary';

    const dataExperience = experience.length
        ? experience.map((exp) => ({
              title: exp.translations?.title ?? '',
              company: exp.company,
              date: formatDateRange(exp.date_start, exp.date_end, locale, datePresent),
              tasks: exp.translations?.tasks || [],
              tech: '',
          }))
        : [];

    return (
        <div className="max-w-4xl mx-auto">
            <div
                className="mb-8 flex w-full rounded-xl border border-border bg-border/25 p-1 shadow-inner dark:bg-black/25"
                role="tablist"
                aria-label={t.tabsLabel}
            >
                <button
                    type="button"
                    className={cn(segmentBase, activeTab === 'laboral' ? segmentActive : segmentInactive)}
                    onClick={() => setActiveTab('laboral')}
                    role="tab"
                    aria-selected={activeTab === 'laboral'}
                    aria-controls="panel-laboral"
                    id="tab-laboral"
                >
                    <Briefcase className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                    {t.work}
                </button>
                <button
                    type="button"
                    className={cn(segmentBase, activeTab === 'estudios' ? segmentActive : segmentInactive)}
                    onClick={() => setActiveTab('estudios')}
                    role="tab"
                    aria-selected={activeTab === 'estudios'}
                    aria-controls="panel-estudios"
                    id="tab-estudios"
                >
                    <GraduationCap className="h-4 w-4 shrink-0 opacity-90" aria-hidden />
                    {t.studies}
                </button>
            </div>
            {error && <p className="text-red-500 mb-6">{error}</p>}
            <div className="relative min-h-[12rem] md:min-h-[16rem]">
                <div
                    className={cn(
                        loading && 'pointer-events-none select-none opacity-40'
                    )}
                >
                    {activeTab === 'laboral' && (
                        <div id="panel-laboral" role="tabpanel" tabIndex={0} aria-labelledby="tab-laboral">
                            <ExperienceContent jobs={dataExperience} locale={locale} emptyMessage={t.emptyWork} />
                        </div>
                    )}
                    {activeTab === 'estudios' && (
                        <div id="panel-estudios" role="tabpanel" tabIndex={0} aria-labelledby="tab-estudios">
                            <StudiesContent studies={t.studiesData} locale={locale} emptyMessage={t.emptyStudies} />
                        </div>
                    )}
                </div>
                {loading && (
                    <div
                        className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/65 backdrop-blur-[2px] dark:bg-background/75"
                        role="status"
                        aria-live="polite"
                        aria-label={t.loading}
                    >
                        <Spinner size="lg" />
                    </div>
                )}
            </div>
        </div>
    );
};
