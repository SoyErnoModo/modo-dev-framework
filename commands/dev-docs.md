---
description: >
  Generate or update comprehensive feature documentation. Architecture diagrams (Mermaid),
  decision log (ADRs), API changes, component tree, test coverage report.
argument-hint: [<ticket-id>] [--section architecture|decisions|api|components|tests|all]
---

# /dev-docs - Documentation Generator

Generate and maintain comprehensive documentation for the active feature.

## Step 0: Resolve Context

Resolve ticket, load vault path, engram data, previous checks/critiques.

## Step 1: Gather Data (parallel)

1. **Git**: Full diff main..HEAD, commit history, file list
2. **Vault**: Read all existing vault files
3. **Engram**: Load dev-check and dev-critique results
4. **Tests**: Run test suite with coverage if `--section tests` or `all`

## Step 2: Launch doc-generator Agent

Provide all gathered data. The agent generates/updates based on `--section`:

### `architecture` (or `all`)
- Overview of what was built
- Component hierarchy diagram (Mermaid)
- Module dependency graph (Mermaid)
- Data flow diagram (Mermaid)
- Integration points with existing code

### `decisions` (or `all`)
- Extract decisions from code patterns, critique results, comments
- Format as ADRs with context, options, decision, consequences

### `api` (or `all`)
- New/changed API routes, server actions
- Request/response shapes
- Breaking changes flagged

### `components` (or `all`)
- New/modified React components
- Props interfaces
- State management approach
- Server vs Client classification

### `tests` (or `all`)
- Test coverage mapped to acceptance criteria
- Coverage gaps identified
- Test quality assessment

## Step 3: Update Vault Files

Write updates to:
1. **architecture.md** - Full docs with Mermaid diagrams
2. **decisions.md** - Append new ADRs (don't overwrite existing)
3. **acceptance.md** - Update implementation evidence
4. **review.md** - Append documentation review entry

## Step 4: Calculate Doc Quality Score

| Dimension | Weight | Criteria |
|-----------|--------|----------|
| Architecture docs | 25% | Diagrams exist and current |
| ADRs complete | 25% | All significant decisions documented |
| ACs mapped | 25% | Every AC has implementation evidence |
| API/Component docs | 15% | All changes documented |
| Readability | 10% | Standalone-readable by non-participants |

## Step 5: Update Journal

```markdown
---

## {YYYY-MM-DD HH:MM} - Documentation Update

- Sections updated: {list}
- Doc Quality Score: {score}/100
- ADRs created: {count}
- Diagrams generated: {count}
```

## Step 6: Present Summary

```markdown
# Documentation Updated: {ticket-id}

**Doc Quality Score**: {score}/100

## Generated/Updated
| File | Status | Highlights |
|------|--------|-----------|
| architecture.md | Updated | {N} diagrams, {sections} |
| decisions.md | {N} new ADRs | {titles} |
| acceptance.md | {N}/{total} mapped | {gaps if any} |

## Key Diagrams
{Show the most important Mermaid diagram inline}

## Gaps
- {What's still missing or incomplete}
```

## Rules

- Mermaid diagrams MUST be syntactically valid
- Documentation must be readable by someone who hasn't seen the code
- Cross-link vault files using relative markdown links
- ADRs capture REASONING, not just choices
- Don't document obvious things - focus on non-obvious decisions
- If code lacks comments about WHY, flag as documentation gap
