import { test as setup, expect } from '@fixtures';
import { t, ACCESS_USERS } from '@data';

for (const persona of ACCESS_USERS) {
  setup(`Authenticate as ${persona.role}`, async ({ page, loc, action, session }) => {
    await setup.step('⬜ Go to login', async () => {
      await page.goto('/');
    });

    await setup.step('🟦 Log in to app', async () => {
      await action.login.submit({ user: persona.user, pass: persona.pass });
    });

    await expect(loc.plp.title, '🟧 UI: PLP title check').toHaveText(t.plp.title);
    await expect(loc.header.cart.openBtn, '🟧 UI: Cart icon visible').toBeVisible();
    expect(await session.userSession(), '🟧 Data: Session cookies present').toBeTruthy();

    await setup.step('⬜ Save authentication state', async () => {
      await page.context().storageState({ path: persona.storageState });
    });
  });
}
