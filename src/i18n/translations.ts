import { es } from './translationES';
import { en } from './translationEN';

export const translations = { es, en };

export type Translation = typeof es;
export type Locale = keyof typeof translations;
