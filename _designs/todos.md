---
layout: post
title: Conju NextGen To-Do List
author: cshabsin
---

# To-Do List

This document contains a running list of tasks and improvements for the
ConjuNext project.

## Current Tasks:

- [ ] Implement a UI for creating pre-registrations (Person documents with
      `authUid: null`).
- [ ] Implement a UI for editing user/person profiles.
- [ ] Refactor `persons.ts` to use the Firestore data converter pattern.
- [ ] Add more comprehensive integration tests for the `persons` service.
- [ ] Investigate the lingering "Jest did not exit" warning.
  - Note: Using `--forceExit` is not an acceptable long-term solution. The root
    cause should be identified and fixed. See `notes/cookbook.md` for debugging
    steps.
- [ ] Rename application's `User` type (in `models/person.ts`) to `AppUser` (or
      similar) to avoid collision with Firebase's `User` type and eliminate the
      need for `User as FirebaseUser` aliasing.
