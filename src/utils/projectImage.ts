import type { ProjectWithDetails } from '../hooks/useSupabaseData';

export function getProjectImageUrl(project: ProjectWithDetails): string {
    const thumbnail = project.media.find((media) => media.is_thumbnail);
    return thumbnail?.url || project.media[0]?.url || 'https://via.placeholder.com/800x450?text=Project+Image';
}
