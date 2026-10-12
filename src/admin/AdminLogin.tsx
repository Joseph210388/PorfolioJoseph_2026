import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AdminField, adminInputClass } from './components/AdminField';
import { cn } from '@/lib/utils';

const AdminLogin: React.FC = () => {
    const { user, loading, signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (!loading && user) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        // Supabase Auth hashea la contraseña en el servidor (bcrypt); nunca la guardamos en claro aquí.
        const { error: signInError } = await signIn(email.trim(), password);
        if (signInError) {
            const isInvalidCreds = /invalid login credentials/i.test(signInError);
            setError(isInvalidCreds ? 'Email o contraseña incorrectos.' : signInError);
        }
        // No dejar la contraseña en el estado del formulario tras el intento.
        setPassword('');
        setShowPassword(false);
        setSubmitting(false);
    };

    return (
        <div className="admin-shell flex min-h-screen items-center justify-center bg-[var(--admin-sidebar)] px-4 py-12">
            <div
                className={cn(
                    'w-full max-w-md rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-main)] p-6 shadow-lg sm:p-8',
                )}
            >
                <div className="mb-8 text-center">
                    <h1 className="text-2xl font-bold tracking-tight text-[var(--admin-text)]">Panel Admin</h1>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                    autoComplete="off"
                    data-lpignore="true"
                    data-1p-ignore="true"
                >
                    <AdminField label="Email" htmlFor="admin-email">
                        <input
                            id="admin-email"
                            name="admin-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="off"
                            autoCapitalize="none"
                            spellCheck={false}
                            className={adminInputClass}
                            placeholder="tu@email.com"
                        />
                    </AdminField>

                    <AdminField label="Contraseña" htmlFor="admin-password">
                        <div className="relative">
                            <input
                                id="admin-password"
                                name="admin-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete="new-password"
                                className={cn(adminInputClass, 'pr-11')}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--admin-text-muted)] transition-colors hover:bg-slate-100 hover:text-[var(--admin-text)]"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" aria-hidden />
                                ) : (
                                    <Eye className="h-4 w-4" aria-hidden />
                                )}
                            </button>
                        </div>
                    </AdminField>

                    {error ? (
                        <p className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-500" role="alert">
                            {error}
                        </p>
                    ) : null}

                    <button
                        type="submit"
                        disabled={submitting || loading}
                        className={cn(
                            'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#ec4869] px-4 py-2.5 text-sm font-semibold text-white transition-colors',
                            'hover:bg-[#d93d5c] disabled:cursor-not-allowed disabled:opacity-60',
                        )}
                    >
                        <LogIn className="h-4 w-4" aria-hidden />
                        {submitting || loading ? 'Entrando…' : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
