import { test, expect } from '@fixtures';
import { t, ACCESS_USERS } from '@data';

const SCOPE = 'Logout';

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to inventory page', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of ACCESS_USERS) {
  test.describe(`${persona.role}`, { tag: persona.tag }, () => {
    test.use({ storageState: persona.storageState });

    test(`${SCOPE}: Secure logout and session destruction`, async ({ page, loc, action, session }) => {
      await test.step('🟦 Logout', async () => {
        await action.header.logout();
      });

      await expect.soft(loc.login.loginBtn, '🟧 UI: Login button visible').toBeVisible();

      await test.step('🟦 Navigate back', async () => {
        await page.goBack();
      });

      await expect.soft(loc.login.errorMsg, '🟧 UI: Error message matches').toHaveText(t.identity.errors.restricted);

      await test.step('🟦 Reload the page', async () => {
        await page.reload();
      });

      expect(await session.getCookie(), '🟧 Data: Session cookies deleted').toBeUndefined();
    });
  });
}
