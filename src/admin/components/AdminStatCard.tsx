import React from 'react';
import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminStatCardProps {
    label: string;
    value: number | string;
    icon: LucideIcon;
    hint?: string;
    suffix?: string;
}

const cardClass = cn(
    'group rounded-2xl border border-[var(--admin-border)] bg-white p-5 shadow-sm',
    'transition-all duration-300 hover:border-[var(--admin-accent)]/50',
    'hover:shadow-[0_8px_32px_rgba(236,72,105,0.1)]',
);

export const AdminStatCard: React.FC<AdminStatCardProps> = ({ label, value, icon: Icon, hint, suffix }) => (
    <motion.article whileHover={{ y: -2, transition: { duration: 0.2 } }} className={cardClass}>
        <div className="mb-4 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--admin-text-muted)]">{label}</p>
            <Icon className="h-5 w-5 text-[var(--admin-accent)]" aria-hidden />
        </div>
        <p className="text-3xl font-bold tracking-tight text-[var(--admin-text)] transition-colors group-hover:text-[var(--admin-accent)]">
            {value}
            {suffix ? (
                <span className="ml-1 text-base font-medium text-[var(--admin-text-muted)]">{suffix}</span>
            ) : null}
        </p>
        {hint ? <p className="mt-2 text-xs text-[var(--admin-text-secondary)]">{hint}</p> : null}
    </motion.article>
);
