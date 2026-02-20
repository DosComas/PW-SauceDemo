import { faker } from '@faker-js/faker';
import { ItemData } from './types';

// ==========================================
// 🏛️ STATIC MOCKS
// ==========================================

export const VISUAL_MOCK = {
  item: {
    name: 'Standardized Product',
    price: '$99.99',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
} as const satisfies { item: ItemData };

// ==========================================
// 🏛️ DYNAMIC MOCKS
// ==========================================

export const createCheckoutMock = () => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  zipCode: faker.location.zipCode(),
});
