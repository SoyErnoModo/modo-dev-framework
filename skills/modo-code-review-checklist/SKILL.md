---
name: modo-code-review-checklist
description: Comprehensive code review checklist tailored to modo-landing patterns and standards. Auto-invoke on all code changes and PR reviews to ensure quality, security, and architectural consistency.
---

# modo-landing Code Review Checklist

## When to Use
- Auto-invoke on ALL code changes and PR reviews
- Manual invoke for comprehensive code audits

## TypeScript Quality
- [ ] No new `as any` casts - use proper types, generics, or `unknown` with type guards
- [ ] No `@ts-ignore` or `@ts-nocheck` - fix the type error properly
- [ ] No new `eslint-disable` comments without documented justification
- [ ] Function parameters have explicit types (not implicit `any`)
- [ ] Return types are explicit for exported functions

## Imports & Architecture
- [ ] Use path aliases: `@Promotions/*`, `@Hooks/*`, `@/CMS/*` - NOT `../../../`
- [ ] No deep relative imports (max 2 levels: `./` or `../`)
- [ ] Check all 3 promotion trees before creating new components:
  - `src/components/Layout/Promotions/components/`
  - `src/promotions/components/`
  - `src/promotionsTS/` (canonical location)
- [ ] New promotion components go in `src/promotionsTS/` only

## Styling
- [ ] Tailwind-first: no new styled-components or Emotion imports
- [ ] Use design tokens from `tailwind.config.js` - not hardcoded values
- [ ] No inline `style={{}}` for static properties
- [ ] Use `classnames` package for conditional classes

## Testing
- [ ] Behavior tests, NOT snapshots - use `screen.getByRole`, `getByText`, user-event
- [ ] Test user interactions, not implementation details
- [ ] Colocate tests next to components (`Component.test.tsx`)
- [ ] Mock external dependencies, not internal modules

## Security
- [ ] No `dangerouslySetInnerHTML` without sanitization
- [ ] Validate `event.origin` in PostMessage handlers
- [ ] No hardcoded API keys, tokens, or secrets
- [ ] No sensitive data in `console.log` (console.log is prohibited by ESLint)

## Performance
- [ ] Lazy load below-fold components with `next/dynamic`
- [ ] Use Next.js `Image` component for images (not `<img>`)
- [ ] Memoize expensive computations with `useMemo`/`useCallback`
- [ ] No unnecessary re-renders (check dependency arrays)

## Analytics
- [ ] Use `logAmplitudeEvent` wrapper, never direct `amplitude.logEvent()`
- [ ] Event names follow convention: domain prefix + past tense
- [ ] Properties in camelCase (auto-formatted to capitalized)
- [ ] SDK whitelist updated if event should fire in WebView mode

## Accessibility
- [ ] Semantic HTML elements (`<nav>`, `<main>`, `<section>`, `<article>`)
- [ ] `alt` text on all images
- [ ] ARIA labels on interactive elements without visible text
- [ ] Keyboard navigation for custom interactive components

## Commit Convention
- Format: `type(JIRA-TICKET): Subject`
- Types: feat, fix, refactor, style, perf, docs, test, ci, build, chore, revert
- Subject: imperative mood, max 90 chars
