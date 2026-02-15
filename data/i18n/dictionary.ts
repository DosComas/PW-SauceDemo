import { en } from './languages/en';

const DICTIONARY = { en };

type Language = keyof typeof DICTIONARY;
type LanguageData = typeof en;

export type SortLabels = LanguageData['catalog']['sort'][keyof LanguageData['catalog']['sort']];

const currentLang = (process.env.LANGUAGE as Language) || 'en';
const baseBundle = DICTIONARY[currentLang] || DICTIONARY.en;

/**
 * The 't' proxy provides type-safe, runtime-checked access to translations.
 * It will throw an explicit error if a key is missing.
 */
export const t = new Proxy(baseBundle, {
  get(target, prop: string): any {
    if (typeof prop === 'symbol' || prop === 'then') return target[prop];

    const value = target[prop];

    if (!(prop in target)) {
      throw new Error(`[i18n] Translation Key Missing: "${prop}" does not exist in the current dictionary.`);
    }

    if (value !== null && typeof value === 'object') {
      return new Proxy(value, this);
    }

    return value;
  },
}) as unknown as LanguageData;
