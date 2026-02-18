import type { Locator } from '@playwright/test';
import type { LanguageData } from './i18n/dictionary';
import { STATE_KEYS } from './session.data';

// ==========================================
// 🏛️ I18N DERIVED TYPES
// ==========================================

export type SortOption = LanguageData['plp']['sort'][keyof LanguageData['plp']['sort']];
export type SocialPlatform = keyof LanguageData['footer']['social'];
export type SocialPlatformData = LanguageData['footer']['social'][SocialPlatform];

// ==========================================
// 🏛️ SESSION TYPES
// ==========================================

export type StateKey = (typeof STATE_KEYS)[keyof typeof STATE_KEYS];

// ==========================================
// 🏛️ ITEM TYPES
// ==========================================

export type ItemData = { name: string; desc: string; price: string; imgSrc?: string };
export type ItemLocators = { name: Locator; desc: Locator; price: Locator; img?: Locator };
export type SortableLocators = { names: Locator; prices: Locator };
export type SortCriteria = { by: 'price' | 'name'; order: 'asc' | 'desc' };
