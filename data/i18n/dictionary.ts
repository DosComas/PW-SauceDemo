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

const handler: ProxyHandler<LanguageData> = {
  get(target, prop, receiver) {
    if (typeof prop === 'symbol' || prop === 'then') return Reflect.get(target, prop, receiver);

    if (!(prop in target)) throw new Error(`[i18n] Missing path, "t.${String(prop)}", language: "${activeLang}"`);

    const value = Reflect.get(target, prop, receiver);
    if (value !== null && typeof value === 'object') return new Proxy(value as LanguageData, handler);

    return value;
  },
};

// ==========================================
// 🏛️ DOMAIN TRANSLATIONS (t)
// ==========================================

export const t: LanguageData = new Proxy(baseBundle, handler);
