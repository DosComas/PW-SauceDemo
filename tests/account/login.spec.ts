import { test, expect } from '@fixtures';
import { t, BASELINE, UNAUTHORIZED } from '@data';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await test.step('⬜ Go to login', async () => {
      await page.goto('/');
    });
  });

  for (const persona of UNAUTHORIZED) {
    test.describe(`${persona.role}`, { tag: persona.tag }, () => {
      test('Validation for invalid credentials', async ({ loc, act }) => {
        await test.step('🟦 Log into the app', async () => {
          await act.login.submitCredentials({ username: persona.user, password: persona.pass });
        });

        await expect(loc.login.errorMsg, '🟧 UI: Error message matches').toContainText(
          t.login.errors[persona.expectedError],
        );
      });
    });
  }

  for (const persona of BASELINE) {
    test.describe(`${persona.role}`, { tag: persona.tag }, () => {
      test('Successful authentication', { tag: '@aria' }, async ({ loc, act, query, aria }) => {
        await test.step('🟧 ARIA: Login page milestone', async () => {
          await aria.login();
        });

        await test.step('🟦 Log in to app', async () => {
          await act.login.submitCredentials({ username: persona.user, password: persona.pass });
        });

        await expect.soft(loc.plp.title, '🟧 UI: Products title check').toHaveText(t.plp.title);

        await test.step('🟧 ARIA: Post login PLP state', async () => {
          await aria.plp({ itemCount: 0, sortBy: 'az', itemsInCart: [] });
        });

        expect(await query.session.readUser(), '🟧 Data: Session cookies present').toBeTruthy();
      });

      test('Visual layout', { tag: '@visual' }, async ({ page, loc }) => {
        await test.step('⬜ Wait for logo and login button', async () => {
          await loc.header.appLogo.waitFor();
          await loc.login.loginBtn.waitFor();
        });

        await expect(page, '🟧 UI: Layout visual check').toHaveScreenshot({ fullPage: true });
      });
    });
  }
});
