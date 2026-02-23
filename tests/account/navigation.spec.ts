import { expect, test } from '@fixtures';
import type { SocialPlatform, SocialPlatformData } from '@data';
import { t, BASELINE } from '@data';

const SOCIAL = Object.entries(t.footer.social) as [SocialPlatform, SocialPlatformData][];
const ABOUT = t.menu.about;

test.describe.parallel('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await test.step('⬜ Go to inventory', async () => {
      await page.goto('/inventory.html');
    });
  });

  for (const persona of BASELINE) {
    test.describe(`${persona.role}`, { tag: persona.tag }, () => {
      test.use({ storageState: persona.storageState });

      test('Social Media Links', async ({ loc }) => {
        for (const [platform, expected] of SOCIAL) {
          await test.step(`🟧 UI: ${expected.label} link properties`, async () => {
            const socialLoc = loc.footer.social[platform];
            await expect.soft(socialLoc).toHaveAttribute('href', expected.url);
            await expect.soft(socialLoc).toHaveAttribute('target', '_blank');
          });
        }
      });

      test('About Link', async ({ loc, act }) => {
        await test.step('🟦 Open main menu', async () => {
          await act.menu.openMenu();
        });

        await expect.soft(loc.header.menu.aboutBtn, '🟧 UI: About button visible').toBeVisible();
        await expect(loc.header.menu.aboutBtn, `🟧 UI: About link URL`).toHaveAttribute('href', ABOUT.url);
      });
    });
  }
});
