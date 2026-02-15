# SauceDemo Test Suite

Automation testing suite for the SauceDemo Shop web application built with **Playwright**, **TypeScript**, and
**Functional Helpers**. Tests cover login, cart operations, and checkout workflows across multiple browsers and screen
sizes with a focus on data-driven assertions and resilient custom matchers.

## Quick Start

**Prerequisites:** Node.js (>= 16.x) and NPM

1. **Install:** `npm install`
2. **Configure:** Rename `.env.example` to `.env` and add your environment variables
3. **Run:** `npx playwright test` (all browsers) or `npx playwright test --project=Chrome` (specific browser)
4. **Report:** `npx playwright show-report` to view detailed HTML report

**Additional Commands:**

- Update snapshots: `npx playwright test --update-snapshots`
- Single test file: `npx playwright test tests/auth.setup.ts`
- Debug mode: `npx playwright test --debug`

**Dependencies:** `playwright` (end-to-end testing), `dotenv` (environment management)

## Test Philosophy

**Tests validate functionality regardless of data.** Use the **Arrange-Act-Assert (AAA)** pattern with emoji categories
for clarity. Collect data during Arrange and use it for comparisons in Assert—no hard-coded product names or counts.
This ensures resilience across environments and data changes.

**Example:** Instead of asserting "Product X is at position 1", collect all product names during Arrange, apply a sort
action during Act, then compare the new order against the collected data during Assert.

## AAA Step Categorization

| Emoji  | Phase       | Description                                           | Examples                                    |
| :----- | :---------- | :---------------------------------------------------- | :------------------------------------------ |
| **⬜** | **Arrange** | Set up the test environment and collect baseline data | navigation, waiting, setup, data collection |
| **🟦** | **Act**     | Perform the user action or workflow being tested      | clicks, form fills, reload, user workflows  |
| **🟧** | **Assert**  | Verify the application state or behavior              | expectations, screenshots, result checks    |

**Benefit:** Categorical failures pinpoint the issue. Debug faster by knowing if failure is in setup, feature, or
verification.

## Helper File Structure

All helpers follow this pattern:

1. `// --- TYPES ---` – Interfaces and type contracts
2. `// --- LOCATORS ---` – Public element selectors (used directly in tests)
3. `// --- PRIVATE UTILITIES ---` – Internal helper functions
4. `// --- ACTIONS ---` – Playwright user task implementations
5. `// --- MODULE INTERFACE ---` – Public API export (`export const`)

**Usage in tests:** Import locators and actions, use them to build readable test workflows:

```typescript
const { inventoryUI, productUI } = catalogLoc(page);
await catalog.addProductToCart(page, { from: 'inventory', index: 0 });
```

## Locator Strategy

**Aria locators have priority.** Use accessible selectors (`getByRole`, `getByLabel`, etc.) whenever possible. For
dynamic text and localization, `dictionary.data.ts` provides centralized strings, enabling selectors to work across
languages.

```typescript
// Simple aria-based locator with i18n text
addToCartButton: page.getByRole('button', { name: t('product.addToCart') });
```

## Project Structure

```
PW-SauceDemo/
├── data/                  # Test data, user personas, environment config, selectors
├── helpers/               # Reusable actions and locators organized by feature
├── tests/                 # Test specifications organized by workflow
│   ├── auth.setup.ts      # Authentication setup for persona storage
│   ├── catalog/           # Inventory and product tests
│   ├── identity/          # Login/logout tests
│   ├── journeys/          # End-to-end workflows
│   └── purchase/          # Cart and checkout tests
├── utils/                 # Testing utilities, custom matchers, polling logic
└── playwright.config.ts   # Playwright configuration with path aliases
```

## Import Paths

The project uses TypeScript path aliases for clean imports:

```typescript
import { catalogLoc, catalog } from '@helpers'; // helpers/index.ts
import { STORAGE_KEYS, VALID_USERS } from '@data'; // data/index.ts
import { expect, poll } from '@utils'; // utils/index.ts
```

These aliases are configured in `tsconfig.json` and prevent deeply-nested relative paths.

## Custom Matchers & Assertions

Custom matchers are extended with **polling logic** to handle dynamic content and async state changes. They use the
`poll` utility for progressive wait intervals (100ms → 250ms → 500ms → 1000ms).

### toHaveStorageLength(page, key, expected)

Verifies that a localStorage key contains an array with a specific length. Useful for validating cart counts and session
data.

```typescript
await expect(page).toHaveStorageLength(STORAGE_KEYS.cart, 3);
```

### toBeSortedBy(locator, attribute, order)

Validates that a collection of elements is sorted by `name` or `price` in `asc` or `desc` order. Works with product
lists and dynamic sorting.

```typescript
await expect(inventoryUI.productCards).toBeSortedBy('price', 'asc');
```

## Polling Utility

`poll()` is a generic helper function in `utils/matchers.ts` for custom matchers that need to wait for async conditions.
It handles timeouts, progressive backoff, and **transient errors** automatically.

**Key features:**

- Retries on transient failures (stale elements, timing issues, element not yet loaded)
- Progressive wait intervals: 100ms → 250ms → 500ms → 1000ms
- Returns both the final value and pass/fail status

```typescript
const { pass, value } = await poll(
  async () => {
    /* check condition */
  },
  (value) => {
    /* validation logic */
  },
  5000, // timeout in ms
);
```

## VS Code Snippets (`pw-` or `new-` )

Type `pw-` or `new-` and press Enter in any `.ts` file to expand templates. Snippets enforce AAA structure and
auto-inject emoji categories.

**Architectural Templates:**

- `new-spec` – Full test suite with persona loops and SCOPE variable
- `new-helper` – Helper module scaffold with all 5 sections
- `pw-describe` – Test describe block with structural template
- `pw-test` – Test case with AAA steps
- `pw-step` – Individual step with emoji picker (⬜/🟦/🟧)

**Lifecycle Hooks:**

- `pw-beforeEach` – Setup before each test
- `pw-afterEach` – Cleanup after each test
- `pw-beforeAll` – One-time setup
- `pw-afterAll` – One-time teardown
- `pw-use` – Context configuration override

## Assertion Style Guide

**Core rule:** Every assertion must be categorized, outcome-oriented, and concise.

**Format:** `[Emoji] [Category]: [Assertion Context]`  
**Verb style:** Use active facts (`matches`, `visible`) not "should"  
**Categories:**

- `🟧 UI:` Visibility, text content, layout, and visual regression checks
- `🟧 Data:` localStorage, session state, API responses, and business logic

**Examples:**

```typescript
await expect.soft(page).toHaveStorageLength('cart', 3, '🟧 Data: Local storage has 3 items');
await expect.soft(inventoryUI.cartBadge).toHaveText('3', '🟧 UI: Cart Badge shows 3 items');
await expect(page).toHaveScreenshot('inventory.png', '🟧 UI: Inventory layout visual check');
```

**Why it matters:** Clear categorization helps report readers instantly identify whether failures are UI, data, or
environment issues.
