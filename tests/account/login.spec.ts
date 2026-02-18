import { test, expect } from '@fixtures';
import { t, BASELINE, UNAUTHORIZED } from '@data';

const SCOPE = 'Login';

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to login', async () => {
    await page.goto('/');
  });
});

for (const persona of UNAUTHORIZED) {
  test.describe(`${persona.role}`, { tag: persona.tag }, () => {
    test(`${SCOPE}: Reject invalid credentials`, async ({ loc, action }) => {
      await test.step('🟦 Log into the app', async () => {
        await action.login.submit({ user: persona.user, pass: persona.pass });
      });

      await expect(loc.login.errorMsg, '🟧 UI: Error message matches').toContainText(
        t.login.errors[persona.expectedError],
      );
    });
  });
}

for (const persona of BASELINE) {
  test.describe(`${persona.role}`, { tag: persona.tag }, () => {
    test(`${SCOPE}: Accept valid credentials`, async ({ loc, action, session }) => {
      await test.step('🟦 Log in to app', async () => {
        await action.login.submit({ user: persona.user, pass: persona.pass });
      });

      await expect.soft(loc.plp.title, '🟧 UI: PLP title check').toHaveText(t.plp.title);
      await expect.soft(loc.header.cart.openBtn, '🟧 UI: Cart icon visible').toBeVisible();
      expect(await session.userSession(), '🟧 Data: Session cookies present').toBeTruthy();
    });

    test(`${SCOPE}: Visual layout`, { tag: '@visual' }, async ({ page, loc }) => {
      await test.step('⬜ Wait for logo and login button', async () => {
        await loc.header.appLogo.waitFor();
        await loc.login.loginBtn.waitFor();
      });

      await expect(page, '🟧 UI: Login layout visual check').toHaveScreenshot({ fullPage: true });
    });
  });
}
