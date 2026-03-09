import { test as setup, expect } from '@fixtures';
import { t, AUTHENTICATED } from '@data';

for (const persona of AUTHENTICATED) {
  setup(`${persona.role} login`, { tag: persona.tag }, async ({ page, loc, act, query }) => {
    await setup.step('⬜ Go to login', async () => {
      await page.goto('/');
    });

    await setup.step('🟦 Log in to app', async () => {
      await act.login.submitCredentials({ username: persona.user, password: persona.pass });
    });

    await expect(loc.plp.title, '🟧 UI: PLP title check').toHaveText(t.plp.title);
    await expect(loc.header.cart.openBtn, '🟧 UI: Cart icon visible').toBeVisible();
    expect(await query.session.readUser(), '🟧 Data: Session cookies present').toBeTruthy();

    await setup.step('⬜ Save authentication state', async () => {
      await page.context().storageState({ path: persona.storageState });
    });
  });
}
