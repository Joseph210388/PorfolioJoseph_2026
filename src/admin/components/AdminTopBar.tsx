import React from 'react';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminTopBarProps {
    title: string;
    description?: string;
    email?: string | null;
    onMenuClick?: () => void;
}

export const AdminTopBar: React.FC<AdminTopBarProps> = ({ title, description, email, onMenuClick }) => (
    <header
        className={cn(
            'flex shrink-0 items-center justify-between gap-4 border-b px-4 py-3 sm:px-6',
            'border-[var(--admin-border)] bg-[var(--admin-main)]',
        )}
    >
        <div className="flex min-w-0 items-center gap-3">
            {onMenuClick ? (
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="shrink-0 rounded-lg p-2 text-[var(--admin-text-muted)] hover:bg-slate-100 lg:hidden"
                    aria-label="Abrir menú"
                >
                    <Menu className="h-5 w-5" />
                </button>
            ) : null}
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <h1 className="truncate text-lg font-semibold tracking-tight text-[var(--admin-text)] sm:text-xl">
                    {title}
                </h1>
                {description ? (
                    <p className="truncate text-xs text-[var(--admin-text-muted)] sm:text-sm">{description}</p>
                ) : null}
            </div>
        </div>
        {email ? (
            <p className="hidden shrink-0 truncate text-sm text-[var(--admin-text-muted)] sm:block" title={email}>
                {email}
            </p>
        ) : null}
    </header>
);
