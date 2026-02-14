import { faker } from '@faker-js/faker';
import { AUTH_CONFIG } from './identity.data';
import { t } from '@i18n';

const VALID_USERNAME = process.env.VALID_USERNAME as string;
const VALID_PASSWORD = process.env.VALID_PASSWORD as string;

interface UserPersona {
  role: string;
  user: string;
  pass: string;
}

type TestUserData = {
  valid: (UserPersona & {
    expectAuth: true;
    storageState: string;
    isBaselineUser: boolean;
  })[];
  invalid: (UserPersona & {
    expectAuth: false;
    expectedErrorKey: keyof typeof t.identity.errors;
  })[];
};

const TEST_USERS: TestUserData = {
  valid: [
    {
      role: 'Normal User 👤',
      user: VALID_USERNAME,
      pass: VALID_PASSWORD,
      expectAuth: true,
      storageState: `${AUTH_CONFIG.dir}/normal_user.json`,
      isBaselineUser: true,
    },
    {
      role: 'Problem User ⚠️',
      user: 'problem_user',
      pass: VALID_PASSWORD,
      expectAuth: true,
      storageState: `${AUTH_CONFIG.dir}/problem_user.json`,
      isBaselineUser: false,
    },
    {
      role: 'Error User 💣',
      user: 'error_user',
      pass: VALID_PASSWORD,
      expectAuth: true,
      storageState: `${AUTH_CONFIG.dir}/error_user.json`,
      isBaselineUser: false,
    },
    {
      role: 'Visual User 👁️',
      user: 'visual_user',
      pass: VALID_PASSWORD,
      expectAuth: true,
      storageState: `${AUTH_CONFIG.dir}/visual_user.json`,
      isBaselineUser: false,
    },
  ],
  invalid: [
    {
      role: 'Invalid Password User 🔑',
      user: VALID_USERNAME,
      pass: 'wrong_sauce',
      expectAuth: false,
      expectedErrorKey: 'unauthorized',
    },
    {
      role: 'Invalid Username User 🎭',
      user: 'ghost_user',
      pass: VALID_PASSWORD,
      expectAuth: false,
      expectedErrorKey: 'unauthorized',
    },
    {
      role: 'Locked Out User 🔒',
      user: 'locked_out_user',
      pass: VALID_PASSWORD,
      expectAuth: false,
      expectedErrorKey: 'lockedOut',
    },
  ],
} as const;

export const VALID_USERS = TEST_USERS.valid;
export const INVALID_USERS = TEST_USERS.invalid;
export const BASELINE_USERS = VALID_USERS.filter((u) => u.isBaselineUser);

export const createCheckoutData = () => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  zipCode: faker.location.zipCode(),
});
