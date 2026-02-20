import { Page, Locator } from '@playwright/test';
import type * as d from '@data';
import { t } from '@data';

// ==========================================
// 🏛️ LAYOUT LOCATORS GATEWAY
// ==========================================

export const layoutLocators = (page: Page) => {
  const _social = page.locator('.social');

  return {
    header: {
      appLogo: page.locator('.login_logo').filter({ hasText: t.meta.storeName }),
      menu: {
        openBtn: page.getByRole('button', { name: t.menu.openMenu }),
        logoutBtn: page.getByRole('link', { name: t.menu.logout }),
        aboutBtn: page.getByRole('link', { name: t.menu.about.label }),
        panel: page.locator('.bm-menu-wrap'),
      },
      cart: {
        openBtn: page.getByTestId('shopping-cart-link'),
        badge: page.getByTestId('shopping-cart-badge'),
      },
    },
    footer: {
      social: {
        twitter: _social.getByRole('link', { name: t.footer.social.twitter.label }),
        facebook: _social.getByRole('link', { name: t.footer.social.facebook.label }),
        linkedin: _social.getByRole('link', { name: t.footer.social.linkedin.label }),
      } satisfies Record<d.SocialPlatform, Locator>,
    },
  } as const satisfies d.LocSchema;
};
