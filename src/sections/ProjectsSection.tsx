import React from 'react';
import { GithubToolIcon, ExternalLinkIcon } from '../components/icons';
import type { Translation } from '../i18n/translations';

type ProjectsCopy = Translation['projects'];

export const ProjectsContent: React.FC<{ t: ProjectsCopy }> = ({ t }) => (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {t.projectsData.map((project, index) => (
            <div
                key={index}
                className="group bg-card-background rounded-lg shadow-lg overflow-hidden transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl dark:ring-1 dark:ring-white/10 flex flex-col"
            >
                <div className="overflow-hidden h-48">
                    <img
                        src={project.image}
                        alt={project.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-xl font-bold text-text-primary">{project.name}</h3>
                        <div className="flex items-center space-x-4 flex-shrink-0">
                            {project.github && project.github !== '#' && (
                                <a
                                    href={project.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={t.sourceCode}
                                    title={t.sourceCode}
                                    className="text-text-muted hover:text-accent transition-colors duration-200"
                                >
                                    <GithubToolIcon className="w-6 h-6" />
                                </a>
                            )}
                            {project.link && project.link !== '#' && (
                                <a
                                    href={project.link}
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
                    <p className="text-text-secondary flex-grow mb-4">{project.description}</p>
                    <div className="mt-auto pt-4 border-t border-border/20">
                        <ul className="flex flex-wrap gap-2" aria-label="Tecnologías usadas">
                            {project.tags.map((tag) => (
                                <li key={tag} className="text-xs font-mono bg-accent/10 text-accent px-2 py-1 rounded">
                                    {tag}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        ))}
    </div>
);
