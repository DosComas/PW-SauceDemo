import { DICTIONARY, Language, LanguageData } from './dictionary';

const currentLang = (process.env.LANGUAGE as Language) || 'en';
const baseBundle = DICTIONARY[currentLang] || DICTIONARY.en;

export const t = new Proxy(baseBundle, {
  get(target, prop: string): any {
    if (typeof prop === 'symbol' || prop === 'then') return target[prop];

    const value = target[prop];

    // Check if the property actually exists in the target object
    if (!(prop in target)) {
      throw new Error(`[i18n] Translation Key Missing: "${prop}" does not exist in the current dictionary.`);
    }

    if (value !== null && typeof value === 'object') {
      return new Proxy(value, this);
    }

    return value;
  },
}) as unknown as LanguageData;
