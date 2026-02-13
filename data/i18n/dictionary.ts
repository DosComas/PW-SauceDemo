import { en } from './languages/en';

export const DICTIONARY = { en };

export type Language = keyof typeof DICTIONARY;
export type LanguageData = typeof en;
