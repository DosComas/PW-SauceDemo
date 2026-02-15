import { faker } from '@faker-js/faker';
import { t } from '@data';
import path from 'path';

const AUTH_DIR = './playwright/.auth';

const VALID_USERNAME = process.env.VALID_USERNAME as string;
const VALID_PASSWORD = process.env.VALID_PASSWORD as string;

interface UserPersona {
  role: string;
  user: string;
  pass: string;
}

type TestUserData = {
  access: (UserPersona & {
    expectAuth: true;
    storageState: string;
    isBaselineUser: boolean;
  })[];
  denied: (UserPersona & {
    expectAuth: false;
    expectedErrorKey: keyof typeof t.identity.errors;
  })[];
};

const TEST_USERS: TestUserData = {
  access: [
    {
      role: 'Normal User',
      user: VALID_USERNAME,
      pass: VALID_PASSWORD,
      expectAuth: true,
      storageState: path.join(AUTH_DIR, 'normal_user.json'),
      isBaselineUser: true,
    },
    {
      role: 'Problem User @⚠️',
      user: 'problem_user',
      pass: VALID_PASSWORD,
      expectAuth: true,
      storageState: path.join(AUTH_DIR, 'problem_user.json'),
      isBaselineUser: false,
    },
    {
      role: 'Error User @💣',
      user: 'error_user',
      pass: VALID_PASSWORD,
      expectAuth: true,
      storageState: path.join(AUTH_DIR, 'error_user.json'),
      isBaselineUser: false,
    },
    {
      role: 'Visual User @🎨',
      user: 'visual_user',
      pass: VALID_PASSWORD,
      expectAuth: true,
      storageState: path.join(AUTH_DIR, 'visual_user.json'),
      isBaselineUser: false,
    },
  ],
  denied: [
    {
      role: 'Invalid Password User @🔑',
      user: VALID_USERNAME,
      pass: 'wrong_sauce',
      expectAuth: false,
      expectedErrorKey: 'unauthorized',
    },
    {
      role: 'Invalid Username User @🎭',
      user: 'ghost_user',
      pass: VALID_PASSWORD,
      expectAuth: false,
      expectedErrorKey: 'unauthorized',
    },
    {
      role: 'Locked Out User @🔒',
      user: 'locked_out_user',
      pass: VALID_PASSWORD,
      expectAuth: false,
      expectedErrorKey: 'lockedOut',
    },
  ],
} as const;

export const ACCESS_USERS = TEST_USERS.access;
export const DENIED_USERS = TEST_USERS.denied;
export const BASELINE_USERS = ACCESS_USERS.filter((u) => u.isBaselineUser);

export const createCheckoutData = () => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  zipCode: faker.location.zipCode(),
});
