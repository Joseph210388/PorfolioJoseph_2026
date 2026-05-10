import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import React from 'react';
import { cn } from '@/lib/utils';

// Cáscara opaca + bordes redondeados; el scroll va en un hijo para que el rebote (overscroll) no deje ver el fondo de la página
const contentShellClassName = cn(
    'z-[300] flex max-h-[min(70vh,22rem)] min-h-0 min-w-[14rem] max-w-[min(calc(100vw-1.5rem),22rem)] flex-col overflow-hidden rounded-2xl p-0 outline-none isolate',
    'border-2 border-border bg-[var(--color-dropdown-surface)] text-text-primary',
    'shadow-2xl shadow-black/25 ring-1 ring-black/[0.12]',
    'dark:border-accent/40 dark:shadow-[0_24px_56px_-8px_rgba(0,0,0,0.85)] dark:ring-accent/25'
);

const contentScrollClassName = cn(
    'min-h-0 flex-1 overflow-y-auto overscroll-y-contain divide-y divide-border',
    'bg-[var(--color-dropdown-surface)]',
    'dark:divide-border'
);

export interface FilterDropdownMenuProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    /** Botón u otro control que reciba las props del Trigger (ref, handlers). */
    trigger: React.ReactElement;
    children: React.ReactNode;
}

/**
 * Menú flotante para filtros: portal + posicionamiento (Radix). Seraui CLI no expone este bloque en el registry usado.
 */
export const FilterDropdownMenu: React.FC<FilterDropdownMenuProps> = ({
    open,
    onOpenChange,
    trigger,
    children,
}) => (
    // modal=true (default Radix): con modal=false el capa dismissable a veces interpreta el mismo clic
    // como “interacción fuera” y el menú abre y cierra al instante según scroll/stacking.
    <DropdownMenu.Root open={open} onOpenChange={onOpenChange} modal>
        <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
        <DropdownMenu.Portal>
            <DropdownMenu.Content
                side="bottom"
                align="start"
                sideOffset={8}
                collisionPadding={12}
                className={contentShellClassName}
                onCloseAutoFocus={(e) => e.preventDefault()}
                style={{
                    backgroundColor: 'var(--color-dropdown-surface)',
                    color: 'var(--color-text-primary)',
                }}
            >
                <div
                    className={contentScrollClassName}
                    style={{ backgroundColor: 'var(--color-dropdown-surface)' }}
                >
                    {children}
                </div>
            </DropdownMenu.Content>
        </DropdownMenu.Portal>
    </DropdownMenu.Root>
);

export const FilterMenuItem = DropdownMenu.Item;
