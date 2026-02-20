import type { Page } from '@playwright/test';
import * as c from './core';
import * as u from '@utils';
import type * as d from '@data';
import { t, STATE_KEYS } from '@data';

// ==========================================
// 🏛️ DOMAIN LOCATORS
// ==========================================

const accountLocators = (page: Page) =>
  ({
    login: {
      nameInput: page.getByPlaceholder(t.login.username),
      passInput: page.getByPlaceholder(t.login.password),
      loginBtn: page.getByRole('button', { name: t.login.button }),
      errorMsg: page.getByTestId('error'),
    },
  }) as const satisfies d.LocSchema;

// ==========================================
// 🏛️ DOMAIN GATEWAY
// ==========================================

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
        submit: async ({ user, pass }: { user: string; pass: string }) => {
          await loc.login.nameInput.fill(user);
          await loc.login.passInput.fill(pass);
          await loc.login.loginBtn.click();
        },
      },
      menu: {
        logout: async () => {
          await _openMenu();
          await header.menu.logoutBtn.click();
        },
        open: async () => _openMenu(),
      },
    } as const satisfies d.ActSchema,
    query: {
      session: {
        user: async () => await u._getCookie(page, STATE_KEYS.userSession),
        cart: async () => await u._getStorageData<number[]>(page, STATE_KEYS.cart),
      },
    } as const satisfies d.QuerySchema,
  };
};
