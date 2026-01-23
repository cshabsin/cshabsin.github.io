---
layout: post
title: Conju NextGen Developer Cookbook
author: cshabsin
---

# Developer Cookbook

This document contains recipes for common development and debugging tasks.

## Setting an Admin User for Local Testing

To set a user as an admin in the local development environment, you need to set
a custom claim on their Firebase Auth account. A script is provided to make this
easier.

1.  **Create a User:** If you haven't already, sign up a user in the web
    application that you want to make an admin. Note their email address.

2.  **Run the Script:**
    - From the project root, run the following command, replacing `<email>` with
      the user's email address:

    ```bash
    node scripts/set-admin-claim.js <email>
    ```

3.  **Verify Admin Status:** Log out and log back into the application. The
    user's ID token will be refreshed, and they will now have admin privileges.

## Debugging Lingering Jest Processes

If Jest hangs after a test run (especially integration tests), it's likely due
to open handles preventing Node.js from exiting. Here's how to debug this:

1.  **Install the Debugging Tool:**

    ```bash
    npm install --save-dev why-is-node-still-running --prefix frontend
    ```

2.  **Create a Teardown Script:** Create a file named
    `frontend/debug-teardown.js` with the following content:

    ```javascript
    const { whyIsNodeStillRunning } = require("why-is-node-still-running");

    module.exports = async () => {
      // You may need to add a delay to allow the event loop to settle
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("--- Checking for open handles after test run ---");
      whyIsNodeStillRunning();
    };
    ```

3.  **Configure Jest:** In the relevant Jest configuration file (e.g.,
    `frontend/jest.integration.config.mjs`), add a `globalTeardown` property:

    ```javascript
    const config = {
      // ... other config
      globalTeardown: "<rootDir>/debug-teardown.js",
      // ... other config
    };
    ```

4.  **Run the Tests:** Execute the test script (e.g.,
    `npm run test:integration --prefix frontend`). The output will now include a
    list of active handles that are keeping the process alive.

5.  **Cleanup:** Once you're done debugging, remember to:
    - Uninstall the package:
      `npm uninstall why-is-node-still-running --prefix frontend`
    - Delete the `frontend/debug-teardown.js` file.
    - Remove the `globalTeardown` line from your Jest config.
