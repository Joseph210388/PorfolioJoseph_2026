import React from 'react';
import { cn } from '@/lib/utils';

interface AdminScrollableTableProps {
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
    /** Clase del contenedor con scroll (tabla). */
    scrollClassName?: string;
    empty?: boolean;
    emptyMessage?: string;
}

/**
 * Tabla admin con scroll interno: cabecera sticky, paginación fija abajo.
 * El padre debe tener altura limitada (p. ej. flex-1 min-h-0).
 */
export const AdminScrollableTable: React.FC<AdminScrollableTableProps> = ({
    children,
    footer,
    className,
    scrollClassName,
    empty = false,
    emptyMessage,
}) => {
    if (empty) {
        return (
            <p className="rounded-2xl border border-[var(--admin-border)] bg-white p-6 text-center text-sm text-[var(--admin-text-secondary)]">
                {emptyMessage ?? 'Sin resultados.'}
            </p>
        );
    }

    return (
        <div
            className={cn(
                'flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-white',
                className,
            )}
        >
            <div className={cn('min-h-0 flex-1 overflow-auto overscroll-contain', scrollClassName)}>
                {children}
            </div>
            {footer ? <div className="shrink-0">{footer}</div> : null}
        </div>
    );
};

/** Clases para thead sticky dentro del scroll. */
export const adminTableHeadClass =
    'sticky top-0 z-10 border-b border-[var(--admin-border)] bg-slate-50 shadow-[0_1px_0_0_var(--admin-border)]';

export const adminTableThClass =
    'px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)] bg-slate-50';
