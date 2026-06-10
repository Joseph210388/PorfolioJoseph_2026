import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GripVertical, Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminField, adminInputClass } from '../components/AdminField';
import AdminModal from '../components/AdminModal';
import { AdminModalFooter } from '../components/AdminModalFooter';
import { AdminTableToolbar } from '../components/AdminTableToolbar';
import {
    deleteExperience,
    fetchAdminExperience,
    saveExperience,
    translationToForm,
    updateExperienceOrder,
    type ExperienceFormData,
} from '../adminApi';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

type ExperienceRow = Awaited<ReturnType<typeof fetchAdminExperience>>[number];

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
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<ExperienceFormData>(emptyForm());
    const [showForm, setShowForm] = useState(false);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [query, setQuery] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setItems(await fetchAdminExperience());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const filteredItems = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return items;
        return items.filter((row) => {
            const title = row.translationsEs?.title ?? row.translationsEn?.title ?? '';
            return (
                title.toLowerCase().includes(q) ||
                row.company.toLowerCase().includes(q)
            );
        });
    }, [items, query]);

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
    };

    const openCreate = () => {
        setEditingId(null);
        setForm({ ...emptyForm(), order: items.length });
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
            await updateExperienceOrder(fullOrder);
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
        <div>
            {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}

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
                query={query}
                onQueryChange={setQuery}
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
                <div className="flex justify-center py-12">
                    <Spinner />
                </div>
            ) : items.length === 0 ? (
                <p className="rounded-2xl border border-[var(--admin-border)] py-12 text-center text-sm text-[var(--admin-text-muted)]">
                    No hay experiencias registradas.
                </p>
            ) : filteredItems.length === 0 ? (
                <p className="rounded-2xl border border-[var(--admin-border)] py-12 text-center text-sm text-[var(--admin-text-muted)]">
                    No hay experiencias que coincidan con la búsqueda.
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
                                    Puesto
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                                    Empresa
                                </th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                                    Fechas
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
                </div>
            )}

            {!loading && items.length > 0 ? (
                <p className="mt-4 text-xs text-[var(--admin-text-muted)]">
                    Arrastra las filas para cambiar el orden de aparición en el portfolio.
                </p>
            ) : null}
        </div>
    );
};

export default ExperienceAdminPage;
