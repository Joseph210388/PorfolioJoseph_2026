import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';

/** GoTrue guarda el destino del cambio aquí hasta que se confirma el enlace. */
type AuthUserWithPendingEmail = User & { new_email?: string | null };

interface AuthContextValue {
    user: User | null;
    session: Session | null;
    loading: boolean;
    /** Correo nuevo pedido a Auth y aún no confirmado (p. ej. Gmail). */
    pendingEmail: string | null;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
    /** Cambia el email de acceso. Sigue usando Auth (deuda: se sustituirá por sesión propia). */
    updateAdminEmail: (nextEmail: string, currentPassword: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
}

function pendingEmailFromUser(user: User | null): string | null {
    const next = (user as AuthUserWithPendingEmail | null)?.new_email?.trim().toLowerCase();
    if (!next) return null;
    if (next === user?.email?.toLowerCase()) return null;
    return next;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setUser(data.session?.user ?? null);
            setLoading(false);
        });

        const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
            setSession(nextSession);
            setUser(nextSession?.user ?? null);
            setLoading(false);
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({
            email: email.trim().toLowerCase(),
            password,
        });
        return { error: error?.message ?? null };
    }, []);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
    }, []);

    const refreshUser = useCallback(async () => {
        const { data } = await supabase.auth.getUser();
        if (data.user) setUser(data.user);
    }, []);

    const updateAdminEmail = useCallback(
        async (nextEmail: string, currentPassword: string) => {
            const currentEmail = user?.email;
            if (!currentEmail) {
                return { error: 'No hay sesión de admin.', needsConfirmation: false };
            }

            const normalized = nextEmail.trim().toLowerCase();
            if (normalized === currentEmail.toLowerCase()) {
                return { error: null, needsConfirmation: false };
            }

            // Reautenticamos para que el cambio de email no quede a medias.
            const { error: reauthError } = await supabase.auth.signInWithPassword({
                email: currentEmail,
                password: currentPassword,
            });
            if (reauthError) {
                return { error: 'La contraseña actual no es correcta.', needsConfirmation: false };
            }

            const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
            const { error } = await supabase.auth.updateUser(
                { email: normalized },
                origin ? { emailRedirectTo: `${origin}/auth/confirm` } : undefined,
            );
            if (error) {
                return { error: error.message, needsConfirmation: false };
            }

            const { data: latest } = await supabase.auth.getUser();
            if (latest.user) setUser(latest.user);

            const confirmed = latest.user?.email?.toLowerCase() === normalized;
            return { error: null, needsConfirmation: !confirmed };
        },
        [user?.email],
    );

    const pendingEmail = pendingEmailFromUser(user);

    const value = useMemo(
        () => ({ user, session, loading, pendingEmail, signIn, signOut, refreshUser, updateAdminEmail }),
        [user, session, loading, pendingEmail, signIn, signOut, refreshUser, updateAdminEmail],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error('useAuth debe usarse dentro de AuthProvider');
    }
    return ctx;
}
