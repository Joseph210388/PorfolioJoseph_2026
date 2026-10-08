import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/** true si faltan VITE_SUPABASE_* en `.env` / `.env.local` */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

/**
 * Cliente Supabase. Si no hay env, se usa un placeholder para no romper el import;
 * la UI debe comprobar `isSupabaseConfigured` antes de usarlo.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
);

// Type definitions for database tables
export type Technology = {
  id: number;
  name: string;
  icon_url: string | null;
  color: string | null;
};

export type Category = {
  id: number;
  slug: string;
};

export type CategoryTranslation = {
  id: number;
  category_id: number;
  locale: 'es' | 'en';
  name: string;
};

export type Project = {
  id: number;
  category_id: number | null;
  status: 'finished' | 'in_progress' | 'paused';
  featured: boolean;
  github_url: string | null;
  live_url: string | null;
  order: number;
  created_at: string;
};

export type ProjectTranslation = {
  id: number;
  project_id: number;
  locale: 'es' | 'en';
  name: string;
  description: string;
  long_description: string | null;
};

export type ProjectTechnology = {
  project_id: number;
  technology_id: number;
};

export type ProjectMedia = {
  id: number;
  project_id: number;
  type: 'image' | 'video';
  url: string;
  order: number;
  is_thumbnail: boolean;
};

export type WorkExperience = {
  id: number;
  company: string;
  company_url: string | null;
  date_start: string;
  date_end: string | null;
  order: number;
};

export type WorkExperienceTranslation = {
  id: number;
  experience_id: number;
  locale: 'es' | 'en';
  title: string;
  tasks: string[];
};
