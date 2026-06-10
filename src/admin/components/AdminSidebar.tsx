import React from 'react';
import { NavLink } from 'react-router-dom';
import { Briefcase, Code2, FolderKanban, LayoutDashboard, LogOut, X } from 'lucide-react';
import { ADMIN_BRAND } from '../adminPageMeta';
import { cn } from '@/lib/utils';

const navItems = [
    { to: '/admin/dashboard', label: 'Inicio', icon: LayoutDashboard },
    { to: '/admin/projects', label: 'Proyectos', icon: FolderKanban },
    { to: '/admin/experience', label: 'Experiencia', icon: Briefcase },
    { to: '/admin/technologies', label: 'Tecnologías', icon: Code2 },
] as const;

interface AdminSidebarProps {
    onSignOut: () => void;
    onClose?: () => void;
    className?: string;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ onSignOut, onClose, className }) => (
    <aside
        className={cn(
            'flex h-screen min-h-screen w-64 shrink-0 flex-col bg-[var(--admin-sidebar)] text-[var(--admin-sidebar-text)]',
            className,
        )}
    >
        {onClose ? (
            <div className="flex shrink-0 justify-end p-3 lg:hidden">
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar menú"
                    className="rounded-lg p-2 text-[var(--admin-sidebar-muted)] hover:bg-[var(--admin-sidebar-hover)]"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
        ) : null}

        <div className="shrink-0 px-3 pt-4">
            <div
                className={cn(
                    'relative flex items-center gap-3 rounded-lg px-4 py-3',
                    'bg-[var(--admin-sidebar-active)] text-sm font-semibold text-white',
                    'before:absolute before:left-0 before:top-1/2 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-r before:bg-[var(--admin-accent)]',
                )}
                aria-current="page"
            >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                    JV
                </span>
                {ADMIN_BRAND}
            </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
            {navItems.map(({ to, label, icon: Icon }) => (
                <NavLink
                    key={to}
                    to={to}
                    onClick={onClose}
                    className={({ isActive }) =>
                        cn(
                            'relative inline-flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                            isActive
                                ? 'bg-[var(--admin-sidebar-active)] text-white'
                                : 'text-[var(--admin-sidebar-muted)] hover:bg-[var(--admin-sidebar-hover)] hover:text-white',
                            isActive &&
                                'before:absolute before:left-0 before:top-1/2 before:h-6 before:w-1 before:-translate-y-1/2 before:rounded-r before:bg-[var(--admin-accent)]',
                        )
                    }
                >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                </NavLink>
            ))}
        </nav>

        <div className="mt-auto shrink-0 border-t border-white/10 p-3">
            <button
                type="button"
                onClick={onSignOut}
                className="inline-flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-[var(--admin-sidebar-muted)] transition-colors hover:bg-[var(--admin-sidebar-hover)] hover:text-white"
            >
                <LogOut className="h-4 w-4" />
                Salir
            </button>
        </div>
    </aside>
);
