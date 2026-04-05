/**
 * Higiene de entrada del formulario de contacto.
 * Formspree no ejecuta SQL, pero esto reduce riesgos si los datos se reutilizan
 * en otro sistema, mitiga XSS básico y limita payloads abusivos.
 */

const NAME_MAX = 120;
const EMAIL_MAX = 254;
const MESSAGE_MAX = 4000;

function stripDisallowedControls(value: string, allowNewlines: boolean): string {
    let out = '';
    for (const ch of value) {
        const code = ch.codePointAt(0) ?? 0;
        if (code === 0) continue;
        if (!allowNewlines && (code === 0x0a || code === 0x0d)) {
            out += ' ';
            continue;
        }
        if (code < 0x20 && code !== 0x09) continue;
        if (code === 0xfeff) continue;
        out += ch;
    }
    return out;
}

/** Evita < > en nombre (inyección de marcado si el dato se renderiza como HTML en algún sitio). */
function stripMarkupChars(value: string): string {
    return value.replace(/[<>]/g, '');
}

/**
 * Atenúa cadenas típicas de pruebas de inyección SQL en texto libre sin bloquear mensajes normales.
 * No sustituye validación en servidor con consultas parametrizadas.
 */
function softenSqlProbePatterns(value: string): string {
    return (
        value
            // Comentarios de una línea al estilo SQL al inicio de línea
            .replace(/(^|\n)\s*--[^\n]*/g, '$1')
            // Bloques de comentario estilo /* */
            .replace(/\/\*[\s\S]*?\*\//g, ' ')
            // Sucesiones largas de punto y coma (encadenar sentencias)
            .replace(/;{2,}/g, ';')
    );
}

export type ContactFormFields = {
    name: string;
    email: string;
    message: string;
};

export function sanitizeContactForm(data: ContactFormFields): ContactFormFields {
    let name = stripMarkupChars(stripDisallowedControls(data.name, false)).trim();
    name = name.replace(/\s+/g, ' ').slice(0, NAME_MAX);

    let email = stripDisallowedControls(data.email, false).trim().toLowerCase();
    email = email.replace(/\s+/g, '').slice(0, EMAIL_MAX);

    let message = stripDisallowedControls(data.message, true);
    message = message.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    message = softenSqlProbePatterns(message).trim();
    message = message.slice(0, MESSAGE_MAX);

    return { name, email, message };
}

export const CONTACT_FIELD_LIMITS = {
    name: NAME_MAX,
    email: EMAIL_MAX,
    message: MESSAGE_MAX,
} as const;
