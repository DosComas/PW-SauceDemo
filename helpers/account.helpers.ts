import type { Page } from '@playwright/test';
import type { Header } from './common/app.locators';
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
// 🏛️ DOMAIN ACTIONS
// ==========================================

export const account = (page: Page, headerLocs: Header) => {
  const loc = accountLocators(page);
  const _openMenu = async () => {
    await headerLocs.menu.panel.waitFor({ state: 'hidden' });
    await headerLocs.menu.openBtn.click();
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
          await headerLocs.menu.logoutBtn.click();
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
