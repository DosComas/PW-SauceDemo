// ==========================================
// 🏛️ POLLING UTILITY (Wait Logic)
// ==========================================

/**
 * A progressive polling utility that retries a callback until a condition is met.
 * Handles transient UI errors and scales wait times to be efficient.
 */
export async function pollUntil<T>(
  callback: () => Promise<T | null>,
  condition: (value: T) => boolean,
  timeout: number = 5000,
): Promise<{ value: T | null; pass: boolean }> {
  const start = Date.now();
  let currentWait = 100;
  let value: T | null = null;

  while (Date.now() - start < timeout) {
    try {
      value = await callback();

      // Ensure we have a value and it meets our business logic
      if (value !== null && condition(value)) {
        return { value, pass: true };
      }
    } catch (error) {
      // Transient errors are expected during polling.
    }

    // Progressive Polling: 100ms -> 250ms -> 500ms -> 1000ms
    await new Promise((res) => setTimeout(res, currentWait));

    if (currentWait < 1000) {
      currentWait = currentWait < 250 ? 250 : currentWait < 500 ? 500 : 1000;
    }
  }

  return { value, pass: false };
}
