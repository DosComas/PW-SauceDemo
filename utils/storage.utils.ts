import type { Page, Cookie } from '@playwright/test';
import type { StateKeys } from '@data';
import { pollUntil } from './poll.utils';

// ==========================================
// 🏛️ STORAGE SCRAPER
// ==========================================

/** Retrieves a specific cookie by name */
export async function _getCookie(page: Page, name: string): Promise<Cookie | undefined> {
  const cookies = await page.context().cookies();
  return cookies.find((c) => c.name === name);
}

/** Retrieves data from LocalStorage with polling resilience */
export async function _getStorageData<T>(page: Page, key: StateKeys, options?: { timeout?: number }): Promise<T> {
  const { value, pass } = await pollUntil<T>(
    // CALLBACK: How to get the data
    async () => {
      const raw = await page.evaluate((k) => window.localStorage.getItem(k), key);
      if (raw === null) return null;

      try {
        return JSON.parse(raw);
      } catch {
        return raw as unknown as T; // Return as raw string if not JSON
      }
    },
    // CONDITION: When to stop polling (when the key exists)
    (val) => val !== null,
    options?.timeout,
  );

  if (!pass) throw new Error(`[_getStorageData] Timed out waiting for key: "${key}"`);
  return value as T;
}
