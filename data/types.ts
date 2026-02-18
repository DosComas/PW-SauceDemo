import type { Locator } from '@playwright/test';
import type { LanguageData } from './i18n/dictionary';
import { STATE_KEYS } from './session.data';

// ==========================================
// 🏛️ I18N DERIVED TYPES
// ==========================================
type PLP = LanguageData['plp'];
type Footer = LanguageData['footer'];

export type SortOption = PLP['sort'][keyof PLP['sort']];
export type SocialPlatform = keyof Footer['social'];
export type SocialPlatformData = Footer['social'][SocialPlatform];

// ==========================================
// 🏛️ SESSION DERIVED TYPES
// ==========================================

export type StateKeys = (typeof STATE_KEYS)[keyof typeof STATE_KEYS];

// ==========================================
// 🏛️ ITEM TYPES
// ==========================================

export type ItemData = { name: string; desc: string; price: string; imgSrc?: string };
export type ItemLocators = { name: Locator; desc: Locator; price: Locator; img?: Locator };
export type SortableLocators = { names: Locator; prices: Locator };
export type SortCriteria = { by: keyof SortableLocators; order: 'asc' | 'desc' };
