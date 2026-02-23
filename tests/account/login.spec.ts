import { test, expect } from '@fixtures';
import { t, BASELINE, UNAUTHORIZED } from '@data';

test.describe.parallel('Login', () => {
  test.beforeEach(async ({ page }) => {
    await test.step('⬜ Go to login', async () => {
      await page.goto('/');
    });
  });

  for (const persona of UNAUTHORIZED) {
    test.describe(`${persona.role}`, { tag: persona.tag }, () => {
      test('Reject invalid credentials', async ({ loc, act }) => {
        await test.step('🟦 Log into the app', async () => {
          await act.login.submitCredentials({ user: persona.user, pass: persona.pass });
        });

        await expect(loc.login.errorMsg, '🟧 UI: Error message matches').toContainText(
          t.login.errors[persona.expectedError],
        );
      });
    });
  }

  for (const persona of BASELINE) {
    test.describe(`${persona.role}`, { tag: persona.tag }, () => {
      test('Accept valid credentials', async ({ loc, act, query }) => {
        await test.step('🟦 Log in to app', async () => {
          await act.login.submitCredentials({ user: persona.user, pass: persona.pass });
        });

        await expect.soft(loc.plp.title, '🟧 UI: Products title check').toHaveText(t.plp.title);
        await expect.soft(loc.header.cart.openBtn, '🟧 UI: Cart icon visible').toBeVisible();
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
