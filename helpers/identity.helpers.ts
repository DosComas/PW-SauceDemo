import { type Page } from '@playwright/test';
import { sharedHeader } from './shared/locators';
import { t, STATE_KEYS } from '@data';

// --- LOCATORS ---
const identityLocators = (page: Page) => ({
  login: {
    nameInput: page.getByPlaceholder(t.identity.username),
    passInput: page.getByPlaceholder(t.identity.password),
    loginBtn: page.getByRole('button', { name: t.identity.login }),
    errorMsg: page.getByTestId('error'),
    logoImg: page.locator('.login_logo'),
  },

  header: {
    ...sharedHeader(page),
  },
});

// --- DOMAIN INTERFACE ---
export const identity = (page: Page) => {
  const loc = identityLocators(page);

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
      header: {
        logout: async () => {
          await loc.header.menuBtn.click();
          await loc.header.logoutBtn.click();
        },
      },
    },
    session: {
      getCookie: async () => {
        const cookies = await page.context().cookies();
        return cookies.find((c) => c.name === STATE_KEYS.userSession);
      },
    },
  };
};
