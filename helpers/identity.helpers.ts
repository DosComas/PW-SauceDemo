import { Page, BrowserContext } from '@playwright/test';
import { sharedHeader } from './shared/locators';
import { STATE_KEYS } from '@data';
import { t } from '@i18n';

// --- TYPES ---
type LoginCredentials = {
  user: string;
  pass: string;
};

// --- LOCATORS ---
export const identityLocators = (page: Page) => ({
  // LOGIN: The entry gateway
  loginUI: {
    usernameInput: page.getByPlaceholder(t.identity.username),
    passwordInput: page.getByPlaceholder(t.identity.password),
    loginBtn: page.getByRole('button', { name: t.identity.login }),
    errorMsg: page.getByTestId('error'),
    logoImg: page.locator('.login_logo'),
  },

  // HEADER: Global navigation and cart
  headerUI: {
    ...sharedHeader(page),
  },
});

// --- PRIVATE UTILITIES ---
// ...

// --- ACTIONS ---
async function doLogin(page: Page, { user, pass }: LoginCredentials) {
  const { loginUI } = identityLocators(page);
  await loginUI.usernameInput.fill(user);
  await loginUI.passwordInput.fill(pass);
  await loginUI.loginBtn.click();
}

async function doLogout(page: Page) {
  const { headerUI } = identityLocators(page);
  await headerUI.menuBtn.click();
  await headerUI.logoutBtn.click();
}

async function getSession(context: BrowserContext) {
  const cookies = await context.cookies();
  const sessionCookie = cookies.find((cookie) => cookie.name === STATE_KEYS.userSession);
  return sessionCookie;
}

// --- MODULE INTERFACE ---
export const identity = {
  doLogin,
  doLogout,
  getSession,
} as const;
