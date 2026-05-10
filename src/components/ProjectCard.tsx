import React from 'react';
import { GithubToolIcon, ExternalLinkIcon } from './icons';
import type { Locale, ProjectWithDetails } from '../hooks/useSupabaseData';
import { translations } from '../i18n/translations';
import { getProjectImageUrl } from '../utils/projectImage';

export type ProjectCardProps = {
    project: ProjectWithDetails;
    locale: Locale;
    sourceCodeLabel: string;
    viewProjectLabel: string;
    readMoreLabel: string;
    fallbackDescription: string;
    onReadMore: (project: ProjectWithDetails) => void;
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
    const description = project.translations?.description ?? project.translations?.long_description ?? fallbackDescription;

    return (
        <article className="group flex h-full min-h-0 flex-col overflow-hidden rounded-lg bg-card-background shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:ring-1 dark:ring-white/10">
            <div className="h-48 overflow-hidden">
                <img
                    src={getProjectImageUrl(project)}
                    alt={project.translations?.name ?? 'Project image'}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
            </div>
            <div className="flex min-h-0 flex-1 flex-col p-6">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        {project.categoryName && (
                            <span className="mb-2 inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                                {project.categoryName}
                            </span>
                        )}
                        <h3 className="text-xl font-bold text-text-primary">{project.translations?.name ?? 'Unnamed project'}</h3>
                    </div>
                    <div className="flex flex-shrink-0 items-center space-x-4">
                        {project.github_url && (
                            <a
                                href={project.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={sourceCodeLabel}
                                title={sourceCodeLabel}
                                className="text-text-muted transition-colors duration-200 hover:text-accent"
                            >
                                <GithubToolIcon className="h-6 w-6" />
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
                                <ExternalLinkIcon className="h-6 w-6" />
                            </a>
                        )}
                    </div>
                </div>

                <p className="mb-3 min-h-0 break-words text-text-secondary line-clamp-3">{description}</p>

                <button
                    type="button"
                    onClick={() => onReadMore(project)}
                    className="self-start text-sm font-semibold text-accent underline-offset-4 hover:underline"
                    aria-label={`${readMoreLabel}: ${project.translations?.name ?? 'Project'}`}
                >
                    {readMoreLabel}
                </button>

                <div className="mt-2 border-t border-border/20 pt-4">
                    <ul className="flex flex-wrap gap-2" aria-label={tp.technologiesListAria}>
                        {project.technologies.length > 0 ? (
                            project.technologies.map((technology) => (
                                <li key={technology.id} className="rounded bg-accent/10 px-2 py-1 font-mono text-xs text-accent">
                                    {technology.name}
                                </li>
                            ))
                        ) : (
                            <li className="rounded bg-accent/10 px-2 py-1 font-mono text-xs text-accent">
                                {tp.noTechnologies}
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </article>
    );
};

export default ProjectCard;
