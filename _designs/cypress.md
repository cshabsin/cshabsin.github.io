---
layout: post
title: Conju NextGen Cypress Integration Testing Plan
author: cshabsin
---

# Cypress Integration Testing Plan

**Author:** Gemini **Status:** Proposed

## 1. Justification for a New Approach

Our current integration testing setup relies on Jest and the `jsdom` library to
simulate a browser environment. While this is effective for unit tests, we have
consistently encountered issues when trying to write more complex,
component-based integration tests. These issues include:

1.  **Missing Web APIs:** `jsdom` is a pure JavaScript simulation of a browser
    DOM and does not include many modern web APIs that libraries like Firebase
    expect to be present. This has forced us to spend significant time finding
    and implementing "polyfills" for APIs like `TextEncoder`, `ReadableStream`,
    and `fetch`.

2.  **Obscure Environment Errors:** We've encountered cryptic errors like
    `Cannot read properties of null (reading '_location')` that originate deep
    within `jsdom`. These errors are difficult to debug and are a direct result
    of the test environment's limitations, not a problem with the application
    code itself.

3.  **Low Fidelity:** A simulated environment will always be an imperfect
    approximation of a real browser. It cannot fully replicate the nuances of
    rendering, network requests, and user interactions, which reduces the
    confidence we can have in these tests.

Continuing down the path of fighting and polyfilling `jsdom` is inefficient and
brittle. A much more robust and reliable solution is to run our integration
tests in the same environment our users will: a real browser.

## 2. Proposal: Adopt Cypress for E2E and Integration Testing

I propose we adopt **Cypress** as our framework for all UI-based integration and
end-to-end (E2E) tests.

Cypress is a modern, all-in-one testing framework that runs tests directly in a
browser (like Chrome, Firefox, or Edge). This approach provides several key
advantages:

- **High Fidelity:** Tests run in the exact same environment as the application,
  eliminating the need for polyfills and ensuring that what you test is what the
  user gets.
- **Excellent Developer Experience:** Cypress comes with a powerful GUI that
  shows your application running in real-time, with "time-travel" debugging that
  lets you inspect the state of your app at every step of the test.
- **Reliability:** Cypress automatically waits for commands and assertions,
  which eliminates a major source of flakiness in tests.
- **Complete Tooling:** It includes assertions, mocking, and the ability to run
  Node.js code for backend tasks, providing everything needed out of the box.

## 3. Implementation Plan

### Step 3.1: Installation and Initial Setup

1.  **Install Cypress:** Add Cypress as a dev dependency to the `frontend`
    package.
    ```bash
    npm install --save-dev cypress --prefix frontend
    ```
2.  **Scaffold Cypress:** Open the Cypress app for the first time. This will
    automatically create a `cypress.config.ts` file and a `cypress/` directory
    with examples.
    ```bash
    cd frontend && npx cypress open
    ```
3.  **Configure Cypress:** Modify the generated `cypress.config.ts` to tell
    Cypress where our application is running.

    ```typescript
    import { defineConfig } from "cypress";

    export default defineConfig({
      e2e: {
        baseUrl: "http://localhost:3000",
        // We can add other config here later
      },
    });
    ```

### Step 3.2: Authentication Strategy (The Critical Piece)

We cannot use the application's UI to log in during a test; it's too slow and
brittle. We need a way to programmatically log in as a specific user with
specific permissions.

The solution is to create a custom Cypress command, `cy.login()`, that
orchestrates the login process by communicating with the Firebase Admin SDK on
the backend.

1.  **Cypress Task:** We will define a `cy.task()` in `cypress.config.ts`. This
    task will use the `firebase-admin` SDK to: a. Create a test user in the
    Firebase Auth Emulator (e.g., `test@example.com`). b. Set custom claims on
    that user (e.g., `{ admin: true }` or `{ admin: false }`). c. Generate a
    custom sign-in token for that user.

2.  **Cypress Custom Command:** We will create a custom command,
    `cy.login(options)`, in `cypress/support/commands.ts`. a. This command will
    call the `cy.task()` to get the custom token. b. It will then use the
    **client-side** Firebase SDK within the browser to sign in with that token
    (`signInWithCustomToken`). c. This gives our test a valid, authenticated
    session in the browser, just as if a real user had logged in.

### Step 3.3: Writing the Admin Page Test

With the `cy.login()` command in place, we can rewrite our admin page test. The
new test, located at `cypress/e2e/admin.cy.ts`, will be much cleaner and more
realistic:

```typescript
describe("Admin Page Access", () => {
  it("should redirect a non-admin user", () => {
    // 1. Programmatically log in as a non-admin
    cy.login({ isAdmin: false });

    // 2. Visit the page and assert the behavior
    cy.visit("/admin");
    cy.url().should("not.include", "/admin"); // Check for redirect
    cy.contains("h1", "Welcome"); // Check for home page content
  });

  it("should allow an admin user to access the page", () => {
    // 1. Programmatically log in as an admin
    cy.login({ isAdmin: true });

    // 2. Visit the page and assert the behavior
    cy.visit("/admin");
    cy.url().should("include", "/admin");
    cy.contains("h1", "Admin - Manage Persons").should("be.visible");
  });
});
```

### Step 3.4: Refactoring and Cleanup

Once the Cypress tests are implemented and passing, we can clean up our old
setup:

1.  **Delete Obsolete Tests:** Remove the Jest-based UI integration test
    (`frontend/src/app/admin/__tests__/page.integration.test.tsx`).
2.  **Simplify Jest Configuration:** Revert the changes to the Jest
    configuration files. We will no longer need the special `testMatch` rules,
    `jsdom` environment overrides, or polyfills for the integration tests,
    simplifying our Jest setup significantly.

### Step 3.5: Considerations for Running Cypress Tests

While Cypress tests offer high fidelity, their nature makes them generally
unsuitable for direct integration into Git pre-commit hooks.

1.  **Performance Overhead:** E2E tests are inherently slower than unit tests.
    Running them on every commit would significantly increase commit times,
    hindering developer productivity.
2.  **Environmental Dependencies:** Cypress tests require the application's
    development server and any necessary backend services (like Firebase
    emulators) to be running. Orchestrating this setup and teardown within a
    pre-commit hook adds considerable complexity.
3.  **Best Practice for Automation:**
    - **Continuous Integration (CI):** The recommended approach is to run
      Cypress tests as part of a CI pipeline (e.g., GitHub Actions, GitLab CI,
      Jenkins). This ensures that tests are executed automatically on every push
      to a branch, providing a safety net before code is merged, without
      blocking individual commits.
    - **Manual Execution:** Developers can also run Cypress tests manually
      during development to verify features before pushing their changes.

**Note for Gemini:** For significant changes or before creating a "big commit,"
Gemini should be instructed to run the Cypress tests manually to ensure critical
user flows remain functional. This can be added as a specific clause in
`GEMINI.md` if desired.

## 4. Next Steps

The immediate next step is to approve this plan. Once approved, I will begin
with Step 3.1: installing and configuring Cypress.
