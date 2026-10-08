import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ADMIN_PAGE_SIZE_OPTIONS, type AdminPageSize } from '../adminListTypes';

interface AdminPaginationProps {
    page: number;
    pageSize: AdminPageSize;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: AdminPageSize) => void;
    className?: string;
    idPrefix?: string;
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
    page,
    pageSize,
    total,
    onPageChange,
    onPageSizeChange,
    className,
    idPrefix = 'admin-pagination',
}) => {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(page, totalPages);
    const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const to = Math.min(safePage * pageSize, total);

    return (
        <div
            className={cn(
                'flex flex-col gap-3 border-t border-[var(--admin-border)] bg-slate-50/80 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4',
                className,
            )}
        >
            <p className="text-center text-xs text-[var(--admin-text-muted)] sm:text-left">
                {total === 0 ? (
                    'Sin resultados'
                ) : (
                    <>
                        Mostrando <span className="font-medium text-[var(--admin-text-secondary)]">{from}</span>
                        {' – '}
                        <span className="font-medium text-[var(--admin-text-secondary)]">{to}</span> de{' '}
                        <span className="font-medium text-[var(--admin-text-secondary)]">{total}</span>
                    </>
                )}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-end">
                {onPageSizeChange ? (
                    <label className="inline-flex items-center gap-2 text-xs text-[var(--admin-text-muted)]">
                        <span className="sr-only">Filas por página</span>
                        <span aria-hidden>Por página</span>
                        <select
                            id={`${idPrefix}-size`}
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value) as AdminPageSize)}
                            className="rounded-xl border border-[var(--admin-border)] bg-white px-2 py-1.5 text-sm text-[var(--admin-text)] focus:border-[var(--admin-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-accent)]/25"
                        >
                            {ADMIN_PAGE_SIZE_OPTIONS.map((size) => (
                                <option key={size} value={size}>
                                    {size}
                                </option>
                            ))}
                        </select>
                    </label>
                ) : null}

                <div className="inline-flex items-center gap-1 rounded-xl border border-[var(--admin-border)] bg-white p-1">
                    <button
                        type="button"
                        onClick={() => onPageChange(safePage - 1)}
                        disabled={safePage <= 1}
                        aria-label="Página anterior"
                        className="rounded-lg p-2 text-[var(--admin-text-muted)] transition-colors hover:bg-slate-100 hover:text-[var(--admin-text)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="min-w-[5.5rem] px-2 text-center text-xs font-medium text-[var(--admin-text-secondary)]">
                        {safePage} / {totalPages}
                    </span>
                    <button
                        type="button"
                        onClick={() => onPageChange(safePage + 1)}
                        disabled={safePage >= totalPages}
                        aria-label="Página siguiente"
                        className="rounded-lg p-2 text-[var(--admin-text-muted)] transition-colors hover:bg-slate-100 hover:text-[var(--admin-text)] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
