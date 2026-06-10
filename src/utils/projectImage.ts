import type { ProjectWithDetails } from '../hooks/useSupabaseData';

const PLACEHOLDER = 'https://via.placeholder.com/800x450?text=Project+Image';

/** Imágenes ordenadas por `order` (galería completa del proyecto). */
export function getOrderedProjectImages(project: ProjectWithDetails): string[] {
    if (!project.media.length) return [];
    return [...project.media]
        .sort((a, b) => a.order - b.order)
        .map((m) => m.url)
        .filter(Boolean);
}

export function getProjectImageUrl(project: ProjectWithDetails): string {
    const thumbnail = project.media.find((media) => media.is_thumbnail);
    return thumbnail?.url || project.media[0]?.url || PLACEHOLDER;
}
