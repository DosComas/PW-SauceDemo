import { expect as baseExpect, Page } from '@playwright/test';

type StorageTarget = { page: Page; key: string };

export const expect = baseExpect.extend({
  async toHaveStorageLength(target: StorageTarget, expected: number, options?: { timeout?: number }) {
    const assertionName = 'toHaveStorageLength';
    const timeout = options?.timeout || 5000;
    const start = Date.now();

    let actualLength: number | null = null;
    let keyExists = false;
    let pass = false;
    let currentWait = 100;

    // The Polling Loop
    while (Date.now() - start < timeout) {
      const rawValue = await target.page.evaluate((k) => window.localStorage.getItem(k), target.key);

      if (rawValue === null) {
        keyExists = false;
        actualLength = null;
      } else {
        keyExists = true;
        try {
          const parsed = JSON.parse(rawValue);
          actualLength = Array.isArray(parsed) ? parsed.length : -1;
        } catch {
          actualLength = -2; // Signal for invalid JSON
        }
      }

      if (actualLength === expected) {
        pass = true;
        break;
      }

      // Progressive Polling
      await new Promise((res) => setTimeout(res, currentWait));

      if (currentWait < 250) {
        currentWait = 250;
      } else if (currentWait < 500) {
        currentWait = 500;
      } else if (currentWait < 1000) {
        currentWait = 1000;
      }
    }

    const message = () => {
      const header = this.utils.matcherHint(assertionName, 'storage', 'expected', { isNot: this.isNot });

      let receivedInfo: string;
      if (!keyExists) {
        receivedInfo = `Received: ${this.utils.printReceived(null)} (Key not found in LocalStorage)`;
      } else if (actualLength === -1) {
        receivedInfo = `Received: ${this.utils.printReceived('Not an Array')}`;
      } else if (actualLength === -2) {
        receivedInfo = `Received: ${this.utils.printReceived('Invalid JSON')}`;
      } else {
        receivedInfo = `Received length: ${this.utils.printReceived(actualLength)}`;
      }

      return (
        header +
        '\n\n' +
        `Storage Key: "${target.key}"\n` +
        `Expected length: ${this.utils.printExpected(expected)}\n` +
        receivedInfo
      );
    };

    return { message, pass };
  },
});
