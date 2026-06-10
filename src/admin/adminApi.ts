import { supabase } from '../utils/supabase';
import type { Locale } from '../i18n/translations';
import type { Project, ProjectTranslation, Technology, WorkExperienceTranslation } from '../utils/supabase';

export type LocalePair = { es: string; en: string };

/** Fila editable de `project_media` en el formulario del admin */
export type ProjectMediaFormItem = {
    clientId: string;
    url: string;
    is_thumbnail: boolean;
};

export type ProjectFormData = {
    status: Project['status'];
    featured: boolean;
    github_url: string;
    live_url: string;
    /** Galería del proyecto (tabla `project_media`) */
    media: ProjectMediaFormItem[];
    order: number;
    category_id: number | null;
    name: LocalePair;
    description: LocalePair;
    technology_ids: number[];
};

export type ExperienceFormData = {
    company: string;
    company_url: string;
    date_start: string;
    date_end: string;
    order: number;
    title: LocalePair;
    tasks: LocalePair;
};

export type TechnologyFormData = {
    name: string;
    icon_url: string;
    color: string;
};

async function upsertTranslation<T extends { id?: number }>(
    table: string,
    match: Record<string, string | number>,
    payload: Record<string, unknown>,
) {
    const { data: existing, error: findError } = await supabase
        .from(table)
        .select('id')
        .match(match)
        .maybeSingle();

    if (findError) throw findError;

    if (existing?.id) {
        const { error } = await supabase.from(table).update(payload).eq('id', existing.id);
        if (error) throw error;
        return;
    }

    const { error } = await supabase.from(table).insert({ ...match, ...payload });
    if (error) throw error;
}

type AdminProjectRowFromDb = Project & {
    project_translations: ProjectTranslation[] | null;
    project_technologies: { technology_id: number }[] | null;
    project_media: { id: number; url: string; is_thumbnail: boolean; order: number }[] | null;
};

export async function fetchAdminProjects() {
    const { data: projects, error } = await supabase
        .from('projects')
        .select(
            `
            *,
            project_translations (*),
            project_technologies (technology_id),
            project_media (id, url, is_thumbnail, order)
        `,
        )
        .order('order', { ascending: true });

    if (error) throw error;

    return (projects ?? []).map((raw) => {
        const row = raw as AdminProjectRowFromDb;
        const { project_translations, project_technologies, project_media, ...project } = row;

        const translations = project_translations ?? [];
        const byLocale = (locale: Locale) => translations.find((t) => t.locale === locale) ?? null;
        const media = [...(project_media ?? [])].sort((a, b) => a.order - b.order);

        return {
            ...project,
            translationsEs: byLocale('es'),
            translationsEn: byLocale('en'),
            technology_ids: project_technologies?.map((t) => t.technology_id) ?? [],
            media: media.map((m) => ({
                clientId: `media-${m.id}`,
                url: m.url,
                is_thumbnail: m.is_thumbnail,
            })),
        };
    });
}

export async function saveProject(id: number | null, form: ProjectFormData) {
    const projectPayload = {
        status: form.status,
        featured: form.featured,
        github_url: form.github_url || null,
        live_url: form.live_url || null,
        order: form.order,
        category_id: form.category_id,
    };

    let projectId = id;

    if (projectId) {
        const { error } = await supabase.from('projects').update(projectPayload).eq('id', projectId);
        if (error) throw error;
    } else {
        const { data, error } = await supabase.from('projects').insert(projectPayload).select('id').single();
        if (error) throw error;
        projectId = data.id;
    }

    await Promise.all(
        (['es', 'en'] as const).map((locale) =>
            upsertTranslation('project_translations', { project_id: projectId!, locale }, {
                name: form.name[locale],
                description: form.description[locale],
                long_description: null,
            }),
        ),
    );

    await supabase.from('project_technologies').delete().eq('project_id', projectId!);

    if (form.technology_ids.length > 0) {
        const { error } = await supabase.from('project_technologies').insert(
            form.technology_ids.map((technology_id) => ({ project_id: projectId!, technology_id })),
        );
        if (error) throw error;
    }

    await saveProjectMedia(projectId!, form.media);

    return projectId!;
}

/** Reemplaza todas las filas de `project_media` del proyecto según el formulario. */
async function saveProjectMedia(projectId: number, items: ProjectMediaFormItem[]) {
    const cleaned = items.map((m) => ({ ...m, url: m.url.trim() })).filter((m) => m.url.length > 0);

    let normalized = cleaned;
    if (cleaned.length > 0) {
        const thumbIndex = cleaned.findIndex((m) => m.is_thumbnail);
        const thumbnailIdx = thumbIndex >= 0 ? thumbIndex : 0;
        normalized = cleaned.map((m, i) => ({
            ...m,
            is_thumbnail: i === thumbnailIdx,
        }));
    }

    const { error: deleteError } = await supabase.from('project_media').delete().eq('project_id', projectId);
    if (deleteError) throw deleteError;

    if (normalized.length === 0) return;

    const { error: insertError } = await supabase.from('project_media').insert(
        normalized.map((m, index) => ({
            project_id: projectId,
            type: 'image' as const,
            url: m.url,
            order: index,
            is_thumbnail: m.is_thumbnail,
        })),
    );
    if (insertError) throw insertError;
}

export async function updateProjectsOrder(orderedIds: number[]) {
    const updates = orderedIds.map((id, index) =>
        supabase.from('projects').update({ order: index }).eq('id', id),
    );
    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);
    if (failed?.error) throw failed.error;
}

export async function deleteProject(id: number) {
    await supabase.from('project_technologies').delete().eq('project_id', id);
    await supabase.from('project_translations').delete().eq('project_id', id);
    await supabase.from('project_media').delete().eq('project_id', id);
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
}

export async function fetchAdminExperience() {
    const { data, error } = await supabase.from('work_experience').select('*').order('order', { ascending: true });
    if (error) throw error;

    return Promise.all(
        (data ?? []).map(async (exp) => {
            const { data: translations } = await supabase
                .from('work_experience_translations')
                .select('*')
                .eq('experience_id', exp.id);

            return {
                ...exp,
                translationsEs: translations?.find((t) => t.locale === 'es') ?? null,
                translationsEn: translations?.find((t) => t.locale === 'en') ?? null,
            };
        }),
    );
}

function tasksFromText(text: string): string[] {
    return text
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean);
}

export async function saveExperience(id: number | null, form: ExperienceFormData) {
    const payload = {
        company: form.company,
        company_url: form.company_url || null,
        date_start: form.date_start,
        date_end: form.date_end || null,
        order: form.order,
    };

    let experienceId = id;

    if (experienceId) {
        const { error } = await supabase.from('work_experience').update(payload).eq('id', experienceId);
        if (error) throw error;
    } else {
        const { data, error } = await supabase.from('work_experience').insert(payload).select('id').single();
        if (error) throw error;
        experienceId = data.id;
    }

    await Promise.all(
        (['es', 'en'] as const).map((locale) =>
            upsertTranslation('work_experience_translations', { experience_id: experienceId!, locale }, {
                title: form.title[locale],
                tasks: tasksFromText(form.tasks[locale]),
            }),
        ),
    );

    return experienceId!;
}

export async function updateExperienceOrder(orderedIds: number[]) {
    const updates = orderedIds.map((id, index) =>
        supabase.from('work_experience').update({ order: index }).eq('id', id),
    );
    const results = await Promise.all(updates);
    const failed = results.find((r) => r.error);
    if (failed?.error) throw failed.error;
}

export async function deleteExperience(id: number) {
    await supabase.from('work_experience_translations').delete().eq('experience_id', id);
    const { error } = await supabase.from('work_experience').delete().eq('id', id);
    if (error) throw error;
}

export async function fetchAdminTechnologies() {
    const { data, error } = await supabase.from('technologies').select('*').order('id', { ascending: true });
    if (error) throw error;
    return data ?? [];
}

export async function saveTechnology(id: number | null, form: TechnologyFormData) {
    const payload = {
        name: form.name,
        icon_url: form.icon_url || null,
        color: form.color || null,
    };

    if (id) {
        const { error } = await supabase.from('technologies').update(payload).eq('id', id);
        if (error) throw error;
        return id;
    }

    const { data, error } = await supabase.from('technologies').insert(payload).select('id').single();
    if (error) throw error;
    return data.id;
}

export async function deleteTechnology(id: number) {
    const { error } = await supabase.from('technologies').delete().eq('id', id);
    if (error) throw error;
}

export async function fetchCategories() {
    const { data, error } = await supabase.from('categories').select('id, slug');
    if (error) throw error;
    return data ?? [];
}

export type AdminDashboardStats = {
    projectsTotal: number;
    projectsFinished: number;
    projectsInProgress: number;
    projectsPaused: number;
    projectsFeatured: number;
    technologiesTotal: number;
    experienceTotal: number;
    categoriesTotal: number;
    recentProjects: { id: number; name: string; status: Project['status']; featured: boolean }[];
};

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
    const [projects, technologies, experience, categories] = await Promise.all([
        fetchAdminProjects(),
        fetchAdminTechnologies(),
        fetchAdminExperience(),
        fetchCategories(),
    ]);

    return {
        projectsTotal: projects.length,
        projectsFinished: projects.filter((p) => p.status === 'finished').length,
        projectsInProgress: projects.filter((p) => p.status === 'in_progress').length,
        projectsPaused: projects.filter((p) => p.status === 'paused').length,
        projectsFeatured: projects.filter((p) => p.featured).length,
        technologiesTotal: technologies.length,
        experienceTotal: experience.length,
        categoriesTotal: categories.length,
        recentProjects: projects.slice(0, 5).map((p) => ({
            id: p.id,
            name: p.translationsEs?.name ?? `Proyecto #${p.id}`,
            status: p.status,
            featured: p.featured,
        })),
    };
}

/** Descripción editable en admin: usa `description`; si está vacía, rellena con `long_description` legado. */
export function projectDescriptionToForm(
    es: ProjectTranslation | null,
    en: ProjectTranslation | null,
): LocalePair {
    const pick = (t: ProjectTranslation | null) => {
        const short = t?.description?.trim() ?? '';
        if (short) return short;
        return t?.long_description?.trim() ?? '';
    };
    return { es: pick(es), en: pick(en) };
}

export function translationToForm(
    es: ProjectTranslation | WorkExperienceTranslation | null,
    en: ProjectTranslation | WorkExperienceTranslation | null,
    field: 'name' | 'description' | 'long_description' | 'title' | 'tasks',
): LocalePair {
    if (field === 'tasks') {
        const esTasks = (es as WorkExperienceTranslation | null)?.tasks?.join('\n') ?? '';
        const enTasks = (en as WorkExperienceTranslation | null)?.tasks?.join('\n') ?? '';
        return { es: esTasks, en: enTasks };
    }
    return {
        es: (es as ProjectTranslation | WorkExperienceTranslation | null)?.[field as 'name']?.toString() ?? '',
        en: (en as ProjectTranslation | WorkExperienceTranslation | null)?.[field as 'name']?.toString() ?? '',
    };
}
