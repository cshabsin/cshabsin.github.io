---
layout: post
title: Conju NextGen Firestore Data Modeling and Access Patterns
author: cshabsin
---

# Firestore Data Modeling and Access Patterns

This document outlines the best practices and patterns used for interacting with
Firestore in the ConjuNext application.

## 1. Type-Safe Data Access with Converters

A primary goal of this project is to leverage TypeScript for end-to-end type
safety. When fetching data from Firestore, which is a schemaless NoSQL database,
there is a risk of a mismatch between the data stored in the database and the
static types expected by the application.

### The Problem with Type Assertions

A common but unsafe way to handle this is with a type assertion:

```typescript
// Unsafe - Avoid this pattern!
const docSnap = await getDoc(docRef);
const myData = docSnap.data() as MyType; // Tells TypeScript to trust us
```

The `as MyType` assertion provides no runtime validation. If the data in
Firestore is malformed (e.g., a field is missing or has the wrong type), the
assertion will not fail. Instead, the application will crash later with a
runtime error when it tries to access a property that doesn't exist on the
`myData` object.

### The Solution: Firestore Data Converters

The correct and recommended approach is to use a `FirestoreDataConverter`. A
converter is an object that explicitly defines how to convert data between our
custom TypeScript objects and the plain objects that Firestore stores.

```typescript
const myTypeConverter: FirestoreDataConverter<MyType> = {
  // fromFirestore: Converts a Firestore document to our TypeScript type
  fromFirestore(snapshot, options) {
    const data = snapshot.data(options)!;
    // This is the key: we perform runtime validation here.
    return {
      field1: data.field1 || "default value",
      field2: data.field2 || [],
      // ...etc.
    };
  },
  // toFirestore: Converts our TypeScript type to a plain Firestore object
  toFirestore(myObject: MyType) {
    return { ...myObject };
  },
};
```

By attaching this converter to a collection reference, we gain two major
benefits:

1.  **Runtime Safety:** The `fromFirestore` function acts as a validation layer.
    It ensures that every document read from the database is transformed into a
    predictable, correctly-shaped TypeScript object, preventing runtime errors
    from malformed data.
2.  **Strong Typing:** The `getDoc` and `getDocs` calls will now return a
    `DocumentSnapshot<MyType>`, meaning the `.data()` method is already strongly
    typed and requires no further assertions.

## 2. Repository Pattern and Encapsulation

To keep our code organized and our data models clean, we follow a variation of
the Repository Pattern.

- **Model Objects are Plain:** Our model interfaces (e.g., `Person`, `Event`)
  are plain data structures. They contain no Firestore-specific logic.

- **Services Encapsulate Logic:** All Firestore interaction logic for a specific
  data type is encapsulated within a dedicated service file (e.g.,
  `src/firebase/persons.ts`).

- **Collection Reference Helpers:** Within each service file, we create a helper
  function that returns a typed `CollectionReference` with the appropriate data
  converter attached. This centralizes the creation of collection references and
  ensures the converter is always used.

**Example (`persons.ts`):**

```typescript
// Helper function to get the collection reference with the converter
const personsCollectionRef = (): CollectionReference<Person> => {
  return collection(db, COLLECTION_NAME).withConverter(personConverter);
};

// Public functions then use this helper
export const getPerson = async (id: string) => {
  const personDocRef = doc(personsCollectionRef(), id);
  // ... logic
};
```

This pattern ensures a clean separation of concerns and makes our data access
layer robust, maintainable, and type-safe.
