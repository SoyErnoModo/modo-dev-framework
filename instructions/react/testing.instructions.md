---
title: React Testing Standards
tags: [react, testing, jest, testing-library]
---

# React Testing Standards

MODO testing standards for React components and features.

## Behavior-Driven Tests

- Test **what the user sees and does**, not implementation details.
- Never assert on internal state, ref values, or component instance methods.
- Tests should remain valid even if the component is refactored internally.

## User Interaction

- Always use `userEvent` over `fireEvent`. `userEvent` simulates real browser behavior (focus, blur, keyboard events) while `fireEvent` dispatches synthetic events.
- Example: `await userEvent.click(button)` instead of `fireEvent.click(button)`.

## Accessible Query Priority

Use queries in this order of preference:

1. `getByRole` -- best accessibility signal, matches how assistive tech sees the page
2. `getByLabelText` -- form elements with proper labels
3. `getByText` -- visible text content
4. `getByTestId` -- last resort, only when no semantic query works

Avoid `getByClassName` or `querySelector` in tests entirely.

## No Snapshot Tests for Behavior

- Snapshot tests are acceptable only for static, presentational markup.
- **Never use snapshots** to verify component behavior, interactions, or dynamic rendering.

## Edge Case Coverage

Every component test suite must cover:

- **Empty state** -- no data, empty arrays, null values
- **Error state** -- API failures, invalid props, network errors
- **Loading state** -- skeleton/spinner rendering during async operations
- **Large data** -- long lists, oversized strings, boundary values

## Integration Tests

- Write integration tests for **critical user flows** (checkout, authentication, onboarding).
- Integration tests should exercise multiple components working together with real (or MSW-mocked) API calls.

## Coverage Targets

| Metric | Minimum | Target |
|--------|---------|--------|
| Line coverage (new code) | 80% | 90% |
| Branch coverage | 70% | 80% |

## Mocking Strategy

- **Mock at boundaries** -- API calls, third-party services, browser APIs.
- Do not mock internal modules, utility functions, or child components unless absolutely necessary.
- Use MSW (Mock Service Worker) for API mocking in integration tests.
