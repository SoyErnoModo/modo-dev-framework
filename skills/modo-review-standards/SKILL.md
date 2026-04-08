---
name: review-standards
description: PR review quality standards and checklist used by Code Guardian agents. Auto-loaded when running /guardia.
---

# Code Guardian Review Standards

## Review Philosophy

1. **Be specific**: Every finding must reference a file and line number
2. **Be actionable**: Every issue must have a suggested fix
3. **Be proportional**: Minor style issues are suggestions, not blockers
4. **Be fair**: Acknowledge what the PR does well
5. **Be fast**: Prefer parallel analysis over sequential

## PR Metadata Standards (checked before code review)

- Title: `type(SCOPE-XXX): description` (e.g. `feat(EXA-123): add ads page`)
- Description: filled, not template `[Change!]` placeholders
- Evidence: screenshots/videos for visual changes (desktop 1280x800 + mobile 375x812)
- JIRA ticket linked
- Checklist items marked
- Branch name follows convention
- If >1000 lines or mixed concerns: suggest fragmentation

## Severity Classification

### Blocker (must fix before merge)
- Security vulnerabilities (XSS, injection, secrets)
- Bugs that cause crashes or data loss
- Failing CI checks
- SonarCloud quality gate failures
- Missing tests for critical business logic
- Breaking changes without migration path
- Hardcoded credentials or API keys in code

### Warning (should fix)
- Code smells (cognitive complexity, duplication)
- Missing tests for non-critical code
- Performance issues that affect UX
- Accessibility violations
- Outdated dependencies with known issues

### Suggestion (nice to have)
- Style improvements
- Better naming
- Additional test cases
- Documentation improvements
- Performance micro-optimizations

## MODO-Specific Rules

- Use `globalThis` over `window`/`global` (ESLint unicorn)
- No `alt=""` — use descriptive alt text on all images
- No CSS modules in Tailwind projects — follow the primary styling system
- Use design system tokens from `modo-ui-lib-web`, not hardcoded hex colors
- Credentials must be env vars (`NEXT_PUBLIC_*` for client, server-only otherwise)
- No `console.log/error/warn` in production (use logger or remove)
- Scripts: use `next/script` not `document.createElement('script')`
- SSR: guard all `window`/`document` access with `typeof window !== 'undefined'`

## Tech Stack Awareness

### modo-landing (Next.js 12 Pages Router)
- `getServerSideProps` for SSR data
- `<Head>` with title, description, canonical on every page
- Storyblok CMS for content pages via `[[...slug]].jsx`
- Redux Toolkit for global state, React Context for scoped features
- Styled Components + Tailwind coexist (migrating to Tailwind-only)
- `@playsistemico/modo-ui-lib-web` for design system components

### promos-hub-site (Next.js 15 App Router)
- Server vs Client component boundaries
- Metadata API for SEO
- Route handlers and server actions
- Streaming and Suspense

### Testing with Jest + Testing Library
- Behavior-driven tests over implementation tests
- User-centric queries (getByRole > getByTestId)
- Async patterns (waitFor, findBy)
- Mock boundaries (mock at the edge, not everywhere)

### TypeScript Strict Mode
- No `any` types in new code
- Proper generic usage
- Discriminated unions over type assertions
- Readonly where applicable

## Report Quality Checklist

Before finalizing a Code Guardian report, verify:

- [ ] Every finding has a file:line reference
- [ ] Every blocker has a concrete fix suggestion
- [ ] Scores are consistent with findings
- [ ] The verdict matches the scores
- [ ] No false positives from auto-generated or config files
- [ ] Test files are evaluated separately from source files
- [ ] The summary is actionable and concise
