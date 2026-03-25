---
id: sprint-plan
title: "Sprint Plan Generator"
description: "Generate a phased sprint plan following MODO sprint-plan-template conventions"
category: architecture
tags: [planning, sprint, agile, project-management]
variables:
  - name: epic_name
    description: "Name of the epic or initiative to plan"
    type: string
    required: true
  - name: capacity
    description: "Team capacity for the planning period"
    type: string
    required: false
    defaultValue: "3 devs"
  - name: duration
    description: "Total duration of the planning horizon"
    type: string
    required: false
    defaultValue: "4 sprints"
  - name: priorities
    description: "Ordered list of priority areas or constraints"
    type: string
    required: false
---

# Sprint Plan: {epic_name}

Generate a phased sprint plan for the MODO platform following the sprint-plan-template conventions.

**Epic**: {epic_name}
**Capacity**: {capacity}
**Duration**: {duration}
**Priorities**: {priorities}

---

## Planning Framework

### 1. Epic Breakdown

Decompose {epic_name} into discrete work items. For each item provide:

- **Title**: short, descriptive name
- **Description**: one sentence explaining the deliverable
- **Complexity**: S (1-2 days) / M (3-5 days) / L (1-2 weeks) / XL (requires splitting)
- **Type**: Foundation / Feature / Polish / QA
- **Dependencies**: list of items that must complete first

Flag any XL items — these must be broken down further before they can be scheduled.

### 2. Phase Allocation

Distribute work across {duration} using the MODO four-phase structure:

#### Phase 1: Foundation (Sprint 1)
Focus on infrastructure, shared types, API contracts, and scaffolding. No user-facing features yet.

- Set up module structure and routing
- Define TypeScript interfaces and shared types
- Create or update API client methods
- Configure feature flags and Remote Config keys
- Establish test infrastructure (fixtures, mocks, factories)

**Exit criteria**: all contracts defined, dev environment fully functional, CI pipeline passing.

#### Phase 2: Features (Sprints 2-3)
Build the core functionality, working from the inside out (data layer, then business logic, then UI).

- Implement backend services and API endpoints
- Build UI components following the design system
- Wire up state management and data fetching
- Integrate with upstream services
- Write unit and integration tests alongside implementation

**Exit criteria**: all acceptance criteria met in the development environment, 80% test coverage on new code.

#### Phase 3: Polish (Sprint 3-4)
Refine the user experience, handle edge cases, and address technical debt introduced during feature work.

- Error handling and fallback states
- Loading skeletons and empty states
- Accessibility audit and fixes
- Performance optimization (bundle size, render cycles, API call reduction)
- Copy review and Remote Config finalization

**Exit criteria**: feature is production-ready from a UX perspective, no open accessibility issues.

#### Phase 4: QA and Stabilization (Sprint 4)
Final validation, documentation, and release preparation.

- End-to-end testing on staging environment
- Regression testing of adjacent features
- SonarCloud quality gate validation
- Documentation updates (API docs, runbooks, ADRs)
- Release notes and stakeholder demo preparation

**Exit criteria**: all quality gates pass, stakeholder sign-off obtained, release plan finalized.

### 3. Dependencies Graph

Map the dependencies between work items to identify the critical path.

```
[Item A] ──> [Item B] ──> [Item D]
                 └──> [Item E]
[Item C] ──────────────> [Item F]
```

- **Critical path**: the longest chain of dependent items that determines the minimum project duration.
- **Parallelizable items**: items with no dependencies on each other that can be assigned to different developers simultaneously.
- **External dependencies**: items blocked on other teams, services, or approvals — flag with an owner and expected resolution date.

### 4. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| <risk description> | Low/Medium/High | Low/Medium/High | <specific mitigation action> |

Include at least these categories:
- **Technical risk**: unfamiliar technology, complex integration, performance uncertainty
- **Dependency risk**: upstream API delays, design deliverables, third-party services
- **Scope risk**: requirements ambiguity, stakeholder changes, scope creep
- **Capacity risk**: team availability, knowledge concentration in one person

### 5. Team Allocation

Given {capacity}, assign work streams to team members.

| Developer | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 |
|-----------|----------|----------|----------|----------|
| Dev 1 | <items> | <items> | <items> | <items> |
| Dev 2 | <items> | <items> | <items> | <items> |
| Dev 3 | <items> | <items> | <items> | <items> |

**Principles**:
- No developer should be assigned more than 80% of their sprint capacity (leave room for code reviews, meetings, and unplanned work).
- Distribute knowledge — avoid having a single person own all critical-path items.
- Pair complex items with a reviewer who has domain expertise.
- If {priorities} is provided, ensure the highest-priority items are staffed first and have backup coverage.

### 6. Sprint Summary

| Sprint | Theme | Key Deliverables | Risks | Capacity Used |
|--------|-------|-----------------|-------|---------------|
| 1 | Foundation | <list> | <top risk> | X% |
| 2 | Features (core) | <list> | <top risk> | X% |
| 3 | Features + Polish | <list> | <top risk> | X% |
| 4 | QA + Release | <list> | <top risk> | X% |

Adjust the number of sprints and phase boundaries based on {duration} if it differs from the default 4-sprint horizon.
