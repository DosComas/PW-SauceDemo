import { faker } from '@faker-js/faker';
import { TranslationKey } from './dictionary';

const VALID_USERNAME = process.env.VALID_USERNAME as string;
const VALID_PASSWORD = process.env.VALID_PASSWORD as string;
const AUTH_DIR = '.auth';

interface BaseUser {
  role: string;
  user: string;
  pass: string;
}

interface AuthUser extends BaseUser {
  expectAuth: true;
  storageState: string;
}

interface InvalidUser extends BaseUser {
  expectAuth: false;
  expectedError: TranslationKey;
}

export const authUsers = [
  {
    role: 'Normal User 👤',
    user: VALID_USERNAME,
    pass: VALID_PASSWORD,
    expectAuth: true,
    storageState: `${AUTH_DIR}/normal_user.json`,
  },
  {
    role: 'Problem User ⚠️',
    user: 'problem_user',
    pass: VALID_PASSWORD,
    expectAuth: true,
    storageState: `${AUTH_DIR}/problem_user.json`,
  },
  {
    role: 'Error User 💣',
    user: 'error_user',
    pass: VALID_PASSWORD,
    expectAuth: true,
    storageState: `${AUTH_DIR}/error_user.json`,
  },
  {
    role: 'Visual User 👁️',
    user: 'visual_user',
    pass: VALID_PASSWORD,
    expectAuth: true,
    storageState: `${AUTH_DIR}/visual_user.json`,
  },
] as const;

export const invalidUsers = [
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
] as const;

export const anonymousVisitor = {
  role: 'Anonymous Visitor 🔍',
} as const;

export const createCheckoutData = () => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  zipCode: faker.location.zipCode(),
});
