import {
    DEFAULT_ADMIN_PAGE_SIZE,
    escapeIlikePattern,
    paginateRange,
    type AdminListParams,
    type AdminPaginatedResult,
} from './adminListTypes';
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

/** Mensaje usable a partir de un error de PostgREST (a veces no es `instanceof Error`). */
export function formatAdminError(err: unknown, fallback: string): string {
    if (err && typeof err === 'object') {
        const e = err as { message?: string; details?: string; hint?: string; code?: string };
        const parts = [e.message, e.details, e.hint].filter(
            (part): part is string => typeof part === 'string' && part.trim().length > 0,
        );
        if (parts.length > 0) {
            return e.code ? `${parts.join(' — ')} (${e.code})` : parts.join(' — ');
        }
    }
    if (err instanceof Error && err.message.trim()) return err.message;
    return fallback;
}

function throwDbError(
    error: { message?: string; details?: string; hint?: string; code?: string } | null,
    fallback: string,
) {
    if (!error) return;
    throw new Error(formatAdminError(error, fallback));
}

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

export type AdminProjectListItem = ReturnType<typeof mapAdminProjectRow>;

function mapAdminProjectRow(raw: AdminProjectRowFromDb) {
    const { project_translations, project_technologies, project_media, ...project } = raw;

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
}

const PROJECT_LIST_SELECT = `
    *,
    project_translations (*),
    project_technologies (technology_id),
    project_media (id, url, is_thumbnail, order)
`;

const PROJECT_LIST_SELECT_SEARCH = `
    *,
    project_translations!inner (*),
    project_technologies (technology_id),
    project_media (id, url, is_thumbnail, order)
`;

export type AdminProjectsListParams = AdminListParams & {
    status?: 'all' | Project['status'];
};

export async function fetchAdminProjectsPaginated(
    params: AdminProjectsListParams = { page: 1, pageSize: DEFAULT_ADMIN_PAGE_SIZE },
): Promise<AdminPaginatedResult<AdminProjectListItem>> {
    const page = Math.max(1, params.page);
    const pageSize = params.pageSize;
    const { from, to } = paginateRange(page, pageSize);
    const term = params.search?.trim();
    const pattern = term ? `%${escapeIlikePattern(term)}%` : null;

    let query = supabase
        .from('projects')
        .select(term ? PROJECT_LIST_SELECT_SEARCH : PROJECT_LIST_SELECT, { count: 'exact' })
        .order('order', { ascending: true });

    if (params.status && params.status !== 'all') {
        query = query.eq('status', params.status);
    }

    if (pattern) {
        query = query.ilike('project_translations.name', pattern);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    return {
        items: (data ?? []).map((row) => mapAdminProjectRow(row as AdminProjectRowFromDb)),
        total: count ?? 0,
        page,
        pageSize,
    };
}

/** Solo ids ordenados (reordenar filas sin cargar relaciones). */
export async function fetchProjectsOrderIds(): Promise<number[]> {
    const { data, error } = await supabase.from('projects').select('id').order('order', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) => row.id);
}

/** Listado completo de tecnologías para selects del formulario (tabla pequeña). */
export async function fetchTechnologyOptions(): Promise<Technology[]> {
    const { data, error } = await supabase.from('technologies').select('*').order('name', { ascending: true });
    if (error) throw error;
    return data ?? [];
}

export async function saveProject(
    id: number | null,
    form: ProjectFormData,
): Promise<{ id: number; warning: string | null }> {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
        throw new Error('La sesión ha caducado. Vuelve a iniciar sesión para guardar.');
    }

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
        throwDbError(error, 'No se pudo actualizar el proyecto');
    } else {
        const { data, error } = await supabase.from('projects').insert(projectPayload).select('id').single();
        throwDbError(error, 'No se pudo crear el proyecto');
        if (!data?.id) throw new Error('No se pudo crear el proyecto');
        projectId = data.id;
    }

    await Promise.all(
        (['es', 'en'] as const).map((locale) => {
            const name = form.name[locale].trim() || form.name.es.trim();
            const description = form.description[locale].trim() || form.description.es.trim();
            return upsertTranslation('project_translations', { project_id: projectId!, locale }, {
                name,
                description,
                // La ficha pública lee primero long_description; lo igualamos para que el texto del admin se vea.
                long_description: description,
            });
        }),
    );

    const mediaWarning = await saveProjectMedia(projectId!, form.media);
    const technologiesWarning = await syncProjectTechnologies(projectId!, form.technology_ids);
    const warning = [mediaWarning, technologiesWarning].filter(Boolean).join(' ');

    return { id: projectId!, warning: warning || null };
}

function isRlsDenied(error: { code?: string; message?: string } | null): boolean {
    if (!error) return false;
    return error.code === '42501' || /row-level security|permission denied/i.test(error.message ?? '');
}

const TECHNOLOGIES_RLS_WARNING =
    'Las tecnologías no se guardaron (RLS en project_technologies).';
const MEDIA_RLS_WARNING =
    'Las imágenes no se guardaron (RLS en project_media).';

/** Solo inserta/borra el diff. Si RLS lo impide, no tira abajo el resto del guardado. */
async function syncProjectTechnologies(projectId: number, technologyIds: number[]): Promise<string | null> {
    const uniqueIds = [...new Set(technologyIds.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0))];
    const { data: existing, error: selectError } = await supabase
        .from('project_technologies')
        .select('technology_id')
        .eq('project_id', projectId);
    if (isRlsDenied(selectError)) return TECHNOLOGIES_RLS_WARNING;
    throwDbError(selectError, 'No se pudieron leer las tecnologías del proyecto');

    const current = new Set((existing ?? []).map((row) => Number(row.technology_id)));
    const toInsert = uniqueIds.filter((id) => !current.has(id));
    const toDelete = [...current].filter((id) => !uniqueIds.includes(id));

    if (toInsert.length > 0) {
        const { error } = await supabase.from('project_technologies').insert(
            toInsert.map((technology_id) => ({ project_id: projectId, technology_id })),
        );
        if (isRlsDenied(error)) return TECHNOLOGIES_RLS_WARNING;
        throwDbError(
            error,
            'No se pudieron guardar las tecnologías. Falta permiso de escritura en project_technologies.',
        );
    }

    if (toDelete.length > 0) {
        const { error } = await supabase
            .from('project_technologies')
            .delete()
            .eq('project_id', projectId)
            .in('technology_id', toDelete);
        if (isRlsDenied(error)) return TECHNOLOGIES_RLS_WARNING;
        throwDbError(error, 'No se pudieron quitar tecnologías del proyecto');
    }

    return null;
}

/** Reemplaza `project_media` solo si cambió. Si RLS bloquea, no tira abajo el resto. */
async function saveProjectMedia(projectId: number, items: ProjectMediaFormItem[]): Promise<string | null> {
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

    const { data: existing, error: selectError } = await supabase
        .from('project_media')
        .select('url, order, is_thumbnail')
        .eq('project_id', projectId)
        .order('order', { ascending: true });
    if (isRlsDenied(selectError)) return MEDIA_RLS_WARNING;
    throwDbError(selectError, 'No se pudieron leer las imágenes del proyecto');

    const current = (existing ?? []).map((row) => ({
        url: String(row.url ?? '').trim(),
        order: Number(row.order),
        is_thumbnail: Boolean(row.is_thumbnail),
    }));
    const next = normalized.map((m, index) => ({
        url: m.url,
        order: index,
        is_thumbnail: m.is_thumbnail,
    }));
    const unchanged =
        current.length === next.length &&
        current.every((row, index) =>
            row.url === next[index].url &&
            row.order === next[index].order &&
            row.is_thumbnail === next[index].is_thumbnail,
        );
    if (unchanged) return null;

    const { error: deleteError } = await supabase.from('project_media').delete().eq('project_id', projectId);
    if (isRlsDenied(deleteError)) return MEDIA_RLS_WARNING;
    throwDbError(deleteError, 'No se pudieron actualizar las imágenes del proyecto');

    if (normalized.length === 0) return null;

    const { error: insertError } = await supabase.from('project_media').insert(
        normalized.map((m, index) => ({
            project_id: projectId,
            type: 'image' as const,
            url: m.url,
            order: index,
            is_thumbnail: m.is_thumbnail,
        })),
    );
    if (isRlsDenied(insertError)) return MEDIA_RLS_WARNING;
    throwDbError(insertError, 'No se pudieron guardar las imágenes del proyecto');
    return null;
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

type AdminExperienceRowFromDb = {
    id: number;
    company: string;
    company_url: string | null;
    date_start: string;
    date_end: string | null;
    order: number;
    work_experience_translations: WorkExperienceTranslation[] | null;
};

export type AdminExperienceListItem = ReturnType<typeof mapAdminExperienceRow>;

function mapAdminExperienceRow(raw: AdminExperienceRowFromDb) {
    const { work_experience_translations, ...exp } = raw;
    const translations = work_experience_translations ?? [];
    return {
        ...exp,
        translationsEs: translations.find((t) => t.locale === 'es') ?? null,
        translationsEn: translations.find((t) => t.locale === 'en') ?? null,
    };
}

const EXPERIENCE_LIST_SELECT = `*, work_experience_translations (*)`;
const EXPERIENCE_LIST_SELECT_SEARCH = `*, work_experience_translations!inner (*)`;

export async function fetchAdminExperiencePaginated(
    params: AdminListParams = { page: 1, pageSize: DEFAULT_ADMIN_PAGE_SIZE },
): Promise<AdminPaginatedResult<AdminExperienceListItem>> {
    const page = Math.max(1, params.page);
    const pageSize = params.pageSize;
    const { from, to } = paginateRange(page, pageSize);
    const term = params.search?.trim();
    const pattern = term ? `%${escapeIlikePattern(term)}%` : null;

    let query = supabase
        .from('work_experience')
        .select(term ? EXPERIENCE_LIST_SELECT_SEARCH : EXPERIENCE_LIST_SELECT, { count: 'exact' })
        .order('order', { ascending: true });

    if (pattern) {
        query = query.or(`company.ilike.${pattern},work_experience_translations.title.ilike.${pattern}`);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    return {
        items: (data ?? []).map((row) => mapAdminExperienceRow(row as AdminExperienceRowFromDb)),
        total: count ?? 0,
        page,
        pageSize,
    };
}

export async function fetchExperienceOrderIds(): Promise<number[]> {
    const { data, error } = await supabase.from('work_experience').select('id').order('order', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row) => row.id);
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

export async function fetchAdminTechnologiesPaginated(
    params: AdminListParams = { page: 1, pageSize: DEFAULT_ADMIN_PAGE_SIZE },
): Promise<AdminPaginatedResult<Technology>> {
    const page = Math.max(1, params.page);
    const pageSize = params.pageSize;
    const { from, to } = paginateRange(page, pageSize);
    const term = params.search?.trim();
    const pattern = term ? `%${escapeIlikePattern(term)}%` : null;

    let query = supabase.from('technologies').select('*', { count: 'exact' }).order('id', { ascending: true });

    if (pattern) {
        const idFilter = /^\d+$/.test(term!) ? `id.eq.${term},` : '';
        query = query.or(`${idFilter}name.ilike.${pattern},icon_url.ilike.${pattern},color.ilike.${pattern}`);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    return {
        items: data ?? [],
        total: count ?? 0,
        page,
        pageSize,
    };
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

export type AdminCategoryOption = {
    id: number;
    slug: string;
    name: string;
};

export async function fetchCategories(): Promise<AdminCategoryOption[]> {
    const { data, error } = await supabase
        .from('categories')
        .select('id, slug, category_translations(locale, name)')
        .order('id', { ascending: true });
    if (error) throw error;

    type CategoryQueryRow = {
        id: number;
        slug: string;
        category_translations: { locale: string; name: string }[] | null;
    };

    return ((data ?? []) as CategoryQueryRow[]).map((row) => {
        const translations = row.category_translations ?? [];
        const es = translations.find((t) => t.locale === 'es')?.name;
        const en = translations.find((t) => t.locale === 'en')?.name;
        return { id: row.id, slug: row.slug, name: es || en || row.slug };
    });
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

async function countTableRows(
    table: 'projects' | 'technologies' | 'work_experience' | 'categories',
    filter?: { column: string; value: string | boolean },
): Promise<number> {
    let query = supabase.from(table).select('*', { count: 'exact', head: true });
    if (filter) {
        query = query.eq(filter.column, filter.value);
    }
    const { count, error } = await query;
    if (error) throw error;
    return count ?? 0;
}

export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
    const [
        projectsTotal,
        projectsFinished,
        projectsInProgress,
        projectsPaused,
        projectsFeatured,
        technologiesTotal,
        experienceTotal,
        categoriesTotal,
        recentResult,
    ] = await Promise.all([
        countTableRows('projects'),
        countTableRows('projects', { column: 'status', value: 'finished' }),
        countTableRows('projects', { column: 'status', value: 'in_progress' }),
        countTableRows('projects', { column: 'status', value: 'paused' }),
        countTableRows('projects', { column: 'featured', value: true }),
        countTableRows('technologies'),
        countTableRows('work_experience'),
        countTableRows('categories'),
        fetchAdminProjectsPaginated({ page: 1, pageSize: 5 }),
    ]);

    return {
        projectsTotal,
        projectsFinished,
        projectsInProgress,
        projectsPaused,
        projectsFeatured,
        technologiesTotal,
        experienceTotal,
        categoriesTotal,
        recentProjects: recentResult.items.map((p) => ({
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
