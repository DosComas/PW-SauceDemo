import { test, expect } from '@fixtures';
import { toSnapshotName } from '@utils';
import { createApp } from '@helpers';
import { t, INVALID_USERS, BASELINE_USERS } from '@data';

const SCOPE = 'Login';

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to login page', async () => {
    await page.goto('/');
  });
});

for (const persona of BASELINE_USERS) {
  test.describe(`${persona.role}`, () => {
    test(`${SCOPE}: Accept valid credentials`, async ({ loc, action, session }) => {
      await test.step('🟦 Log in to app', async () => {
        await action.login.submit({ user: persona.user, pass: persona.pass });
      });

      await expect.soft(loc.plp.title, '🟧 UI: PLP title check').toHaveText(t.catalog.title);
      await expect.soft(loc.header.cartBtn, '🟧 UI: Cart icon visible').toBeVisible();
      expect(await session.getCookie(), '🟧 Data: Session cookies present').toBeTruthy();
    });

    test(`${SCOPE}: Visual layout`, { tag: '@visual' }, async ({ page, loc }) => {
      await test.step('⬜ Wait for logo and login button', async () => {
        await loc.login.logoImg.waitFor({ state: 'visible' });
        await loc.login.loginBtn.waitFor({ state: 'visible' });
      });

      await expect(page, '🟧 UI: Login layout visual check').toHaveScreenshot(
        `${toSnapshotName(persona.role)}-login.png`,
        { fullPage: true }
      );
    });
  });

  for (const persona of INVALID_USERS) {
    test.describe(`${persona.role}`, () => {
      test(`${SCOPE}: Reject invalid credentials`, async ({ loc, action }) => {
        await test.step('🟦 Log into the app', async () => {
          await action.login.submit({ user: persona.user, pass: persona.pass });
        });

        await expect(loc.login.errorMsg, '🟧 UI: Error message matches').toContainText(
          t.identity.errors[persona.expectedErrorKey]
        );
      });
    });
  }
}
