import React, { useCallback, useMemo, useState } from 'react';
import { Search, X, ChevronDown, Trash2 } from 'lucide-react';
import ProjectCard from '../components/ProjectCard';
import ProjectDetailModal from '../components/ProjectDetailModal';
import { useProjects, type ProjectWithDetails, type Locale } from '../hooks/useSupabaseData';
import { translations } from '../i18n/translations';
import Button from '@/components/ui/Button';
import { FilterDropdownMenu, FilterMenuItem } from '@/components/ui/FilterDropdownMenu';
import { filterMenuItemClass } from '@/components/ui/filterMenuItemStyles';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

// Fondo siempre tipo tarjeta (no relleno oscuro al filtrar); el acento de “hay filtro” va en el valor en rojo
const filterDropdownTriggerClass = (isOpen: boolean) =>
    cn(
        'h-10 min-w-[9.5rem] justify-between gap-2 font-medium shadow-sm',
        // active:scale-100 evita que el botón encoja bajo el dedo (el Button base usa scale-0.97) y empeore hit-testing con Radix
        'border-2 border-border bg-card-background text-text-primary active:scale-100',
        'hover:border-accent/50 hover:bg-background dark:bg-card-background/80 dark:hover:bg-card-background',
        isOpen && 'border-accent ring-2 ring-accent/25',
    );

const filterValueClass = (hasSpecificSelection: boolean) =>
    cn(
        'opacity-90',
        hasSpecificSelection && 'font-semibold text-red-600 dark:text-red-400',
    );

export const ProjectsContent: React.FC<{ locale: Locale }> = ({ locale }) => {
    const t = translations[locale].projects;
    const { projects, loading, error } = useProjects(locale);

    const [selectedProject, setSelectedProject] = useState<ProjectWithDetails | null>(null);
    const closeProjectModal = useCallback(() => {
        setSelectedProject(null);
    }, []);

    const [query, setQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedTech, setSelectedTech] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<'all' | 'finished' | 'in_progress' | 'paused'>('all');
    const [openDropdown, setOpenDropdown] = useState<'status' | 'category' | 'tech' | null>(null);

    const categories = useMemo(() => {
        const set = new Set<string>();
        for (const p of projects) {
            if (p.categoryName) set.add(p.categoryName);
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [projects]);

    const technologies = useMemo(() => {
        const set = new Set<string>();
        for (const p of projects) {
            for (const tech of p.technologies) set.add(tech.name);
        }
        return Array.from(set).sort((a, b) => a.localeCompare(b));
    }, [projects]);

    const filteredProjects = useMemo(() => {
        const q = query.trim().toLowerCase();

        return projects.filter((p) => {
            if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;
            if (selectedCategory !== 'all' && (p.categoryName ?? '') !== selectedCategory) return false;
            if (selectedTech !== 'all' && !p.technologies.some((t) => t.name === selectedTech)) return false;

            if (!q) return true;

            const haystack = [
                p.translations?.name ?? '',
                p.translations?.description ?? '',
                p.translations?.long_description ?? '',
                p.categoryName ?? '',
                ...p.technologies.map((t) => t.name),
            ]
                .join(' ')
                .toLowerCase();

            return haystack.includes(q);
        });
    }, [projects, query, selectedCategory, selectedTech, selectedStatus]);

    /** Solo dropdowns (Estado / Categoría / Tecnología); la búsqueda se limpia con la X del input */
    const hasActiveFilters = useMemo(
        () => selectedCategory !== 'all' || selectedTech !== 'all' || selectedStatus !== 'all',
        [selectedCategory, selectedTech, selectedStatus]
    );

    const selectedStatusLabel = useMemo(() => {
        switch (selectedStatus) {
            case 'finished':
                return t.statusFinished;
            case 'in_progress':
                return t.statusInProgress;
            case 'paused':
                return t.statusPaused;
            default:
                return t.filterAll;
        }
    }, [selectedStatus, t]);

    const selectedCategoryLabel = selectedCategory === 'all' ? t.filterAll : selectedCategory;
    const selectedTechLabel = selectedTech === 'all' ? t.filterAll : selectedTech;

    const clearFilters = () => {
        setSelectedCategory('all');
        setSelectedTech('all');
        setSelectedStatus('all');
        setOpenDropdown(null);
    };

    return (
        <div className="space-y-6">
            {error && <p className="text-red-500">{error}</p>}

            <div className="relative z-40 rounded-2xl border border-border bg-card-background px-3 py-3 shadow-md ring-1 ring-black/[0.04] sm:px-4 dark:border-border dark:bg-card-background/95 dark:shadow-lg dark:ring-white/10">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-3">
                    <div className="w-full min-w-0 shrink-0 lg:max-w-xs xl:max-w-sm">
                        <div className="flex h-11 w-full min-w-0 max-w-full items-stretch overflow-hidden rounded-xl border-2 border-border bg-background shadow-inner transition-colors focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/25 dark:bg-card-background/80">
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t.searchPlaceholder}
                                className="min-w-0 flex-1 border-0 bg-transparent py-2 pl-4 pr-2 text-sm text-text-primary outline-none ring-0 placeholder:text-text-muted focus:ring-0 dark:bg-transparent"
                                aria-label={t.searchPlaceholder}
                            />
                            <div className="flex shrink-0 items-stretch border-l border-border dark:border-border">
                                {query.trim() !== '' && (
                                    <button
                                        type="button"
                                        onClick={() => setQuery('')}
                                        className="inline-flex items-center justify-center px-2 text-text-muted transition-colors hover:bg-border/30 hover:text-text-primary"
                                        aria-label={t.clearSearch}
                                        title={t.clearSearch}
                                    >
                                        <X className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                                    </button>
                                )}
                                <span
                                    className="inline-flex items-center justify-center px-2.5 text-text-muted"
                                    aria-hidden
                                >
                                    <Search className="h-4 w-4 shrink-0" strokeWidth={2} />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex min-w-0 flex-1 flex-wrap items-center justify-start gap-2 lg:justify-end">
                        <div className="relative z-50 w-full sm:w-auto">
                            <FilterDropdownMenu
                                open={openDropdown === 'status'}
                                onOpenChange={(next) => setOpenDropdown(next ? 'status' : null)}
                                trigger={
                                    <Button
                                        className={cn(
                                            filterDropdownTriggerClass(openDropdown === 'status'),
                                            'w-full sm:w-auto',
                                        )}
                                        variant="outline"
                                        size="sm"
                                        aria-expanded={openDropdown === 'status'}
                                        aria-haspopup="menu"
                                        iconRight={
                                            <ChevronDown
                                                className={cn(
                                                    'h-4 w-4 shrink-0 text-text-muted transition-transform',
                                                    openDropdown === 'status' && 'rotate-180',
                                                )}
                                            />
                                        }
                                    >
                                        <span className="font-medium text-text-primary">{t.filterStatus}:</span>{' '}
                                        <span className={filterValueClass(selectedStatus !== 'all')}>
                                            {selectedStatusLabel}
                                        </span>
                                    </Button>
                                }
                            >
                                {(
                                    [
                                        ['all', t.filterAll] as const,
                                        ['finished', t.statusFinished] as const,
                                        ['in_progress', t.statusInProgress] as const,
                                        ['paused', t.statusPaused] as const,
                                    ] as const
                                ).map(([value, label]) => (
                                    <FilterMenuItem
                                        key={value}
                                        className={filterMenuItemClass(selectedStatus === value)}
                                        onSelect={() => {
                                            setSelectedStatus(value);
                                        }}
                                    >
                                        {label}
                                    </FilterMenuItem>
                                ))}
                            </FilterDropdownMenu>
                        </div>

                        <div className="relative z-50 w-full sm:w-auto">
                            <FilterDropdownMenu
                                open={openDropdown === 'category'}
                                onOpenChange={(next) => setOpenDropdown(next ? 'category' : null)}
                                trigger={
                                    <Button
                                        className={cn(
                                            filterDropdownTriggerClass(openDropdown === 'category'),
                                            'w-full sm:w-auto',
                                        )}
                                        variant="outline"
                                        size="sm"
                                        aria-expanded={openDropdown === 'category'}
                                        aria-haspopup="menu"
                                        iconRight={
                                            <ChevronDown
                                                className={cn(
                                                    'h-4 w-4 shrink-0 text-text-muted transition-transform',
                                                    openDropdown === 'category' && 'rotate-180',
                                                )}
                                            />
                                        }
                                    >
                                        <span className="font-medium text-text-primary">{t.filterCategory}:</span>{' '}
                                        <span
                                            className={cn(
                                                'max-w-[10rem] truncate',
                                                filterValueClass(selectedCategory !== 'all'),
                                            )}
                                        >
                                            {selectedCategoryLabel}
                                        </span>
                                    </Button>
                                }
                            >
                                <FilterMenuItem
                                    className={filterMenuItemClass(selectedCategory === 'all')}
                                    onSelect={() => {
                                        setSelectedCategory('all');
                                    }}
                                >
                                    {t.filterAll}
                                </FilterMenuItem>
                                {categories.map((c) => (
                                    <FilterMenuItem
                                        key={c}
                                        className={filterMenuItemClass(selectedCategory === c)}
                                        onSelect={() => {
                                            setSelectedCategory(c);
                                        }}
                                    >
                                        {c}
                                    </FilterMenuItem>
                                ))}
                            </FilterDropdownMenu>
                        </div>

                        <div className="relative z-50 w-full sm:w-auto">
                            <FilterDropdownMenu
                                open={openDropdown === 'tech'}
                                onOpenChange={(next) => setOpenDropdown(next ? 'tech' : null)}
                                trigger={
                                    <Button
                                        className={cn(
                                            filterDropdownTriggerClass(openDropdown === 'tech'),
                                            'w-full sm:w-auto',
                                        )}
                                        variant="outline"
                                        size="sm"
                                        aria-expanded={openDropdown === 'tech'}
                                        aria-haspopup="menu"
                                        iconRight={
                                            <ChevronDown
                                                className={cn(
                                                    'h-4 w-4 shrink-0 text-text-muted transition-transform',
                                                    openDropdown === 'tech' && 'rotate-180',
                                                )}
                                            />
                                        }
                                    >
                                        <span className="font-medium text-text-primary">{t.filterTechnology}:</span>{' '}
                                        <span
                                            className={cn(
                                                'max-w-[10rem] truncate',
                                                filterValueClass(selectedTech !== 'all'),
                                            )}
                                        >
                                            {selectedTechLabel}
                                        </span>
                                    </Button>
                                }
                            >
                                <FilterMenuItem
                                    className={filterMenuItemClass(selectedTech === 'all')}
                                    onSelect={() => {
                                        setSelectedTech('all');
                                    }}
                                >
                                    {t.filterAll}
                                </FilterMenuItem>
                                {technologies.map((techName) => (
                                    <FilterMenuItem
                                        key={techName}
                                        className={filterMenuItemClass(selectedTech === techName)}
                                        onSelect={() => {
                                            setSelectedTech(techName);
                                        }}
                                    >
                                        {techName}
                                    </FilterMenuItem>
                                ))}
                            </FilterDropdownMenu>
                        </div>

                        {hasActiveFilters && (
                            <Button
                                variant="secondary"
                                size="default"
                                type="button"
                                className={cn(
                                    'h-10 w-10 shrink-0 border-2 border-border text-text-secondary shadow-sm transition-colors',
                                    'hover:border-red-500/70 hover:bg-red-500/10 hover:text-red-600',
                                    'dark:border-border dark:hover:border-red-400/70 dark:hover:bg-red-500/15 dark:hover:text-red-400'
                                )}
                                onClick={clearFilters}
                                iconLeft={<Trash2 className="h-4 w-4" aria-hidden />}
                                aria-label={t.clearFilters}
                            />
                        )}
                    </div>
                </div>
            </div>
            <div className="relative z-0 min-h-[12rem] md:min-h-[16rem]">
                <div
                    className={cn(
                        'grid md:grid-cols-2 lg:grid-cols-3 gap-8',
                        loading && 'pointer-events-none select-none opacity-40'
                    )}
                >
                    {filteredProjects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            locale={locale}
                            sourceCodeLabel={t.sourceCode}
                            viewProjectLabel={t.viewProject}
                            readMoreLabel={t.readMore}
                            fallbackDescription={t.description}
                            onReadMore={(p) => {
                                setOpenDropdown(null);
                                setSelectedProject(p);
                            }}
                        />
                    ))}
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
            {!loading && projects.length === 0 && (
                <p className="text-text-secondary">{t.emptyList}</p>
            )}
            {!loading && projects.length > 0 && filteredProjects.length === 0 && (
                <p className="text-text-secondary">
                    {t.noFilterResults}
                </p>
            )}

            <ProjectDetailModal
                project={selectedProject}
                onClose={closeProjectModal}
                locale={locale}
                closeLabel={t.close}
                sourceCodeLabel={t.sourceCode}
                viewProjectLabel={t.viewProject}
                technologiesHeading={t.technologies}
                fallbackDescription={t.description}
            />
        </div>
    );
};
