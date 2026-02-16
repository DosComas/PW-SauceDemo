import { expect, test } from '@fixtures';
import { type SocialPlatform, type SocialPlatformData, BASELINE_USERS } from '@data';
import { t } from '@data';

const SCOPE = 'Nav';

test.beforeEach(async ({ page }) => {
  await test.step('⬜ Go to inventory page', async () => {
    await page.goto('/inventory.html');
  });
});

for (const persona of BASELINE_USERS) {
  test.describe(`${persona.role}`, { tag: persona.tag }, () => {
    test.use({ storageState: persona.storageState });

    test(`${SCOPE}: Social Media Links`, async ({ loc }) => {
      const platformSpecs = Object.entries(t.footer.social) as [SocialPlatform, SocialPlatformData][];
      for (const [platform, expected] of platformSpecs) {
        const socialLoc = loc.footer.social[platform];

        await expect.soft(socialLoc, `🟧 UI: ${expected.label} label`).toHaveText(expected.label);
        await expect.soft(socialLoc, `🟧 UI: ${expected.label} target`).toHaveAttribute('target', '_blank');
        await expect(socialLoc, `🟧 Data: ${expected.label} URL`).toHaveAttribute('href', expected.url);
      }
    });
  });
}
