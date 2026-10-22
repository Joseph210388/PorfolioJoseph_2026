/** Extrae un mensaje legible de errores de Supabase (no siempre son `instanceof Error`). */
export function getAdminErrorMessage(err: unknown, fallback: string): string {
    if (typeof err === 'string' && err.trim()) return err.trim();

    if (err && typeof err === 'object') {
        const payload = err as { message?: unknown; details?: unknown; hint?: unknown };
        const parts = [payload.message, payload.details, payload.hint].filter(
            (value): value is string => typeof value === 'string' && value.trim().length > 0,
        );
        if (parts.length > 0) {
            return [...new Set(parts.map((part) => part.trim()))].join(' — ');
        }
    }

    if (err instanceof Error && err.message.trim()) return err.message.trim();
    return fallback;
}
