import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GithubToolIcon, ExternalLinkIcon } from './icons';
import { getProjectImageUrl } from '../utils/projectImage';
import type { Locale, ProjectWithDetails } from '../hooks/useSupabaseData';
import { translations } from '../i18n/translations';

export type ProjectDetailModalProps = {
    project: ProjectWithDetails | null;
    onClose: () => void;
    locale: Locale;
    closeLabel: string;
    sourceCodeLabel: string;
    viewProjectLabel: string;
    technologiesHeading: string;
    fallbackDescription: string;
};

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
    project,
    onClose,
    locale,
    closeLabel,
    sourceCodeLabel,
    viewProjectLabel,
    technologiesHeading,
    fallbackDescription,
}) => {
    const open = Boolean(project);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (ev: KeyboardEvent) => {
            if (ev.key === 'Escape') {
                onClose();
            }
        };

        const prevOverflow = document.body.style.overflow;
        const prevPaddingRight = document.body.style.paddingRight;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        const root = document.getElementById('root') as (HTMLElement & { inert?: boolean }) | null;
        const prevRootPointerEvents = root?.style.pointerEvents;
        const prevAriaHidden = root?.getAttribute('aria-hidden');
        const prevInert = root?.inert;

        if (root) {
            root.style.pointerEvents = 'none';
            root.setAttribute('aria-hidden', 'true');
            root.inert = true;
        }

        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = prevOverflow;
            document.body.style.paddingRight = prevPaddingRight;
            if (root) {
                root.style.pointerEvents = prevRootPointerEvents ?? '';
                if (prevAriaHidden == null) root.removeAttribute('aria-hidden');
                else root.setAttribute('aria-hidden', prevAriaHidden);
                root.inert = prevInert;
            }
        };
    }, [open, onClose]);

    if (!project) {
        return null;
    }

    const tp = translations[locale].projects;

    const bodyText =
        project.translations?.long_description ?? project.translations?.description ?? fallbackDescription;

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={project.translations?.name ?? 'Project details'}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="w-full max-w-3xl overflow-hidden rounded-2xl bg-card-background shadow-2xl ring-1 ring-white/10">
                <div className="relative">
                    <img
                        src={getProjectImageUrl(project)}
                        alt={project.translations?.name ?? 'Project image'}
                        className="max-h-[320px] w-full object-cover"
                    />
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/70"
                        aria-label={closeLabel}
                        title={closeLabel}
                    >
                        ✕
                    </button>
                </div>

                <div className="p-6 sm:p-8">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            {project.categoryName && (
                                <span className="mb-3 inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                                    {project.categoryName}
                                </span>
                            )}
                            <h3 className="text-2xl font-bold text-text-primary">
                                {project.translations?.name ?? 'Unnamed project'}
                            </h3>
                        </div>

                        <div className="flex items-center gap-4">
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

                    <p className="mt-4 whitespace-pre-line text-text-secondary">{bodyText}</p>

                    <div className="mt-6 border-t border-border/20 pt-5">
                        <p className="mb-3 text-sm font-semibold text-text-primary">{technologiesHeading}</p>
                        <ul className="flex flex-wrap gap-2" aria-label={technologiesHeading}>
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
            </div>
        </div>,
        document.body
    );
};

export default ProjectDetailModal;
