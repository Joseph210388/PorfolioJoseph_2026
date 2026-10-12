import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Maximize2 } from 'lucide-react';
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
    const [thumbsNeedScroll, setThumbsNeedScroll] = useState(false);
    const [galleryExpanded, setGalleryExpanded] = useState(false);
    const thumbListRef = useRef<HTMLDivElement>(null);
    const galleryExpandedRef = useRef(false);

    galleryExpandedRef.current = galleryExpanded;

    useEffect(() => {
        if (!open) return;
        setActiveImageIndex(0);
        setGalleryExpanded(false);
    }, [open, project?.id]);

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (ev: KeyboardEvent) => {
            if (ev.key === 'Escape') {
                // Primero se cierra la vista ampliada; el siguiente Escape cierra el popup.
                if (galleryExpandedRef.current) {
                    setGalleryExpanded(false);
                    return;
                }
                onClose();
                return;
            }
            if (ev.key === 'ArrowLeft') {
                ev.preventDefault();
                setActiveImageIndex((i) => (i <= 0 ? Math.max(galleryImages.length, 1) - 1 : i - 1));
            }
            if (ev.key === 'ArrowRight') {
                ev.preventDefault();
                setActiveImageIndex((i) => {
                    const total = Math.max(galleryImages.length, 1);
                    return i >= total - 1 ? 0 : i + 1;
                });
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
    }, [open, onClose, galleryImages.length]);

    useEffect(() => {
        const activeThumb = thumbListRef.current?.querySelector<HTMLElement>('[data-active-thumb="true"]');
        activeThumb?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }, [activeImageIndex]);

    useEffect(() => {
        const el = thumbListRef.current;
        if (!open || !el) {
            setThumbsNeedScroll(false);
            return;
        }

        const update = () => {
            setThumbsNeedScroll(
                el.scrollHeight > el.clientHeight + 4 || el.scrollWidth > el.clientWidth + 4,
            );
        };

        const frame = window.requestAnimationFrame(update);
        const observer = new ResizeObserver(update);
        observer.observe(el);
        window.addEventListener('resize', update);
        return () => {
            window.cancelAnimationFrame(frame);
            observer.disconnect();
            window.removeEventListener('resize', update);
        };
    }, [open, galleryImages.length, activeImageIndex]);

    useEffect(() => {
        const collapseOnMobile = () => {
            if (window.innerWidth < 768) setGalleryExpanded(false);
        };
        window.addEventListener('resize', collapseOnMobile);
        return () => window.removeEventListener('resize', collapseOnMobile);
    }, []);

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

    const scrollThumbs = (direction: -1 | 1) => {
        thumbListRef.current?.scrollBy({
            top: direction * 80,
            left: direction * 80,
            behavior: 'smooth',
        });
    };

    const toggleGalleryExpanded = () => {
        if (window.innerWidth < 768) return;
        setGalleryExpanded((current) => !current);
    };

    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-5 lg:overflow-hidden lg:p-4 xl:p-5"
            role="dialog"
            aria-modal="true"
            aria-label={project.translations?.name ?? 'Project details'}
            onMouseDown={(e) => {
                if (e.target !== e.currentTarget) return;
                // Fuera del popup: si la foto está ampliada, se vuelve a la ficha; si no, se cierra.
                if (galleryExpandedRef.current) {
                    setGalleryExpanded(false);
                    return;
                }
                onClose();
            }}
        >
            <div
                className={cn(
                    'relative my-auto grid w-full overflow-hidden rounded-2xl bg-card-background shadow-2xl ring-1 ring-white/10',
                    'max-w-3xl md:max-h-[min(92dvh,56rem)] md:max-w-[min(96vw,72rem)] md:grid-cols-[minmax(0,1.25fr)_minmax(16rem,1fr)]',
                    'lg:max-w-[min(96vw,88rem)] lg:grid-cols-[minmax(0,1.45fr)_minmax(20rem,1fr)]',
                    galleryExpanded && 'md:grid-cols-1 lg:grid-cols-1',
                )}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <div className="flex min-h-0 flex-col gap-3 p-3 sm:p-4 lg:h-full lg:min-h-[28rem] lg:flex-row lg:items-stretch lg:gap-3 lg:p-5">
                    {hasMultipleImages ? (
                        <div
                            className={cn(
                                // En móvil basta con las flechas; las miniaturas vuelven desde tablet.
                                'order-2 hidden min-h-0 items-center gap-1 md:flex lg:order-1 lg:w-[4.75rem] lg:shrink-0 lg:flex-col',
                                !thumbsNeedScroll && 'lg:justify-center',
                            )}
                        >
                            {thumbsNeedScroll ? (
                                <button
                                    type="button"
                                    onClick={() => scrollThumbs(-1)}
                                    className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-accent/50 hover:text-accent lg:inline-flex"
                                    aria-label="Miniaturas anteriores"
                                >
                                    <ChevronUp className="h-4 w-4" />
                                </button>
                            ) : null}
                            <div
                                ref={thumbListRef}
                                className="flex min-w-0 flex-1 gap-2 overflow-x-auto overscroll-contain lg:max-h-full lg:flex-col lg:overflow-x-hidden lg:overflow-y-auto"
                            >
                                {images.map((src, index) => (
                                    <button
                                        key={`${src}-${index}`}
                                        type="button"
                                        data-active-thumb={index === safeIndex ? 'true' : undefined}
                                        onClick={() => setActiveImageIndex(index)}
                                        aria-label={`Imagen ${index + 1}`}
                                        aria-current={index === safeIndex ? true : undefined}
                                        className={cn(
                                            'h-14 w-14 shrink-0 overflow-hidden rounded-xl border bg-background transition-colors sm:h-16 sm:w-16',
                                            index === safeIndex
                                                ? 'border-accent ring-2 ring-accent/30'
                                                : 'border-border hover:border-accent/50',
                                        )}
                                    >
                                        <img
                                            src={src}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                            {thumbsNeedScroll ? (
                                <button
                                    type="button"
                                    onClick={() => scrollThumbs(1)}
                                    className="hidden h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-text-muted transition-colors hover:border-accent/50 hover:text-accent lg:inline-flex"
                                    aria-label="Miniaturas siguientes"
                                >
                                    <ChevronDown className="h-4 w-4" />
                                </button>
                            ) : null}
                        </div>
                    ) : null}

                    <div
                        className={cn(
                            'relative order-1 min-h-0 flex-1 overflow-hidden rounded-xl bg-background p-2 sm:p-3 lg:order-2 lg:p-3 md:cursor-zoom-in',
                            galleryExpanded && 'md:min-h-[min(72dvh,42rem)] md:cursor-zoom-out',
                        )}
                        onClick={toggleGalleryExpanded}
                    >
                        <img
                            src={images[safeIndex]}
                            alt={project.translations?.name ?? 'Project image'}
                            className={cn(
                                'pointer-events-none h-52 w-full rounded-lg sm:h-64 md:h-80 lg:h-full lg:min-h-[24rem]',
                                galleryExpanded
                                    ? 'object-contain object-center md:h-full md:min-h-[min(70dvh,40rem)]'
                                    : 'object-cover object-top',
                            )}
                        />
                        {!galleryExpanded ? (
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation();
                                    toggleGalleryExpanded();
                                }}
                                className="absolute bottom-3 right-3 z-[2] hidden h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/70 md:inline-flex"
                                aria-label={tp.expandImage}
                                title={tp.expandImage}
                            >
                                <Maximize2 className="h-4 w-4" aria-hidden />
                            </button>
                        ) : null}
                        {hasMultipleImages ? (
                            <>
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        showPrev();
                                    }}
                                    className="absolute left-2 top-1/2 z-[2] inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/70 sm:left-3 sm:h-10 sm:w-10"
                                    aria-label="Imagen anterior"
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        showNext();
                                    }}
                                    className="absolute right-2 top-1/2 z-[2] inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white transition-colors hover:bg-black/70 sm:right-3 sm:h-10 sm:w-10"
                                    aria-label="Imagen siguiente"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </>
                        ) : null}
                    </div>
                </div>

                {galleryExpanded ? (
                    <button
                        type="button"
                        onClick={() => setGalleryExpanded(false)}
                        className="absolute right-3 top-3 z-20 hidden max-w-[min(100%-1.5rem,20rem)] items-center gap-2 rounded-full bg-black/70 px-3.5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-black/80 md:inline-flex lg:right-4 lg:top-4"
                        aria-label={tp.collapseImage}
                    >
                        <ChevronLeft className="h-4 w-4 shrink-0" aria-hidden />
                        <span className="truncate">{tp.collapseImage}</span>
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute right-3 top-3 z-20 inline-flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/70 lg:right-4 lg:top-4"
                        aria-label={closeLabel}
                        title={closeLabel}
                    >
                        ✕
                    </button>
                )}

                {!galleryExpanded ? (
                    <div className="min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6 md:max-h-[min(92dvh,56rem)] lg:p-7 lg:pr-12">
                    {/* Tipo + estado; padding derecho para no chocar con el cierre */}
                    <div className="flex min-w-0 flex-wrap items-center gap-2 pr-12 sm:gap-3">
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

                    <h3 className="mt-4 pr-10 text-2xl font-bold tracking-tight text-text-primary sm:mt-5 sm:text-3xl">
                        {project.translations?.name ?? 'Unnamed project'}
                    </h3>

                    {(project.github_url || project.live_url) ? (
                        <div className="mt-4 flex flex-wrap gap-2">
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

                    <p className="mt-5 whitespace-pre-line text-sm leading-relaxed text-text-secondary sm:text-base">
                        {bodyText}
                    </p>

                    {/* Tecnologías debajo de la descripción, a todo el ancho de la columna */}
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
                ) : null}
            </div>
        </div>,
        document.body
    );
};

export default ProjectDetailModal;
