---
id: feature-kickoff
title: "Feature Kickoff"
description: "Initialize a new feature with spec-first discipline, vault entry, and development plan"
category: development
tags: [feature, planning, workflow, dev-start]
variables:
  - name: ticket_id
    description: "Jira or Linear ticket identifier for the feature"
    type: string
    required: true
  - name: feature_name
    description: "Human-readable name of the feature"
    type: string
    required: true
  - name: acceptance_criteria
    description: "List of acceptance criteria from the ticket"
    type: string
    required: false
---

# Feature Kickoff: {feature_name}

You are initializing a new feature for the MODO platform. Follow the spec-first discipline to ensure the feature is well-defined before any code is written.

**Ticket**: {ticket_id}
**Feature**: {feature_name}
**Acceptance Criteria**: {acceptance_criteria}

---

## Step 1: Validate Acceptance Criteria

Before starting, review the acceptance criteria for completeness.

1. **Parse each AC** into a testable statement. Each criterion must be:
   - Specific (no ambiguous terms like "should work well")
   - Measurable (defines a concrete expected outcome)
   - Independent (can be verified in isolation)
2. **Identify gaps**: flag any ACs that are missing edge cases, error states, or cross-platform considerations.
3. **Propose additions**: suggest additional ACs for scenarios the ticket may not cover:
   - Error handling and fallback behavior
   - Loading and empty states
   - Accessibility requirements
   - Analytics or tracking events
   - Backward compatibility constraints
4. If {acceptance_criteria} is not provided, extract them from the ticket {ticket_id} or draft a proposed set based on the feature name and request author confirmation before proceeding.

## Step 2: Create Dev Vault Entry

Initialize a vault entry for this feature to track decisions and progress throughout development.

```markdown
## {feature_name}

**Ticket**: {ticket_id}
**Status**: In Progress
**Started**: <current date>

### Acceptance Criteria
<validated ACs from Step 1>

### Technical Decisions
<to be filled during implementation>

### Open Questions
<questions identified during kickoff>

### Quality Metrics
- Coverage: pending
- Complexity: pending
- SonarCloud: pending
```

## Step 3: Technical Discovery

Perform a lightweight technical analysis before writing code.

1. **Scope the change**: identify which modules, services, and components will be touched.
2. **Check dependencies**: are there upstream API changes, shared library updates, or feature flags needed?
3. **Identify risks**: what could block progress or cause rework?
   - Missing API endpoints or incomplete contracts
   - Design system components that do not exist yet
   - Shared state or data models that other teams also modify
4. **Estimate complexity**: classify as S / M / L / XL using MODO sizing conventions.
5. **Flag prerequisites**: list anything that must be completed or decided before implementation can begin.

## Step 4: Suggest Development Plan

Propose a structured plan using plan mode thinking.

1. **Approach**: outline the implementation strategy in 3-5 steps, ordered by dependency.
2. **Spec first**: the first task should always be writing or updating the technical specification — no implementation before the spec is reviewed.
3. **Branch strategy**: suggest the branch name following MODO conventions (e.g., `feature/{ticket_id}-short-description`).
4. **Testing strategy**: define which types of tests are needed:
   - Unit tests for business logic and utilities
   - Integration tests for API interactions
   - Component tests for UI elements
   - E2E tests for critical user flows (if applicable)
5. **PR breakdown**: if the feature is M or larger, suggest how to split it into smaller, independently reviewable PRs.

## Step 5: Trigger Workflow

Summarize the kickoff and provide the developer with immediate next actions:

- [ ] Validate and finalize acceptance criteria
- [ ] Create the feature branch
- [ ] Write the technical specification
- [ ] Get spec reviewed by a peer
- [ ] Begin implementation following the plan
- [ ] Update the vault entry as decisions are made

This kickoff follows the `/dev-start` workflow pattern. The vault entry should be updated at each milestone and finalized during `/dev-complete`.
