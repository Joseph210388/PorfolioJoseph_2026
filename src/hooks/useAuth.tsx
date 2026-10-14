import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../utils/supabase';

interface AuthContextValue {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<{ error: string | null }>;
    signOut: () => Promise<void>;
    /** Cambia el email de acceso. Sigue usando Auth (deuda: se sustituirá por sesión propia). */
    updateAdminEmail: (nextEmail: string, currentPassword: string) => Promise<{ error: string | null; needsConfirmation: boolean }>;
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
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message ?? null };
    }, []);

    const signOut = useCallback(async () => {
        await supabase.auth.signOut();
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

            const { data, error } = await supabase.auth.updateUser({ email: normalized });
            if (error) {
                return { error: error.message, needsConfirmation: false };
            }

            const confirmed = data.user?.email?.toLowerCase() === normalized;
            return { error: null, needsConfirmation: !confirmed };
        },
        [user?.email],
    );

    const value = useMemo(
        () => ({ user, session, loading, signIn, signOut, updateAdminEmail }),
        [user, session, loading, signIn, signOut, updateAdminEmail],
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
