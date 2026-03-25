---
title: TypeScript Strict Mode Standards
tags: [typescript, strict-mode, types, generics]
---

# TypeScript Strict Mode Standards

MODO TypeScript rules for type safety and code reliability.

## No `any` in New Code

- Every new file and modified function must have explicit types.
- Use `unknown` when the type is genuinely not known, then narrow with type guards.
- Existing `any` should be incrementally replaced during refactors.

## Generic Usage

- Use generics to create reusable, type-safe utilities and components.
- Constrain generics with `extends` to enforce structure:
  ```typescript
  function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
    return obj[key];
  }
  ```
- Avoid over-generic signatures -- if a generic is only used once, it may not be needed.

## Discriminated Unions Over Type Assertions

- Prefer discriminated unions to model variant data:
  ```typescript
  type Result =
    | { status: 'success'; data: User }
    | { status: 'error'; error: string }
    | { status: 'loading' };
  ```
- Avoid `as` type assertions. If you need to assert, document why with a comment.
- Never use `as any` -- this defeats the entire type system.

## Readonly Where Applicable

- Mark function parameters as `readonly` when they should not be mutated.
- Use `Readonly<T>` for props and state objects.
- Prefer `ReadonlyArray<T>` over `T[]` for arrays that should not be modified.

## Strict Null Checks

- `strictNullChecks` must be enabled in `tsconfig.json`.
- Handle `null` and `undefined` explicitly -- do not assume values exist.
- Use optional chaining (`?.`) and nullish coalescing (`??`) for safe access.

## Non-Null Assertions

- The non-null assertion operator (`!`) is discouraged.
- If used, add a comment explaining **why** the value is guaranteed to be non-null.
- Prefer narrowing with conditionals or type guards instead.

## Interface vs Type

- Use `interface` for public APIs, component props, and contracts between modules.
- Use `type` for unions, intersections, mapped types, and internal aliases.
- Interfaces support declaration merging and are more performant for the compiler on large codebases.

## Utility Types

Leverage built-in utility types to avoid manual type construction:

| Utility | Use Case |
|---------|----------|
| `Pick<T, K>` | Select specific properties from a type |
| `Omit<T, K>` | Exclude specific properties from a type |
| `Partial<T>` | Make all properties optional (useful for update payloads) |
| `Required<T>` | Make all properties required |
| `Record<K, V>` | Define a dictionary/map type |
| `ReturnType<T>` | Extract the return type of a function |

## Branded Types for IDs

Use branded types to prevent mixing up primitive IDs:

```typescript
type UserId = string & { readonly __brand: 'UserId' };
type OrderId = string & { readonly __brand: 'OrderId' };

function createUserId(id: string): UserId {
  return id as UserId;
}

// This prevents accidentally passing an OrderId where a UserId is expected
function getUser(id: UserId): Promise<User> { ... }
```

Branded types catch logic errors at compile time with zero runtime cost.
