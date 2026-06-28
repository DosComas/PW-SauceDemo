// ==========================================
// 🏛️ ENVIROMENT TYPES
// ==========================================

type EnvConfig = { baseUrl: string; name: string };
type EnvKey = keyof typeof ENV_MAP;

// ==========================================
// 🏛️ ENVIROMENT DATA
// ==========================================

const ENV_MAP = {
  prod: { baseUrl: 'https://www.saucedemo.com', name: 'Production' },
  local: { baseUrl: 'http://localhost:3000/', name: 'Local' },
} as const satisfies Record<string, EnvConfig>;

// ==========================================
// 🏛️ PUBLIC EXPORTS
// ==========================================
export function getCurrentEnv(environment: string | undefined): EnvConfig {
  if (!environment) throw new Error('[_getCurrentEnv] ENVIRONMENT is undefined');

  const key = environment.toLowerCase() as EnvKey;
  if (!(key in ENV_MAP)) throw new Error(`[_getCurrentEnv] Unknown ENVIRONMENT: "${environment}"`);

  return ENV_MAP[key];
}
