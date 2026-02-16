import { en } from './languages/en';

const DICTIONARY = { en };

type Language = keyof typeof DICTIONARY;
type LanguageData = typeof en;

export type SortLabels = LanguageData['plp']['sort'][keyof LanguageData['plp']['sort']];

const currentLang = (process.env.LANGUAGE as Language) || 'en';
const baseBundle = DICTIONARY[currentLang] || DICTIONARY.en;

export const t = new Proxy(baseBundle, {
  get(target, prop: string): any {
    const bundle = target as Record<string, any>;

    if (typeof prop === 'symbol' || prop === 'then') return bundle[prop];

    const value = bundle[prop];

    if (!(prop in bundle)) {
      throw new Error(`[i18n] Translation key missing, key: "${prop}", dictionary: "${currentLang}"`);
    }

    if (value !== null && typeof value === 'object') {
      return new Proxy(value, this);
    }

    return value;
  },
}) as unknown as LanguageData;
