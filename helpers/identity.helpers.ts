import { Page, BrowserContext } from '@playwright/test';
import { t } from '@i18n';

// --- TYPES ---
type LoginCredentials = {
  user: string;
  pass: string;
};

// --- LOCATORS ---
export const identityLocators = (page: Page) => ({
  // --- Login Screen ---
  loginUI: {
    usernameInput: page.getByPlaceholder(t.identity.username),
    passwordInput: page.getByPlaceholder(t.identity.password),
    loginButton: page.getByRole('button', { name: t.identity.login }),
    errorMessage: page.getByTestId('error'),
    logoImage: page.locator('.login_logo'),
  },

  // --- Page Header ---
  headerUI: {
    menuButton: page.getByRole('button', { name: t.identity.header.openMenu }),
    logoutButton: page.getByRole('link', { name: t.identity.header.logout }),
  },
});

// --- PRIVATE UTILITIES ---
// ...

// --- ACTIONS ---
async function doLogin(page: Page, { user, pass }: LoginCredentials) {
  const { loginUI } = identityLocators(page);
  await loginUI.usernameInput.fill(user);
  await loginUI.passwordInput.fill(pass);
  await loginUI.loginButton.click();
}

async function doLogout(page: Page) {
  const { headerUI } = identityLocators(page);
  await headerUI.menuButton.click();
  await headerUI.logoutButton.click();
}

async function getSession(context: BrowserContext) {
  const cookies = await context.cookies();
  const sessionCookie = cookies.find((cookie) => cookie.name === 'session-username');
  return sessionCookie;
}

// --- MODULE INTERFACE ---
export const identity = {
  doLogin,
  doLogout,
  getSession,
} as const;
