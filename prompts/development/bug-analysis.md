---
id: bug-analysis
title: "Structured Bug Analysis"
description: "Systematic bug investigation with root cause analysis and regression verification"
category: development
tags: [bug, debugging, investigation, quality]
variables:
  - name: error_message
    description: "The error message or observed incorrect behavior"
    type: string
    required: true
  - name: context
    description: "Where and when the bug occurs (environment, user flow, frequency)"
    type: string
    required: false
  - name: stack_trace
    description: "Full stack trace if available"
    type: string
    required: false
---

# Structured Bug Analysis

You are investigating a bug in the MODO platform. Follow the structured methodology below to move from symptom to verified fix.

## Bug Report

- **Error**: {error_message}
- **Context**: {context}
- **Stack Trace**: {stack_trace}

---

## Phase 1: Reproduce

Before investigating, confirm the bug is reproducible.

1. Identify the **exact steps** to trigger the error based on the context provided.
2. Determine the **environment** where it occurs (local dev, staging, production) and whether it is environment-specific.
3. Establish the **frequency** — is it deterministic (every time) or intermittent (race condition, timing, data-dependent)?
4. Note the **earliest known occurrence** — check recent deployments, merged PRs, or config changes that correlate with the timeline.
5. Write a minimal reproduction case if the bug can be isolated outside the full application.

## Phase 2: Isolate Root Cause

Work systematically from the error surface inward.

1. **Parse the stack trace** (if available): identify the originating file, function, and line number. Determine whether the error is thrown by our code, a dependency, or the runtime.
2. **Trace the data flow**: follow the inputs from the entry point (API request, user action, scheduled job) through each layer until you find where the actual value diverges from the expected value.
3. **Check recent changes**: use `git log` and `git blame` on the affected files to identify commits that may have introduced the regression.
4. **Evaluate common MODO-specific causes**:
   - Remote Config values that changed or are missing a fallback
   - Feature flag state mismatch between environments
   - API contract changes from upstream services without corresponding client updates
   - Race conditions in async flows (missing await, unhandled promise rejection)
   - Type coercion issues masked by `any` types that bypass compile-time checks
5. **Form a hypothesis**: state the suspected root cause clearly before moving to the fix.

## Phase 3: Identify Fix

Propose a targeted fix with minimal blast radius.

1. **Describe the fix** in plain language — what will change and why it resolves the root cause.
2. **Show the code change** — provide a diff or before/after snippet for the affected file(s).
3. **Assess side effects**: list other components, services, or tests that may be affected by the change.
4. **Consider defensive improvements**:
   - Add input validation or null checks that would have caught this earlier
   - Improve error messages to make future debugging faster
   - Add TypeScript type narrowing to prevent similar issues at compile time

## Phase 4: Verify and Prevent Regression

Ensure the fix is durable and the bug cannot silently return.

1. **Write a regression test** that reproduces the original bug scenario and asserts the correct behavior after the fix. The test should fail without the fix applied.
2. **Run the full test suite** and confirm no existing tests break.
3. **Check coverage impact**: verify the fix maintains or improves the 80% coverage threshold on the affected files.
4. **SonarCloud validation**: confirm the fix does not introduce new code smells, security hotspots, or complexity violations (keep functions under 15 cyclomatic complexity).
5. **Document the finding**: provide a short summary suitable for a post-mortem or dev-vault entry:
   - Root cause (one sentence)
   - Fix applied (one sentence)
   - Prevention measure (what structural change, test, or check prevents recurrence)

## Output Format

Structure your analysis using the four phases above. For each phase, provide concrete findings — not generic advice. Reference specific files, functions, and line numbers where applicable. End with a confidence level for the root cause hypothesis (High / Medium / Low) and any open questions that need further investigation.
