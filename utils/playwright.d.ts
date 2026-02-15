import { ToBeSortedByOptions } from './matchers';

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
       * await expect(inventory.itemNames).toBeSorted({ content: 'name', order: 'asc' });
       * * // Sort prices high-to-low (Using numeric order)
       * await expect(inventory.itemPrices).toBeSorted({ content: 'price', order: 'desc' });
       * ```
       *
       */
      toBeSorted(sortBy: ToBeSortedByOptions, options: { timeout?: number }): Promise<R>;

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
      toHaveStorageLength(key: string, expected: number, options?: { timeout?: number }): Promise<R>;
    }
  }
}

export {};
