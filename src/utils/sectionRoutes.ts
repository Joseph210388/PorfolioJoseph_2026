/**
 * Rutas de sección con History API (sin hash): misma página, URL más limpia.
 * Respeta `import.meta.env.BASE_URL` de Vite para despliegue en subcarpeta.
 */

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** Orden visual del scroll para detectar la sección activa */
export const SECTION_SCROLL_ORDER = ['/', '/about', '/proyectos', '/experiencia', '/contacto'] as const;

const VALID_APP_PATHS = new Set<string>(SECTION_SCROLL_ORDER);

const KNOWN_SECTION_IDS = new Set([
    'home',
    'about',
    'proyectos',
    'experiencia',
    'contacto',
]);

/** Convierte pathname del navegador a ruta interna (/about) sin prefijo base */
export function pathnameWithoutBase(pathname: string): string {
    if (!BASE) return pathname || '/';
    const prefix = BASE.startsWith('/') ? BASE : `/${BASE}`;
    if (pathname === prefix || pathname === `${prefix}/`) return '/';
    if (pathname.startsWith(`${prefix}/`)) {
        const rest = pathname.slice(prefix.length) || '/';
        return rest.startsWith('/') ? rest : `/${rest}`;
    }
    return pathname || '/';
}

/** Ruta de app → id de elemento (#id en el DOM) */
/** Normaliza la ruta interna (trailing slash, alias /home) */
export function normalizeAppPath(internalPath: string): string {
    const p = internalPath.replace(/\/$/, '') || '/';
    if (p.toLowerCase() === '/home') return '/';
    return p;
}

export function isKnownAppPath(internalPath: string): boolean {
    return VALID_APP_PATHS.has(normalizeAppPath(internalPath));
}

/** Ruta interna de la app (`/`, `/about`, …) → id del bloque en el DOM */
export function internalPathToSectionId(internalPath: string): string {
    const p = normalizeAppPath(internalPath);
    if (p === '/') return 'home';
    const map: Record<string, string> = {
        '/about': 'about',
        '/proyectos': 'proyectos',
        '/experiencia': 'experiencia',
        '/contacto': 'contacto',
    };
    return map[p] ?? 'home';
}

/** `window.location.pathname` (con base de Vite) → id del bloque */
export function pathToSectionId(fullPathname: string): string {
    const internal = normalizeAppPath(pathnameWithoutBase(fullPathname));
    return internalPathToSectionId(internal);
}

/** Si la ruta no existe, conviene llevar al usuario a inicio sin recargar */
export function normalizeUnknownPathToHome(pathname: string): string {
    const internal = normalizeAppPath(pathnameWithoutBase(pathname));
    if (!isKnownAppPath(internal)) return '/';
    return internal;
}

/** id de sección → ruta interna para la barra de direcciones */
export function sectionIdToPath(sectionId: string): string {
    if (sectionId === 'home') return '/';
    if (['about', 'proyectos', 'experiencia', 'contacto'].includes(sectionId)) {
        return `/${sectionId}`;
    }
    return '/';
}

/** Path listo para `history.replaceState` / `href` (incluye base de Vite si aplica) */
export function toBrowserPath(route: string): string {
    const r = route === '/' ? '/' : route.startsWith('/') ? route : `/${route}`;
    if (!BASE) return r;
    return r === '/' ? `${BASE}/` : `${BASE}${r}`;
}

export function isKnownSectionHash(hashWithoutPound: string): boolean {
    return KNOWN_SECTION_IDS.has(hashWithoutPound);
}
