// ==========================================
// 🏛️ ENV TYPES
// ==========================================

type EnvKey = keyof typeof ENV_MAP;

// ==========================================
// 🏛️ ENV DATA
// ==========================================

const ENV_MAP = {
  prod: { baseUrl: 'https://www.saucedemo.com', environment: 'Production' },
} as const;

const ENV_KEY = (process.env.ENVIRONMENT?.toLowerCase() || 'prod') as EnvKey;

// ==========================================
// 🏛️ PUBLIC EXPORTS
// ==========================================

export const CURRENT_ENV = ENV_MAP[ENV_KEY] || ENV_MAP.prod;
