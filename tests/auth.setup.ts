import { test as setup, expect } from '@fixtures';
import type { AuthenticatedPersona } from '@data';
import { t, AUTHENTICATED } from '@data';

let personasToAuth: readonly AuthenticatedPersona[];

const hasGrep = process.argv.some((arg) => arg === '-g' || arg.startsWith('--grep'));

if (hasGrep) {
  personasToAuth = AUTHENTICATED.filter((p) => process.argv.join(' ').includes(p.tag));
  if (personasToAuth.length === 0) personasToAuth = AUTHENTICATED;
} else personasToAuth = AUTHENTICATED;

for (const persona of personasToAuth) {
  setup(`Authenticate as ${persona.role}`, { tag: persona.tag }, async ({ page, loc, action, session }) => {
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
