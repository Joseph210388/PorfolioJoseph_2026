import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, GripVertical, Languages, Loader2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { AdminField, adminInputClass } from '../components/AdminField';
import {
    deleteProject,
    fetchAdminProjects,
    fetchAdminTechnologies,
    fetchCategories,
    projectDescriptionToForm,
    saveProject,
    translationToForm,
    updateProjectsOrder,
    type ProjectFormData,
} from '../adminApi';
import type { Project, Technology } from '../../utils/supabase';
import AdminModal from '../components/AdminModal';
import { AdminProjectMediaEditor } from '../components/AdminProjectMediaEditor';
import { AdminModalFooter } from '../components/AdminModalFooter';
import { translateEsToEn } from '../utils/translateEsToEn';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

type ProjectRow = Awaited<ReturnType<typeof fetchAdminProjects>>[number];
type StatusFilter = 'all' | 'finished' | 'in_progress' | 'paused';

const emptyForm = (): ProjectFormData => ({
    status: 'finished',
    featured: false,
    github_url: '',
    live_url: '',
    media: [],
    order: 0,
    category_id: null,
    name: { es: '', en: '' },
    description: { es: '', en: '' },
    technology_ids: [],
});

const statusLabels: Record<Project['status'], string> = {
    finished: 'Finalizado',
    in_progress: 'En progreso',
    paused: 'En pausa',
};

const statusBadgeClass: Record<Project['status'], string> = {
    finished: 'border-[var(--admin-accent)]/30 bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]',
    in_progress: 'border-amber-400/30 bg-amber-400/10 text-amber-600',
    paused: 'border-[var(--admin-border)] bg-slate-100 text-[var(--admin-text-muted)]',
};

const statusFilterOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'finished', label: 'Finalizados' },
    { value: 'in_progress', label: 'En progreso' },
    { value: 'paused', label: 'En pausa' },
];

const ProjectsAdminPage: React.FC = () => {
    const [items, setItems] = useState<ProjectRow[]>([]);
    const [technologies, setTechnologies] = useState<Technology[]>([]);
    const [categories, setCategories] = useState<{ id: number; slug: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pageError, setPageError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<ProjectFormData>(emptyForm());
    const [showForm, setShowForm] = useState(false);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [translatingAll, setTranslatingAll] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setPageError(null);
        try {
            const [projects, techs, cats] = await Promise.all([
                fetchAdminProjects(),
                fetchAdminTechnologies(),
                fetchCategories(),
            ]);
            setItems(projects);
            setTechnologies(techs);
            setCategories(cats);
        } catch (err) {
            setPageError(err instanceof Error ? err.message : 'Error al cargar');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filteredItems = useMemo(() => {
        const q = query.trim().toLowerCase();
        return items.filter((row) => {
            if (statusFilter !== 'all' && row.status !== statusFilter) return false;
            if (!q) return true;
            const name = row.translationsEs?.name ?? row.translationsEn?.name ?? '';
            return name.toLowerCase().includes(q);
        });
    }, [items, query, statusFilter]);

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormError(null);
    };

    const openCreate = () => {
        setEditingId(null);
        setFormError(null);
        setForm({ ...emptyForm(), order: items.length });
        setShowForm(true);
    };

    const openEdit = (row: ProjectRow) => {
        setFormError(null);
        setEditingId(row.id);
        setForm({
            status: row.status,
            featured: row.featured,
            github_url: row.github_url ?? '',
            live_url: row.live_url ?? '',
            media: row.media.map((m) => ({ ...m })),
            order: row.order,
            category_id: row.category_id,
            name: translationToForm(row.translationsEs, row.translationsEn, 'name'),
            description: projectDescriptionToForm(row.translationsEs, row.translationsEn),
            technology_ids: row.technology_ids,
        });
        setShowForm(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.category_id == null) {
            setFormError('Selecciona una categoría.');
            return;
        }
        setSaving(true);
        setFormError(null);
        try {
            await saveProject(editingId, form);
            closeForm();
            await load();
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Eliminar este proyecto y sus traducciones?')) return;
        try {
            await deleteProject(id);
            await load();
        } catch (err) {
            setPageError(err instanceof Error ? err.message : 'Error al eliminar');
        }
    };

    const handleDrop = async (targetIndex: number) => {
        if (dragIndex === null || dragIndex === targetIndex) return;
        const reordered = [...filteredItems];
        const [moved] = reordered.splice(dragIndex, 1);
        reordered.splice(targetIndex, 0, moved);

        const idOrder = reordered.map((r) => r.id);
        const allIds = items.map((r) => r.id);
        const remaining = allIds.filter((id) => !idOrder.includes(id));
        const fullOrder = [...idOrder, ...remaining];

        setItems((prev) => {
            const map = new Map(prev.map((p) => [p.id, p]));
            return fullOrder.map((id, index) => ({ ...map.get(id)!, order: index }));
        });

        try {
            await updateProjectsOrder(fullOrder);
        } catch (err) {
            setPageError(err instanceof Error ? err.message : 'Error al reordenar');
            await load();
        }
        setDragIndex(null);
    };

    const setLocaleField = (field: 'name' | 'description', locale: 'es' | 'en', value: string) => {
        setForm((prev) => ({ ...prev, [field]: { ...prev[field], [locale]: value } }));
    };

    const toggleTech = (id: number) => {
        setForm((prev) => ({
            ...prev,
            technology_ids: prev.technology_ids.includes(id)
                ? prev.technology_ids.filter((t) => t !== id)
                : [...prev.technology_ids, id],
        }));
    };

    const translateAllToEnglish = async () => {
        const nameEs = form.name.es.trim();
        const descEs = form.description.es.trim();
        if (!nameEs && !descEs) {
            setFormError('Escribe al menos el nombre o la descripción en español.');
            return;
        }

        setTranslatingAll(true);
        setFormError(null);
        try {
            const [nameEn, descEn] = await Promise.all([
                nameEs ? translateEsToEn(nameEs) : Promise.resolve(form.name.en),
                descEs ? translateEsToEn(descEs) : Promise.resolve(form.description.en),
            ]);
            setForm((prev) => ({
                ...prev,
                name: { ...prev.name, en: nameEn },
                description: { ...prev.description, en: descEn },
            }));
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Error al traducir al inglés');
        } finally {
            setTranslatingAll(false);
        }
    };

    return (
        <div className="text-[var(--admin-text)]">
            {pageError ? <p className="mb-4 text-sm text-red-500">{pageError}</p> : null}

            <AdminModal
                open={showForm}
                onClose={closeForm}
                title={editingId ? 'Editar proyecto' : 'Nuevo proyecto'}
                footer={<AdminModalFooter formId="admin-project-form" onCancel={closeForm} saving={saving} />}
            >
                <form id="admin-project-form" onSubmit={handleSave} className="space-y-5">
                    {formError ? (
                        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600" role="alert">
                            {formError}
                        </p>
                    ) : null}
                    <p className="text-xs text-[var(--admin-text-muted)]">
                        Los campos marcados con <span className="font-semibold text-[#ec4869]">*</span> son obligatorios.
                    </p>
                    <AdminField
                        label="Imágenes del proyecto"
                        hint="Opcional. La miniatura sale en la tarjeta; el resto en el detalle. Añade filas hacia la derecha y desplázate si no caben."
                    >
                        <AdminProjectMediaEditor
                            items={form.media}
                            onChange={(media) => setForm((prev) => ({ ...prev, media }))}
                        />
                    </AdminField>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <AdminField label="Estado" htmlFor="proj-status" required>
                            <select
                                id="proj-status"
                                required
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value as ProjectFormData['status'] })}
                                className={adminInputClass}
                            >
                                <option value="finished">Finalizado</option>
                                <option value="in_progress">En progreso</option>
                                <option value="paused">Pausado</option>
                            </select>
                        </AdminField>
                        <AdminField label="Categoría" htmlFor="proj-cat" required>
                            <select
                                id="proj-cat"
                                required
                                value={form.category_id ?? ''}
                                onChange={(e) => setForm({ ...form, category_id: e.target.value ? Number(e.target.value) : null })}
                                className={adminInputClass}
                            >
                                <option value="" disabled>
                                    Seleccionar categoría
                                </option>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>{c.slug}</option>
                                ))}
                            </select>
                        </AdminField>
                    </div>
                    <AdminField
                        label="Destacado"
                        htmlFor="proj-featured"
                        hint="Opcional. Los proyectos destacados pueden usarse en secciones especiales del portfolio (p. ej. hero)."
                    >
                        <label
                            htmlFor="proj-featured"
                            className="inline-flex cursor-pointer items-center gap-3 rounded-xl border border-[#dee2e6] bg-white px-4 py-3 text-sm text-[#212529] transition-colors hover:border-[#ec4869]/30"
                        >
                            <input
                                id="proj-featured"
                                type="checkbox"
                                checked={form.featured}
                                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                                className="h-4 w-4 shrink-0 rounded border-[#dee2e6] text-[#ec4869] focus:ring-[#ec4869]"
                            />
                            <span>Marcar como proyecto destacado</span>
                        </label>
                    </AdminField>
                    <div className="space-y-3 rounded-xl border border-[#dee2e6] bg-slate-50/60 p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-[var(--admin-text-muted)]">
                                Escribe en español y usa la traducción automática para el inglés (revisa el resultado antes de guardar).
                            </p>
                            <button
                                type="button"
                                onClick={translateAllToEnglish}
                                disabled={translatingAll || (!form.name.es.trim() && !form.description.es.trim())}
                                className={cn(
                                    'inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#ec4869]/30 bg-white px-4 py-2 text-sm font-semibold text-[#ec4869] transition-colors',
                                    'hover:bg-[#ec4869]/5 disabled:cursor-not-allowed disabled:opacity-50',
                                )}
                            >
                                {translatingAll ? (
                                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                ) : (
                                    <Languages className="h-4 w-4" aria-hidden />
                                )}
                                Traducir todo al inglés
                            </button>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-2">
                            <AdminField label="Nombre (ES)" htmlFor="proj-name-es" required>
                                <input id="proj-name-es" required value={form.name.es} onChange={(e) => setLocaleField('name', 'es', e.target.value)} className={adminInputClass} />
                            </AdminField>
                            <AdminField label="Name (EN)" htmlFor="proj-name-en" required>
                                <input id="proj-name-en" required value={form.name.en} onChange={(e) => setLocaleField('name', 'en', e.target.value)} className={adminInputClass} />
                            </AdminField>
                            <AdminField label="Descripción (ES)" htmlFor="proj-desc-es" required>
                                <textarea id="proj-desc-es" required rows={3} value={form.description.es} onChange={(e) => setLocaleField('description', 'es', e.target.value)} className={cn(adminInputClass, 'resize-y')} />
                            </AdminField>
                            <AdminField label="Description (EN)" htmlFor="proj-desc-en" required>
                                <textarea id="proj-desc-en" required rows={3} value={form.description.en} onChange={(e) => setLocaleField('description', 'en', e.target.value)} className={cn(adminInputClass, 'resize-y')} />
                            </AdminField>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
                        <AdminField
                            className="min-w-0 flex-1"
                            label="Tecnologías"
                            hint={`${form.technology_ids.length} seleccionada${form.technology_ids.length === 1 ? '' : 's'}`}
                        >
                            <div className="max-h-52 overflow-y-auto overscroll-contain rounded-xl border border-[#dee2e6] bg-white p-3 sm:max-h-60 lg:min-h-[11rem]">
                                <div className="grid grid-cols-2 gap-2">
                                    {technologies.map((tech) => {
                                        const checked = form.technology_ids.includes(tech.id);
                                        return (
                                            <label
                                                key={tech.id}
                                                className={cn(
                                                    'flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2 text-sm transition-colors',
                                                    checked
                                                        ? 'border-[#ec4869]/40 bg-[#ec4869]/5 text-[#212529]'
                                                        : 'border-transparent text-[#495057] hover:bg-slate-50',
                                                )}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleTech(tech.id)}
                                                    className="h-4 w-4 shrink-0 rounded border-[#dee2e6] text-[#ec4869] focus:ring-[#ec4869]"
                                                />
                                                <span className="truncate">{tech.name}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>
                        </AdminField>
                        <div className="flex w-full shrink-0 flex-col gap-4 lg:w-64 xl:w-72">
                            <AdminField label="GitHub URL" htmlFor="proj-gh" hint="Opcional">
                                <input id="proj-gh" value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} className={adminInputClass} />
                            </AdminField>
                            <AdminField label="Live URL" htmlFor="proj-live" hint="Opcional">
                                <input id="proj-live" value={form.live_url} onChange={(e) => setForm({ ...form, live_url: e.target.value })} className={adminInputClass} />
                            </AdminField>
                        </div>
                    </div>
                </form>
            </AdminModal>

            {/* Búsqueda a la izquierda; filtro y acción pegados a la derecha */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full shrink-0 sm:max-w-xs md:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Buscar proyecto..."
                        className={cn(adminInputClass, 'pl-10')}
                    />
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:ml-auto">
                    <label
                        htmlFor="proj-filter-status"
                        className="inline-flex w-auto shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-[#dee2e6] bg-white py-2 pl-3 pr-1 text-sm transition-colors focus-within:border-[#ec4869] focus-within:ring-2 focus-within:ring-[#ec4869]/25"
                    >
                        <span className="shrink-0 font-medium text-[var(--admin-text-secondary)]">Estado:</span>
                        <span className="relative shrink-0">
                            <select
                                id="proj-filter-status"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                                className="w-[7.25rem] cursor-pointer appearance-none border-0 bg-transparent py-1 pl-0 pr-6 text-sm font-semibold text-[var(--admin-text)] focus:outline-none focus:ring-0"
                                aria-label="Filtrar por estado"
                            >
                                {statusFilterOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                className="pointer-events-none absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]"
                                aria-hidden
                            />
                        </span>
                    </label>
                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[var(--admin-accent)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--admin-accent-hover)] sm:px-5"
                    >
                        <Plus className="h-4 w-4 shrink-0" />
                        Nuevo proyecto
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Spinner />
                </div>
            ) : filteredItems.length === 0 ? (
                <p className="rounded-2xl border border-[var(--admin-border)] py-12 text-center text-sm text-[var(--admin-text-muted)]">
                    No hay proyectos que coincidan con el filtro.
                </p>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-[var(--admin-border)]">
                    <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b border-[var(--admin-border)] bg-slate-50">
                                <th className="w-24 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                                    Orden
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                                    Proyecto
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                                    Estado
                                </th>
                                <th className="w-28 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                                    Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--admin-border)]">
                            {filteredItems.map((row, index) => (
                                <tr
                                    key={row.id}
                                    draggable
                                    onDragStart={() => setDragIndex(index)}
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={() => handleDrop(index)}
                                    onDragEnd={() => setDragIndex(null)}
                                    className={cn(
                                        'bg-white transition-colors hover:bg-slate-50',
                                        dragIndex === index && 'opacity-50',
                                    )}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2 text-[var(--admin-text-muted)]">
                                            <GripVertical className="h-4 w-4 shrink-0 cursor-grab active:cursor-grabbing" aria-hidden />
                                            <span className="font-mono text-xs">{String(row.order).padStart(2, '0')}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-[var(--admin-text)]">
                                        {row.translationsEs?.name ?? row.translationsEn?.name ?? `Proyecto #${row.id}`}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
                                                statusBadgeClass[row.status],
                                            )}
                                        >
                                            {row.status === 'finished' ? (
                                                <span className="h-1.5 w-1.5 rounded-full bg-[var(--admin-accent)]" aria-hidden />
                                            ) : null}
                                            {statusLabels[row.status]}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-1">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(row)}
                                                aria-label="Editar"
                                                className="rounded-lg p-2 text-[var(--admin-text-muted)] transition-colors hover:bg-slate-100 hover:text-[var(--admin-accent)]"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(row.id)}
                                                aria-label="Eliminar"
                                                className="rounded-lg p-2 text-[var(--admin-text-muted)] transition-colors hover:bg-red-50 hover:text-red-500"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <p className="mt-4 text-xs text-[var(--admin-text-muted)]">
                Arrastra las filas para cambiar el orden de aparición en el portfolio.
            </p>
        </div>
    );
};

export default ProjectsAdminPage;
