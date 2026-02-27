import type { Locator } from '@playwright/test';
import { faker } from '@faker-js/faker';

// ==========================================
// 🏛️ CORE DATA TYPES
// ==========================================

type TypeMap = { text: string; checkbox: boolean; select: string };
type FieldConfig = { readonly key: string; readonly type: 'text' | 'checkbox' | 'select' };
type LocatorsFromConfig<T extends readonly FieldConfig[]> = { readonly [F in T[number] as F['key']]: Locator };
type DataFromConfig<T extends readonly FieldConfig[]> = { [F in T[number] as F['key']]: TypeMap[F['type']] };

// ==========================================
// 🏛️ STATIC ITEM DATA
// ==========================================

export type ItemLocators = LocatorsFromConfig<typeof itemConfig>;
export type ItemData = DataFromConfig<typeof itemConfig>;

const itemConfig = [
  { key: 'name', type: 'text' },
  { key: 'desc', type: 'text' },
  { key: 'price', type: 'text' },
] as const;

export const sampleItem = {
  config: itemConfig,
  data: {
    name: 'Standardized Product',
    price: '$99.99',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  } as const satisfies ItemData,
};

// ==========================================
// 🏛️ DYNAMIC CHECKOUT DATA
// ==========================================

export type CheckoutLocators = LocatorsFromConfig<typeof checkoutConfig>;
export type CheckoutData = DataFromConfig<typeof checkoutConfig>;

const checkoutConfig = [
  { key: 'firstName', type: 'text' },
  { key: 'lastName', type: 'text' },
  { key: 'zipCode', type: 'text' },
] as const;

export const checkout = {
  config: checkoutConfig,
  generate: (): CheckoutData => ({
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    zipCode: faker.location.zipCode(),
  }),
} as const;
