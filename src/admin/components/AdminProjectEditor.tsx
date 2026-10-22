import React, { useState } from 'react';
import { Languages, Loader2, X } from 'lucide-react';
import { AdminField, adminInputClass } from './AdminField';
import { AdminProjectMediaEditor } from './AdminProjectMediaEditor';
import { AdminToggle } from './AdminToggle';
import type { AdminCategoryOption, ProjectFormData } from '../adminApi';
import { GithubToolIcon, ExternalLinkIcon, UsaFlagIcon } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { Project, Technology } from '../../utils/supabase';

interface AdminProjectEditorProps {
    form: ProjectFormData;
    onChange: React.Dispatch<React.SetStateAction<ProjectFormData>>;
    technologies: Technology[];
    categories: AdminCategoryOption[];
    formError: string | null;
    translating: boolean;
    onTranslateToEnglish: () => void;
}

const statusDotClass: Record<Project['status'], string> = {
    finished: 'bg-emerald-400',
    in_progress: 'bg-amber-400',
    paused: 'bg-[#6c757d]',
};

const projectLinkButtonClass = cn(
    'inline-flex w-full min-w-0 items-center gap-2 rounded-xl border border-[#dee2e6]',
    'bg-white px-3 py-2 text-sm text-[#212529] transition-colors',
    'focus-within:border-[#ec4869] focus-within:ring-2 focus-within:ring-[#ec4869]/25',
);

const techChipClass = cn(
    'inline-flex h-8 max-w-full min-w-[5.25rem] items-center justify-center rounded-full border px-3',
    'font-mono text-[10px] transition-colors sm:text-[11px]',
);

export const AdminProjectEditor: React.FC<AdminProjectEditorProps> = ({
    form,
    onChange,
    technologies,
    categories,
    formError,
    translating,
    onTranslateToEnglish,
}) => {
    const [showTranslations, setShowTranslations] = useState(false);
    const hasEnglish = Boolean(form.name.en.trim() || form.description.en.trim());

    const setLocaleField = (field: 'name' | 'description', locale: 'es' | 'en', value: string) => {
        onChange((prev) => ({ ...prev, [field]: { ...prev[field], [locale]: value } }));
    };

    const toggleTech = (id: number) => {
        onChange((prev) => ({
            ...prev,
            technology_ids: prev.technology_ids.includes(id)
                ? prev.technology_ids.filter((techId) => techId !== id)
                : [...prev.technology_ids, id],
        }));
    };

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain md:overflow-hidden">
            {formError ? (
                <p
                    className="mx-4 mt-4 shrink-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 sm:mx-5"
                    role="alert"
                >
                    {formError}
                </p>
            ) : null}

            <div className="grid min-h-0 flex-1 md:grid-cols-[minmax(0,1.35fr)_minmax(18rem,1fr)] md:overflow-hidden">
                <div className="min-h-0 p-4 sm:p-5 lg:min-h-[28rem]">
                    <AdminProjectMediaEditor
                        items={form.media}
                        onChange={(media) => onChange((prev) => ({ ...prev, media }))}
                    />
                </div>

                <div className="relative min-h-[22rem] md:min-h-0 md:overflow-hidden">
                    <div className="min-h-0 overflow-visible p-5 sm:p-6 md:h-full md:overflow-y-auto md:overscroll-contain lg:pr-8">
                    <div className="flex min-w-0 flex-wrap items-center gap-2 sm:gap-3">
                        <label className="sr-only" htmlFor="proj-cat">
                            Categoría
                        </label>
                        <select
                            id="proj-cat"
                            required
                            value={form.category_id ?? ''}
                            onChange={(e) =>
                                onChange((prev) => ({
                                    ...prev,
                                    category_id: e.target.value ? Number(e.target.value) : null,
                                }))
                            }
                            className="max-w-full cursor-pointer appearance-none border-0 bg-transparent py-1 pr-6 text-xs font-bold uppercase tracking-wider text-[#ec4869] focus:outline-none focus:ring-0"
                        >
                            <option value="" disabled>
                                Categoría
                            </option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        <label className="sr-only" htmlFor="proj-status">
                            Estado
                        </label>
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#dee2e6] px-2.5 py-0.5 text-xs font-medium text-[#6c757d]">
                            <span
                                className={cn('h-1.5 w-1.5 shrink-0 rounded-full', statusDotClass[form.status])}
                                aria-hidden
                            />
                            <select
                                id="proj-status"
                                required
                                value={form.status}
                                onChange={(e) =>
                                    onChange((prev) => ({
                                        ...prev,
                                        status: e.target.value as ProjectFormData['status'],
                                    }))
                                }
                                className="cursor-pointer appearance-none border-0 bg-transparent py-0.5 pr-4 text-xs font-medium text-[#6c757d] focus:outline-none focus:ring-0"
                            >
                                <option value="finished">Finalizado</option>
                                <option value="in_progress">En progreso</option>
                                <option value="paused">En pausa</option>
                            </select>
                        </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 sm:mt-5">
                        <div className="flex items-center gap-3">
                            <AdminToggle
                                checked={form.featured}
                                onChange={(featured) => onChange((prev) => ({ ...prev, featured }))}
                                label="Proyecto destacado"
                            />
                            <span className="text-xs font-medium text-[#495057]">Destacado</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowTranslations(true)}
                            className={cn(
                                'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors',
                                hasEnglish
                                    ? 'border-[#dee2e6] bg-white text-[#495057] hover:border-[#ec4869]/50'
                                    : 'border-[#ec4869]/30 bg-[#ec4869]/5 text-[#ec4869]',
                            )}
                        >
                            <UsaFlagIcon className="h-3.5 w-3.5" />
                            Traducciones
                        </button>
                    </div>

                    <label className="sr-only" htmlFor="proj-name-es">
                        Nombre
                    </label>
                    <input
                        id="proj-name-es"
                        required
                        value={form.name.es}
                        onChange={(e) => setLocaleField('name', 'es', e.target.value)}
                        placeholder="Nombre del proyecto"
                        className="mt-4 w-full border-0 bg-transparent p-0 text-2xl font-bold tracking-tight text-[#212529] placeholder:text-[#adb5bd] focus:outline-none focus:ring-0 sm:mt-5 sm:text-3xl"
                    />

                    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        <label className={projectLinkButtonClass}>
                            <GithubToolIcon className="h-4 w-4 shrink-0" />
                            <input
                                value={form.github_url}
                                onChange={(e) => onChange((prev) => ({ ...prev, github_url: e.target.value }))}
                                placeholder="Código (GitHub)"
                                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm focus:outline-none focus:ring-0"
                            />
                        </label>
                        <label className={projectLinkButtonClass}>
                            <ExternalLinkIcon className="h-4 w-4 shrink-0" />
                            <input
                                value={form.live_url}
                                onChange={(e) => onChange((prev) => ({ ...prev, live_url: e.target.value }))}
                                placeholder="Ver proyecto"
                                className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm focus:outline-none focus:ring-0"
                            />
                        </label>
                    </div>

                    <label className="sr-only" htmlFor="proj-desc-es">
                        Descripción
                    </label>
                    <textarea
                        id="proj-desc-es"
                        required
                        rows={6}
                        value={form.description.es}
                        onChange={(e) => setLocaleField('description', 'es', e.target.value)}
                        placeholder="Descripción del proyecto"
                        className="mt-5 w-full resize-y border-0 bg-transparent p-0 text-sm leading-relaxed text-[#495057] placeholder:text-[#adb5bd] focus:outline-none focus:ring-0 sm:text-base"
                    />

                    <section className="mt-6 w-full border-t border-[#dee2e6]/80 pt-5">
                        <h4 className="mb-3 text-sm font-semibold text-[#212529]">Tecnologías</h4>
                        {technologies.length > 0 ? (
                            <ul className="flex w-full flex-wrap gap-2" aria-label="Tecnologías">
                                {technologies.map((technology) => {
                                    const checked = form.technology_ids.includes(technology.id);
                                    return (
                                        <li key={technology.id}>
                                            <button
                                                type="button"
                                                onClick={() => toggleTech(technology.id)}
                                                title={technology.name}
                                                className={cn(
                                                    techChipClass,
                                                    checked
                                                        ? 'border-[#ec4869]/40 bg-[#ec4869]/5 text-[#ec4869]'
                                                        : 'border-[#dee2e6] bg-white text-[#495057] hover:border-[#ec4869]/40',
                                                )}
                                            >
                                                <span className="truncate">{technology.name}</span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-sm text-[#6c757d]">Aún no hay tecnologías. Créalas en su apartado.</p>
                        )}
                    </section>
                    </div>

                    {showTranslations ? (
                        <div className="absolute inset-0 z-10 flex flex-col overflow-y-auto bg-white p-5 sm:p-6">
                            {/* Panel encima de la ficha en español para no mezclar ambos idiomas */}
                            <div className="mb-4 flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#ec4869]">
                                        Inglés
                                    </p>
                                    <h3 className="mt-1 text-lg font-semibold text-[#212529]">Traducciones</h3>
                                    <p className="mt-1 max-w-prose text-xs text-[#6c757d]">
                                        Revisa el inglés antes de guardar. Si lo dejas vacío, se copia el español.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowTranslations(false)}
                                    aria-label="Cerrar traducciones"
                                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#dee2e6] text-[#495057] transition-colors hover:border-[#ec4869]/50 hover:text-[#ec4869]"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={onTranslateToEnglish}
                                disabled={translating || (!form.name.es.trim() && !form.description.es.trim())}
                                className={cn(
                                    'mb-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#ec4869]/30 bg-white px-4 py-2.5 text-sm font-semibold text-[#ec4869] transition-colors sm:w-auto',
                                    'hover:bg-[#ec4869]/5 disabled:cursor-not-allowed disabled:opacity-50',
                                )}
                            >
                                {translating ? (
                                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                ) : (
                                    <Languages className="h-4 w-4" aria-hidden />
                                )}
                                Traducir desde el español
                            </button>

                            <AdminField label="Name (EN)" htmlFor="proj-name-en">
                                <input
                                    id="proj-name-en"
                                    value={form.name.en}
                                    onChange={(e) => setLocaleField('name', 'en', e.target.value)}
                                    className={adminInputClass}
                                />
                            </AdminField>
                            <AdminField className="mt-4" label="Description (EN)" htmlFor="proj-desc-en">
                                <textarea
                                    id="proj-desc-en"
                                    rows={8}
                                    value={form.description.en}
                                    onChange={(e) => setLocaleField('description', 'en', e.target.value)}
                                    className={cn(adminInputClass, 'resize-y')}
                                />
                            </AdminField>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};
