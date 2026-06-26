import type { Locator } from '@playwright/test';
import type { LanguageData } from './i18n/dictionary';

// ==========================================
// 🏛️ I18N DERIVED TYPES
// ==========================================

type Footer = LanguageData['footer'];
export type SocialPlatform = keyof Footer['social'];
export type SocialPlatformData = Footer['social'][SocialPlatform];
export type CheckoutInfoError =
  LanguageData['checkout']['info']['errors'][keyof LanguageData['checkout']['info']['errors']];

// ==========================================
// 🏛️ ITEM TYPES
// ==========================================

export type SortOption = keyof LanguageData['plp']['sort'];
export type SortableLocators = { names: Locator; prices: Locator };
export type SortCriteria = { by: keyof SortableLocators; order: 'asc' | 'desc' };

// ==========================================
// 🏛️ DOMAIN SCHEMA TYPES
// ==========================================

type Branch<T> = T | { readonly [k: string]: T | { readonly [k: string]: T } };
export type LocatorBundle = { readonly [k: string]: Locator | ((...args: never[]) => Locator) };
export type LocatorSchema = Branch<Locator | LocatorBundle | ((...args: never[]) => Locator | LocatorBundle)>;
