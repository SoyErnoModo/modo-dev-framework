---
id: feature-summary
title: "Feature Summary for Dev Vault"
description: "Generate a post-implementation feature summary suitable for the dev-vault archive"
category: documentation
tags: [documentation, vault, dev-complete, retrospective]
variables:
  - name: feature_name
    description: "Name of the completed feature"
    type: string
    required: true
  - name: ticket_id
    description: "Jira or Linear ticket identifier"
    type: string
    required: true
  - name: outcomes
    description: "Summary of what was delivered and the result"
    type: string
    required: true
  - name: metrics
    description: "Quality or business metrics associated with the feature"
    type: string
    required: false
---

# Feature Summary: {feature_name}

Generate a post-implementation feature summary for the MODO dev-vault. This document serves as the permanent record of what was built, how it was built, and what the team learned. It is created as part of the `/dev-complete` workflow.

**Feature**: {feature_name}
**Ticket**: {ticket_id}
**Outcomes**: {outcomes}
**Metrics**: {metrics}

---

## Summary Output Structure

### 1. Overview

- **Feature**: {feature_name}
- **Ticket**: {ticket_id}
- **Status**: Complete
- **Completed**: <current date>
- **Duration**: <time from kickoff to merge, if known>

**What was built**: a 2-3 sentence description of the feature from the user's perspective. Focus on the problem it solves, not the implementation details.

### 2. Acceptance Criteria Validation

Review each acceptance criterion from the original ticket and confirm its status.

| # | Acceptance Criterion | Status | Notes |
|---|---------------------|--------|-------|
| 1 | <AC from ticket> | Met / Partially Met / Deferred | <explanation if not fully met> |
| 2 | <AC from ticket> | Met / Partially Met / Deferred | |
| ... | ... | ... | ... |

If any ACs were deferred, document the reason and link to the follow-up ticket.

### 3. What Was Delivered

Detail the concrete deliverables grouped by type.

**Code Changes**:
- <list of key PRs with their purpose and link>
- Total files changed: <count>
- Lines added/removed: <counts>

**New Components or Services**:
- <new module, component, or service with a one-line description>

**Configuration**:
- Remote Config keys added or modified
- Feature flags created
- Environment variables introduced

**Documentation**:
- ADRs written
- API documentation updated
- Runbooks created or modified

### 4. Architectural Decisions

Summarize the significant technical decisions made during implementation.

For each decision:
- **Decision**: what was decided
- **Why**: the reasoning behind it
- **Alternatives considered**: what was rejected and why
- **ADR reference**: link to the full ADR if one was written

This section captures institutional knowledge that would otherwise be lost when team members rotate.

### 5. Quality Metrics

Report the final quality gate results for the feature.

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Test coverage (new code) | >= 80% | <actual>% | Pass/Fail |
| Cyclomatic complexity | < 15 per function | <actual max> | Pass/Fail |
| SonarCloud issues | 0 new issues | <actual count> | Pass/Fail |
| Type safety | No `any` types | <count of any> | Pass/Fail |
| Bundle size impact | < 50KB increase | <actual delta> | Pass/Fail |

If {metrics} includes business metrics (adoption rate, error rate, performance), include those as well:

| Business Metric | Baseline | Current | Change |
|----------------|----------|---------|--------|
| <metric from {metrics}> | <before> | <after> | <delta> |

### 6. Challenges and Solutions

Document the non-obvious problems encountered during implementation and how they were resolved.

For each challenge:
- **Problem**: what went wrong or was harder than expected
- **Impact**: how it affected the timeline or approach
- **Solution**: what the team did to resolve it
- **Prevention**: what could be done differently next time

### 7. Lessons Learned

Capture insights that benefit the broader team.

- **What went well**: practices, tools, or approaches that should be repeated
- **What could improve**: friction points, process gaps, or tooling issues
- **Recommendations**: specific suggestions for future features of similar scope

### 8. Follow-Up Items

List any remaining work that was descoped, deferred, or identified during implementation.

| Item | Priority | Ticket | Owner |
|------|----------|--------|-------|
| <description> | High/Medium/Low | <ticket link or "To be created"> | <person or team> |

This summary closes the development lifecycle for {feature_name}. The vault entry should be marked as complete and archived for future reference.
