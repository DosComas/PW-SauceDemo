import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  // Global Ignores
  {
    ignores: ['**/node_modules/**', '**/test-results/**', '**/playwright-report/**', '**/blob-report/**', '**/dist/**'],
  },

  // Base JS + TS
  {
    files: ['**/*.{js,mjs,cjs,ts}'],
    languageOptions: {
      globals: globals.browser,
    },
    ...pluginJs.configs.recommended,
  },

  ...tseslint.configs.recommended,

  // Playwright (tests only)
  {
    ...playwright.configs['flat/recommended'],
    files: ['tests/**/*.{ts,js}'],
    settings: {
      playwright: {
        globalAliases: {
          test: ['setup'],
        },
      },
    },
    rules: {
      'playwright/valid-test-tags': 'off',

      // CI safety
      'playwright/no-focused-test': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-conditional-expect': 'error',
      'playwright/no-standalone-expect': 'error',

      // Best practices
      'playwright/no-skipped-test': 'warn',
      'playwright/no-force-option': 'warn',
      'playwright/no-networkidle': 'warn',
      'playwright/no-element-handle': 'warn',
      'playwright/prefer-web-first-assertions': 'warn',
      'playwright/prefer-to-have-count': 'warn',
    },
  },

  // Prettier (must be last)
  eslintConfigPrettier,
];
