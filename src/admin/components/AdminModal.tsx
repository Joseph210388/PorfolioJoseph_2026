import React, { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminModalProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    className?: string;
}

const AdminModal: React.FC<AdminModalProps> = ({
    open,
    onClose,
    title,
    children,
    footer,
    className,
}) => {
    const titleId = useId();

    useEffect(() => {
        if (!open) return;

        const onKeyDown = (ev: KeyboardEvent) => {
            if (ev.key === 'Escape') onClose();
        };

        const prevOverflow = document.body.style.overflow;
        const prevPaddingRight = document.body.style.paddingRight;
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) {
            document.body.style.paddingRight = `${scrollbarWidth}px`;
        }

        const root = document.getElementById('root') as (HTMLElement & { inert?: boolean }) | null;
        const prevRootPointerEvents = root?.style.pointerEvents;
        const prevAriaHidden = root?.getAttribute('aria-hidden');
        const prevInert = root?.inert;

        if (root) {
            root.style.pointerEvents = 'none';
            root.setAttribute('aria-hidden', 'true');
            root.inert = true;
        }

        window.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            document.body.style.overflow = prevOverflow;
            document.body.style.paddingRight = prevPaddingRight;
            if (root) {
                root.style.pointerEvents = prevRootPointerEvents ?? '';
                if (prevAriaHidden == null) root.removeAttribute('aria-hidden');
                else root.setAttribute('aria-hidden', prevAriaHidden);
                root.inert = prevInert;
            }
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div className="admin-modal-shell">
            <div
                className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/60 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                onMouseDown={(e) => {
                    if (e.target === e.currentTarget) onClose();
                }}
            >
                <div
                    className={cn(
                        'flex max-h-[100dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-[#dee2e6] bg-white shadow-2xl sm:max-h-[min(90dvh,900px)] sm:max-w-4xl sm:rounded-2xl',
                        className,
                    )}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {/* Cabecera azul marino, alineada con el sidebar */}
                    <div className="flex shrink-0 items-center justify-between gap-4 bg-[#0f1c3a] px-5 py-4 sm:px-6">
                        <h2 id={titleId} className="text-lg font-semibold text-white sm:text-xl">
                            {title}
                        </h2>
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Cerrar"
                            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/25 text-white/90 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Contenido: texto oscuro sobre fondo blanco */}
                    <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-white px-5 py-5 text-[#212529] sm:px-6">
                        {children}
                    </div>

                    {footer ? (
                        <div className="shrink-0 border-t border-[#dee2e6] bg-[#f8f9fa] px-5 py-4 sm:px-6">
                            {footer}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>,
        document.body,
    );
};

export default AdminModal;
