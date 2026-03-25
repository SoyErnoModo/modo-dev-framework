---
description: >
  Start a new feature/task lifecycle. Fetches ticket from Linear/Jira, validates acceptance
  criteria quality, creates documentation vault, initializes feature journal and checklist.
  Use before writing any code.
argument-hint: <ticket-id> [--source linear|jira] [--branch <branch-name>]
---

# /dev-start - Initialize Feature Development

You are the dev-guardian lifecycle initializer. Set up everything needed before code is written.

## Step 0: Parse Arguments

Extract from `$ARGUMENTS`:
- **ticket-id**: e.g., "MOD-1234", "MODO-567", "FE-89"
- **--source**: If provided, force Linear or Jira. Otherwise auto-detect by prefix.
- **--branch**: Custom branch name. Default: `feat/{ticket-id}-{slug}`

## Step 1: Fetch Ticket Data

### From Linear MCP (if Linear ticket):
Use Linear MCP tools to get: title, description, priority, labels, acceptance criteria, assignee, team, project, linked issues, comments, status.

### From Jira (Atlassian MCP):
Use Atlassian MCP tools to get: summary, description, priority, labels, components, acceptance criteria, assignee, sprint, epic, linked issues, comments.

## Step 2: Validate Acceptance Criteria

Launch the **criteria-validator** agent with all ticket data.

The agent validates each criterion for:
- **Clarity** (0-25): Specific, measurable, no ambiguous words
- **Testability** (0-25): Can write a test to verify
- **Completeness** (0-25): Happy path, errors, edge cases defined

Also checks for missing common concerns: error handling, loading states, empty states, mobile/responsive, accessibility, edge cases, performance, security.

**Overall AC Score**: 0-100
- Score < 60: "Clarify before starting" (high rework risk)
- Score 60-80: "Proceed with caution"
- Score > 80: "Proceed"

## Step 3: Create Documentation Vault

Create directory: `~/Documents/dev-vault/features/{YYYY-MM}/{ticket-id}-{slug}/`

Generate files from templates in `~/Documents/dev-vault/templates/`:

1. **journal.md**: Initialize from journal-template.md with ticket data, AC score, date
2. **acceptance.md**: Initialize from acceptance-template.md with extracted criteria
3. **architecture.md**: Empty scaffold with sections for diagrams and decisions
4. **decisions.md**: Empty ADR log, first entry will be added by /dev-critique
5. **review.md**: Empty review log, entries added by /dev-check and /dev-critique
6. **summary.md**: Initialize from summary-template.md with ticket metadata

## Step 4: Update Vault Index

Append to `~/Documents/dev-vault/index.md` Active Features table:
```
| {date} | [{ticket-id}](features/{YYYY-MM}/{ticket-id}-{slug}/) | {title} | In Progress | {AC score}/100 | - |
```

## Step 5: Persist to Engram

Save to engram with `topic_key: dev-guardian/features/{ticket-id}`:
```
**Feature**: {ticket-id} - {title}
**Status**: started
**Ticket URL**: {url}
**Vault Path**: ~/Documents/dev-vault/features/{YYYY-MM}/{ticket-id}-{slug}/
**Branch**: {branch-name}
**AC Score**: {score}/100
**AC Count**: {count}
**Started**: {YYYY-MM-DD HH:MM}
```

## Step 6: Present Summary

```markdown
# Dev Guardian: {ticket-id} Initialized

**Ticket**: [{title}]({url})
**Branch**: `{branch-name}`
**Vault**: `~/Documents/dev-vault/features/{YYYY-MM}/{ticket-id}-{slug}/`
**AC Score**: {score}/100 - {recommendation}

## Acceptance Criteria ({count})
| # | Criterion | Clarity | Testable | Score |
|---|-----------|---------|----------|-------|
| AC-1 | {text} | {rating} | {yes/no} | {score} |

## Flagged Issues
{Any ambiguities, missing concerns, or low-scoring criteria}

## Next Steps
1. Review acceptance criteria in `acceptance.md` - refine if needed
2. Start coding on branch `{branch-name}`
3. Run `/dev-check` periodically during development
4. Run `/dev-critique` before creating PR

_Suggest: `/dev-notify started` to inform the team_
```

## Rules

- Always fetch REAL ticket data - never guess or fabricate
- If ticket not found, fail with helpful message (wrong ID? wrong source?)
- Create vault even if some data is incomplete
- Journal is append-only: never overwrite previous entries
- AC validation is advisory, not blocking - user decides whether to proceed
- Convert relative dates to absolute dates in all saved data
