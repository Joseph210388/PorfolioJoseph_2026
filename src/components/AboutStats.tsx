import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useProjects, useWorkExperience } from '../hooks/useSupabaseData';
import { calculateYearsOfExperience } from '../utils/calculateExperienceYears';
import { stackTechnologyCount } from '../data/technologies';
import type { Locale } from '../i18n/translations';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

interface AboutStatsCopy {
    experience: string;
    projects: string;
    technologies: string;
    yearsUnit: string;
}

interface AboutStatsProps {
    t: AboutStatsCopy;
    locale: Locale;
}

const statCardClass = cn(
    'group flex min-w-0 flex-col items-center rounded-2xl border border-border/60 p-3 sm:p-4',
    'bg-card-background/30 backdrop-blur-lg text-center',
    'shadow-sm transition-all duration-300',
    'hover:border-accent hover:bg-card-background/45',
    'hover:shadow-[0_8px_32px_rgba(236,72,105,0.12)]',
    'dark:bg-card-background/20 dark:hover:bg-card-background/30',
);

const valueClass = cn(
    'text-2xl font-bold tracking-tight text-text-primary sm:text-3xl',
    'transition-colors duration-300 group-hover:text-accent',
);

const AboutStats: React.FC<AboutStatsProps> = ({ t, locale }) => {
    const { projects, loading: projectsLoading } = useProjects(locale);
    const { experience, loading: experienceLoading } = useWorkExperience(locale);

    const yearsOfExperience = useMemo(
        () => calculateYearsOfExperience(experience),
        [experience],
    );

    const isLoading = projectsLoading || experienceLoading;

    const stats = [
        { value: yearsOfExperience, label: t.experience, showYearsUnit: true },
        { value: projects.length, label: t.projects },
        { value: stackTechnologyCount, label: t.technologies },
    ];

    return (
        <div className="w-full lg:w-auto lg:shrink-0">
            {isLoading ? (
                <div className="flex justify-center py-4">
                    <Spinner size="sm" />
                </div>
            ) : (
                <dl className="grid grid-cols-3 gap-2 sm:gap-3">
                    {stats.map((stat) => (
                        <motion.div
                            key={stat.label}
                            whileHover={{ y: -2, transition: { duration: 0.2 } }}
                            className={statCardClass}
                        >
                            <dd>
                                {stat.showYearsUnit ? (
                                    <span className="inline-flex items-baseline justify-center gap-1">
                                        <span className={valueClass}>{stat.value}</span>
                                        <span className="text-sm font-medium text-text-muted sm:text-base">
                                            {t.yearsUnit}
                                        </span>
                                    </span>
                                ) : (
                                    <span className={valueClass}>{stat.value}</span>
                                )}
                            </dd>
                            <dt className="mt-2 text-xs text-text-muted sm:text-sm">{stat.label}</dt>
                        </motion.div>
                    ))}
                </dl>
            )}
        </div>
    );
};

export default AboutStats;
