---
name: modo-review-standards
description: >
  Code review quality standards and checklist used by all MODO review agents.
  Auto-loaded when running /guardia or /dev-council. Defines severity classification,
  tech stack awareness, and report quality requirements.
license: MIT
metadata:
  author: MODO Engineering
  version: 1.0.0
---

# MODO Review Standards

## Review Philosophy

1. **Be specific**: Every finding must reference a file and line number
2. **Be actionable**: Every issue must have a suggested fix
3. **Be proportional**: Minor style issues are suggestions, not blockers
4. **Be fair**: Acknowledge what the PR does well
5. **Be fast**: Prefer parallel analysis over sequential

## Severity Classification

### Blocker (must fix before merge)
- Security vulnerabilities (XSS, injection, secrets)
- Bugs that cause crashes or data loss
- Failing CI checks
- SonarCloud quality gate failures
- Missing tests for critical business logic
- Breaking changes without migration path

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

## Tech Stack Awareness

### Next.js App Router
- Server vs Client component boundaries
- Metadata and SEO
- Route handlers and server actions
- Streaming and Suspense
- Image and font optimization

### Zustand State Management
- Store design (avoid god stores)
- Selector optimization
- Middleware usage
- DevTools integration

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

Before finalizing a review report, verify:

- [ ] Every finding has a file:line reference
- [ ] Every blocker has a concrete fix suggestion
- [ ] Scores are consistent with findings
- [ ] The verdict matches the scores
- [ ] No false positives from auto-generated or config files
- [ ] Test files are evaluated separately from source files
- [ ] The summary is actionable and concise
