import type { Page } from '@playwright/test';
import { layoutLocators } from './core/layout.core';
import { _getStorageData, _getCookie } from '@utils';
import { t, STATE_KEYS } from '@data';

// ==========================================
// 🏛️ DOMAIN LOCATORS
// ==========================================

const accountLocators = (page: Page) => ({
  login: {
    nameInput: page.getByPlaceholder(t.login.username),
    passInput: page.getByPlaceholder(t.login.password),
    loginBtn: page.getByRole('button', { name: t.login.button }),
    errorMsg: page.getByTestId('error'),
  },
});

// ==========================================
// 🏛️ DOMAIN GATEWAY
// ==========================================

export const account = (page: Page) => {
  const loc = accountLocators(page);
  const { header } = layoutLocators(page);

  const _openMenu = async () => {
    await header.menu.panel.waitFor({ state: 'hidden' });
    await header.menu.openBtn.click();
  };

  return {
    loc,
    action: {
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
    },
    session: {
      userSession: async () => await _getCookie(page, STATE_KEYS.userSession),
      cartItems: async () => await _getStorageData<number[]>(page, STATE_KEYS.cart),
    },
  };
};
