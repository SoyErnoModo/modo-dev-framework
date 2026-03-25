---
description: >
  Browse the documentation vault. Search feature histories, view timelines,
  see quality metrics, compare implementations.
argument-hint: [<ticket-id>] [--search "query"] [--stats] [--recent N]
---

# /dev-history - Feature History Browser

Browse and search the dev-guardian documentation vault.

## Sub-Commands

### Default (no args): Recent Features

Show 10 most recent features from `~/Documents/dev-vault/index.md`:

```markdown
# Recent Features

| Date | Ticket | Title | Status | Grade | Duration |
|------|--------|-------|--------|-------|----------|
| {date} | {id} | {title} | {status} | {grade} | {days} |
```

### With ticket-id: Feature Detail

Read and present `summary.md` for the specified feature, plus:
- Quick links to journal, architecture, decisions, review
- Key stats and grade
- Timeline of events

### --search "query"

Search across all vault files using Grep:
- journal.md files for development context
- architecture.md for patterns and diagrams
- decisions.md for similar ADRs
- acceptance.md for similar criteria

Present results grouped by feature:
```markdown
# Search: "{query}"

## {ticket-id} - {title} ({date})
- **journal.md**: {matching context}
- **decisions.md**: {matching ADR}

## {ticket-id-2} - {title} ({date})
- **architecture.md**: {matching pattern}
```

### --stats

Show aggregate metrics from `~/Documents/dev-vault/stats.md`:

```markdown
# Development Quality Metrics

## Overall
| Metric | Value | Trend |
|--------|-------|-------|
| Features completed | {N} | |
| Average lifecycle score | {N}/100 | {trend} |
| Average duration | {N} days | {trend} |
| Average AC coverage | {%} | {trend} |

## Monthly
| Month | Features | Avg Score | Avg Duration |
|-------|----------|-----------|-------------|
| {month} | {N} | {score} | {days} |

## Grade Distribution
| Grade | Count | % |
|-------|-------|---|
| A | {N} | {%} |
| B | {N} | {%} |
| C | {N} | {%} |

## Common Issues
{Most frequent issue types across all features}

## Quality Trends
{Are scores improving? Duration decreasing? AC coverage going up?}
```

### --recent N

List the N most recent features with their grades.

## Rules

- Read from the file system (vault is source of truth), not just engram
- If vault files are missing or corrupted, note it
- Stats should show trends to help improve over time
- Search is case-insensitive and supports partial matches
- For `--stats`, calculate aggregates from actual vault data, not cached values
