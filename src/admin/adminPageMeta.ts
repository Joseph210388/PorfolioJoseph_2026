export const ADMIN_BRAND = 'Admin Portfolio';

const pageMeta: Record<string, { title: string; description: string }> = {
    '/admin/dashboard': {
        title: 'Inicio',
        description: 'Resumen del contenido registrado en la base de datos.',
    },
    '/admin/projects': {
        title: 'Proyectos',
        description: 'Gestiona proyectos con traducciones y tecnologías asociadas.',
    },
    '/admin/experience': {
        title: 'Experiencia laboral',
        description: 'Empleos mostrados en la sección Experiencia.',
    },
    '/admin/technologies': {
        title: 'Tecnologías',
        description: 'Catálogo usado en proyectos y filtros.',
    },
};

export function getAdminPageMeta(pathname: string) {
    return pageMeta[pathname] ?? { title: ADMIN_BRAND, description: '' };
}
