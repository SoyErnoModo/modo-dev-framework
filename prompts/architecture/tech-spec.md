---
id: tech-spec
title: "Technical Specification"
description: "Generate a technical specification following MODO tech-guide-structure conventions"
category: architecture
tags: [spec, architecture, planning, tech-guide]
variables:
  - name: feature_name
    description: "Name of the feature to specify"
    type: string
    required: true
  - name: requirements
    description: "Functional and non-functional requirements for the feature"
    type: string
    required: true
  - name: existing_apis
    description: "List of existing APIs or services this feature will interact with"
    type: string
    required: false
  - name: ui_library
    description: "UI component library to use"
    type: string
    required: false
    defaultValue: "@playsistemico/modo-sdk-web-ui-lib"
---

# Technical Specification: {feature_name}

Generate a comprehensive technical specification for the MODO platform following the tech-guide-structure conventions. This spec should be detailed enough for any team member to implement the feature without ambiguity.

**Feature**: {feature_name}
**Requirements**: {requirements}
**Existing APIs**: {existing_apis}
**UI Library**: {ui_library}

---

## Spec Output Structure

### 1. Overview

- **Objective**: one-paragraph description of what the feature does and the user problem it solves.
- **Scope**: what is included in this spec and what is explicitly out of scope.
- **Dependencies**: list upstream services, libraries, and teams this feature depends on.
- **Ticket Reference**: link to the originating ticket or epic.

### 2. Stack Analysis

Analyze the current technology stack and identify what is already available versus what needs to be built.

- **Frontend**: framework version, state management approach, routing strategy.
- **Backend**: runtime, framework, database, caching layer.
- **Shared**: common types, validation schemas, utility libraries.
- **Infrastructure**: deployment target, CDN, monitoring, feature flags.

Identify which parts of the stack this feature touches and whether any upgrades or new dependencies are required.

### 3. API Integration

Detail every API interaction the feature requires.

For each endpoint:
- **Method and path**: e.g., `GET /api/v1/resource`
- **Purpose**: what data it provides or what action it performs
- **Request schema**: parameters, headers, body shape with TypeScript interface
- **Response schema**: success and error response shapes with TypeScript interface
- **Authentication**: required auth mechanism
- **Rate limits or quotas**: if applicable

If {existing_apis} is provided, map each requirement to an existing endpoint or flag gaps where new endpoints are needed. If not provided, propose the API contract.

### 4. Design System Compliance

Ensure the implementation uses the MODO design system correctly.

- **Component inventory**: list every UI component needed from {ui_library} with the specific variant and props.
- **Custom components**: identify any components that do not exist in the library and must be built. Provide specifications for each.
- **Remote Config integration**: all user-facing text, feature toggles, and configurable thresholds must be sourced from Remote Config variables — never hardcoded. List every Remote Config key this feature requires.
- **Theming**: confirm the feature respects the existing theme tokens (colors, spacing, typography).
- **Responsive behavior**: specify layout behavior across mobile, tablet, and desktop breakpoints.
- **Accessibility**: WCAG 2.1 AA compliance requirements — keyboard navigation, screen reader support, color contrast.

### 5. Data Model

Define new or modified data structures.

- **Database schema changes**: new tables, columns, indexes, or migrations.
- **TypeScript interfaces**: complete type definitions for domain entities.
- **State management**: where feature state lives (local component state, global store, URL params, server cache).
- **Caching strategy**: what data is cached, TTL, invalidation rules.

### 6. Component Architecture

Describe the component tree and module boundaries.

- **Component hierarchy**: parent-child relationships with a simple tree diagram.
- **Props and contracts**: key props for each component with types.
- **Shared logic**: custom hooks, utilities, or services to be extracted.
- **Module boundaries**: which existing modules are modified and which new modules are created.

### 7. Gap Analysis

Compare what the requirements demand against what currently exists.

| Requirement | Current State | Gap | Effort |
|-------------|--------------|-----|--------|
| <requirement from {requirements}> | <what exists today> | <what needs to be built or changed> | S/M/L/XL |

Flag any gaps that are blockers (cannot proceed without resolution) versus gaps that can be addressed in parallel.

### 8. Testing Strategy

- **Unit tests**: key business logic functions and utility coverage targets.
- **Integration tests**: API interaction and service layer tests.
- **Component tests**: UI rendering, user interaction, and accessibility tests.
- **E2E tests**: critical user flows that warrant end-to-end verification.
- **Coverage target**: 80% minimum on all new code, per MODO quality gates.

### 9. Implementation Plan

Break the work into ordered, independently deliverable tasks.

| # | Task | Dependencies | Estimate | Deliverable |
|---|------|-------------|----------|-------------|
| 1 | <first task — typically types/interfaces> | None | S | PR with shared types |
| 2 | <second task> | Task 1 | M | PR with ... |
| ... | ... | ... | ... | ... |

Reference the modo-tech-architect skill for architecture validation before finalizing the spec.

### 10. Open Questions

List any unresolved questions, assumptions that need confirmation, or decisions deferred to implementation time. Each item should have a proposed owner and deadline.
