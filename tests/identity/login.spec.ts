import { test, expect, toSnapshotName } from '@utils';
import { accountLoc, doLogin } from '@helpers';
import { INVALID_USERS, ANONYMOUS_VISITOR } from '@data';
import { t } from '@i18n';

const SCOPE = 'Identity';

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to login page', async () => {
    await page.goto('/');
  });
});

for (const persona of INVALID_USERS) {
  test.describe(`${persona.role}`, () => {
    test(`${SCOPE}: Reject invalid credentials`, async ({ page }) => {
      const { loginUI } = accountLoc(page);

      await test.step('🟦 Log into the app', async () => {
        await doLogin(page, { user: persona.user, pass: persona.pass });
      });

      await expect(loginUI.errorMessage, '🟧 UI: Error message matches').toContainText(
        t.identity.errors[persona.expectedErrorKey]
      );
    });
  });
}

test.describe(`${ANONYMOUS_VISITOR.role}`, () => {
  test(`${SCOPE}: Visual layout`, { tag: '@visual' }, async ({ page }) => {
    const { loginUI } = accountLoc(page);

    await test.step('⬜ Wait for logo and login button', async () => {
      await loginUI.logoImage.waitFor({ state: 'visible' });
      await loginUI.loginButton.waitFor({ state: 'visible' });
    });

    await expect(page, '🟧 UI: Login layout visual check').toHaveScreenshot(
      `${toSnapshotName(ANONYMOUS_VISITOR.role)}-login.png`,
      { fullPage: true }
    );
  });
});
