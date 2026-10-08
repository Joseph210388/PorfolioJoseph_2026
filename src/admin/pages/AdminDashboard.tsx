import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, FolderKanban, Layers, Star, Wrench } from 'lucide-react';
import { AdminCvSettingsCard } from '../components/AdminCvSettingsCard';
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
            <div className="flex h-full items-center justify-center py-20">
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
        <div className="h-full min-h-0 space-y-6 overflow-y-auto overscroll-contain text-[var(--admin-text)] lg:space-y-8">
            <section>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] sm:mb-4">
                    Contenido registrado
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
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

            <section className="grid items-stretch gap-4 lg:grid-cols-12 lg:gap-6">
                {/* Un solo panel de proyectos: estado + lista */}
                <article className="order-2 flex min-h-[22rem] min-w-0 flex-col overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-white shadow-sm lg:order-1 lg:col-span-9">
                    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-border)] px-4 py-4 sm:px-6">
                        <div>
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                                Proyectos
                            </h2>
                            <p className="mt-0.5 text-xs text-[var(--admin-text-secondary)]">
                                Resumen por estado y últimos registros
                            </p>
                        </div>
                        <Link
                            to="/admin/projects"
                            className="text-sm font-medium text-[var(--admin-accent)] transition-colors hover:text-[var(--admin-accent-hover)]"
                        >
                            Ver todos →
                        </Link>
                    </header>

                    <div className="grid grid-cols-3 divide-x divide-[var(--admin-border)] border-b border-[var(--admin-border)] bg-slate-50/70">
                        <div className="px-3 py-4 text-center sm:px-5 sm:py-5 sm:text-left">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] sm:text-xs">
                                Finalizados
                            </p>
                            <p className="mt-1 text-2xl font-bold text-[var(--admin-text)] sm:text-3xl">
                                {stats.projectsFinished}
                            </p>
                        </div>
                        <div className="px-3 py-4 text-center sm:px-5 sm:py-5 sm:text-left">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] sm:text-xs">
                                En progreso
                            </p>
                            <p className="mt-1 text-2xl font-bold text-[var(--admin-accent)] sm:text-3xl">
                                {stats.projectsInProgress}
                            </p>
                        </div>
                        <div className="px-3 py-4 text-center sm:px-5 sm:py-5 sm:text-left">
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] sm:text-xs">
                                Pausados
                            </p>
                            <p className="mt-1 text-2xl font-bold text-[var(--admin-text)] sm:text-3xl">
                                {stats.projectsPaused}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-1 flex-col px-4 py-4 sm:px-6 sm:py-5">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">
                            Recientes
                        </p>

                        {stats.recentProjects.length === 0 ? (
                            <p className="text-sm text-[var(--admin-text-secondary)]">Aún no hay proyectos registrados.</p>
                        ) : (
                            <ul className="divide-y divide-[var(--admin-border)]">
                                {stats.recentProjects.map((project) => (
                                    <li
                                        key={project.id}
                                        className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <span className="min-w-0 truncate font-medium text-[var(--admin-text)]">
                                            {project.name}
                                        </span>
                                        <span
                                            className={cn(
                                                'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium',
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
                    </div>
                </article>

                <aside className="order-1 min-w-0 lg:order-2 lg:col-span-3">
                    <AdminCvSettingsCard compact className="h-full" />
                </aside>
            </section>
        </div>
    );
};

export default AdminDashboard;
