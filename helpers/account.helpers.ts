import { Page, BrowserContext } from '@playwright/test';
import { t } from '@i18n';

// --- TYPES ---
// ...

// --- LOCATORS ---
export const accountLoc = (page: Page) => ({
  // --- Login Screen ---
  loginUI: {
    usernameInput: page.getByPlaceholder(t.identity.username),
    passwordInput: page.getByPlaceholder(t.identity.password),
    loginButton: page.getByRole('button', { name: t.identity.login }),
    errorMessage: page.getByTestId('error'),
    logoImage: page.locator('.login_logo'),
  },

  // --- Navigation Bar ---
  navBarUI: {
    menuButton: page.getByRole('button', { name: t.layout.openMenu }),
    logoutButton: page.getByRole('link', { name: t.identity.logout }),
  },
});

// --- PRIVATE UTILITIES ---
// ...

// --- ACTIONS ---

export async function doLogin(page: Page, { user, pass }: { user: string; pass: string }) {
  const { loginUI } = accountLoc(page);
  await loginUI.usernameInput.fill(user);
  await loginUI.passwordInput.fill(pass);
  await loginUI.loginButton.click();
}

export async function doLogout(page: Page) {
  const { navBarUI } = accountLoc(page);
  await navBarUI.menuButton.click();
  await navBarUI.logoutButton.click();
}

export async function getSession(context: BrowserContext) {
  const cookies = await context.cookies();
  const sessionCookie = cookies.find((cookie) => cookie.name === 'session-username');
  return sessionCookie;
}

// --- MODULE INTERFACE ---
export const account = {
  doLogin,
  doLogout,
  getSession,
} as const;
