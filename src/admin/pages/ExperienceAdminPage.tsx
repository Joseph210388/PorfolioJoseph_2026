import React, { useCallback, useEffect, useState } from 'react';
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminField, adminInputClass } from '../components/AdminField';
import AdminModal from '../components/AdminModal';
import { AdminModalFooter } from '../components/AdminModalFooter';
import { AdminTableToolbar } from '../components/AdminTableToolbar';
import { AdminPagination } from '../components/AdminPagination';
import {
    AdminScrollableTable,
    adminTableHeadClass,
    adminTableThClass,
} from '../components/AdminScrollableTable';
import {
    deleteExperience,
    fetchAdminExperiencePaginated,
    fetchExperienceOrderIds,
    saveExperience,
    translationToForm,
    updateExperienceOrder,
    type AdminExperienceListItem,
    type ExperienceFormData,
} from '../adminApi';
import { DEFAULT_ADMIN_PAGE_SIZE, type AdminPageSize } from '../adminListTypes';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

type ExperienceRow = AdminExperienceListItem;

const emptyForm = (): ExperienceFormData => ({
    company: '',
    company_url: '',
    date_start: '',
    date_end: '',
    order: 0,
    title: { es: '', en: '' },
    tasks: { es: '', en: '' },
});

const formatDateRange = (start: string, end: string | null) => {
    const from = start.slice(0, 10);
    const to = end ? end.slice(0, 10) : 'Actualidad';
    return `${from} — ${to}`;
};

const ExperienceAdminPage: React.FC = () => {
    const [items, setItems] = useState<ExperienceRow[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<AdminPageSize>(DEFAULT_ADMIN_PAGE_SIZE);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<ExperienceFormData>(emptyForm());
    const [showForm, setShowForm] = useState(false);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebouncedValue(query);

    const canReorder = !debouncedQuery.trim() && total > 0 && total <= pageSize;

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchAdminExperiencePaginated({
                page,
                pageSize,
                search: debouncedQuery,
            });
            setItems(result.items);
            setTotal(result.total);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar');
        } finally {
            setLoading(false);
        }
    }, [page, pageSize, debouncedQuery]);

    useEffect(() => {
        setPage(1);
    }, [debouncedQuery, pageSize]);

    useEffect(() => {
        load();
    }, [load]);

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
    };

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...emptyForm(), order: total });
        setShowForm(true);
    };

    const openEdit = (row: ExperienceRow) => {
        setEditingId(row.id);
        setForm({
            company: row.company,
            company_url: row.company_url ?? '',
            date_start: row.date_start.slice(0, 10),
            date_end: row.date_end ? row.date_end.slice(0, 10) : '',
            order: row.order,
            title: translationToForm(row.translationsEs, row.translationsEn, 'title'),
            tasks: translationToForm(row.translationsEs, row.translationsEn, 'tasks'),
        });
        setShowForm(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await saveExperience(editingId, form);
            closeForm();
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Eliminar esta experiencia?')) return;
        try {
            await deleteExperience(id);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al eliminar');
        }
    };

    const handleDrop = async (targetIndex: number) => {
        if (!canReorder || dragIndex === null || dragIndex === targetIndex) return;

        const reordered = [...items];
        const [moved] = reordered.splice(dragIndex, 1);
        reordered.splice(targetIndex, 0, moved);
        const idOrder = reordered.map((r) => r.id);

        try {
            const allIds = await fetchExperienceOrderIds();
            const remaining = allIds.filter((id) => !idOrder.includes(id));
            await updateExperienceOrder([...idOrder, ...remaining]);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al reordenar');
            await load();
        }
        setDragIndex(null);
    };

    const setLocaleField = (field: 'title' | 'tasks', locale: 'es' | 'en', value: string) => {
        setForm((prev) => ({ ...prev, [field]: { ...prev[field], [locale]: value } }));
    };

    return (
        <div className="flex h-full min-h-0 flex-col">
            {error ? <p className="mb-3 shrink-0 text-sm text-red-400">{error}</p> : null}

            <AdminModal
                open={showForm}
                onClose={closeForm}
                title={editingId ? 'Editar experiencia' : 'Nueva experiencia'}
                footer={<AdminModalFooter formId="admin-experience-form" onCancel={closeForm} saving={saving} />}
            >
                <form id="admin-experience-form" onSubmit={handleSave} className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <AdminField label="Empresa" htmlFor="exp-company">
                            <input id="exp-company" required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className={adminInputClass} />
                        </AdminField>
                        <AdminField label="URL empresa" htmlFor="exp-url">
                            <input id="exp-url" value={form.company_url} onChange={(e) => setForm({ ...form, company_url: e.target.value })} className={adminInputClass} />
                        </AdminField>
                        <AdminField label="Fecha inicio" htmlFor="exp-start">
                            <input id="exp-start" type="date" required value={form.date_start} onChange={(e) => setForm({ ...form, date_start: e.target.value })} className={adminInputClass} />
                        </AdminField>
                        <AdminField label="Fecha fin" htmlFor="exp-end" hint="Vacío = actualidad">
                            <input id="exp-end" type="date" value={form.date_end} onChange={(e) => setForm({ ...form, date_end: e.target.value })} className={adminInputClass} />
                        </AdminField>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <AdminField label="Título (ES)" htmlFor="exp-title-es">
                            <input id="exp-title-es" required value={form.title.es} onChange={(e) => setLocaleField('title', 'es', e.target.value)} className={adminInputClass} />
                        </AdminField>
                        <AdminField label="Title (EN)" htmlFor="exp-title-en">
                            <input id="exp-title-en" required value={form.title.en} onChange={(e) => setLocaleField('title', 'en', e.target.value)} className={adminInputClass} />
                        </AdminField>
                        <AdminField label="Tareas (ES)" htmlFor="exp-tasks-es" hint="Una tarea por línea">
                            <textarea id="exp-tasks-es" rows={4} value={form.tasks.es} onChange={(e) => setLocaleField('tasks', 'es', e.target.value)} className={cn(adminInputClass, 'resize-y')} />
                        </AdminField>
                        <AdminField label="Tasks (EN)" htmlFor="exp-tasks-en" hint="One task per line">
                            <textarea id="exp-tasks-en" rows={4} value={form.tasks.en} onChange={(e) => setLocaleField('tasks', 'en', e.target.value)} className={cn(adminInputClass, 'resize-y')} />
                        </AdminField>
                    </div>
                </form>
            </AdminModal>

            <AdminTableToolbar
                className="shrink-0"
                query={query}
                onQueryChange={(value) => {
                    setQuery(value);
                    setPage(1);
                }}
                placeholder="Buscar experiencia..."
                right={
                    <button
                        type="button"
                        onClick={openCreate}
                        className="inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#ec4869] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#d93d5c] sm:px-5"
                    >
                        <Plus className="h-4 w-4 shrink-0" />
                        Nueva
                    </button>
                }
            />

            {loading ? (
                <div className="flex flex-1 items-center justify-center py-12">
                    <Spinner />
                </div>
            ) : total === 0 && !debouncedQuery.trim() ? (
                <AdminScrollableTable empty emptyMessage="No hay experiencias registradas.">
                    {null}
                </AdminScrollableTable>
            ) : total === 0 ? (
                <AdminScrollableTable empty emptyMessage="No hay experiencias que coincidan con la búsqueda.">
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
                                idPrefix="experience"
                            />
                        }
                    >
                        <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                            <thead className={adminTableHeadClass}>
                                <tr>
                                    <th className={cn(adminTableThClass, 'w-24')}>Orden</th>
                                    <th className={adminTableThClass}>Puesto</th>
                                    <th className={adminTableThClass}>Empresa</th>
                                    <th className={adminTableThClass}>Fechas</th>
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
                                            {row.translationsEs?.title ?? row.translationsEn?.title ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-[var(--admin-text-secondary)]">{row.company}</td>
                                        <td className="px-4 py-3 text-[var(--admin-text-muted)]">
                                            {formatDateRange(row.date_start, row.date_end)}
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
                            : 'Para reordenar, quita la búsqueda y muestra todas las filas en una sola página.'}
                    </p>
                </>
            )}
        </div>
    );
};

export default ExperienceAdminPage;
