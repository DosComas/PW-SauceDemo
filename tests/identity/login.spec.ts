import { test, expect } from '@playwright/test';
import { accountUI, doLogin } from '../../helpers/account-helpers';
import { t } from '../../helpers/i18n';
import { invalidUsers, anonymousVisitor as persona } from '../../data/users';
import { toSnapshotName } from '../../helpers/string-utils';

test.beforeEach(async ({ page }) => {
  await test.step('🟦 Navigate', async () => {
    await page.goto('/');
  });
});

for (const persona of invalidUsers) {
  test.describe(`${persona.role}`, () => {
    test(`Validate login failure`, async ({ page }) => {
      const { loginUI } = accountUI(page);

      await test.step('🟦 Login', async () => {
        await doLogin(page, { user: persona.user, pass: persona.pass });
      });

      await expect(loginUI.errorMessage, '🟧 Error message should be displayed').toContainText(
        t(persona.expectedError),
      );
    });
  });
}

test.describe(`${persona.role}`, () => {
  test('Validate login page @visual', async ({ page }) => {
    const { loginUI } = accountUI(page);

    await test.step('🟦 Wait for logo and login button', async () => {
      await loginUI.logoImage.waitFor({ state: 'visible' });
      await loginUI.loginButton.waitFor({ state: 'visible' });
    });

    await expect(page, '🟧 Login page should be visible').toHaveScreenshot(
      `${toSnapshotName(persona.role)}-login.png`,
    );
  });
});
