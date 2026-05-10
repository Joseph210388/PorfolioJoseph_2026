import { cn } from '@/lib/utils';

/** Clases de cada opción del menú de filtros (archivo solo utilidades → Fast Refresh estable con el componente del menú). */
export const filterMenuItemClass = (selected: boolean) =>
    cn(
        'flex w-full cursor-pointer select-none items-center px-4 py-2.5 text-left text-sm font-medium outline-none transition-colors duration-100',
        'rounded-none border-0',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        'data-[highlighted]:outline-none',
        'focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/60',
        selected
            ? 'bg-accent/35 font-semibold text-accent shadow-[inset_3px_0_0_0_var(--color-accent)] dark:bg-accent/40 dark:text-accent dark:data-[highlighted]:bg-card-background dark:data-[highlighted]:text-text-primary'
            : 'bg-[var(--color-dropdown-surface)] text-text-secondary data-[highlighted]:bg-accent/30 data-[highlighted]:text-text-primary dark:data-[highlighted]:bg-card-background dark:data-[highlighted]:text-text-primary'
    );
