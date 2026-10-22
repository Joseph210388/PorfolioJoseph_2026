import React, { useCallback, useEffect, useState } from 'react';
import { ChevronDown, GripVertical, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { adminInputClass } from '../components/AdminField';
import {
    deleteProject,
    fetchAdminProjectsPaginated,
    fetchCategories,
    fetchProjectsOrderIds,
    fetchTechnologyOptions,
    formatAdminError,
    projectDescriptionToForm,
    saveProject,
    translationToForm,
    updateProjectsOrder,
    type AdminCategoryOption,
    type AdminProjectListItem,
    type ProjectFormData,
} from '../adminApi';
import { DEFAULT_ADMIN_PAGE_SIZE, type AdminPageSize } from '../adminListTypes';
import type { Project, Technology } from '../../utils/supabase';
import AdminModal from '../components/AdminModal';
import { AdminProjectEditor } from '../components/AdminProjectEditor';
import { AdminModalFooter } from '../components/AdminModalFooter';
import { showAdminToast } from '../components/AdminToast';
import { AdminPagination } from '../components/AdminPagination';
import {
    AdminScrollableTable,
    adminTableHeadClass,
    adminTableThClass,
} from '../components/AdminScrollableTable';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { translateEsToEn } from '../utils/translateEsToEn';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

type ProjectRow = AdminProjectListItem;
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
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<AdminPageSize>(DEFAULT_ADMIN_PAGE_SIZE);
    const [technologies, setTechnologies] = useState<Technology[]>([]);
    const [categories, setCategories] = useState<AdminCategoryOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [pageError, setPageError] = useState<string | null>(null);
    const [formError, setFormError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<ProjectFormData>(emptyForm());
    const [showForm, setShowForm] = useState(false);
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebouncedValue(query);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [translatingAll, setTranslatingAll] = useState(false);

    const canReorder =
        !debouncedQuery.trim() && statusFilter === 'all' && total > 0 && total <= pageSize;

    const load = useCallback(async () => {
        setLoading(true);
        setPageError(null);
        try {
            const [projectsPage, techs, cats] = await Promise.all([
                fetchAdminProjectsPaginated({
                    page,
                    pageSize,
                    search: debouncedQuery,
                    status: statusFilter,
                }),
                fetchTechnologyOptions(),
                fetchCategories(),
            ]);
            setItems(projectsPage.items);
            setTotal(projectsPage.total);
            setTechnologies(techs);
            setCategories(cats);
        } catch (err) {
            setPageError(err instanceof Error ? err.message : 'Error al cargar');
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, debouncedQuery, statusFilter]);

    useEffect(() => {
        setPage(1);
    }, [debouncedQuery, statusFilter, pageSize]);

    useEffect(() => {
        load();
    }, [load]);

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
        setFormError(null);
    };

    const openCreate = () => {
        setEditingId(null);
        setFormError(null);
        setForm({ ...emptyForm(), order: total });
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
            const { warning } = await saveProject(editingId, form);
            closeForm();
            if (warning) {
                showAdminToast(warning);
                setPageError(warning);
            }
            await load();
        } catch (err) {
            setFormError(formatAdminError(err, 'Error al guardar'));
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
        if (!canReorder || dragIndex === null || dragIndex === targetIndex) return;

        const reordered = [...items];
        const [moved] = reordered.splice(dragIndex, 1);
        reordered.splice(targetIndex, 0, moved);

        const idOrder = reordered.map((r) => r.id);

        try {
            const allIds = await fetchProjectsOrderIds();
            const remaining = allIds.filter((id) => !idOrder.includes(id));
            await updateProjectsOrder([...idOrder, ...remaining]);
            await load();
        } catch (err) {
            setPageError(err instanceof Error ? err.message : 'Error al reordenar');
            await load();
        }
        setDragIndex(null);
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
        <div className="flex h-full min-h-0 flex-col text-[var(--admin-text)]">
            {pageError ? <p className="mb-3 shrink-0 text-sm text-red-500">{pageError}</p> : null}

            <AdminModal
                open={showForm}
                onClose={closeForm}
                title={editingId ? 'Editar proyecto' : 'Nuevo proyecto'}
                className="sm:max-h-[min(92dvh,56rem)] sm:max-w-[min(96vw,72rem)] lg:max-w-[min(96vw,88rem)]"
                bodyClassName="flex min-h-0 flex-col overflow-hidden p-0 sm:p-0"
                footer={<AdminModalFooter formId="admin-project-form" onCancel={closeForm} saving={saving} />}
            >
                <form
                    id="admin-project-form"
                    onSubmit={handleSave}
                    className="flex min-h-0 flex-1 flex-col overflow-hidden"
                >
                    <AdminProjectEditor
                        key={editingId ?? 'new'}
                        form={form}
                        onChange={setForm}
                        technologies={technologies}
                        categories={categories}
                        formError={formError}
                        translating={translatingAll}
                        onTranslateToEnglish={translateAllToEnglish}
                    />
                </form>
            </AdminModal>

            {/* Búsqueda a la izquierda; filtro y acción pegados a la derecha */}
            <div className="mb-3 flex shrink-0 flex-col gap-3 sm:mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full shrink-0 sm:max-w-xs md:max-w-sm">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => {
                            setQuery(e.target.value);
                            setPage(1);
                        }}
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
                                onChange={(e) => {
                                    setStatusFilter(e.target.value as StatusFilter);
                                    setPage(1);
                                }}
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
                <div className="flex flex-1 items-center justify-center py-16">
                    <Spinner />
                </div>
            ) : total === 0 ? (
                <AdminScrollableTable empty emptyMessage="No hay proyectos que coincidan con el filtro.">
                    {null}
                </AdminScrollableTable>
            ) : (
                <>
                    <AdminScrollableTable
                        footer={
                            <AdminPagination
                                page={page}
                                pageSize={pageSize}
                                total={total}
                                onPageChange={setPage}
                                onPageSizeChange={(size) => {
                                    setPageSize(size);
                                    setPage(1);
                                }}
                                idPrefix="projects"
                            />
                        }
                    >
                        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                            <thead className={adminTableHeadClass}>
                                <tr>
                                    <th className={cn(adminTableThClass, 'w-24')}>Orden</th>
                                    <th className={adminTableThClass}>Proyecto</th>
                                    <th className={adminTableThClass}>Estado</th>
                                    <th className={cn(adminTableThClass, 'w-28 text-right')}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--admin-border)]">
                                {items.map((row, index) => (
                                    <tr
                                        key={row.id}
                                        draggable={canReorder}
                                        onDragStart={() => canReorder && setDragIndex(index)}
                                        onDragOver={(e) => canReorder && e.preventDefault()}
                                        onDrop={() => handleDrop(index)}
                                        onDragEnd={() => setDragIndex(null)}
                                        className={cn(
                                            'bg-white transition-colors hover:bg-slate-50',
                                            dragIndex === index && 'opacity-50',
                                        )}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 text-[var(--admin-text-muted)]">
                                                <GripVertical
                                                    className={cn(
                                                        'h-4 w-4 shrink-0',
                                                        canReorder ? 'cursor-grab active:cursor-grabbing' : 'opacity-30',
                                                    )}
                                                    aria-hidden
                                                />
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
                    </AdminScrollableTable>
                    <p className="mt-2 shrink-0 text-xs text-[var(--admin-text-muted)]">
                        {canReorder
                            ? 'Arrastra las filas para cambiar el orden de aparición en el portfolio.'
                            : 'Para reordenar, quita búsqueda y filtros y muestra todos los proyectos en una sola página (sube «Por página»).'}
                    </p>
                </>
            )}
        </div>
    );
};

export default ProjectsAdminPage;
