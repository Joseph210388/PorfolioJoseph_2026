import React from 'react';
import { cn } from '@/lib/utils';

interface AdminFieldProps {
    label: string;
    htmlFor?: string;
    /** Muestra asterisco rojo en la etiqueta */
    required?: boolean;
    error?: string | null;
    hint?: string;
    children: React.ReactNode;
    className?: string;
}

export const AdminField: React.FC<AdminFieldProps> = ({
    label,
    htmlFor,
    required = false,
    error,
    hint,
    children,
    className,
}) => (
    <div className={cn('space-y-2', className)}>
        <label htmlFor={htmlFor} className="block text-xs font-semibold uppercase tracking-wider text-[#495057]">
            {label}
            {required ? (
                <span className="ml-0.5 text-[#ec4869]" aria-hidden>
                    *
                </span>
            ) : null}
            {required ? <span className="sr-only"> (obligatorio)</span> : null}
        </label>
        {children}
        {hint && !error ? <p className="text-xs text-[var(--admin-text-muted)]">{hint}</p> : null}
        {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
);

export const adminInputClass = cn(
    'block w-full rounded-xl border border-[#dee2e6] bg-white px-4 py-2.5 text-sm text-[#212529]',
    'placeholder:text-[#6c757d]/80 transition-colors',
    'focus:border-[#ec4869] focus:outline-none focus:ring-2 focus:ring-[#ec4869]/25',
);
