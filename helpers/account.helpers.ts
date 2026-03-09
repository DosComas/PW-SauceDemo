import { type Page, type Cookie, expect } from '@playwright/test';
import * as c from './core';
import * as u from '@utils';
import type * as d from '@data';
import { t, STATE_KEYS, loginConfig, loginSnapshots } from '@data';

// ==========================================
// 🏛️ DOMAIN SCHEMA
// ==========================================

type AccountSchema = {
  loc: ReturnType<typeof accountLocators>;

  act: {
    login: {
      /** Performs the submission of the login credentials. */
      submitCredentials: (args: c.FormOptions<d.LoginData>) => Promise<void>;
    };
    menu: {
      /** Performs the logout sequence via the navigation menu. */
      logout: () => Promise<void>;

      /** Performs the opening of the navigation menu panel. */
      openMenu: () => Promise<void>;
    };
  };

  query: {
    session: {
      /** Retrieves the user session cookie from the browser. */
      readUser: () => Promise<Cookie | undefined>;

      /** Retrieves the cart items list from local storage. */
      readCart: () => Promise<number[]>;
    };
  };

  aria: {
    /** Performs ARIA snapshot validation for the full Login page. */
    login: () => Promise<void>;
  };
};

// ==========================================
// 🏛️ DOMAIN LOCATORS
// ==========================================

const accountLocators = (page: Page) => {
  return {
    login: {
      container: page.locator('.login_wrapper-inner'),
      credentials: page.getByTestId('login-credentials-container'),
      input: {
        username: page.getByPlaceholder(t.login.username),
        password: page.getByPlaceholder(t.login.password),
      } satisfies d.LoginLocators,
      loginBtn: page.getByRole('button', { name: t.login.button }),
      errorMsg: page.getByTestId('error'),
    },
  } as const satisfies d.LocatorSchema;
};

// ==========================================
// 🏛️ DOMAIN GATEWAY
// ==========================================

export const account = (page: Page): AccountSchema => {
  const loc = accountLocators(page);
  const headerLoc = c.layout(page).loc.header;

  const _openMenu = async () => {
    await headerLoc.menu.panel.waitFor({ state: 'hidden' });
    await headerLoc.menu.openBtn.click();
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
          await headerLoc.menu.logoutBtn.click();
        },
        openMenu: async () => await _openMenu(),
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
    aria: {
      login: async () => {
        await expect(headerLoc.appLogo, 'App Logo ARIA snapshot').toMatchAriaSnapshot(loginSnapshots.logo);
        await expect(loc.login.container, 'Login ARIA snapshot').toMatchAriaSnapshot(loginSnapshots.login);
        await expect(loc.login.credentials, 'Credentials ARIA snapshot').toMatchAriaSnapshot(
          loginSnapshots.credentials,
        );
      },
    },
  } as const;
};

// ==========================================
// 🏛️ DOMAIN PRIVATE ACTIONS
// ==========================================

async function _getCookie(page: Page, name: string): Promise<Cookie | undefined> {
  const cookies = await page.context().cookies();
  return cookies.find((c) => c.name === name);
}

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
