import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const sizeClass = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
} as const;

export type SpinnerProps = {
    size?: keyof typeof sizeClass;
    className?: string;
    /** Si se pasa, añade texto solo para lectores de pantalla (uso aislado del icono). */
    label?: string;
};

/**
 * Indicador de carga circular; mismo enfoque visual que loaders tipo shadcn/Seraui (icono + spin).
 * El registry Seraui usado aquí no expone `spinner` vía CLI, por eso vive como primitivo local en `ui/`.
 */
export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className, label }) => (
    <span className={cn('inline-flex items-center justify-center', className)}>
        <Loader2 className={cn('animate-spin text-accent', sizeClass[size])} aria-hidden />
        {label ? <span className="sr-only">{label}</span> : null}
    </span>
);
