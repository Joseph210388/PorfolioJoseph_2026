import React from 'react';
import { GithubToolIcon, ExternalLinkIcon } from '../components/icons';
import { useProjects, type ProjectWithDetails, type Locale } from '../hooks/useSupabaseData';
import { translations } from '../i18n/translations';

const getProjectImage = (project: ProjectWithDetails) => {
    const thumbnail = project.media.find((media) => media.is_thumbnail);
    return thumbnail?.url || project.media[0]?.url || 'https://via.placeholder.com/800x450?text=Project+Image';
};

export const ProjectsContent: React.FC<{ locale: Locale }> = ({ locale }) => {
    const t = translations[locale].projects;
    const { projects, loading, error } = useProjects(locale);

    return (
        <div className="space-y-6">
            {loading && <p className="text-text-secondary">{locale === 'es' ? 'Cargando proyectos...' : 'Loading projects...'}</p>}
            {error && <p className="text-red-500">{error}</p>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project) => (
                    <div
                        key={project.id}
                        className="group bg-card-background rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl dark:ring-1 dark:ring-white/10 flex flex-col"
                    >
                        <div className="overflow-hidden h-48">
                            <img
                                src={getProjectImage(project)}
                                alt={project.translations?.name ?? 'Project image'}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                                <div>
                                    {project.categoryName && (
                                        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] bg-accent/10 text-accent rounded-full mb-2">
                                            {project.categoryName}
                                        </span>
                                    )}
                                    <h3 className="text-xl font-bold text-text-primary">{project.translations?.name ?? 'Unnamed project'}</h3>
                                </div>
                                <div className="flex items-center space-x-4 flex-shrink-0">
                                    {project.github_url && (
                                        <a
                                            href={project.github_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={t.sourceCode}
                                            title={t.sourceCode}
                                            className="text-text-muted hover:text-accent transition-colors duration-200"
                                        >
                                            <GithubToolIcon className="w-6 h-6" />
                                        </a>
                                    )}
                                    {project.live_url && (
                                        <a
                                            href={project.live_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={t.viewProject}
                                            title={t.viewProject}
                                            className="text-text-muted hover:text-accent transition-colors duration-200"
                                        >
                                            <ExternalLinkIcon className="w-6 h-6" />
                                        </a>
                                    )}
                                </div>
                            </div>
                            <p className="text-text-secondary flex-grow mb-4">
                                {project.translations?.description ?? project.translations?.long_description ?? t.description}
                            </p>
                            <div className="mt-auto pt-4 border-t border-border/20">
                                <ul className="flex flex-wrap gap-2" aria-label="Tecnologías usadas">
                                    {project.technologies.length > 0 ? (
                                        project.technologies.map((technology) => (
                                            <li key={technology.id} className="text-xs font-mono bg-accent/10 text-accent px-2 py-1 rounded">
                                                {technology.name}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-xs font-mono bg-accent/10 text-accent px-2 py-1 rounded">
                                            {locale === 'es' ? 'Sin tecnologías' : 'No technologies'}
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {!loading && projects.length === 0 && (
                <p className="text-text-secondary">{locale === 'es' ? 'No hay proyectos disponibles en este momento.' : 'No projects are available at the moment.'}</p>
            )}
        </div>
    );
};
