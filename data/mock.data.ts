import { faker } from '@faker-js/faker';

// ==========================================
// 🏛️ MOCK TYPES
// ==========================================

export type ItemTextFields = { name: string; desc: string; price: string };

// ==========================================
// 🏛️ STATIC MOCKS (Constants)
// ==========================================

export const VISUAL_MOCK: { product: ItemTextFields } = {
  product: {
    name: 'Standardized Product',
    price: '$99.99',
    desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
  },
};

// ==========================================
// 🏛️ DYNAMIC MOCKS (Seeded)
// ==========================================

export const createCheckoutMock = () => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  zipCode: faker.location.zipCode(),
});
