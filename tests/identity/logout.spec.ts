import { test, expect } from '@utils';
import { accountLoc, doLogout, getSession } from '@helpers';
import { VALID_USERS } from '@data';
import { t } from '@i18n';

const SCOPE = 'Identity';

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to inventory page', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of VALID_USERS) {
  test.describe(`${persona.role}`, () => {
    test.use({ storageState: persona.storageState });

    test(`${SCOPE}: Secure logout and session destruction`, async ({ page }) => {
      const { loginUI } = accountLoc(page);

      await test.step('🟦 Logout', async () => {
        await doLogout(page);
      });

      await test.step('🟦 Navigate back', async () => {
        await page.goBack();
      });

      await expect.soft(loginUI.errorMessage, '🟧 UI: Error message matches').toHaveText(t.identity.errors.restricted);

      await test.step('🟦 Reload the page', async () => {
        await page.reload();
      });

      expect(await getSession(page.context()), '🟧 Data: Session cookies deleted').toBeUndefined();
    });
  });
}
