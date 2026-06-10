import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AdminField, adminInputClass } from './components/AdminField';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const AdminLogin: React.FC = () => {
    const { user, loading, signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (!loading && user) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        const { error: signInError } = await signIn(email.trim(), password);
        if (signInError) setError(signInError);
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
                    <p className="mt-2 text-sm text-[var(--admin-text-muted)]">Inicia sesión para gestionar el portfolio</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <AdminField label="Email" htmlFor="admin-email">
                        <input
                            id="admin-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                            className={adminInputClass}
                            placeholder="tu@email.com"
                        />
                    </AdminField>

                    <AdminField label="Contraseña" htmlFor="admin-password">
                        <input
                            id="admin-password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                            className={adminInputClass}
                        />
                    </AdminField>

                    {error ? (
                        <p className="rounded-xl border border-red-400/40 bg-red-400/10 px-4 py-3 text-sm text-red-400">
                            {error}
                        </p>
                    ) : null}

                    <Button
                        type="submit"
                        loading={submitting || loading}
                        className="w-full rounded-xl bg-[var(--admin-accent)] text-white hover:bg-[var(--admin-accent-hover)]"
                        iconLeft={<LogIn className="h-4 w-4" />}
                    >
                        Entrar
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
