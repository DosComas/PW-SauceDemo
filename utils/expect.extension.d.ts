import type { SortByField, SortOrder } from './custom.assertions';

// ==========================================
// 🏛️ GLOBAL MATCHERS (IntelliSense)
// ==========================================

declare global {
  namespace PlaywrightTest {
    interface Matchers<R> {
      /**
       * Asserts that a Locator's elements are ordered by the specified criteria.
       * * Handles natural alphanumeric sorting for names and mathematical parsing for prices.
       * * Retries via progressive polling to handle UI transitions and loading states.
       *
       * **Usage**
       *
       * ```js
       * // Sort names A-Z (Using string order)
       * await expect(loc.plp.items.names).toBeSorted('name', 'asc');
       * // Sort prices high-to-low (Using numeric order)
       * await expect(loc.plp.items.prices).toBeSorted('price', 'desc');
       * ```
       *
       */
      toBeSortedBy(by: SortByField, order: SortOrder, options?: { timeout?: number }): Promise<R>;
    }
  }
}

export {};
