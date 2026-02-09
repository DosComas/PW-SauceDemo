import { test as setup, expect } from '@playwright/test';
import { doLogin, accountUI } from '../helpers/account-helpers';
import { authUsers } from '../data/users';

for (const persona of authUsers) {
  setup(`Authenticate as ${persona.role}`, async ({ page }) => {
    const { navBarUI } = accountUI(page);

    await setup.step('🟦 Navigate and Login', async () => {
      await page.goto('/');
      await doLogin(page, { user: persona.user, pass: persona.pass });
    });

    await expect(page, '🟧 URL should be inventory page').toHaveURL(/.*inventory.html/);

    await setup.step('🟦 Open user menu', async () => {
      await navBarUI.menuButton.click();
    });

    await expect(navBarUI.logoutButton, '🟧 Logout button should be visible').toBeVisible();

    await setup.step('🟦 Save authentication state', async () => {
      await page.context().storageState({ path: persona.storageState });
    });
  });
}
