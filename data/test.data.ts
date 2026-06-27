import type { Locator } from '@playwright/test';
import { faker } from '@faker-js/faker';

// ==========================================
// 🏛️ CORE DATA TYPES
// ==========================================

// Core Maps
export type InputMap = { textInput: string; checkbox: boolean; select: string };
export type InjectMap = { textField: string; priceField: number };

// Generic Schema
export type ConfigSchema<M> = { readonly key: string; readonly type: keyof M };

// Factory Types
export type LocatorsOf<M, T extends readonly ConfigSchema<M>[]> = { readonly [F in T[number] as F['key']]: Locator };
export type DataOf<M, T extends readonly ConfigSchema<M>[]> = { [F in T[number] as F['key']]: M[F['type']] };

// ==========================================
// 🏛️ LOGIN CONFIG
// ==========================================

export type LoginLocators = LocatorsOf<InputMap, typeof loginConfig>;
export type LoginData = DataOf<InputMap, typeof loginConfig>;

export const loginConfig = [
  { key: 'username', type: 'textInput' },
  { key: 'password', type: 'textInput' },
] as const satisfies readonly ConfigSchema<InputMap>[];

// ==========================================
// 🏛️ STATIC ITEM MOCK DATA
// ==========================================

export type ItemLocators = LocatorsOf<InjectMap, typeof itemConfig>;
export type ItemData = DataOf<InjectMap, typeof itemConfig>;

const itemConfig = [
  { key: 'name', type: 'textField' },
  { key: 'desc', type: 'textField' },
  { key: 'price', type: 'priceField' },
] as const satisfies readonly ConfigSchema<InjectMap>[];

export const sampleItem = {
  config: itemConfig,
  data: {
    name: 'Standardized Product',
    price: 99.99,
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  } as const satisfies ItemData,
};

// ==========================================
// 🏛️ DYNAMIC CHECKOUT INPUT DATA
// ==========================================

export type CheckoutInfoLocators = LocatorsOf<InputMap, typeof checkoutInfoConfig>;
export type CheckoutInfoData = DataOf<InputMap, typeof checkoutInfoConfig>;

const checkoutInfoConfig = [
  { key: 'firstName', type: 'textInput' },
  { key: 'lastName', type: 'textInput' },
  { key: 'zipCode', type: 'textInput' },
] as const satisfies readonly ConfigSchema<InputMap>[];

export const checkoutInfo = {
  config: checkoutInfoConfig,
  generate: (): CheckoutInfoData => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    zipCode: faker.location.zipCode(),
  }),
} as const;

// ==========================================
// 🏛️ STATIC CHECKOUT MOCK DATA
// ==========================================

export type CheckoutTotalsLocators = LocatorsOf<InjectMap, typeof checkoutTotalsConfig>;
export type CheckoutTotalsData = DataOf<InjectMap, typeof checkoutTotalsConfig>;

const checkoutTotalsConfig = [
  { key: 'itemTotal', type: 'priceField' },
  { key: 'tax', type: 'priceField' },
  { key: 'total', type: 'priceField' },
] as const satisfies readonly ConfigSchema<InjectMap>[];

export const checkoutTotals = {
  config: checkoutTotalsConfig,
  data: {
    itemTotal: 189.98,
    tax: 15.2,
    total: 205.18,
  } as const satisfies CheckoutTotalsData,
};
