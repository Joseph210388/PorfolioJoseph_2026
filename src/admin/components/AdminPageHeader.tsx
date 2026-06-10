import React from 'react';
import { cn } from '@/lib/utils';

interface AdminPageHeaderProps {
    action?: React.ReactNode;
    className?: string;
}

/** Barra de acciones de página (el título va en AdminTopBar). */
export const AdminPageHeader: React.FC<AdminPageHeaderProps> = ({ action, className }) => {
    if (!action) return null;

    return (
        <div className={cn('mb-6 flex justify-end', className)}>
            {action}
        </div>
    );
};
