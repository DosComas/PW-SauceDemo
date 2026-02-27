import { test as setup, expect } from '@fixtures';
import { t, AUTHENTICATED } from '@data';

setup.describe('Setup', () => {
  for (const persona of AUTHENTICATED) {
    setup(`Authenticate as ${persona.role}`, { tag: persona.tag }, async ({ page, loc, act, query }) => {
      await setup.step('⬜ Go to login', async () => {
        await page.goto('/');
      });

      await setup.step('🟦 Log in to app', async () => {
        await act.login.submitCredentials({ user: persona.user, pass: persona.pass });
      });

      await expect(loc.plp.title, '🟧 UI: PLP title check').toHaveText(t.plp.title);
      await expect(loc.header.cart.openBtn, '🟧 UI: Cart icon visible').toBeVisible();
      expect(await query.session.readUser(), '🟧 Data: Session cookies present').toBeTruthy();

      await setup.step('⬜ Save authentication state', async () => {
        await page.context().storageState({ path: persona.storageState });
      });
    });
  }
});
