import { t } from './i18n/dictionary';

// ==========================================
// 🏛️ PURCHASE SNAPSHOTS DATA
// ==========================================

export const checkoutSnapshots = {
  completeContainer: `
    - img "${t.checkout.complete.ponyAlt}"
    - heading "${t.checkout.complete.success}" [level=2]
    - text: ${t.checkout.complete.dispatchedNote}
    - button "${t.checkout.complete.backHome}"
  `,
} as const;
