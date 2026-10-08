import React, { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
    deleteTechnology,
    fetchAdminTechnologiesPaginated,
    saveTechnology,
    type TechnologyFormData,
} from '../adminApi';
import { DEFAULT_ADMIN_PAGE_SIZE, type AdminPageSize } from '../adminListTypes';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import type { Technology } from '../../utils/supabase';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

const emptyForm = (): TechnologyFormData => ({ name: '', icon_url: '', color: '' });

const TechnologiesAdminPage: React.FC = () => {
    const [items, setItems] = useState<Technology[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState<AdminPageSize>(DEFAULT_ADMIN_PAGE_SIZE);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<TechnologyFormData>(emptyForm);
    const [showForm, setShowForm] = useState(false);
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebouncedValue(query);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fetchAdminTechnologiesPaginated({
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
        setForm(emptyForm());
        setShowForm(true);
    };

    const openEdit = (tech: Technology) => {
        setEditingId(tech.id);
        setForm({
            name: tech.name,
            icon_url: tech.icon_url ?? '',
            color: tech.color ?? '',
        });
        setShowForm(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        try {
            await saveTechnology(editingId, form);
            closeForm();
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Eliminar esta tecnología?')) return;
        setError(null);
        try {
            await deleteTechnology(id);
            await load();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al eliminar');
        }
    };

    return (
        <div className="flex h-full min-h-0 flex-col">
            {error ? <p className="mb-3 shrink-0 text-sm text-red-400">{error}</p> : null}

            <AdminModal
                open={showForm}
                onClose={closeForm}
                title={editingId ? 'Editar tecnología' : 'Nueva tecnología'}
                footer={<AdminModalFooter formId="admin-technology-form" onCancel={closeForm} saving={saving} />}
            >
                <form id="admin-technology-form" onSubmit={handleSave} className="space-y-4">
                    <AdminField label="Nombre" htmlFor="tech-name">
                        <input id="tech-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={adminInputClass} />
                    </AdminField>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <AdminField label="URL icono" htmlFor="tech-icon">
                            <input id="tech-icon" value={form.icon_url} onChange={(e) => setForm({ ...form, icon_url: e.target.value })} className={adminInputClass} />
                        </AdminField>
                        <AdminField label="Color" htmlFor="tech-color">
                            <input id="tech-color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className={adminInputClass} placeholder="#EC4869" />
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
                placeholder="Buscar tecnología..."
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
                <AdminScrollableTable empty emptyMessage="No hay tecnologías registradas.">
                    {null}
                </AdminScrollableTable>
            ) : total === 0 ? (
                <AdminScrollableTable empty emptyMessage="No hay tecnologías que coincidan con la búsqueda.">
                    {null}
                </AdminScrollableTable>
            ) : (
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
                            idPrefix="technologies"
                        />
                    }
                >
                    <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                        <thead className={adminTableHeadClass}>
                            <tr>
                                <th className={adminTableThClass}>ID</th>
                                <th className={adminTableThClass}>Nombre</th>
                                <th className={adminTableThClass}>Icono</th>
                                <th className={adminTableThClass}>Color</th>
                                <th className={cn(adminTableThClass, 'text-right')}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {items.map((tech) => (
                                <tr key={tech.id} className="transition-colors hover:bg-background/40">
                                    <td className="px-4 py-3 font-mono text-xs text-[var(--admin-text-muted)]">{tech.id}</td>
                                    <td className="px-4 py-3 font-medium text-[var(--admin-text)]">{tech.name}</td>
                                    <td className="max-w-[200px] truncate px-4 py-3 text-[var(--admin-text-secondary)]" title={tech.icon_url ?? undefined}>
                                        {tech.icon_url || '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {tech.color ? (
                                            <span className="inline-flex items-center gap-2">
                                                <span
                                                    className="h-4 w-4 shrink-0 rounded-full border border-[var(--admin-border)]"
                                                    style={{ backgroundColor: tech.color }}
                                                    aria-hidden
                                                />
                                                <span className="font-mono text-xs text-[var(--admin-text-secondary)]">{tech.color}</span>
                                            </span>
                                        ) : (
                                            <span className="text-[var(--admin-text-muted)]">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(tech)}
                                                aria-label={`Editar ${tech.name}`}
                                                className={cn(
                                                    'rounded-xl border border-[var(--admin-border)] p-2 text-[var(--admin-text-muted)] transition-colors',
                                                    'hover:border-[var(--admin-accent)]/40 hover:text-[var(--admin-accent)]',
                                                )}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(tech.id)}
                                                aria-label={`Eliminar ${tech.name}`}
                                                className="rounded-xl border border-[var(--admin-border)] p-2 text-[var(--admin-text-muted)] transition-colors hover:border-red-400/50 hover:text-red-400"
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
            )}
        </div>
    );
};

export default TechnologiesAdminPage;
