import { type Page, type Locator, expect } from '@playwright/test';
import type * as d from '@data';
import { t, layoutSnapshots } from '@data';

// ==========================================
// 🏛️ DOMAIN SCHEMA
// ==========================================

type LayoutSchema = {
  loc: ReturnType<typeof layoutLocators>;

  aria: {
    /** Validates the primary header state (menu, cart badge) */
    expectPrimary: (args: { itemCount: number }) => Promise<void>;

    /** Validates the secondary header state (title, sort, back buttons) */
    expectSecondary: (args: { snapshot: string }) => Promise<void>;

    /** Validates the global footer state (social links, copyright) */
    expectFooter: () => Promise<void>;
  };
};

// ==========================================
// 🏛️ DOMAIN LOCATORS
// ==========================================

const layoutLocators = (page: Page) => {
  const _social = page.locator('.social');

  return {
    header: {
      appLogo: page.locator('.login_logo').filter({ hasText: t.meta.storeName }),
      container: {
        primary: page.getByTestId('primary-header'),
        secondary: page.getByTestId('secondary-header'),
      },
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
      container: page.getByTestId('footer'),
      social: {
        twitter: _social.getByRole('link', { name: t.footer.social.twitter.label }),
        facebook: _social.getByRole('link', { name: t.footer.social.facebook.label }),
        linkedin: _social.getByRole('link', { name: t.footer.social.linkedin.label }),
      } satisfies Record<d.SocialPlatform, Locator>,
    },
  } as const satisfies d.LocatorSchema;
};

// ==========================================
// 🏛️ DOMAIN GATEWAY
// ==========================================

export const layout = (page: Page): LayoutSchema => {
  const loc = layoutLocators(page);

  return {
    loc,
    aria: {
      expectPrimary: async ({ itemCount }) => {
        await expect(loc.header.container.primary, 'Header ARIA snapshot').toMatchAriaSnapshot(
          layoutSnapshots.header({ itemCount }),
        );
      },
      expectSecondary: async ({ snapshot }) => {
        await expect(loc.header.container.secondary, 'Secondary header ARIA snapshot').toMatchAriaSnapshot(snapshot);
      },
      expectFooter: async () => {
        await expect(loc.footer.container, 'Footer ARIA snapshot').toMatchAriaSnapshot(layoutSnapshots.footer);
      },
    },
  } as const;
};
