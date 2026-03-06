// ==========================================
// 🏛️ STATE CONSTANTS
// ==========================================

export type StateKeys = (typeof STATE_KEYS)[keyof typeof STATE_KEYS];

export const STATE_KEYS = {
  userSession: 'session-username',
  cart: 'cart-contents',
} as const;
