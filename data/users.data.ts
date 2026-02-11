import { faker } from '@faker-js/faker';
import { TranslationKey } from './dictionary.data';

const VALID_USERNAME = process.env.VALID_USERNAME as string;
const VALID_PASSWORD = process.env.VALID_PASSWORD as string;
const AUTH_DIR = '.auth';

interface UserPersona {
  role: string;
  user: string;
  pass: string;
}

type TestUserData = {
  valid: (UserPersona & { expectAuth: true; storageState: string; isBaselineUser: boolean })[];
  invalid: (UserPersona & { expectAuth: false; expectedError: TranslationKey })[];
};

const TEST_USERS: TestUserData = {
  valid: [
    {
      role: 'Normal User 👤',
      user: VALID_USERNAME,
      pass: VALID_PASSWORD,
      expectAuth: true,
      storageState: `${AUTH_DIR}/normal_user.json`,
      isBaselineUser: true,
    },
    {
      role: 'Problem User ⚠️',
      user: 'problem_user',
      pass: VALID_PASSWORD,
      expectAuth: true,
      storageState: `${AUTH_DIR}/problem_user.json`,
      isBaselineUser: false,
    },
    {
      role: 'Error User 💣',
      user: 'error_user',
      pass: VALID_PASSWORD,
      expectAuth: true,
      storageState: `${AUTH_DIR}/error_user.json`,
      isBaselineUser: false,
    },
    {
      role: 'Visual User 👁️',
      user: 'visual_user',
      pass: VALID_PASSWORD,
      expectAuth: true,
      storageState: `${AUTH_DIR}/visual_user.json`,
      isBaselineUser: false,
    },
  ],
  invalid: [
    {
      role: 'Invalid Password User 🔑',
      user: VALID_USERNAME,
      pass: 'wrong_sauce',
      expectAuth: false,
      expectedError: 'auth.loginError',
    },
    {
      role: 'Invalid Username User 🎭',
      user: 'ghost_user',
      pass: VALID_PASSWORD,
      expectAuth: false,
      expectedError: 'auth.loginError',
    },
    {
      role: 'Locked Out User 🔒',
      user: 'locked_out_user',
      pass: VALID_PASSWORD,
      expectAuth: false,
      expectedError: 'auth.lookupError',
    },
  ],
} as const;

export const VALID_USERS = TEST_USERS.valid;
export const INVALID_USERS = TEST_USERS.invalid;

export const ANONYMOUS_VISITOR = {
  role: 'Anonymous Visitor 🔍',
} as const;

export const createCheckoutData = () => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  zipCode: faker.location.zipCode(),
});
