import type { SortOption } from './types';
import { t } from './i18n/dictionary';

// ==========================================
// 🏛️ LOGIN ARIA SNAPSHOTS
// ==========================================

export const loginSnapshots = {
  logo: `
- text: ${t.meta.storeName}`,

  login: `
- textbox "${t.login.username}"
- textbox "${t.login.password}"
- button "${t.login.button}"`,

  credentials: `
- heading "Accepted usernames are:" [level=4]
- text: standard_user locked_out_user problem_user performance_glitch_user error_user visual_user
- heading "Password for all users:" [level=4]
- text: secret_sauce`,
};

// ==========================================
// 🏛️ CHECKOUT ARIA SNAPSHOTS
// ==========================================

export const checkoutSnapshots = {
  info: {
    title: `
- text: "${t.checkout.info.title}"`,

    container: `
- textbox "${t.checkout.info.form.firstName}"
- textbox "${t.checkout.info.form.lastName}"
- textbox "${t.checkout.info.form.zipCode}"
- button "${t.goBackAlt} ${t.checkout.cancel}":
  - img "${t.goBackAlt}"
- button "${t.checkout.info.continue}"`,
  },

  overview: {
    title: `
- text: "${t.checkout.overview.title}"`,

    container: ({ itemCount }: { itemCount: number }) => `
${_renderOverviewList(itemCount)}
- button "${t.goBackAlt} ${t.checkout.cancel}":
  - img "${t.goBackAlt}"
  - text: ${t.checkout.cancel}
- button "${t.checkout.overview.finish}"`,
  },

  complete: {
    title: `
- text: "${t.checkout.complete.title}"`,

    container: `
- img "${t.checkout.complete.ponyAlt}"
- heading "${t.checkout.complete.success}" [level=2]
- text: ${t.checkout.complete.dispatchedNote}
- button "${t.checkout.complete.backHome}"`,
  },
};

function _renderOverviewList(itemCount: number): string {
  const header = `- text: "${t.purchase.qty} ${t.purchase.description} 1"`;
  const items = Array.from({ length: itemCount }, (_, i) => {
    const isLast = i === itemCount - 1;
    const priceLine = isLast
      ? `- text: /.* \\$\\d*\\.\\d{2} Payment Information:\\s.* Shipping Information:\\s.* Price Total Item total:\\s\\$\\d*\\.\\d{2} Tax:\\s\\$\\d*\\.\\d{2} Total:\\s\\$\\d*\\.\\d{2}/`
      : `- text: /.* \\$\\d*\\.\\d{2}/`;

    return `- link /.*/:\n  - /url: "#"\n${priceLine}`;
  }).join('\n');

  return `${header}\n${items}`;
}

// ==========================================
// 🏛️ CART ARIA SNAPSHOTS
// ==========================================

export const cartSnapshot = {
  title: `
- text: ${t.cart.title}`,

  container: ({ itemCount }: { itemCount: number }) => `
${_renderCartList(itemCount)}
- button "${t.goBackAlt} ${t.cart.continueShopping}":
  - img "${t.goBackAlt}"
- button "${t.cart.checkout}"`,
};

function _renderCartList(cartCount: number): string {
  const header = `- text: "${t.purchase.qty} ${t.purchase.description} 1"`;
  const items = Array.from({ length: cartCount }, (_, i) => {
    const qtyLine = i === 0 ? '' : `- text: "1"\n`;

    return `${qtyLine}- link /.*/:\n  - /url: "#"\n- text: /.* \\$\\d*\\.\\d{2}/\n- button "${t.item.remove}"`;
  }).join('\n');

  return `${header}\n${items}`;
}

// ==========================================
// 🏛️ LAYOUT ARIA SNAPSHOTS
// ==========================================

export const layoutSnapshots = {
  header: ({ itemCount }: { itemCount: number }) => `
- button "${t.menu.openMenu}"
- img "${t.menu.openMenu}"
- text: ${t.meta.storeName}${itemCount > 0 ? ` ${itemCount}` : ''}`,

  footer: `
- contentinfo:
  - list:
    - listitem:
      - link "${t.footer.social.twitter.label}":
        - /url: "${t.footer.social.twitter.url}"
    - listitem:
      - link "${t.footer.social.facebook.label}":
        - /url: "${t.footer.social.facebook.url}"
    - listitem:
      - link "${t.footer.social.linkedin.label}":
        - /url: "${t.footer.social.linkedin.url}"
  - text: /© \\d{4} ${t.meta.storeName}. ${t.footer.copy}. ${t.footer.terms} | ${t.footer.privacy}/`,
};

// ==========================================
// 🏛️ CATALOG ARIA SNAPSHOTS
// ==========================================

export const catalogSnapshots = {
  plp: {
    titleAndSort: ({ sortBy }: { sortBy: SortOption }) => `
- text: ${`/^${t.plp.title}(\\s${t.plp.sort[sortBy].replace('(', '\\(').replace(')', '\\)')})?$/`}
- combobox:
  - option ${_renderSortOption(sortBy, 'az')}
  - option ${_renderSortOption(sortBy, 'za')}
  - option ${_renderSortOption(sortBy, 'loHi')}
  - option ${_renderSortOption(sortBy, 'hiLo')}`,

    item: ({ inCart }: { inCart: boolean }) => `
- link /.*/:
  - /url: "#"
  - img /.*/
- link /.*/:
  - /url: "#"
- text: /.* \\$\\d*\\.\\d{2}/
- button "${inCart ? t.item.remove : t.item.addToCart}"`,
  },

  pdp: {
    goBack: `
- button "${t.goBackAlt} ${t.pdp.goBackToProducts}"`,

    item: ({ inCart }: { inCart: boolean }) => `
- img /.*/
- text: /.* \\$\\d*\\.\\d{2}/
- button "${inCart ? t.item.remove : t.item.addToCart}"`,
  },
};

function _renderSortOption(sortBy: SortOption, option: SortOption): string {
  return `"${t.plp.sort[option]}"${sortBy === option ? ' [selected]' : ''}`;
}
