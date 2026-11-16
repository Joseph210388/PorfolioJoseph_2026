import React from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminTopBarProps {
    title: string;
    description?: string;
    onMenuClick?: () => void;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({ title, description, onMenuClick }) => (
    <header
        className={cn(
            'flex shrink-0 items-center justify-between gap-4 border-b px-4 py-3 sm:px-6',
            // En móvil la barra del título usa el azul del sidebar; desde lg vuelve al fondo claro.
            'border-white/10 bg-[var(--admin-sidebar)] lg:border-[var(--admin-border)] lg:bg-[var(--admin-main)]',
        )}
    >
        <div className="flex min-w-0 items-center gap-3">
            {onMenuClick ? (
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="shrink-0 rounded-lg p-2 text-white hover:bg-white/10 lg:hidden"
                    aria-label="Abrir menú"
                >
                    <Menu className="h-5 w-5" />
                </button>
            ) : null}
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <h1 className="truncate text-lg font-semibold tracking-tight text-white sm:text-xl lg:text-[var(--admin-text)]">
                    {title}
                </h1>
                {description ? (
                    <p className="truncate text-xs text-white/70 sm:text-sm lg:text-[var(--admin-text-muted)]">{description}</p>
                ) : null}
            </div>
        </div>
    </header>
);
