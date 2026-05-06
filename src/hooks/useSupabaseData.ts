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

const fetchProjectDetails = async (project: Project, locale: Locale): Promise<ProjectWithDetails> => {
  const { data: translation } = await supabase
    .from('project_translations')
    .select('*')
    .eq('project_id', project.id)
    .eq('locale', locale)
    .maybeSingle();

  const { data: techRelations, error: techRelationError } = await supabase
    .from('project_technologies')
    .select('technology_id')
    .eq('project_id', project.id);

  if (techRelationError) {
    throw techRelationError;
  }

  const technologyIds = techRelations?.map((relation: any) => relation.technology_id) || [];
  const { data: techData, error: techDataError } = technologyIds.length
    ? await supabase.from('technologies').select('*').in('id', technologyIds)
    : { data: [] as Technology[] | null, error: null };

  if (techDataError) {
    throw techDataError;
  }

  const { data: mediaData, error: mediaError } = await supabase
    .from('project_media')
    .select('*')
    .eq('project_id', project.id)
    .order('order', { ascending: true });

  if (mediaError) {
    throw mediaError;
  }

  const { data: categoryData } = await supabase
    .from('category_translations')
    .select('name')
    .eq('category_id', project.category_id)
    .eq('locale', locale)
    .maybeSingle();

  return {
    ...project,
    translations: translation || null,
    technologies: techData || [],
    media: mediaData || [],
    categoryName: categoryData?.name || null,
  };
};

// Hook to fetch projects with their translations and technologies
export const useProjects = (locale: Locale) => {
  const [projects, setProjects] = useState<ProjectWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);

        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .order('order', { ascending: true });

        console.debug('Supabase projects response', { projectsData, projectsError });

        if (projectsError) throw projectsError;

        const projectsWithDetails = await Promise.all(
          (projectsData || []).map(async (project) => fetchProjectDetails(project, locale))
        );

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
          .select('*')
          .order('order', { ascending: true });

        if (experienceError) throw experienceError;

        const experienceWithTranslations = await Promise.all(
          (experienceData || []).map(async (exp) => {
            const { data: translation } = await supabase
              .from('work_experience_translations')
              .select('*')
              .eq('experience_id', exp.id)
              .eq('locale', locale)
              .maybeSingle();

            return {
              ...exp,
              translations: translation || null,
            };
          })
        );

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

        const { data: projectsData, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .eq('featured', true)
          .eq('status', 'finished')
          .order('order', { ascending: true })
          .limit(limit);

        if (projectsError) throw projectsError;

        const projectsWithDetails = await Promise.all(
          (projectsData || []).map(async (project) => fetchProjectDetails(project, locale))
        );

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
