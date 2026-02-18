import { t } from '@data';
import path from 'path';

// ==========================================
// 🏛️ USER PERSONA TYPES
// ==========================================

type UserPersona = { role: string; user: string; pass: string; tag: string };
type TestUserData = {
  access: (UserPersona & { expectAuth: true; storageState: string; isBaselineUser: boolean })[];
  denied: (UserPersona & { expectAuth: false; expectedErrorKey: keyof typeof t.login.errors })[];
};

// ==========================================
// 🏛️ USER PERSONAS
// ==========================================

const AUTH_DIR = './.auth';

const VALID_USERNAME = process.env.VALID_USERNAME as string;
const VALID_PASSWORD = process.env.VALID_PASSWORD as string;

const TEST_USERS: TestUserData = {
  access: [
    {
      role: 'Normal User',
      user: VALID_USERNAME,
      pass: VALID_PASSWORD,
      tag: '@👤',
      expectAuth: true,
      storageState: path.join(AUTH_DIR, 'normal_user.json'),
      isBaselineUser: true,
    },
    {
      role: 'Problem User',
      user: 'problem_user',
      pass: VALID_PASSWORD,
      tag: '@⚠️',
      expectAuth: true,
      storageState: path.join(AUTH_DIR, 'problem_user.json'),
      isBaselineUser: false,
    },
    {
      role: 'Error User',
      user: 'error_user',
      pass: VALID_PASSWORD,
      tag: '@💣',
      expectAuth: true,
      storageState: path.join(AUTH_DIR, 'error_user.json'),
      isBaselineUser: false,
    },
    {
      role: 'Visual User',
      user: 'visual_user',
      pass: VALID_PASSWORD,
      tag: '@🎨',
      expectAuth: true,
      storageState: path.join(AUTH_DIR, 'visual_user.json'),
      isBaselineUser: false,
    },
  ],
  denied: [
    {
      role: 'Invalid Password User',
      user: VALID_USERNAME,
      pass: 'wrong_sauce',
      tag: '@🔑',
      expectAuth: false,
      expectedErrorKey: 'unauthorized',
    },
    {
      role: 'Invalid Username User',
      user: 'ghost_user',
      pass: VALID_PASSWORD,
      tag: '@🎭',
      expectAuth: false,
      expectedErrorKey: 'unauthorized',
    },
    {
      role: 'Locked Out User',
      user: 'locked_out_user',
      pass: VALID_PASSWORD,
      tag: '@🔒',
      expectAuth: false,
      expectedErrorKey: 'lockedOut',
    },
  ],
} as const;

// ==========================================
// 🏛️ PUBLIC EXPORTS
// ==========================================

export const ACCESS_USERS = TEST_USERS.access;
export const DENIED_USERS = TEST_USERS.denied;
export const BASELINE_USERS = ACCESS_USERS.filter((u) => u.isBaselineUser);
