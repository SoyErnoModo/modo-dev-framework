---
id: code-review
title: "Structured Code Review"
description: "Comprehensive code review with configurable focus areas and MODO quality standards"
category: development
tags: [review, quality, code, guardia]
variables:
  - name: pr_url
    description: "Pull request URL or number"
    type: string
    required: true
  - name: focus
    description: "Review focus area"
    type: string
    required: false
    defaultValue: "all"
  - name: language
    description: "Primary programming language"
    type: string
    required: false
    defaultValue: "TypeScript"
---

# Structured Code Review

You are performing a thorough code review for the MODO platform. Review the pull request at **{pr_url}** with a primary focus on **{focus}** using **{language}** best practices.

Apply the MODO quality gate standards throughout the review:
- **Test coverage**: Must meet or exceed 80% threshold
- **Cyclomatic complexity**: No function should exceed 15
- **Type safety**: No usage of `any` types in TypeScript code — use proper interfaces, generics, or `unknown`
- **Linting**: Zero ESLint/SonarCloud warnings in new or modified code

## Review Sections

### 1. Security Review
- Check for hardcoded secrets, tokens, or API keys
- Validate input sanitization on all user-facing endpoints
- Verify authentication and authorization checks are in place
- Look for SQL injection, XSS, or CSRF vulnerabilities
- Confirm sensitive data is not logged or exposed in error messages
- Ensure environment-specific values come from Remote Config, not hardcoded strings

### 2. Performance Review
- Identify unnecessary re-renders in React components
- Check for N+1 query patterns or unbounded data fetches
- Verify proper use of memoization (useMemo, useCallback) where appropriate
- Look for memory leaks (missing cleanup in useEffect, unclosed subscriptions)
- Evaluate bundle size impact of new dependencies
- Check for proper pagination and lazy loading on list endpoints

### 3. Testing Review
- Verify new code has corresponding unit tests meeting the 80% coverage threshold
- Check that edge cases and error paths are tested
- Validate integration tests exist for new API endpoints or service interactions
- Ensure test descriptions clearly state the expected behavior
- Look for flaky test patterns (timing dependencies, shared mutable state)
- Confirm mocks are scoped properly and do not leak between tests

### 4. Architecture Review
- Validate adherence to the existing module/layer boundaries
- Check that new abstractions follow established patterns in the codebase
- Verify proper separation of concerns (business logic vs presentation vs data access)
- Ensure new interfaces or types are placed in the correct shared location
- Look for unnecessary coupling between modules
- Confirm backward compatibility unless a breaking change is explicitly intended

### 5. Code Quality
- Verify naming conventions are clear and consistent with the codebase
- Check for duplicated logic that should be extracted into shared utilities
- Ensure error handling is explicit and follows the project's error strategy
- Validate that comments explain "why" not "what"
- Check for TODO/FIXME comments that should be tracked as tickets

## Output Format

Classify every finding using the following severity levels:

| Severity | Meaning | Action Required |
|----------|---------|-----------------|
| **Blocker** | Prevents merge — security flaw, data loss risk, broken functionality | Must fix before approval |
| **Warning** | Significant concern — performance issue, missing tests, poor pattern | Should fix, discuss if contested |
| **Suggestion** | Improvement opportunity — readability, naming, minor optimization | Nice to have, author's discretion |

For each finding, provide:
- **Severity**: Blocker / Warning / Suggestion
- **Location**: `file:line` reference (e.g., `src/services/payment.ts:42`)
- **Issue**: Clear description of the problem
- **Recommendation**: Specific fix or alternative approach with a code snippet when helpful

End the review with a summary table counting findings by severity and an overall recommendation (Approve / Request Changes / Needs Discussion).
