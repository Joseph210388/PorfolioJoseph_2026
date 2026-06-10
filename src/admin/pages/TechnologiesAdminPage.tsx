import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { AdminField, adminInputClass } from '../components/AdminField';
import AdminModal from '../components/AdminModal';
import { AdminModalFooter } from '../components/AdminModalFooter';
import { AdminTableToolbar } from '../components/AdminTableToolbar';
import {
    deleteTechnology,
    fetchAdminTechnologies,
    saveTechnology,
    type TechnologyFormData,
} from '../adminApi';
import type { Technology } from '../../utils/supabase';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

const emptyForm = (): TechnologyFormData => ({ name: '', icon_url: '', color: '' });

const TechnologiesAdminPage: React.FC = () => {
    const [items, setItems] = useState<Technology[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form, setForm] = useState<TechnologyFormData>(emptyForm);
    const [showForm, setShowForm] = useState(false);
    const [query, setQuery] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setItems(await fetchAdminTechnologies());
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
        return items.filter((tech) => {
            const id = String(tech.id);
            const name = tech.name.toLowerCase();
            const icon = (tech.icon_url ?? '').toLowerCase();
            const color = (tech.color ?? '').toLowerCase();
            return id.includes(q) || name.includes(q) || icon.includes(q) || color.includes(q);
        });
    }, [items, query]);

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
        <div>
            {error ? <p className="mb-4 text-sm text-red-400">{error}</p> : null}

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
                query={query}
                onQueryChange={setQuery}
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
                <div className="flex justify-center py-12">
                    <Spinner />
                </div>
            ) : items.length === 0 ? (
                <p className="rounded-2xl border border-[var(--admin-border)] bg-white p-6 text-center text-sm text-[var(--admin-text-secondary)]">
                    No hay tecnologías registradas.
                </p>
            ) : filteredItems.length === 0 ? (
                <p className="rounded-2xl border border-[var(--admin-border)] bg-white p-6 text-center text-sm text-[var(--admin-text-secondary)]">
                    No hay tecnologías que coincidan con la búsqueda.
                </p>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-[var(--admin-border)] bg-white">
                    <table className="w-full min-w-[640px] border-collapse text-left text-sm">
                        <thead>
                            <tr className="border-b border-[var(--admin-border)] bg-slate-50">
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">ID</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">Nombre</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">Icono</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">Color</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredItems.map((tech) => (
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
                </div>
            )}
        </div>
    );
};

export default TechnologiesAdminPage;
