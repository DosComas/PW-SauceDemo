import { Page, BrowserContext } from '@playwright/test';
import { t } from './i18n';

export const accountLoc = (page: Page) => ({
  // --- Login Screen ---
  loginUI: {
    usernameInput: page.getByPlaceholder(t('auth.username')),
    passwordInput: page.getByPlaceholder(t('auth.password')),
    loginButton: page.getByRole('button', { name: t('auth.login') }),
    errorMessage: page.getByTestId('error'),
    logoImage: page.locator('.login_logo'),
  },

  // --- Navigation Bar ---
  navBarUI: {
    menuButton: page.getByRole('button', { name: t('navBar.openMenu') }),
    logoutButton: page.getByRole('link', { name: t('auth.logout') }),
  },
});

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
