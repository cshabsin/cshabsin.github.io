---
layout: post
title: Conju NextGen Design doc
author: cshabsin
---

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

We will use Firestore with the following top-level collections.

- **`users`**: Stores user profile information. Corresponds to the `Person`
  entity in the old app.
  - `uid` (document ID)
  - `firstName`
  - `lastName`
  - `nickname`
  - `email`
  - `pronouns`
  - ... and other personal details.

- **`events`**: Represents an event.
  - `eventId` (document ID)
  - `name`
  - `shortName`
  - `startDate`
  - `endDate`
  - `venueId`

- **`invitations`**: Manages invitations for an event.
  - `invitationId` (document ID)
  - `eventId` (reference to `events` collection)
  - `inviteeIds` (array of user UIDs)

- **`rsvps`**: Stores RSVP responses for each user for a given invitation.
  - `rsvpId` (document ID)
  - `invitationId`
  - `userId`
  - `status` (e.g., 'Attending', 'Maybe', 'Not Attending')
  - `housingPreference`
  - `dietaryRestrictions`
  - ... and other RSVP details.

## 5. Key Features

- **Authentication:**
  - User registration and login (Email/Password, Google, Passwordless Email Link).
  - Password reset functionality.
  - Protected routes for authenticated users.
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
managed by **Husky** and **lint-staged**. Before any commit, the following automated
checks are performed on staged files:

- **Build & Type Check:** The entire project is built using `next build` to catch
  any TypeScript compilation errors.
- **Linting:** TypeScript/TSX files are linted with **ESLint** (`eslint --fix`)
  to enforce code style and catch common errors.
- **Formatting:** Markdown files are automatically formatted with **Prettier** to
  maintain a consistent style.

### 7.2. Testing Strategy

Unit and component tests are written using **Jest** and **React Testing Library**.
This allows for testing component behavior in a simulated DOM environment.

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