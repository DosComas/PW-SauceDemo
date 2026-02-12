import { expect as baseExpect, Page } from '@playwright/test';

type StorageTarget = { page: Page; key: string };

export const expect = baseExpect.extend({
  async toHaveStorageLength(target: StorageTarget, expected: number) {
    const assertionName = 'toHaveStorageLength';

    const matcherOptions = {
      isNot: this.isNot,
      promise: this.promise,
    };

    // 1. Fetch the raw value
    const rawValue = await target.page.evaluate((k: string) => {
      return window.localStorage.getItem(k);
    }, target.key);

    // 2. Existence Check: Error if the key is missing
    if (rawValue === null) {
      return {
        pass: false,
        message: () =>
          this.utils.matcherHint(assertionName, 'storage', 'expected', matcherOptions) +
          '\n\n' +
          `Storage Key: "${target.key}"\n` +
          `Received: ${this.utils.printReceived(null)} (Key not found)`,
      };
    }

    // 3. Parse and Type Check
    let actual;
    try {
      actual = JSON.parse(rawValue);
    } catch (e) {
      actual = rawValue;
    }

    if (!Array.isArray(actual)) {
      return {
        pass: false,
        message: () =>
          this.utils.matcherHint(assertionName, 'storage', 'expected', matcherOptions) +
          '\n\n' +
          `Storage Key: "${target.key}"\n` +
          `Value is not an array.\n` +
          `Received: ${this.utils.printReceived(actual)}`,
      };
    }

    const actualLength = actual.length;
    const pass = actualLength === expected;

    // 5. Standard Playwright Message
    const message = () => {
      const header = this.utils.matcherHint(assertionName, 'storage', 'expected', matcherOptions);
      return (
        header +
        '\n\n' +
        `Storage Key: "${target.key}"\n` +
        `Expected length: ${this.utils.printExpected(expected)}\n` +
        `Received length: ${this.utils.printReceived(actualLength)}`
      );
    };

    return { message, pass };
  },
});
