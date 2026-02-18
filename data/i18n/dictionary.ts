import { EN } from './languages/en';

// ==========================================
// 🏛️ TRANSLATION TYPES
// ==========================================

type Languages = keyof typeof DICTIONARY;
export type LanguageData = typeof EN;

// ==========================================
// 🏛️ I18N ENGINE
// ==========================================

const DICTIONARY = { EN };

const requestedLang = process.env.LANGUAGE as Languages;
const activeLang = DICTIONARY[requestedLang] ? requestedLang : 'EN';
const baseBundle = DICTIONARY[activeLang];

export const t = new Proxy(baseBundle, {
  get(target, prop: string): any {
    const bundle = target as Record<string, any>;

    if (typeof prop === 'symbol' || prop === 'then') return bundle[prop];

    if (!(prop in bundle)) throw new Error(`[i18n] Missing path: "t.${prop}", language: "${activeLang}"`);

    const value = bundle[prop];
    if (value !== null && typeof value === 'object') return new Proxy(value, this);

    return value;
  },
}) as unknown as LanguageData;
