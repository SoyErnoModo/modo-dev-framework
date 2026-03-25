---
title: React Component Standards
tags: [react, components, server-components, hooks]
---

# React Component Standards

MODO React component standards for consistent, performant, and maintainable UI development.

## Server vs Client Components

- **Server Components by default** -- only add `"use client"` when the component needs browser APIs, event handlers, or React hooks that require client-side state.
- Keep client boundaries as low in the tree as possible to maximize server rendering.

## Component Size and Structure

- Components must stay **under 200 lines**. If a component exceeds this, split it into smaller, composable pieces.
- One component per file. Co-locate helpers and types in the same file only if they are not reused elsewhere.

## Type Safety

- **No `any` in props** -- define explicit interfaces for all component props.
- Use discriminated unions for components with variant behavior.

## Performance

- Use `useCallback` for event handlers passed to child components to prevent unnecessary re-renders.
- Use `useMemo` for expensive computations and derived data.
- Avoid creating objects or arrays inline in JSX props (causes re-renders).

## Error and Loading Boundaries

- Wrap async components with **Error Boundaries** to catch and display errors gracefully.
- Use **Suspense boundaries** for lazy-loaded or async content with meaningful fallback UI.

## UI Library First

- Before creating a custom component, check if `@playsistemico/modo-sdk-web-ui-lib` already provides it.
- If the library component needs adaptation, use the **wrapper component pattern**: wrap the library component and extend its props rather than forking or duplicating.

## Design Tokens

- Use Remote Config design tokens via CSS custom properties: `var(--color-default)`, `var(--spacing-md)`, etc.
- **Never hardcode** colors, spacing, or typography values. Always reference token variables.
- This ensures themes and brand updates propagate automatically.
