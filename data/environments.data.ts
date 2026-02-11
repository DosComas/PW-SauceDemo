const ENV_MAP = {
  prod: { baseUrl: 'https://www.saucedemo.com', reportName: 'Production' },
} as const;

const env = process.env.ENVIRONMENT?.toLowerCase() as keyof typeof ENV_MAP;

export const CURRENT_ENV = ENV_MAP[env] || ENV_MAP.prod;
