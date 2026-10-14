import React from 'react';
import { cn } from '@/lib/utils';

interface AdminToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label: string;
    disabled?: boolean;
}

/** Interruptor accesible (role=switch). Misma semántica que un checkbox, otro aspecto. */
export const AdminToggle: React.FC<AdminToggleProps> = ({ checked, onChange, label, disabled = false }) => (
    <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
            'relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ease-out',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-accent)]/40',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'motion-reduce:transition-none',
            checked ? 'bg-[var(--admin-accent)]' : 'bg-[#dee2e6]',
        )}
    >
        <span
            className={cn(
                'absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm',
                'transition-transform duration-200 ease-out motion-reduce:transition-none',
                checked && 'translate-x-5',
            )}
            aria-hidden
        />
    </button>
);
