import { test, expect } from '@fixtures';
import { t, AUTHENTICATED } from '@data';

test.describe('Logout', () => {
  test.beforeEach(async ({ page }) => {
    await test.step('⬜ Go to inventory', async () => {
      await page.goto('/inventory.html');
    });
  });

  for (const persona of AUTHENTICATED) {
    test.describe(`${persona.role}`, { tag: persona.tag }, () => {
      test.use({ storageState: persona.storageState });

      test('Secure logout and session destruction', async ({ page, loc, action, session }) => {
        await test.step('🟦 Logout', async () => {
          await action.menu.logout();
        });

        await expect.soft(loc.login.loginBtn, '🟧 UI: Login button visible').toBeVisible();

        await test.step('🟦 Navigate back', async () => {
          await page.goBack();
        });

        await expect.soft(loc.login.errorMsg, '🟧 UI: Error message matches').toHaveText(t.login.errors.restricted);

        await test.step('🟦 Reload the page', async () => {
          await page.reload();
        });

        expect(await session.userSession(), '🟧 Data: Session cookies deleted').toBeUndefined();
      });
    });
  }
});
