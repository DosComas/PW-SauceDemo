import { test, expect } from '@playwright/test';
import { accountLoc, doLogin } from '../../helpers/account.helpers';
import { t } from '../../utils/i18n';
import { INVALID_USERS, ANONYMOUS_VISITOR } from '../../data/users.data';
import { toSnapshotName } from '../../utils/string.utils';

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

      await expect(loginUI.errorMessage, '🟧 Error message should be displayed').toContainText(
        t(persona.expectedError)
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

    await expect(page, '🟧 Login layout should be correct').toHaveScreenshot(
      `${toSnapshotName(ANONYMOUS_VISITOR.role)}-login.png`,
      { fullPage: true }
    );
  });
});
