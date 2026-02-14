import { test, expect, toSnapshotName } from '@utils';
import { identity, identityLocators } from '@helpers';
import { INVALID_USERS, BASELINE_USERS } from '@data';
import { t } from '@i18n';

const SCOPE = 'Login';

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to login page', async () => {
    await page.goto('/');
  });
});

for (const persona of BASELINE_USERS) {
  test.describe(`${persona.role}`, () => {
    test(`${SCOPE}: Accept valid credentials`, async ({ page }) => {
      const { headerUI } = identityLocators(page);

      await test.step('🟦 Log in to app', async () => {
        await identity.doLogin(page, { user: persona.user, pass: persona.pass });
      });

      await test.step('🟦 Open user menu', async () => {
        await headerUI.menuBtn.click();
      });

      await expect(headerUI.logoutBtn, '🟧 UI: Logout button visible').toBeVisible();
      expect(await identity.getSession(page.context()), '🟧 Data: Session cookies present').toBeDefined();
    });

    test(`${SCOPE}: Visual layout`, { tag: '@visual' }, async ({ page }) => {
      const { loginUI } = identityLocators(page);

      await test.step('⬜ Wait for logo and login button', async () => {
        await loginUI.logoImg.waitFor({ state: 'visible' });
        await loginUI.loginBtn.waitFor({ state: 'visible' });
      });

      await expect(page, '🟧 UI: Login layout visual check').toHaveScreenshot(
        `${toSnapshotName(persona.role)}-login.png`,
        { fullPage: true }
      );
    });
  });

  for (const persona of INVALID_USERS) {
    test.describe(`${persona.role}`, () => {
      test(`${SCOPE}: Reject invalid credentials`, async ({ page }) => {
        const { loginUI } = identityLocators(page);

        await test.step('🟦 Log into the app', async () => {
          await identity.doLogin(page, { user: persona.user, pass: persona.pass });
        });

        await expect(loginUI.errorMsg, '🟧 UI: Error message matches').toContainText(
          t.identity.errors[persona.expectedErrorKey]
        );
      });
    });
  }
}
