import { test, expect } from '@playwright/test';
import { accountLoc, doLogout, getSession } from '../../helpers/account.helpers';
import { t } from '../../utils/i18n';
import { VALID_USERS } from '../../data/users';

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to inventory page', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of VALID_USERS) {
  test.describe(`${persona.role}`, () => {
    test.use({ storageState: persona.storageState });

    test('Verify session is destroyed on logout', async ({ page }) => {
      const { loginUI } = accountLoc(page);

      await test.step('🟦 Logout', async () => {
        await doLogout(page);
      });

      await test.step('🟦 Navigate back', async () => {
        await page.goBack();
      });

      await expect(loginUI.errorMessage, '🟧 Error message should be displayed').toHaveText(
        t('auth.logoutInvError'),
      );

      await test.step('🟦 Reload the page', async () => {
        await page.reload();
      });

      const sessionCookie = await getSession(page.context());
      expect(sessionCookie, '🟧 Cookies should be deleted').toBeUndefined();
    });
  });
}
