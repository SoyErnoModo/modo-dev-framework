# ADR-XXX: [Short Title]

**Date**: [YYYY-MM-DD]
**Status**: [Proposed | Accepted | Deprecated | Superseded]
**Deciders**: [Names or roles]
**Context**: [Project or feature name]

---

## Context and Problem Statement

[Describe the context and problem in 2-3 sentences. What forces us to make this decision?]

**Example**:
> The PRD requires users to authenticate via biometrics. We need to decide between native biometric APIs vs third-party SDK.

---

## Decision Drivers

[List the factors that influence the decision]

* Driver 1 (e.g., Security requirements)
* Driver 2 (e.g., Development time)
* Driver 3 (e.g., User experience)
* Driver 4 (e.g., Maintenance cost)

---

## Considered Options

### Option 1: [Name]

**Description**: [Brief description]

**Pros**:
* ✅ Pro 1
* ✅ Pro 2

**Cons**:
* ❌ Con 1
* ❌ Con 2

**Implementation Effort**: [Low | Medium | High]

**Example**: [Code snippet or concrete example]

---

### Option 2: [Name]

**Description**: [Brief description]

**Pros**:
* ✅ Pro 1
* ✅ Pro 2

**Cons**:
* ❌ Con 1
* ❌ Con 2

**Implementation Effort**: [Low | Medium | High]

**Example**: [Code snippet or concrete example]

---

### Option 3: [Name] (if applicable)

**Description**: [Brief description]

**Pros**:
* ✅ Pro 1

**Cons**:
* ❌ Con 1

**Implementation Effort**: [Low | Medium | High]

---

## Decision Outcome

**Chosen option**: **Option [X]: [Name]**

**Justification**:
[Explain why this option was chosen. Reference decision drivers.]

**Example**:
> We chose Option 1 (Native Biometric APIs) because:
> 1. Security: Native APIs are more trustworthy (Driver 1)
> 2. Performance: No third-party SDK overhead (Driver 3)
> 3. Maintenance: One less dependency to manage (Driver 4)
>
> While development time (Driver 2) is slightly higher, the long-term benefits outweigh the initial cost.

---

## Consequences

### Positive

* [Positive consequence 1]
* [Positive consequence 2]

### Negative

* [Negative consequence 1]
* [Negative consequence 2]

### Neutral

* [Neutral consequence 1]

---

## Implementation Plan

1. [Step 1 with owner]
2. [Step 2 with owner]
3. [Step 3 with owner]

**Estimated effort**: [X days/weeks]

---

## Alternatives Considered But Not Documented

[List any options that were quickly dismissed and why]

* Option X: Dismissed because [reason]

---

## Links

* **Related ADRs**: [ADR-XXX], [ADR-YYY]
* **PRD Section**: [Link to PRD section]
* **Confluence**: [Link to related docs]
* **GitHub Discussion**: [Link if applicable]

---

## Review History

| Date | Reviewer | Action | Notes |
|------|----------|--------|-------|
| [Date] | [Name] | Proposed | Initial draft |
| [Date] | [Name] | Accepted | Approved after review |
