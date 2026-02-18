import { t } from '@data';
import path from 'path';

// ==========================================
// 🏛️ PERSONA TYPES
// ==========================================

type BasePersona = { role: string; user: string; pass: string; tag: string };
type AuthenticatedPersona = BasePersona & { expectAuth: true; storageState: string; isBaseline: boolean };
type UnauthorizedPersona = BasePersona & { expectAuth: false; expectedError: keyof typeof t.login.errors };

// ==========================================
// 🏛️ PERSONA REGISTRY
// ==========================================

const AUTH_DIR = './.auth';

const VALID_USER = process.env.VALID_USERNAME as string;
const VALID_PASS = process.env.VALID_PASSWORD as string;

const AUTHENTICATED_PERSONAS: AuthenticatedPersona[] = [
  {
    role: 'Normal User',
    user: VALID_USER,
    pass: VALID_PASS,
    tag: '@👤',
    expectAuth: true,
    storageState: path.join(AUTH_DIR, 'normal_user.json'),
    isBaseline: true,
  },
  {
    role: 'Problem User',
    user: 'problem_user',
    pass: VALID_PASS,
    tag: '@⚠️',
    expectAuth: true,
    storageState: path.join(AUTH_DIR, 'problem_user.json'),
    isBaseline: false,
  },
  {
    role: 'Error User',
    user: 'error_user',
    pass: VALID_PASS,
    tag: '@💣',
    expectAuth: true,
    storageState: path.join(AUTH_DIR, 'error_user.json'),
    isBaseline: false,
  },
  {
    role: 'Visual User',
    user: 'visual_user',
    pass: VALID_PASS,
    tag: '@🎨',
    expectAuth: true,
    storageState: path.join(AUTH_DIR, 'visual_user.json'),
    isBaseline: false,
  },
];

const UNAUTHORIZED_PERSONAS: UnauthorizedPersona[] = [
  {
    role: 'Invalid Password User',
    user: VALID_USER,
    pass: 'wrong_sauce',
    tag: '@🔑',
    expectAuth: false,
    expectedError: 'unauthorized',
  },
  {
    role: 'Invalid Username User',
    user: 'ghost_user',
    pass: VALID_PASS,
    tag: '@🎭',
    expectAuth: false,
    expectedError: 'unauthorized',
  },
  {
    role: 'Locked Out User',
    user: 'locked_out_user',
    pass: VALID_PASS,
    tag: '@🔒',
    expectAuth: false,
    expectedError: 'lockedOut',
  },
];

// ==========================================
// 🏛️ IDENTITY GATEWAY
// ==========================================

/** Personas that successfully log in and generate session state */
export const AUTHENTICATED = AUTHENTICATED_PERSONAS;

/** Personas expected to be unauthorized to log in */
export const UNAUTHORIZED = UNAUTHORIZED_PERSONAS;

/** The default base line persona for general test coverage */
export const BASELINE = AUTHENTICATED_PERSONAS.filter((p) => p.isBaseline);
