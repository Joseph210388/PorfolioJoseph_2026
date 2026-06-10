import React from 'react';
import { Search } from 'lucide-react';
import { adminInputClass } from './AdminField';
import { cn } from '@/lib/utils';

interface AdminTableToolbarProps {
    query: string;
    onQueryChange: (value: string) => void;
    placeholder: string;
    right?: React.ReactNode;
    className?: string;
}

export const AdminTableToolbar: React.FC<AdminTableToolbarProps> = ({
    query,
    onQueryChange,
    placeholder,
    right,
    className,
}) => (
    <div className={cn('mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between', className)}>
        <div className="relative w-full shrink-0 sm:max-w-xs md:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--admin-text-muted)]" />
            <input
                type="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder={placeholder}
                className={cn(adminInputClass, 'pl-10')}
            />
        </div>
        {right ? (
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:ml-auto">
                {right}
            </div>
        ) : null}
    </div>
);
