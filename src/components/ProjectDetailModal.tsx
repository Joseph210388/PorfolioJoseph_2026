import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GithubToolIcon, ExternalLinkIcon } from './icons';
import { getOrderedProjectImages, getProjectImageUrl } from '../utils/projectImage';
import { cn } from '@/lib/utils';
import type { Locale, ProjectWithDetails } from '../hooks/useSupabaseData';
import { translations } from '../i18n/translations';

const statusDotClass: Record<ProjectWithDetails['status'], string> = {
    finished: 'bg-emerald-400',
    in_progress: 'bg-amber-400',
    paused: 'bg-text-muted',
};

const projectLinkButtonClass = cn(
    'inline-flex w-full min-w-[8.5rem] items-center justify-center gap-2 rounded-xl border border-border',
    'bg-background px-4 py-2.5 text-sm font-medium text-text-primary transition-colors',
    'hover:border-accent/50 hover:text-accent sm:w-auto sm:min-w-[9.5rem]',
);

const techChipClass = cn(
    'inline-flex h-8 min-w-[5.25rem] max-w-full items-center justify-center rounded-full border border-border',
    'bg-background px-3 font-mono text-[10px] text-accent sm:text-[11px]',
    'truncate',
);

export type ProjectDetailModalProps = {
    project: ProjectWithDetails | null;
    onClose: () => void;
    locale: Locale;
    closeLabel: string;
    sourceCodeLabel: string;
    viewProjectLabel: string;
    fallbackDescription: string;
};

const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
    project,
    onClose,
    locale,
    closeLabel,
    sourceCodeLabel,
    viewProjectLabel,
    fallbackDescription,
}) => {
    const open = Boolean(project);
    const galleryImages = useMemo(
        () => (project ? getOrderedProjectImages(project) : []),
        [project],
    );
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    useEffect(() => {
        if (!open) return;
        setActiveImageIndex(0);
    }, [open, project?.id]);

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

    const statusLabel =
        project.status === 'finished'
            ? tp.statusFinished
            : project.status === 'in_progress'
              ? tp.statusInProgress
              : tp.statusPaused;

    const images = galleryImages.length > 0 ? galleryImages : [getProjectImageUrl(project)];
    const safeIndex = Math.min(activeImageIndex, images.length - 1);
    const hasMultipleImages = images.length > 1;

    const showPrev = () => setActiveImageIndex((i) => (i <= 0 ? images.length - 1 : i - 1));
    const showNext = () => setActiveImageIndex((i) => (i >= images.length - 1 ? 0 : i + 1));

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-label={project.translations?.name ?? 'Project details'}
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                className="my-auto flex w-full max-w-3xl max-h-[min(92dvh,880px)] flex-col overflow-hidden rounded-2xl bg-card-background shadow-2xl ring-1 ring-white/10"
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="relative shrink-0 bg-background">
                    <img
                        src={images[safeIndex]}
                        alt={project.translations?.name ?? 'Project image'}
                        className="max-h-[min(28vh,220px)] w-full object-cover sm:max-h-[min(36vh,280px)]"
                    />
                    {hasMultipleImages ? (
                        <>
                            <button
                                type="button"
                                onClick={showPrev}
                                className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/70"
                                aria-label="Imagen anterior"
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button
                                type="button"
                                onClick={showNext}
                                className="absolute right-14 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/70 sm:right-16"
                                aria-label="Imagen siguiente"
                            >
                                <ChevronRight className="h-5 w-5" />
                            </button>
                            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                                {images.map((_, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => setActiveImageIndex(index)}
                                        aria-label={`Imagen ${index + 1}`}
                                        className={cn(
                                            'h-2 w-2 rounded-full transition-colors',
                                            index === safeIndex ? 'bg-white' : 'bg-white/45 hover:bg-white/70',
                                        )}
                                    />
                                ))}
                            </div>
                        </>
                    ) : null}
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

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 sm:p-8">
                    {/* Tipo + estado */}
                    <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
                        {project.categoryName ? (
                            <span className="text-xs font-bold uppercase tracking-wider text-accent">
                                {project.categoryName}
                            </span>
                        ) : null}
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

                    {/* Título; debajo descripción | botones GitHub / demo */}
                    <div className="mt-4 grid gap-x-6 gap-y-5 sm:mt-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start lg:gap-x-8">
                        <h3 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl lg:col-span-2">
                            {project.translations?.name ?? 'Unnamed project'}
                        </h3>

                        <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary sm:text-base lg:col-start-1 lg:row-start-2">
                            {bodyText}
                        </p>

                        {(project.github_url || project.live_url) ? (
                            <div className="flex flex-col items-stretch gap-2 sm:items-end lg:col-start-2 lg:row-start-2 lg:min-w-[9.5rem]">
                                {project.github_url ? (
                                    <a
                                        href={project.github_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={projectLinkButtonClass}
                                    >
                                        <GithubToolIcon className="h-4 w-4 shrink-0" />
                                        {sourceCodeLabel}
                                    </a>
                                ) : null}
                                {project.live_url ? (
                                    <a
                                        href={project.live_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className={projectLinkButtonClass}
                                    >
                                        <ExternalLinkIcon className="h-4 w-4 shrink-0" />
                                        {viewProjectLabel}
                                    </a>
                                ) : null}
                            </div>
                        ) : null}
                    </div>

                    {/* Tecnologías: bloque propio a ancho completo, debajo de descripción y botones */}
                    <section className="mt-6 w-full border-t border-border/20 pt-5">
                        <h4 className="mb-3 text-sm font-semibold text-text-primary">{tp.technologies}</h4>
                        {project.technologies.length > 0 ? (
                            <ul className="flex w-full flex-wrap gap-2" aria-label={tp.technologies}>
                                {project.technologies.map((technology) => (
                                    <li key={technology.id}>
                                        <span className={techChipClass} title={technology.name}>
                                            {technology.name}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-sm text-text-muted">{tp.noTechnologies}</p>
                        )}
                    </section>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ProjectDetailModal;
