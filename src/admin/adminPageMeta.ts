export const ADMIN_BRAND = 'Admin Portfolio';

const pageMeta: Record<string, { title: string; description: string }> = {
    '/admin/dashboard': {
        title: 'Inicio',
        description: 'Resumen del contenido, CV del portfolio y accesos rápidos.',
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
    '/admin/settings': {
        title: 'Configuración',
        description: 'Perfil, correo público, disponibilidad, ubicación y redes.',
    },
};

export function getAdminPageMeta(pathname: string) {
    return pageMeta[pathname] ?? { title: ADMIN_BRAND, description: '' };
}
