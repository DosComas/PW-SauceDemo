import { test as setup, expect } from '@playwright/test';
import { doLogin, accountLoc } from '../helpers/account.helpers';
import { VALID_USERS } from '../data/users.data';

for (const persona of VALID_USERS) {
  setup(`Authenticate as ${persona.role}`, async ({ page }) => {
    const { navBarUI } = accountLoc(page);

    await setup.step('⬜ Go to login page', async () => {
      await page.goto('/');
    });

    await setup.step('🟦 Log in to app', async () => {
      await doLogin(page, { user: persona.user, pass: persona.pass });
    });

    await setup.step('🟦 Open user menu', async () => {
      await navBarUI.menuButton.click();
    });

    await expect(navBarUI.logoutButton, '🟧 UI: Logout button visible').toBeVisible();
    await expect(page, '🟧 Data: Inventory URL active').toHaveURL(/.*inventory.html/);

    await setup.step('⬜ Save authentication state', async () => {
      await page.context().storageState({ path: persona.storageState });
    });
  });
}
