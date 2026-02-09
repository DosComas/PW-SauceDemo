import { DICTIONARY, TranslationKey, Language } from '../data/dictionary.ts';

const currentLang = (process.env.LANGUAGE as Language) || 'en';

function translate(key: TranslationKey): string {
  return DICTIONARY[key][currentLang];
}

export const t = translate;
