import type { Page, Cookie } from '@playwright/test';
import * as c from './core';
import * as u from '@utils';
import type * as d from '@data';
import { t, STATE_KEYS, loginConfig } from '@data';

// ==========================================
// 🏛️ DOMAIN TYPES
// ==========================================

type AccountSchema = {
  loc: ReturnType<typeof accountLocators>;
  act: {
    login: {
      submitCredentials: (args: c.FormOptions<d.LoginData>) => Promise<void>;
    };
    menu: {
      logout: () => Promise<void>;
      openMenu: () => Promise<void>;
    };
  };
  query: {
    session: {
      readUser: () => Promise<Cookie | undefined>;
      readCart: () => Promise<number[]>;
    };
  };
};

// ==========================================
// 🏛️ DOMAIN LOCATORS
// ==========================================

const accountLocators = (page: Page) =>
  ({
    login: {
      input: {
        username: page.getByPlaceholder(t.login.username),
        password: page.getByPlaceholder(t.login.password),
      } satisfies d.LoginLocators,
      loginBtn: page.getByRole('button', { name: t.login.button }),
      errorMsg: page.getByTestId('error'),
    },
  }) as const satisfies d.LocatorSchema;

// ==========================================
// 🏛️ DOMAIN GATEWAY
// ==========================================

/** Account domain: login, menu, and session queries */
export const account = (page: Page) => {
  const loc = accountLocators(page);
  const { header } = c.layoutLocators(page);

  const _openMenu = async () => {
    await header.menu.panel.waitFor({ state: 'hidden' });
    await header.menu.openBtn.click();
  };

  return {
    loc,
    act: {
      login: {
        submitCredentials: async (args) => {
          const { skip, ...data } = args;
          await c._fillForm(loginConfig, loc.login.input, data, skip);
          await loc.login.loginBtn.click();
        },
      },
      menu: {
        logout: async () => {
          await _openMenu();
          await header.menu.logoutBtn.click();
        },
        openMenu: async () => _openMenu(),
      },
    },
    query: {
      session: {
        readUser: async () => {
          return await _getCookie(page, STATE_KEYS.userSession);
        },
        readCart: async () => {
          return await _getStorageData<number[]>(page, STATE_KEYS.cart);
        },
      },
    },
  } as const satisfies AccountSchema;
};

// ==========================================
// 🏛️ DOMAIN PRIVATE ACTIONS
// ==========================================

/** Retrieves a specific cookie by name */
async function _getCookie(page: Page, name: string): Promise<Cookie | undefined> {
  const cookies = await page.context().cookies();
  return cookies.find((c) => c.name === name);
}

/** Retrieves data from LocalStorage with polling resilience */
async function _getStorageData<T>(page: Page, key: d.StateKeys, options?: { timeout?: number }): Promise<T> {
  const { value, pass } = await u.pollUntil<T>(
    // CALLBACK: How to get the data
    async () => {
      const raw = await page.evaluate((k) => window.localStorage.getItem(k), key);
      if (raw === null) return null;

      try {
        return JSON.parse(raw);
      } catch {
        return raw as unknown as T; // Return as raw string if not JSON
      }
    },
    // CONDITION: When to stop polling (when the key exists)
    (val) => val !== null,
    options?.timeout,
  );

  if (!pass) throw new Error(`[_getStorageData] Timed out waiting for key: "${key}"`);
  return value as T;
}
