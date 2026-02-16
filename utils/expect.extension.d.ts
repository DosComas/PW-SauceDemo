import { type ToBeSortedByOptions } from './custom.assertions';
import { StateKey } from '@data';

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
       * // Sort names A-Z (Using sring order)
       * await expect(loc.plp.items.names).toBeSorted({ content: 'name', order: 'asc' });
       * * // Sort prices high-to-low (Using numeric order)
       * await expect(loc.plp.items.prices).toBeSorted({ content: 'price', order: 'desc' });
       * ```
       *
       */
      toBeSortedBy(sortBy: ToBeSortedByOptions, options?: { timeout?: number }): Promise<R>;

      /**
       * Asserts that a JSON array stored in LocalStorage has the expected number of items.
       * * This is highly useful for state-based testing where the UI might not
       * immediately reflect storage changes.
       *
       * **Usage**
       *
       * ```js
       * await expect(page).toHaveStorageLength('cart-contents', 3);
       * ```
       *
       */
      toHaveStorageLength(key: StateKey, expected: number, options?: { timeout?: number }): Promise<R>;
    }
  }
}

export {};
