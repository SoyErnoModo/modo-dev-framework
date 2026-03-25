---
title: MODO Quality Standards
description: Code quality thresholds, React standards, security, testing, and documentation standards applied by all MODO agents
tags: [core, quality, testing, security, react, sonarcloud]
---

# MODO Quality Standards

Standards applied by all MODO development agents during code analysis.

## Code Quality Thresholds

| Metric | Minimum | Target | Source |
|--------|---------|--------|--------|
| Test coverage (new code) | 80% | 90% | SonarCloud |
| Branch coverage | 70% | 80% | SonarCloud |
| Cognitive complexity | <15 per function | <10 | SonarCloud S3776 |
| File length | <400 lines | <250 lines | Convention |
| Function length | <50 lines | <30 lines | Convention |

## React Standards

- No `any` types in component props
- `useCallback`/`useMemo` for expensive computations and stable references
- Components under 200 lines (split if larger)
- Accessible queries in tests: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`
- Server Components by default, `"use client"` only when needed
- Error boundaries for async components
- Suspense boundaries for lazy-loaded content

## Security Standards

- No secrets in code (API keys, tokens, passwords)
- No `dangerouslySetInnerHTML` without sanitization
- No `eval()`, `document.write()`, `innerHTML`
- httpOnly cookies for auth tokens (not localStorage)
- Input validation on all API endpoints
- CSP headers configured

## Testing Standards

- Behavior-driven tests (test what the user sees, not implementation)
- `userEvent` over `fireEvent`
- No snapshot tests for component behavior
- Edge cases: empty state, error state, loading state, large data
- Integration tests for critical flows

## Documentation Standards

- Every feature has a vault entry
- Architecture changes need Mermaid diagrams
- Significant decisions documented as ADRs
- API changes documented with request/response shapes
- Acceptance criteria mapped to implementation evidence

## Commit Standards

- Sentry conventional commits: `<type>(<scope>): <subject>`
- Types: feat, fix, ref, perf, docs, test, build, ci, chore
- Imperative mood, max 70 chars subject
- Body explains what and why, not how
- Footer references ticket: `Refs LINEAR-XXX` or `Fixes #NNN`
