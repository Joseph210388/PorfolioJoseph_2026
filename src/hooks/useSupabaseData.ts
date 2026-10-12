import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import type { Project, ProjectTranslation, ProjectMedia, Technology, WorkExperience, WorkExperienceTranslation } from '../utils/supabase';

export type Locale = 'es' | 'en';

export type ProjectWithDetails = Project & {
  translations: ProjectTranslation | null;
  technologies: Technology[];
  media: ProjectMedia[];
  categoryName: string | null;
};

export type WorkExperienceWithTranslation = WorkExperience & {
  translations: WorkExperienceTranslation | null;
};

type ProjectListRow = Project & {
  project_translations: ProjectTranslation[] | null;
  project_technologies: { technology_id: number }[] | null;
  project_media: ProjectMedia[] | null;
};

type FetchProjectsOptions = {
  featuredOnly?: boolean;
  status?: Project['status'];
  limit?: number;
};

/**
 * Una consulta anidada + dos lecturas por ids, en vez de 5 peticiones por proyecto
 * (en móvil esas idas y vueltas se notan mucho).
 */
const fetchProjectsWithDetails = async (
  locale: Locale,
  options: FetchProjectsOptions = {},
): Promise<ProjectWithDetails[]> => {
  let query = supabase
    .from('projects')
    .select(
      `
      *,
      project_translations (*),
      project_technologies (technology_id),
      project_media (*)
    `,
    )
    .order('order', { ascending: true });

  if (options.featuredOnly) {
    query = query.eq('featured', true);
  }
  if (options.status) {
    query = query.eq('status', options.status);
  }
  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data: projectsData, error: projectsError } = await query;
  if (projectsError) throw projectsError;

  const rows = (projectsData ?? []) as ProjectListRow[];
  if (rows.length === 0) return [];

  const technologyIds = [
    ...new Set(
      rows.flatMap((row) => row.project_technologies?.map((relation) => relation.technology_id) ?? []),
    ),
  ];
  const categoryIds = [
    ...new Set(rows.map((row) => row.category_id).filter((id): id is number => id != null)),
  ];

  const [{ data: techData, error: techError }, { data: categoryData, error: categoryError }] =
    await Promise.all([
      technologyIds.length
        ? supabase.from('technologies').select('*').in('id', technologyIds)
        : Promise.resolve({ data: [] as Technology[] | null, error: null }),
      categoryIds.length
        ? supabase
            .from('category_translations')
            .select('category_id, name')
            .eq('locale', locale)
            .in('category_id', categoryIds)
        : Promise.resolve({ data: [] as { category_id: number; name: string }[] | null, error: null }),
    ]);

  if (techError) throw techError;
  if (categoryError) throw categoryError;

  const technologiesById = new Map((techData ?? []).map((tech) => [tech.id, tech]));
  const categoryNameById = new Map((categoryData ?? []).map((row) => [row.category_id, row.name]));

  return rows.map((row) => {
    const { project_translations, project_technologies, project_media, ...project } = row;
    const media = [...(project_media ?? [])].sort((a, b) => a.order - b.order);

    return {
      ...project,
      translations: project_translations?.find((item) => item.locale === locale) ?? null,
      technologies: (project_technologies ?? [])
        .map((relation) => technologiesById.get(relation.technology_id))
        .filter((tech): tech is Technology => Boolean(tech)),
      media,
      categoryName: project.category_id != null ? (categoryNameById.get(project.category_id) ?? null) : null,
    };
  });
};

export const useProjects = (locale: Locale) => {
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projectsWithDetails = await fetchProjectsWithDetails(locale);
        setProjects(projectsWithDetails);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching projects');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [locale]);

  return { projects, loading, error };
};

// Hook to fetch work experience with translations
export const useWorkExperience = (locale: Locale) => {
  const [experience, setExperience] = useState<WorkExperienceWithTranslation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperience = async () => {
      try {
        setLoading(true);

        const { data: experienceData, error: experienceError } = await supabase
          .from('work_experience')
          .select('*, work_experience_translations (*)')
          .order('order', { ascending: true });

        if (experienceError) throw experienceError;

        const experienceWithTranslations = (experienceData || []).map((exp) => {
          const { work_experience_translations, ...row } = exp as WorkExperience & {
            work_experience_translations: WorkExperienceTranslation[] | null;
          };
          return {
            ...row,
            translations: work_experience_translations?.find((item) => item.locale === locale) ?? null,
          };
        });

        setExperience(experienceWithTranslations);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching work experience');
        setExperience([]);
      } finally {
        setLoading(false);
      }
    };

    fetchExperience();
  }, [locale]);

  return { experience, loading, error };
};

// Hook to fetch featured projects (for hero or homepage)
export const useFeaturedProjects = (locale: Locale, limit = 3) => {
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedProjects = async () => {
      try {
        setLoading(true);

        const projectsWithDetails = await fetchProjectsWithDetails(locale, {
          featuredOnly: true,
          status: 'finished',
          limit,
        });

        setProjects(projectsWithDetails);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching featured projects');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProjects();
  }, [locale, limit]);

  return { projects, loading, error };
};

// Hook to fetch all technologies
export const useTechnologies = () => {
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTechnologies = async () => {
      try {
        setLoading(true);

        const { data, error: err } = await supabase.from('technologies').select('*');

        if (err) throw err;

        setTechnologies(data || []);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error fetching technologies');
        setTechnologies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTechnologies();
  }, []);

  return { technologies, loading, error };
};
