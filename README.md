# SauceDemo Test Suite

This project is an automation testing suite for the SauceDemo Shop web application, built using **Playwright** and
**TypeScript**. It leverages **Functional Helpers** to improve test reusability and maintainability.

The tests cover critical workflows such as login, adding items to the cart, and completing the checkout process. The
suite is configured to run across different browsers and screen sizes, with detailed HTML reports generated for easy
tracking of test results.

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

To keep our Playwright reports scannable and consistent, we follow the **Arrange-Act-Assert (AAA)** pattern. Using
emojis in `test.step` titles allows us to identify the "health" of our tests at a glance.

# Test Orchestration Standards: AAA Step Categorization

### ⬜ Arrange (Preparation)

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

1.  **Categorized Failures:** If a **⬜** step fails, the **Environment** is likely the issue. If an **🟧** fails, the
    **Feature** is likely broken.
2.  **Report Scannability:** Makes the Playwright HTML report and Trace Viewer incredibly easy to read for developers
    and stakeholders alike.

# Helper File Architecture

To maintain a clean and predictable codebase, all helper files follow this vertical structure:

### 1. `// --- TYPES ---`

**The Contract.** Defines interfaces and types. It sets the rules for what data each function requires.

### 2. `// --- LOCATORS ---`

**The Map.** The collection of element selectors. These are kept public to allow for assertions and `expect` statements
directly in the test cases.

### 3. `// --- PRIVATE UTILITIES ---`

**The Guts.** Internal logic and scoping functions used by actions but hidden from the test files.

### 4. `// --- ACTIONS ---`

**The Behavior.** The actual Playwright implementation of user tasks (clicks, scrapes, inputs).

### 5. `// --- MODULE INTERFACE ---`

**The Remote Control.** The final `export const`. This is the **Public API** used in tests, mapping internal logic to
clean, accessible keys.

# Playwright Productivity Snippets (`pw-`)

This repository uses custom VS Code snippets to enforce our **Arrange-Act-Assert** architecture and eliminate
boilerplate.

### How to Use

1. Start typing `pw-` in any `.ts` file.
2. Press **Enter** to expand the template.
3. Use **Tab** to navigate between placeholders (names, emoji pickers, and logic).

### Architectural Templates

| Prefix        | Snippet Name       | Description                                                   |
| :------------ | :----------------- | :------------------------------------------------------------ |
| `new-spec`    | **New Spec**       | Full test suite template with Persona loops and `SCOPE`.      |
| `new-helper`  | **New Helper**     | Standardized module for Locators, Private Utils, and Actions. |
| `pw-describe` | **Emoji Describe** | `test.describe()` with standardized test and steps.           |
| `pw-test`     | **Emoji Test**     | `test()` with standardized steps.                             |
| `pw-step`     | **Emoji Step**     | `test.step` with an integrated phase picker (⬜/🟦/🟧).       |

### Standard Lifecycle Blocks

| Prefix          | Description                                         |
| :-------------- | :-------------------------------------------------- |
| `pw-beforeEach` | `beforeEach` hook for setup logic.                  |
| `pw-afterEach`  | `afterEach` hook for cleanup logic.                 |
| `pw-beforeAll`  | `beforeAll` hook for one-time setup.                |
| `pw-afterAll`   | `afterAll` hook for one-time teardown.              |
| `pw-use`        | `test.use()` to override **Context** configuration. |

### Visual Language (Emoji System)

We use emojis to make our **Trace Viewers** and **HTML Reports** instantly scannable. Choose the phase that matches your
code logic:

- ⬜ **Arrange:** Setting up state, navigation, or authentication.
- 🟦 **Act:** Primary user interactions (clicks, form fills, submissions).
- 🟧 **Assert:** Verifications, expectations, and snapshots.

---

### Why it Matters

- **Consistency:** Every test file follows the same architectural "Blueprint."
- **Scannability:** Debug failures faster by identifying which "Phase" (Arrange, Act, or Assert) failed at a glance.
- **Speed:** Write complex, persona-driven tests in seconds rather than minutes.

---

# Playwright Assertion Style Guide

### Core Rule

Every assertion message must be **Categorized**, **Outcome-Oriented**, and **Concise**.

---

### The Guide

- **Format:** `[Emoji] [Category]: [Target] [Outcome]`
- **Verb Style:** Use **Active Facts** (e.g., _matches_, _visible_) instead of "should."
- **Prefixes:**
  - `🟧 UI:` Visibility, text content, and layout/screenshots.
  - `🟧 Data:` LocalStorage, session state, and background logic.

---

### Examples

| Category | Message Example                        |
| :------- | :------------------------------------- |
| **UI**   | `'🟧 UI: Product name matches'`        |
| **UI**   | `'🟧 UI: Login Layout visual check'`   |
| **Data** | `'🟧 Data: Local storage has 3 items'` |
| **Data** | `'🟧 Data: Session state is empty'`    |

---
