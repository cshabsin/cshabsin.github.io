---
layout: post
title: Conju NextGen Design doc
author: cshabsin
---

# Conju NextGen Design Doc

**Authors:** Chris Shabsin **Status:** In Progress

## 1. Background

The existing Conju event service is a Go application deployed on AppEngine. Over
time, the codebase has become difficult to maintain and extend ("bitrotted to
confusion"). This document outlines a plan to rewrite Conju from the ground up
as a modern, reactive web application using a new tech stack.

## 2. Goals

- **Modern, Reactive Frontend:** Build a fast, responsive, and user-friendly
  interface using Next.js and React.
- **Simplified Backend:** Leverage Firebase services (Firestore, Authentication,
  Hosting) to reduce backend complexity and maintenance overhead.
- **Improved Developer Experience:** Use TypeScript for type safety and a
  well-defined project structure to make development more efficient.
- **Maintainability:** Create a clean, well-documented, and easily extensible
  codebase for future development.
- **Feature Parity:** Initially, achieve parity with the core features of the
  existing Conju application.

## 3. Non-Goals

- 100% data migration from the old system in the initial version. A migration
  path can be planned later.
- Introducing significant new features beyond the scope of the original
  application at launch.
- Supporting alternative databases or authentication providers.

## 4. Architecture

### 4.1. Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (with App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **UI Library:** [React](https://reactjs.org/)
- **Styling:** [Bootstrap](https://getbootstrap.com/)
- **Backend-as-a-Service (BaaS):** [Firebase](https://firebase.google.com/)
  - **Database:** Firestore
  - **Authentication:** Firebase Authentication
  - **Hosting:** Firebase Hosting

### 4.2. Data Model (Firestore)

We will use Firestore with the following top-level collections. This model
separates the concept of a **Person** (an individual) from a **User** (their
authentication account).

- **`persons`**: This is the central collection for all individuals in the
  system, whether they have created an account or not. The document ID is a
  unique, randomly generated string.
  - `email`: The person's email address. This is used to link them to an auth
    account when they sign up.
  - `authUid`: `string | null`. The UID from Firebase Authentication. This is
    the link to their login account. It is `null` until the person creates their
    account.
  - `firstName`
  - `lastName`
  - `nickname`
  - `pronouns`
  - ... and other personal details.

- **`events`**: Represents an event.
  - `eventId` (document ID)
  - `name`
  - `shortName`
  - `startDate`
  - `endDate`
  - `venueId`

- **`invitations`**: Manages invitations for an event, linking existing `Person`
  records to that event.
  - `invitationId` (document ID)
  - `eventId` (reference to `events` collection)
  - `inviteeIds` (array of `persons` document IDs)

- **`rsvps`**: Stores RSVP responses for each person for a given invitation.
  - `rsvpId` (document ID)
  - `invitationId`
  - `personId`
  - `status` (e.g., 'Attending', 'Maybe', 'Not Attending')
  - `housingPreference`
  - `dietaryRestrictions`
  - ... and other RSVP details.

### 4.3. Server-Side Logic (Cloud Functions)

To handle privileged operations that cannot be trusted to the client, we will
use Cloud Functions for Firebase. The initial function will be for managing user
roles.

- **`setAdminClaim`**: An `onCall` HTTPS function that allows an existing admin
  to grant admin privileges to another user. It will verify the caller's
  authentication token to ensure they are an admin before proceeding. This is
  the **only** mechanism by which a user can be made an admin.

## 5. Key Features

- **Authentication:**
  - **Standard Login:** User registration and login via Email/Password, Google,
    and Passwordless Email Link.
  - **Invited Signup:** Admins can pre-create a `Person` document with profile
    information and an email address. When a new user signs up with that email,
    their authentication account (`authUid`) is automatically linked to the
    existing `Person` document, granting them access to any pre-existing
    invitations.
  - **Password Reset:** Standard password reset functionality.
  - **Roles and Authorization:** User roles (e.g., admin) will be managed using
    **Firebase Custom Claims**. A user's role is embedded securely in their ID
    token by a Cloud Function. The client-side application will read this token
    to grant access to protected routes and UI elements.

- **Event Dashboard:**
  - View details of the current event.

- **RSVP Flow:**
  - Users can view their invitation.
  - Users can RSVP for themselves and other invitees on their invitation.
  - Update personal information, food preferences, housing preferences, etc.

- **Admin Console:**
  - Manage users, events, and invitations.
  - View reports (RSVP list, food report, rooming report).
  - Send emails to attendees.

## 6. UI/UX Sketch

The application will be a Single Page Application (SPA) with a clean, modern
aesthetic following Material Design principles. The UI will be fully reactive,
providing instant feedback to user interactions.

- **Layout:** A main navigation bar for accessing different sections (Home,
  RSVP, Admin). A central content area will display the main information.
- **Components:** Reusable React components will be built for forms, tables,
  modals, and other UI elements.

## 7. Development and Testing

### 7.1. Development Workflow & Tooling

To ensure code quality and consistency, the project uses a pre-commit hook
managed by **Husky** and **lint-staged**. Before any commit, the following
automated checks are performed on staged files:

- **Build & Type Check:** The entire project is built using `next build` to
  catch any TypeScript compilation errors.
- **Linting:** TypeScript/TSX files are linted with **ESLint** (`eslint --fix`)
  to enforce code style and catch common errors.
- **Formatting:** Markdown files are automatically formatted with **Prettier**
  to maintain a consistent style.

### 7.2. Testing Strategy

Our testing strategy is divided into two main categories:

- **Unit & Component Tests:** These are written using **Jest** and **React
  Testing Library**. They run in a Node.js environment, are very fast, and are
  ideal for testing individual components in isolation (e.g., verifying that a
  component renders correctly based on its props). For these tests, any external
  dependencies (like the `useAuth` hook) are mocked.

- **Integration Tests:** For testing the interaction between our application and
  Firebase services (especially Firestore), we use **Jest** in combination with
  the **Firebase Emulator Suite**. These tests run against a live, local
  instance of the emulators, providing a high-fidelity environment that closely
  mimics production. While slightly slower than unit tests, they are essential
  for verifying that our database queries, transactions, and security rules work
  as expected. This approach is preferred over third-party mocking libraries to
  ensure maximum accuracy and reliability. To prevent conflicts with manual
  development data, the integration test suite is configured to run against a
  separate, dedicated Firebase project ID (`conjunext-test`) within the
  emulator.

- **Location:** Tests are located in `__tests__` directories alongside the code
  they are testing.
- **Execution:** Tests can be run via the `npm test` command.

### 7.3. Local Development Environment

For local development, the project is configured to connect to the **Firebase
Emulator Suite**. This allows for local, offline development and testing of
Firebase features without interacting with the production database or services.

- **Configuration:** The app automatically connects to the emulators when
  `NODE_ENV` is set to `development`.
- **Services:** The Auth and Firestore emulators are used.
- **Execution:** The emulators are started via the `firebase emulators:start`
  command from the project root.

### 7.4. Coding Style

- **Function Definitions:** We prefer using arrow function expressions assigned
  to a `const` (`const foo = () => {}`) over function declarations
  (`function foo() {}`). This is not for any technical reason, but for stylistic
  consistency with the prevailing conventions in modern React and Next.js
  projects (e.g., for defining components and hooks).

## 8. Milestones

1.  **Project Setup:** Initialize Next.js project, configure Firebase, set up
    basic project structure.
2.  **Authentication:** Implement user login and registration.
3.  **Core Data Models:** Implement Firestore data structures and basic CRUD
    operations for events and users.
4.  **RSVP Form:** Build the main RSVP form.
5.  **Admin Dashboard:** Create basic admin views for managing data.
6.  **Deployment:** Deploy the initial version to Firebase Hosting.

## 9. Open Questions

- What is the detailed plan for data migration from the old Go application?
- What are the specific requirements for the reporting features?
- Are there any third-party integrations needed (e.g., for sending emails)?
