import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Spinner } from '@/components/ui/Spinner';
import { showAdminToast } from './components/AdminToast';

type EmailLinkType = 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email';

const LINK_TYPES = new Set<EmailLinkType>([
    'signup',
    'invite',
    'magiclink',
    'recovery',
    'email_change',
    'email',
]);

function parseLinkType(value: string | null): EmailLinkType | null {
    if (!value) return null;
    return LINK_TYPES.has(value as EmailLinkType) ? (value as EmailLinkType) : null;
}

function humanizeAuthError(message: string): string {
    const lower = message.toLowerCase();
    if (lower.includes('invalid') || lower.includes('expired')) {
        return 'El enlace no es válido o ha caducado. Pide el cambio otra vez desde Configuración.';
    }
    return message;
}

function hashParams(): URLSearchParams {
    return new URLSearchParams(window.location.hash.replace(/^#/, ''));
}

function decodeHashText(value: string): string {
    return decodeURIComponent(value.replace(/\+/g, ' '));
}

function isNeedOtherEmailMessage(message: string): boolean {
    const lower = message.toLowerCase();
    return lower.includes('other email') || lower.includes('confirm link sent');
}

/**
 * Completa el enlace de Auth (cambio de correo, etc.).
 * Auth a veces redirige a /#message=... (doble confirmación iCloud + Gmail).
 */
const AuthConfirmPage: React.FC = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [needOtherEmail, setNeedOtherEmail] = useState(false);

    useEffect(() => {
        let cancelled = false;

        const finish = async () => {
            const url = new URL(window.location.href);
            const tokenHash = url.searchParams.get('token_hash');
            const type = parseLinkType(url.searchParams.get('type'));
            const code = url.searchParams.get('code');
            const hash = hashParams();
            const hashError = hash.get('error_description') || hash.get('error');
            const hashMessage = hash.get('message');

            if (hashMessage && isNeedOtherEmailMessage(decodeHashText(hashMessage))) {
                if (!cancelled) setNeedOtherEmail(true);
                return;
            }

            if (hashError) {
                if (!cancelled) {
                    setError(humanizeAuthError(decodeHashText(hashError)));
                }
                return;
            }

            let confirmError: string | null = null;

            if (tokenHash && type) {
                const { error: otpError } = await supabase.auth.verifyOtp({
                    token_hash: tokenHash,
                    type,
                });
                confirmError = otpError?.message ?? null;
            } else if (code) {
                const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
                confirmError = codeError?.message ?? null;
            } else {
                const { data, error: sessionError } = await supabase.auth.getSession();
                confirmError = sessionError?.message ?? null;
                if (!confirmError && !data.session) {
                    confirmError = 'Este enlace no se pudo confirmar. Pide el cambio otra vez desde Configuración.';
                }
            }

            if (cancelled) return;
            if (confirmError) {
                setError(humanizeAuthError(confirmError));
                return;
            }

            const { data } = await supabase.auth.getUser();
            const email = data.user?.email;
            showAdminToast(
                email
                    ? `Correo de acceso actualizado a ${email}.`
                    : 'Enlace confirmado. Ya puedes entrar al admin.',
            );
            navigate(data.user ? '/admin/settings' : '/admin/login', { replace: true });
        };

        void finish();
        return () => {
            cancelled = true;
        };
    }, [navigate]);

    return (
        <div className="admin-shell flex min-h-dvh items-center justify-center bg-[var(--admin-sidebar)] px-4 py-12">
            <div className="w-full max-w-md rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-main)] p-6 text-center shadow-lg sm:p-8">
                {needOtherEmail ? (
                    <>
                        <h1 className="text-xl font-semibold tracking-tight text-[var(--admin-text)]">
                            Primer enlace aceptado
                        </h1>
                        <p className="mt-3 text-sm leading-relaxed text-[var(--admin-text-muted)]">
                            Auth pide confirmar los dos buzones (iCloud y Gmail). Abre el otro correo y pulsa el
                            segundo enlace. Hasta entonces Users no cambia.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/login', { replace: true })}
                            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#ec4869] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d93d5c]"
                        >
                            Ir al login
                        </button>
                    </>
                ) : error ? (
                    <>
                        <h1 className="text-xl font-semibold tracking-tight text-[var(--admin-text)]">
                            No se pudo confirmar el correo
                        </h1>
                        <p className="mt-3 text-sm leading-relaxed text-[var(--admin-text-muted)]">{error}</p>
                        <button
                            type="button"
                            onClick={() => navigate('/admin/login', { replace: true })}
                            className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#ec4869] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#d93d5c]"
                        >
                            Ir al login
                        </button>
                    </>
                ) : (
                    <>
                        <Spinner size="lg" label="Confirmando el correo" />
                        <p className="mt-4 text-sm text-[var(--admin-text-muted)]">Confirmando el cambio de correo…</p>
                    </>
                )}
            </div>
        </div>
    );
};

export default AuthConfirmPage;
