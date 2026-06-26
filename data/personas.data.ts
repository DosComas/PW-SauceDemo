import { t } from '@data';
import path from 'path';

// ==========================================
// 🏛️ PERSONA TYPES
// ==========================================

type BasePersona = { role: string; user: string; pass: string; tag: string };
export type AuthenticatedPersona = BasePersona & { expectAuth: true; storageState: string; isBaseline: boolean };
export type UnauthorizedPersona = BasePersona & { expectAuth: false; expectedError: keyof typeof t.login.errors };

// ==========================================
// 🏛️ PERSONA REGISTRY
// ==========================================

const AUTH_DIR = './.auth';

const VALID_USER = process.env.VALID_USERNAME as string;
const VALID_PASS = process.env.VALID_PASSWORD as string;

const AUTHENTICATED_PERSONAS = [
  {
    role: 'normal_user',
    user: VALID_USER,
    pass: VALID_PASS,
    tag: '@👤',
    expectAuth: true,
    storageState: path.join(AUTH_DIR, 'normal_user.json'),
    isBaseline: true,
  },
  {
    role: 'problem_user',
    user: 'problem_user',
    pass: VALID_PASS,
    tag: '@⚠️',
    expectAuth: true,
    storageState: path.join(AUTH_DIR, 'problem_user.json'),
    isBaseline: false,
  },
  {
    role: 'error_user',
    user: 'error_user',
    pass: VALID_PASS,
    tag: '@💣',
    expectAuth: true,
    storageState: path.join(AUTH_DIR, 'error_user.json'),
    isBaseline: false,
  },
  {
    role: 'visual_user',
    user: 'visual_user',
    pass: VALID_PASS,
    tag: '@🎨',
    expectAuth: true,
    storageState: path.join(AUTH_DIR, 'visual_user.json'),
    isBaseline: false,
  },
] as const satisfies readonly AuthenticatedPersona[];

const UNAUTHORIZED_PERSONAS = [
  {
    role: 'invalid_password',
    user: VALID_USER,
    pass: 'wrong_sauce',
    tag: '@🔑',
    expectAuth: false,
    expectedError: 'unauthorized',
  },
  {
    role: 'invalid_username',
    user: 'ghost_user',
    pass: VALID_PASS,
    tag: '@🎭',
    expectAuth: false,
    expectedError: 'unauthorized',
  },
  {
    role: 'locked_out',
    user: 'locked_out_user',
    pass: VALID_PASS,
    tag: '@🔒',
    expectAuth: false,
    expectedError: 'lockedOut',
  },
] as const satisfies readonly UnauthorizedPersona[];

// ==========================================
// 🏛️ IDENTITY GATEWAY
// ==========================================

/** Personas that successfully log in and generate session state */
export const AUTHENTICATED = AUTHENTICATED_PERSONAS;

/** Personas expected to be unauthorized to log in */
export const UNAUTHORIZED = UNAUTHORIZED_PERSONAS;

/** The default base line persona for general test coverage */
export const BASELINE = AUTHENTICATED_PERSONAS.filter((p) => p.isBaseline);
