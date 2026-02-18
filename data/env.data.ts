// ==========================================
// 🏛️ ENV TYPES
// ==========================================

type EnvConfig = { baseUrl: string; environment: string };
type EnvKey = keyof typeof ENV_MAP;

// ==========================================
// 🏛️ ENV DATA
// ==========================================

const ENV_MAP = {
  prod: { baseUrl: 'https://www.saucedemo.com', environment: 'Production' },
} as const satisfies Record<string, EnvConfig>;

const ENV_KEY = (process.env.ENVIRONMENT?.toLowerCase() || 'prod') as EnvKey;

// ==========================================
// 🏛️ PUBLIC EXPORTS
// ==========================================

export const CURRENT_ENV = ENV_MAP[ENV_KEY];
