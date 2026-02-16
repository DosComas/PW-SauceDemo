import { type Page } from '@playwright/test';
import { type Header } from './common/app.locators';
import { t, STATE_KEYS } from '@data';

// LOCATORS
const accountLocators = (page: Page) => ({
  login: {
    nameInput: page.getByPlaceholder(t.login.username),
    passInput: page.getByPlaceholder(t.login.password),
    loginBtn: page.getByRole('button', { name: t.login.button }),
    errorMsg: page.getByTestId('error'),
  },
});

// DOMAIN INTERFACE
export const account = (page: Page, headerLocs: Header) => {
  const loc = accountLocators(page);

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
          await headerLocs.menuBtn.click();
          await headerLocs.logoutBtn.click();
        },
      },
    },
    session: {
      userSession: async () => {
        const cookies = await page.context().cookies();
        return cookies.find((c) => c.name === STATE_KEYS.userSession);
      },
    },
  };
};
