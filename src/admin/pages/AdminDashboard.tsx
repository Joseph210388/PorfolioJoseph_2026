import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FolderKanban, Layers, Star, Wrench } from 'lucide-react';
import { AdminStatCard } from '../components/AdminStatCard';
import { fetchAdminDashboardStats, type AdminDashboardStats } from '../adminApi';
import { Spinner } from '@/components/ui/Spinner';
import { cn } from '@/lib/utils';

const statusLabels: Record<string, string> = {
    finished: 'Finalizado',
    in_progress: 'En progreso',
    paused: 'Pausado',
};

const statusBadgeClass: Record<string, string> = {
    finished: 'border-[var(--admin-accent)]/30 bg-[var(--admin-accent)]/10 text-[var(--admin-accent)]',
    in_progress: 'border-amber-400/30 bg-amber-400/10 text-amber-600',
    paused: 'border-[var(--admin-border)] bg-slate-100 text-[var(--admin-text-muted)]',
};

const miniStatClass =
    'rounded-2xl border border-[var(--admin-border)] bg-white p-5 shadow-sm transition-colors hover:border-[var(--admin-accent)]/40';

const AdminDashboard: React.FC = () => {
    const [stats, setStats] = useState<AdminDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            setStats(await fetchAdminDashboardStats());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar el dashboard');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <Spinner size="lg" label="Cargando dashboard" />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="rounded-2xl border border-red-400/40 bg-red-50 p-6 text-sm text-red-500">
                {error ?? 'No se pudieron cargar las estadísticas'}
            </div>
        );
    }

    return (
        <div className="space-y-8 text-[var(--admin-text)]">

            <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                    Contenido registrado
                </h2>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <AdminStatCard
                        label="Proyectos"
                        value={stats.projectsTotal}
                        icon={FolderKanban}
                        hint={`${stats.projectsFeatured} destacados`}
                    />
                    <AdminStatCard
                        label="Tecnologías"
                        value={stats.technologiesTotal}
                        icon={Wrench}
                        hint="En el catálogo"
                    />
                    <AdminStatCard
                        label="Experiencia"
                        value={stats.experienceTotal}
                        icon={Briefcase}
                        hint="Empleos registrados"
                    />
                    <AdminStatCard
                        label="Categorías"
                        value={stats.categoriesTotal}
                        icon={Layers}
                        hint="Para proyectos"
                    />
                </div>
            </section>

            <section>
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                    Proyectos por estado
                </h2>
                <div className="grid gap-4 sm:grid-cols-3">
                    <div className={miniStatClass}>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                            Finalizados
                        </p>
                        <p className="mt-2 text-3xl font-bold text-[var(--admin-text)]">{stats.projectsFinished}</p>
                    </div>
                    <div className={miniStatClass}>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                            En progreso
                        </p>
                        <p className="mt-2 text-3xl font-bold text-[var(--admin-accent)]">{stats.projectsInProgress}</p>
                    </div>
                    <div className={miniStatClass}>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                            Pausados
                        </p>
                        <p className="mt-2 text-3xl font-bold text-[var(--admin-text)]">{stats.projectsPaused}</p>
                    </div>
                </div>
            </section>

            <section className="rounded-2xl border border-[var(--admin-border)] bg-white p-5 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                        Proyectos recientes
                    </h2>
                    <Link
                        to="/admin/projects"
                        className="text-sm font-medium text-[var(--admin-accent)] transition-colors hover:text-[var(--admin-accent-hover)]"
                    >
                        Ver todos →
                    </Link>
                </div>

                {stats.recentProjects.length === 0 ? (
                    <p className="text-sm text-[var(--admin-text-secondary)]">Aún no hay proyectos registrados.</p>
                ) : (
                    <ul className="divide-y divide-[var(--admin-border)]">
                        {stats.recentProjects.map((project) => (
                            <li
                                key={project.id}
                                className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <span className="font-medium text-[var(--admin-text)]">{project.name}</span>
                                <span
                                    className={cn(
                                        'inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
                                        statusBadgeClass[project.status],
                                    )}
                                >
                                    {project.featured ? <Star className="h-3 w-3" aria-hidden /> : null}
                                    {statusLabels[project.status] ?? project.status}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default AdminDashboard;
