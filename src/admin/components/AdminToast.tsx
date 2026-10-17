import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Mail, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const TOAST_KEY = 'portfolio-admin-toast';
const TOAST_MS = 12000;

type ToastListener = (message: string | null) => void;
const listeners = new Set<ToastListener>();

function readStoredToast(): string | null {
    if (typeof sessionStorage === 'undefined') return null;
    const value = sessionStorage.getItem(TOAST_KEY)?.trim();
    return value || null;
}

/** Aviso que sobrevive al cierre de sesión (login sigue montado en AdminApp). */
export function showAdminToast(message: string) {
    const text = message.trim();
    if (!text) return;
    sessionStorage.setItem(TOAST_KEY, text);
    listeners.forEach((notify) => notify(text));
}

function dismissAdminToast() {
    sessionStorage.removeItem(TOAST_KEY);
    listeners.forEach((notify) => notify(null));
}

export const AdminToastHost: React.FC = () => {
    const reduceMotion = useReducedMotion();
    const [message, setMessage] = useState<string | null>(() => readStoredToast());

    useEffect(() => {
        listeners.add(setMessage);
        setMessage(readStoredToast());
        return () => {
            listeners.delete(setMessage);
        };
    }, []);

    useEffect(() => {
        if (!message) return;
        const timer = window.setTimeout(() => dismissAdminToast(), TOAST_MS);
        return () => window.clearTimeout(timer);
    }, [message]);

    return (
        <div
            className="pointer-events-none fixed inset-x-0 top-0 z-[10000] flex justify-center px-4 pt-4 sm:inset-x-auto sm:right-0 sm:justify-end sm:px-6 sm:pt-6"
            aria-live="polite"
            aria-relevant="additions"
        >
            <AnimatePresence>
                {message ? (
                    <motion.div
                        key="admin-toast"
                        role="status"
                        initial={reduceMotion ? false : { opacity: 0, y: -16 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -12 }}
                        transition={{ duration: reduceMotion ? 0.15 : 0.35, ease: 'easeOut' }}
                        className={cn(
                            'pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border border-[#dee2e6] bg-white p-4 shadow-2xl',
                            'text-sm text-[#212529]',
                        )}
                    >
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#ec4869]/10 text-[#ec4869]">
                            <Mail className="h-4 w-4" aria-hidden />
                        </span>
                        <p className="min-w-0 flex-1 leading-relaxed">{message}</p>
                        <button
                            type="button"
                            onClick={dismissAdminToast}
                            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[#6c757d] transition-colors hover:bg-[#f1f3f5] hover:text-[#212529]"
                            aria-label="Cerrar aviso"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </div>
    );
};
