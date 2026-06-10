import React from 'react';
import { GithubToolIcon, ExternalLinkIcon } from './icons';
import type { Locale, ProjectWithDetails } from '../hooks/useSupabaseData';
import { translations } from '../i18n/translations';
import { getProjectImageUrl } from '../utils/projectImage';
import ProjectCardTechnologies from './ProjectCardTechnologies';
import { cn } from '@/lib/utils';

export type ProjectCardProps = {
    project: ProjectWithDetails;
    locale: Locale;
    sourceCodeLabel: string;
    viewProjectLabel: string;
    readMoreLabel: string;
    fallbackDescription: string;
    onReadMore: (project: ProjectWithDetails) => void;
};

const statusDotClass: Record<ProjectWithDetails['status'], string> = {
    finished: 'bg-emerald-400',
    in_progress: 'bg-amber-400',
    paused: 'bg-text-muted',
};

const ProjectCard: React.FC<ProjectCardProps> = ({
    project,
    locale,
    sourceCodeLabel,
    viewProjectLabel,
    readMoreLabel,
    fallbackDescription,
    onReadMore,
}) => {
    const tp = translations[locale].projects;
    const description =
        project.translations?.description ?? project.translations?.long_description ?? fallbackDescription;

    const statusLabel =
        project.status === 'finished'
            ? tp.statusFinished
            : project.status === 'in_progress'
              ? tp.statusInProgress
              : tp.statusPaused;

    return (
        <article
            className={cn(
                'group flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card-background',
                'shadow-sm transition-all duration-300',
                'hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_8px_32px_rgba(236,72,105,0.12)]',
                'dark:bg-card-background/95 dark:hover:bg-card-background',
            )}
        >
            <div className="h-44 overflow-hidden sm:h-48">
                <img
                    src={getProjectImageUrl(project)}
                    alt={project.translations?.name ?? 'Project image'}
                    className="h-full w-full max-w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
            </div>

            <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6">
                <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                        {project.categoryName && (
                            <span className="text-xs font-bold uppercase tracking-wider text-accent">
                                {project.categoryName}
                            </span>
                        )}
                        <span
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5',
                                'text-xs font-medium text-text-muted',
                            )}
                        >
                            <span
                                className={cn('h-1.5 w-1.5 shrink-0 rounded-full', statusDotClass[project.status])}
                                aria-hidden
                            />
                            {statusLabel}
                        </span>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                        {project.github_url && (
                            <a
                                href={project.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={sourceCodeLabel}
                                title={sourceCodeLabel}
                                className="text-text-primary transition-colors duration-200 hover:text-accent"
                            >
                                <GithubToolIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                            </a>
                        )}
                        {project.live_url && (
                            <a
                                href={project.live_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={viewProjectLabel}
                                title={viewProjectLabel}
                                className="text-text-muted transition-colors duration-200 hover:text-accent"
                            >
                                <ExternalLinkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                            </a>
                        )}
                    </div>
                </div>

                <h3 className="mb-2 text-lg font-bold tracking-tight text-text-primary sm:text-xl">
                    {project.translations?.name ?? 'Unnamed project'}
                </h3>

                <p className="mb-3 line-clamp-3 min-h-0 flex-1 text-sm leading-relaxed text-text-muted sm:text-base">
                    {description}
                </p>

                <button
                    type="button"
                    onClick={() => onReadMore(project)}
                    className="mb-4 self-start text-sm font-semibold text-accent transition-colors hover:text-accent/80"
                    aria-label={`${readMoreLabel}: ${project.translations?.name ?? 'Project'}`}
                >
                    {readMoreLabel} →
                </button>

                <div className="mt-auto border-t border-border pt-4">
                    <ProjectCardTechnologies
                        technologies={project.technologies}
                        ariaLabel={tp.technologiesListAria}
                        noTechnologiesLabel={tp.noTechnologies}
                    />
                </div>
            </div>
        </article>
    );
};

export default ProjectCard;
