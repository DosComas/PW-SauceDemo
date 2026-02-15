import { test as setup, expect } from '@fixtures';
import { t, VALID_USERS } from '@data';

for (const persona of VALID_USERS) {
  setup(`Authenticate as ${persona.role}`, async ({ page, loc, action, session }) => {
    await setup.step('⬜ Go to login page', async () => {
      await page.goto('/');
    });

    await setup.step('🟦 Log in to app', async () => {
      await action.login.submit({ user: persona.user, pass: persona.pass });
    });

    await expect(loc.plp.title, '🟧 UI: PLP title check').toHaveText(t.catalog.title);
    await expect(loc.header.cartBtn, '🟧 UI: Cart icon visible').toBeVisible();
    expect(await session.getCookie(), '🟧 Data: Session cookies present').toBeTruthy();

    await setup.step('⬜ Save authentication state', async () => {
      await page.context().storageState({ path: persona.storageState });
    });
  });
}
