# Prompts Catalog

Complete catalog of all 9 prompt templates in the MODO Dev Framework. Each prompt is a markdown file with gray-matter frontmatter that defines metadata, variables, and the prompt body. The MCP server renders prompts by substituting `{variable_name}` placeholders with provided values.

---

## How Prompts Work

Prompts live in `prompts/{category}/` directories. Each has:

- **Frontmatter**: `id`, `title`, `description`, `category`, `tags`, and `variables` array
- **Body**: Markdown content with `{variable}` placeholders

You can invoke prompts through:

1. **MCP tool**: `get_prompt` with `id` and `variables` object
2. **MCP native prompts**: `prompts/get` with `name` and `arguments`
3. **Slash commands**: Commands like `/dev-start` and `/dev-critique` invoke prompts internally
4. **Direct reference**: Ask Claude to use a specific prompt template

---

## Development Prompts

### code-review

**Structured Code Review**

| Field | Value |
|-------|-------|
| **ID** | `code-review` |
| **Category** | development |
| **Tags** | `review`, `quality`, `code`, `guardia` |
| **File** | `prompts/development/code-review.md` |

#### Variables

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `pr_url` | string | Yes | -- | Pull request URL or number |
| `focus` | string | No | `"all"` | Review focus area |
| `language` | string | No | `"TypeScript"` | Primary programming language |

#### Example Invocation

```json
{
  "id": "code-review",
  "variables": {
    "pr_url": "https://github.com/org/repo/pull/456",
    "focus": "security",
    "language": "TypeScript"
  }
}
```

#### Sample Rendered Output (first 15 lines)

```markdown
# Structured Code Review

You are performing a thorough code review for the MODO platform. Review the
pull request at **https://github.com/org/repo/pull/456** with a primary focus
on **security** using **TypeScript** best practices.

Apply the MODO quality gate standards throughout the review:
- **Test coverage**: Must meet or exceed 80% threshold
- **Cyclomatic complexity**: No function should exceed 15
- **Type safety**: No usage of `any` types in TypeScript code
- **Linting**: Zero ESLint/SonarCloud warnings in new or modified code

## Review Sections

### 1. Security Review
```

#### When to Use

Use this prompt when reviewing a PR outside the `/guardia` workflow, or when you need a focused review on a specific dimension (security, performance, testing, architecture, or code quality). The `/guardia` command uses specialized agents for each dimension; this prompt provides a single-pass comprehensive review.

---

### pr-description

**PR Description Generator**

| Field | Value |
|-------|-------|
| **ID** | `pr-description` |
| **Category** | development |
| **Tags** | `pr`, `git`, `workflow`, `documentation` |
| **File** | `prompts/development/pr-description.md` |

#### Variables

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `ticket_id` | string | Yes | -- | Jira or Linear ticket identifier |
| `changes_summary` | string | Yes | -- | Brief summary of what was changed and why |
| `breaking_changes` | string | No | `"none"` | Description of any breaking changes |

#### Example Invocation

```json
{
  "id": "pr-description",
  "variables": {
    "ticket_id": "MOD-1234",
    "changes_summary": "Added payment retry logic with exponential backoff. Retries failed payments up to 3 times before marking as failed.",
    "breaking_changes": "none"
  }
}
```

#### Sample Rendered Output (first 15 lines)

```markdown
# PR Description Generator

Generate a pull request description for the MODO platform following our
standard conventions. Use the information below to produce a complete,
reviewer-friendly PR body.

**Ticket**: MOD-1234
**Changes**: Added payment retry logic with exponential backoff. Retries
failed payments up to 3 times before marking as failed.
**Breaking Changes**: none

## Instructions

Produce the PR description using the exact structure below. Each section is
mandatory...
```

#### When to Use

Run this prompt after finishing your implementation and before creating the PR. It generates a structured description with Summary (linking the ticket), Changes (Added/Modified/Removed), Test Plan (including standard CI checks), Breaking Changes, and Additional Context sections.

---

### bug-analysis

**Structured Bug Analysis**

| Field | Value |
|-------|-------|
| **ID** | `bug-analysis` |
| **Category** | development |
| **Tags** | `bug`, `debugging`, `investigation`, `quality` |
| **File** | `prompts/development/bug-analysis.md` |

#### Variables

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `error_message` | string | Yes | -- | The error message or observed incorrect behavior |
| `context` | string | No | -- | Where and when the bug occurs (environment, user flow, frequency) |
| `stack_trace` | string | No | -- | Full stack trace if available |

#### Example Invocation

```json
{
  "id": "bug-analysis",
  "variables": {
    "error_message": "TypeError: Cannot read property 'retryCount' of undefined",
    "context": "Occurs in production when a user clicks 'Pay Now' after their session expires. Frequency: ~50 times/day since deploy v2.4.1.",
    "stack_trace": "at PaymentService.processRetry (payment.ts:142)\n  at PaymentController.handlePayment (controller.ts:89)"
  }
}
```

#### Sample Rendered Output (first 15 lines)

```markdown
# Structured Bug Analysis

You are investigating a bug in the MODO platform. Follow the structured
methodology below to move from symptom to verified fix.

## Bug Report

- **Error**: TypeError: Cannot read property 'retryCount' of undefined
- **Context**: Occurs in production when a user clicks 'Pay Now' after their
  session expires. Frequency: ~50 times/day since deploy v2.4.1.
- **Stack Trace**: at PaymentService.processRetry (payment.ts:142)
    at PaymentController.handlePayment (controller.ts:89)

---

## Phase 1: Reproduce
```

#### When to Use

Use when investigating a bug. The prompt guides a 4-phase methodology: Reproduce, Isolate Root Cause, Identify Fix, and Verify/Prevent Regression. It checks MODO-specific causes (Remote Config, feature flags, API contract changes, race conditions, `any` type masking). Pairs well with the `code-auditor` agent for automated code quality checks after the fix.

---

### feature-kickoff

**Feature Kickoff**

| Field | Value |
|-------|-------|
| **ID** | `feature-kickoff` |
| **Category** | development |
| **Tags** | `feature`, `planning`, `workflow`, `dev-start` |
| **File** | `prompts/development/feature-kickoff.md` |

#### Variables

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `ticket_id` | string | Yes | -- | Jira or Linear ticket identifier |
| `feature_name` | string | Yes | -- | Human-readable name of the feature |
| `acceptance_criteria` | string | No | -- | List of acceptance criteria from the ticket |

#### Example Invocation

```json
{
  "id": "feature-kickoff",
  "variables": {
    "ticket_id": "MOD-1234",
    "feature_name": "Payment Retry Logic",
    "acceptance_criteria": "1. Failed payments retry up to 3 times with exponential backoff\n2. User sees retry progress indicator\n3. After 3 failures, payment marked as failed with user notification"
  }
}
```

#### Sample Rendered Output (first 15 lines)

```markdown
# Feature Kickoff: Payment Retry Logic

You are initializing a new feature for the MODO platform. Follow the
spec-first discipline to ensure the feature is well-defined before any
code is written.

**Ticket**: MOD-1234
**Feature**: Payment Retry Logic
**Acceptance Criteria**: 1. Failed payments retry up to 3 times with
exponential backoff
2. User sees retry progress indicator
3. After 3 failures, payment marked as failed with user notification

---

## Step 1: Validate Acceptance Criteria
```

#### When to Use

This prompt powers the spec-first phase of `/dev-start`. Use it directly when you want to run a kickoff without the full `/dev-start` lifecycle (vault creation, engram persistence). It validates ACs, creates a vault entry, performs technical discovery, and suggests a development plan with PR breakdown for larger features.

---

## Architecture Prompts

### adr-decision

**Architecture Decision Record**

| Field | Value |
|-------|-------|
| **ID** | `adr-decision` |
| **Category** | architecture |
| **Tags** | `adr`, `architecture`, `decision`, `documentation` |
| **File** | `prompts/architecture/adr-decision.md` |

#### Variables

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `decision_title` | string | Yes | -- | Short title for the architectural decision |
| `context` | string | Yes | -- | Background and problem statement |
| `options` | string | No | `"To be explored"` | Comma-separated list of options being considered |

#### Example Invocation

```json
{
  "id": "adr-decision",
  "variables": {
    "decision_title": "Payment retry queue implementation",
    "context": "We need to retry failed payments reliably. Current implementation retries in-process, which loses retries if the server restarts.",
    "options": "In-memory queue with setTimeout, Redis-backed queue with Bull, Database-backed queue with pg-boss"
  }
}
```

#### Sample Rendered Output (first 15 lines)

```markdown
# Architecture Decision Record: Payment retry queue implementation

Generate a complete Architecture Decision Record for the MODO platform using
the information provided.

**Decision**: Payment retry queue implementation
**Context**: We need to retry failed payments reliably. Current implementation
retries in-process, which loses retries if the server restarts.
**Options Under Consideration**: In-memory queue with setTimeout, Redis-backed
queue with Bull, Database-backed queue with pg-boss

---

Produce the ADR using the following template. Every section is required. Be
specific and quantitative where possible...
```

#### When to Use

Use when you need to document a significant technical decision. The `/dev-critique` command generates ADRs automatically, but this prompt lets you create them on demand for decisions made outside the feature lifecycle. The output includes context, decision drivers, structured option analysis with effort/risk/reversibility ratings, decision outcome, consequences, implementation plan, and related decisions.

---

### tech-spec

**Technical Specification**

| Field | Value |
|-------|-------|
| **ID** | `tech-spec` |
| **Category** | architecture |
| **Tags** | `spec`, `architecture`, `planning`, `tech-guide` |
| **File** | `prompts/architecture/tech-spec.md` |

#### Variables

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `feature_name` | string | Yes | -- | Name of the feature to specify |
| `requirements` | string | Yes | -- | Functional and non-functional requirements |
| `existing_apis` | string | No | -- | List of existing APIs the feature interacts with |
| `ui_library` | string | No | `"@playsistemico/modo-sdk-web-ui-lib"` | UI component library to use |

#### Example Invocation

```json
{
  "id": "tech-spec",
  "variables": {
    "feature_name": "Payment Retry Dashboard",
    "requirements": "Display retry history for merchants. Filter by date, status, amount. Export to CSV. Real-time updates via WebSocket.",
    "existing_apis": "GET /api/v1/payments, GET /api/v1/payments/:id/retries, WebSocket /ws/payments"
  }
}
```

#### Sample Rendered Output (first 15 lines)

```markdown
# Technical Specification: Payment Retry Dashboard

Generate a comprehensive technical specification for the MODO platform
following the tech-guide-structure conventions. This spec should be detailed
enough for any team member to implement the feature without ambiguity.

**Feature**: Payment Retry Dashboard
**Requirements**: Display retry history for merchants. Filter by date, status,
amount. Export to CSV. Real-time updates via WebSocket.
**Existing APIs**: GET /api/v1/payments, GET /api/v1/payments/:id/retries,
WebSocket /ws/payments
**UI Library**: @playsistemico/modo-sdk-web-ui-lib

---

## Spec Output Structure
```

#### When to Use

Use before implementing a medium or large feature. The output covers 10 sections: overview, stack analysis, API integration (mapping requirements to existing endpoints), design system compliance (component inventory, Remote Config keys, responsive behavior, a11y), data model, component architecture, gap analysis, testing strategy, implementation plan, and open questions. Reference the `modo-tech-architect` skill for architecture validation after writing the spec.

---

### sprint-plan

**Sprint Plan Generator**

| Field | Value |
|-------|-------|
| **ID** | `sprint-plan` |
| **Category** | architecture |
| **Tags** | `planning`, `sprint`, `agile`, `project-management` |
| **File** | `prompts/architecture/sprint-plan.md` |

#### Variables

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `epic_name` | string | Yes | -- | Name of the epic or initiative to plan |
| `capacity` | string | No | `"3 devs"` | Team capacity for the planning period |
| `duration` | string | No | `"4 sprints"` | Total duration of the planning horizon |
| `priorities` | string | No | -- | Ordered list of priority areas or constraints |

#### Example Invocation

```json
{
  "id": "sprint-plan",
  "variables": {
    "epic_name": "Payment Reliability Overhaul",
    "capacity": "4 devs, 1 QA",
    "duration": "3 sprints",
    "priorities": "1. Zero-downtime retry mechanism, 2. Merchant-facing dashboard, 3. Alerting and monitoring"
  }
}
```

#### Sample Rendered Output (first 15 lines)

```markdown
# Sprint Plan: Payment Reliability Overhaul

Generate a phased sprint plan for the MODO platform following the
sprint-plan-template conventions.

**Epic**: Payment Reliability Overhaul
**Capacity**: 4 devs, 1 QA
**Duration**: 3 sprints
**Priorities**: 1. Zero-downtime retry mechanism, 2. Merchant-facing
dashboard, 3. Alerting and monitoring

---

## Planning Framework

### 1. Epic Breakdown
```

#### When to Use

Use when planning a multi-sprint initiative. The output follows MODO's 4-phase structure: Foundation (Sprint 1: types, contracts, scaffolding), Features (Sprints 2-3: core implementation), Polish (Sprint 3-4: error handling, a11y, performance), and QA/Stabilization (Sprint 4: E2E testing, docs, release). Includes dependency graph, risk assessment, team allocation, and sprint summary table.

---

## Documentation Prompts

### feature-summary

**Feature Summary for Dev Vault**

| Field | Value |
|-------|-------|
| **ID** | `feature-summary` |
| **Category** | documentation |
| **Tags** | `documentation`, `vault`, `dev-complete`, `retrospective` |
| **File** | `prompts/documentation/feature-summary.md` |

#### Variables

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `feature_name` | string | Yes | -- | Name of the completed feature |
| `ticket_id` | string | Yes | -- | Jira or Linear ticket identifier |
| `outcomes` | string | Yes | -- | Summary of what was delivered and the result |
| `metrics` | string | No | -- | Quality or business metrics |

#### Example Invocation

```json
{
  "id": "feature-summary",
  "variables": {
    "feature_name": "Payment Retry Logic",
    "ticket_id": "MOD-1234",
    "outcomes": "Implemented exponential backoff retry for failed payments. Reduced payment failure rate from 3.2% to 0.8% in first week.",
    "metrics": "Payment success rate: 96.8% -> 99.2%, P95 latency: 1200ms -> 1350ms (acceptable), Test coverage: 92%"
  }
}
```

#### Sample Rendered Output (first 15 lines)

```markdown
# Feature Summary: Payment Retry Logic

Generate a post-implementation feature summary for the MODO dev-vault. This
document serves as the permanent record of what was built, how it was built,
and what the team learned. It is created as part of the /dev-complete workflow.

**Feature**: Payment Retry Logic
**Ticket**: MOD-1234
**Outcomes**: Implemented exponential backoff retry for failed payments.
Reduced payment failure rate from 3.2% to 0.8% in first week.
**Metrics**: Payment success rate: 96.8% -> 99.2%, P95 latency: 1200ms ->
1350ms (acceptable), Test coverage: 92%

---

## Summary Output Structure
```

#### When to Use

This prompt is invoked automatically by `/dev-complete` to generate the final feature summary. Use it directly when you need to write a post-mortem or retrospective summary for a feature that was completed outside the standard lifecycle. The output covers 8 sections: overview, AC validation, deliverables, architectural decisions, quality metrics, challenges and solutions, lessons learned, and follow-up items.

---

### api-docs

**API Documentation Generator**

| Field | Value |
|-------|-------|
| **ID** | `api-docs` |
| **Category** | documentation |
| **Tags** | `api`, `documentation`, `rest`, `openapi` |
| **File** | `prompts/documentation/api-docs.md` |

#### Variables

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `endpoint` | string | Yes | -- | API endpoint path |
| `method` | string | Yes | `"GET"` | HTTP method |
| `base_url` | string | No | -- | Base URL for the API |
| `request_schema` | string | No | -- | Description or shape of the request body/parameters |
| `response_schema` | string | No | -- | Description or shape of the successful response |

#### Example Invocation

```json
{
  "id": "api-docs",
  "variables": {
    "endpoint": "/api/v1/payments/:id/retry",
    "method": "POST",
    "base_url": "https://api.modo.com.ar",
    "request_schema": "{ max_retries: number (1-5), backoff_strategy: 'linear' | 'exponential' }",
    "response_schema": "{ retry_id: string, status: 'queued' | 'processing', estimated_next_attempt: ISO8601 }"
  }
}
```

#### Sample Rendered Output (first 15 lines)

```markdown
# API Documentation: POST /api/v1/payments/:id/retry

Generate comprehensive API documentation for the MODO platform following the
api-documentation-guide conventions. The output should be complete enough for
a frontend developer to integrate the endpoint without reading the backend
source code.

**Endpoint**: /api/v1/payments/:id/retry
**Method**: POST
**Base URL**: https://api.modo.com.ar
**Request Schema**: { max_retries: number (1-5), backoff_strategy: 'linear' |
'exponential' }
**Response Schema**: { retry_id: string, status: 'queued' | 'processing',
estimated_next_attempt: ISO8601 }
```

#### When to Use

Use when documenting a new or changed API endpoint. The output includes: endpoint summary table, authentication details, headers, path parameters, query parameters, request body (with JSON example and TypeScript interface), success response, error responses (full table with status codes, error codes, and causes), usage examples (cURL and TypeScript fetch), rate limiting details, and a gap analysis comparing current behavior against the PRD. The `/dev-docs --section api` command uses this pattern internally.
