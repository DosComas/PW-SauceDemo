import type { Locator } from '@playwright/test';
import type { LanguageData } from './i18n/dictionary';
import { STATE_KEYS } from './session.data';

// ==========================================
// 🏛️ I18N DERIVED TYPES
// ==========================================

type PLP = LanguageData['plp'];
type Footer = LanguageData['footer'];

export type SocialPlatform = keyof Footer['social'];
export type SocialPlatformData = Footer['social'][SocialPlatform];

// ==========================================
// 🏛️ SESSION DERIVED TYPES
// ==========================================

export type StateKeys = (typeof STATE_KEYS)[keyof typeof STATE_KEYS];

// ==========================================
// 🏛️ ITEM TYPES
// ==========================================

export type SortOption = keyof PLP['sort'];
export type SortableLocators = { names: Locator; prices: Locator };
export type SortCriteria = { by: keyof SortableLocators; order: 'asc' | 'desc' };

// ==========================================
// 🏛️ DOMAIN SCHEMA TYPES
// ==========================================

type Branch<T> = T | { readonly [k: string]: T | { readonly [k: string]: T } };
export type LocatorBundle = { readonly [k: string]: Locator | ((...args: never[]) => Locator) };
export type LocatorSchema = Branch<Locator | LocatorBundle | ((...args: never[]) => Locator | LocatorBundle)>;
