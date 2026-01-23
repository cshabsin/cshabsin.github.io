---
layout: post
title: Conju NextGen Codebase Tour
author: cshabsin
---

# ConjuNext Codebase Tour

This document provides a high-level overview of the key directories and
architectural patterns in the `conjunew` project.

---

### Project Root (`/home/cshabsin/proj/conjunew`)

- **`/` (Root):** Contains project-wide configuration.
  - `.husky/`: Manages pre-commit hooks for code quality.
  - `firebase.json`: Configures Firebase services, including emulators.
  - `notes/`: Contains all project documentation, including this file and the
    main design doc.
  - `package.json`: Manages root-level dependencies, primarily for developer
    tooling like Husky.

- **`/functions`:** A self-contained Node.js project for all server-side Cloud
  Functions (e.g., for setting admin roles).

- **`/frontend`:** The main Next.js web application.

---

### Frontend Application (`/frontend/src`)

This is where all the application code lives.

- **`src/app/`**: The core of the Next.js App Router. Each directory inside
  `app` becomes a URL route (e.g., `app/login` maps to `/login`). The
  `layout.tsx` file defines the global UI shell.

- **`src/components/`**: Contains reusable React components that are shared
  across different pages (e.g., `Header.tsx`, `AdminRoute.tsx`).

- **`src/models/`**: Defines the core data structures of our application as
  TypeScript interfaces. The key concept here is the separation of a `Person`
  (the data in Firestore) from a `User` (the active, authenticated user in the
  app).

- **`src/firebase/`**: This directory encapsulates all interaction with Firebase
  services.
  - `config.ts`: Handles the Firebase project configuration and initializes the
    connection to Firebase services (and the emulators in development).
  - `auth.tsx`: The application's central authentication provider. It provides
    the `useAuth()` hook, which is the single source of truth for the current
    user's state.
  - **Service Files** (e.g., `persons.ts`): Each service file is responsible for
    all Firestore operations for a specific collection, following the repository
    pattern. They use data converters to ensure all data access is type-safe.
