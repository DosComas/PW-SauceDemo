# SauceDemo Test Suite

This project is an automation testing suite for the SauceDemo Shop web application, built using **Playwright** and **TypeScript**. It leverages **Functional Helpers** to improve test reusability and maintainability.

The tests cover critical workflows such as login, adding items to the cart, and completing the checkout process. The suite is configured to run across different browsers and screen sizes, with detailed HTML reports generated for easy tracking of test results.

# Setup Instructions

## Prerequisites

- Node.js (>= 16.x)

- NPM (comes with Node.js)

### 1. Install Dependencies

Run the following command to install all required packages:

```
npm install
```

### 2. Configure Environment Variables

Rename `.env.example` to `.env` and update values as needed.

### 3. Update Screenshots (optional)

If snapshots fail due to system or rendering differences, update them with:

```
npx playwright test --update-snapshots
```

### 4. Run Tests

To execute the tests across all configured browsers:

```
npx playwright test
```

For specific browsers, use the following commands:

```
npx playwright test --project=Chrome
npx playwright test --project=Mobile Chrome
```

### 5. View Reports

After running the tests, view the results by running:

```
npx playwright show-report
```

## Dependencies

- `playwright` - Playwright for end-to-end testing.

- `dotenv` - Environment variable management.

To keep our Playwright reports scannable and consistent, we follow the **Arrange-Act-Assert (AAA)** pattern. Using emojis in `test.step` titles allows us to identify the "health" of our tests at a glance.

# Test Orchestration Standards: AAA Step Categorization

### ⬜ Arrange (Setup & Preparation)

**Purpose:** Everything required to get the application into the starting state.

- **Navigation:** `page.goto('/')`
- **Waiting:** `element.waitFor({ state: 'visible' })`
- **Infrastructure:** Saving `storageState`, setting cookies, or seeding data.
- **Data Collection:** Scraping "Source of Truth" data from the UI to use for later comparisons.

> **Example:** `await test.step('⬜ Navigate and wait for inventory', async () => { ... });`

### 🟦 Act (Execution)

**Purpose:** The specific user behavior or system action being tested.

- **Interactions:** `click()`, `fill()`, `dragTo()`, `hover()`.
- **Functional Actions:** Reloading the page to test persistence.
- **User Flow:** Moving from one logical page or state to another.

> **Example:** `await test.step('🟦 Add product to cart', async () => { ... });`

### 🟧 Assert (Verification)

**Purpose:** Confirming that the application is in the expected state.

- **Expectations:** `toHaveText()`, `toBeVisible()`, `toHaveValue()`.
- **Visual Testing:** `toHaveScreenshot()`.
- **Data Integrity:** Comparing "Act" results against "Arrange" data.

> **Example:** `await test.step('🟧 Verify price matches inventory', async () => { ... });`

---

### Quick Reference Table

| Emoji  | Phase       | Logical Goal               | Example Actions                    |
| :----- | :---------- | :------------------------- | :--------------------------------- |
| **⬜** | **Arrange** | "Get to the starting line" | `goto`, `waitFor`, `storageState`  |
| **🟦** | **Act**     | "Do the work"              | `click`, `fill`, `press`, `reload` |
| **🟧** | **Assert**  | "Check the result"         | `expect`, `toHaveScreenshot`       |

### Why we use this:

1.  **Categorized Failures:** If a **⬜** step fails, the **Environment** is likely the issue. If an **🟧** fails, the **Feature** is likely broken.
2.  **Report Scannability:** Makes the Playwright HTML report and Trace Viewer incredibly easy to read for developers and stakeholders alike.

# Helper File Architecture

To maintain a clean and predictable codebase, all helper files follow this vertical structure:

### 1. `// --- TYPES ---`

**The Contract.** Defines interfaces and types. It sets the rules for what data each function requires.

### 2. `// --- LOCATORS ---`

**The Map.** The collection of element selectors. These are kept public to allow for assertions and `expect` statements directly in the test cases.

### 3. `// --- PRIVATE UTILITIES ---`

**The Guts.** Internal logic and scoping functions used by actions but hidden from the test files.

### 4. `// --- ACTIONS ---`

**The Behavior.** The actual Playwright implementation of user tasks (clicks, scrapes, inputs).

### 5. `// --- MODULE INTERFACE ---`

**The Remote Control.** The final `export const`. This is the **Public API** used in tests, mapping internal logic to clean, accessible keys.
