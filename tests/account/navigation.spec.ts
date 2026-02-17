import { expect, test } from '@fixtures';
import { type SocialPlatform, type SocialPlatformData, BASELINE_USERS } from '@data';
import { t } from '@data';

const SCOPE = 'Nav';

const SOCIAL_LINKS = Object.entries(t.footer.social) as [SocialPlatform, SocialPlatformData][];
const ABOUT_DATA = t.menu.about;

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to inventory', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of BASELINE_USERS) {
  test.describe(`${persona.role}`, { tag: persona.tag }, () => {
    test.use({ storageState: persona.storageState });

    test(`${SCOPE}: Social Media Links`, async ({ loc }) => {
      for (const [platform, expected] of SOCIAL_LINKS) {
        const socialLoc = loc.footer.social[platform];

        await expect.soft(socialLoc, `🟧 UI: ${expected.label} opens in a new tab`).toHaveAttribute('target', '_blank');
        await expect.soft(socialLoc, `🟧 Data: ${expected.label} matches URL`).toHaveAttribute('href', expected.url);
      }
    });

    test(`${SCOPE}: About Link`, async ({ loc, action }) => {
      await test.step('🟦 Open main menu', async () => {
        await action.menu.open();
      });

      await expect.soft(loc.header.menu.aboutBtn, '🟧 UI: About button visible').toBeVisible();
      await expect(loc.header.menu.aboutBtn, `🟧 Data: ${ABOUT_DATA.label} matches URL`).toHaveAttribute(
        'href',
        ABOUT_DATA.url,
      );
    });
  });
}
