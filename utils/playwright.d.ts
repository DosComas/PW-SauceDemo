import { SortAttribute, SortOrder } from './matchers';

declare global {
  namespace PlaywrightTest {
    interface Matchers<R> {
      /**
       * Asserts that a collection of elements is ordered by the specified attribute.
       * Handles currency parsing for 'price' and alphanumeric comparison for 'name'.
       *
       * **Usage**
       *
       * ```js
       * // Assert products are sorted by price descending
       * await expect(inventoryUI.productCards).toBeSortedBy('price', 'desc');
       * ```
       *
       */
      toBeSortedBy(attribute: SortAttribute, order: SortOrder, options?: { timeout?: number }): Promise<R>;

      /**
       * Asserts that a JSON array in LocalStorage matches the expected length.
       * Retries until the key is found and the array count is correct.
       *
       * **Usage**
       *
       * ```js
       * // Assert the shopping cart in storage has 3 items
       * await expect(page).toHaveStorageLength('cart-contents', 3);
       * ```
       *
       */
      toHaveStorageLength(key: string, expected: number, options?: { timeout?: number }): Promise<R>;
    }
  }
}

export {};
