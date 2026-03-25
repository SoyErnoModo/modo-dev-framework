---
description: >
  Deep architectural and approach review. Analyzes whether the implementation is the right
  approach, reviews patterns, checks edge cases, suggests alternatives.
  Generates Mermaid diagrams. Run before creating a PR.
argument-hint: [<ticket-id>] [--focus architecture|performance|security|alternatives]
---

# /dev-critique - Solution Critique

Deep, opinionated review of the current implementation approach.

## Step 0: Resolve Context

Resolve ticket from args, engram, or branch. Load all feature data.

## Step 1: Gather Full Context

Read ALL changed files completely (not just diffs):
```bash
git diff main..HEAD --name-only  # Get file list
```
Then read each file's full content to understand the complete implementation.

Also read related files that the changed files import from, to understand integration.

## Step 2: Launch solution-critic Agent

Provide the agent with:
- Full content of all changed files
- Ticket context (title, description, ACs)
- Existing codebase patterns observed
- Focus area if specified (--focus)

The agent analyzes:
1. **Architecture**: Right pattern? Over/under-engineered? Responsibilities separated?
2. **Performance**: Re-renders, waterfalls, memory leaks, bundle impact
3. **Edge Cases**: Empty data, large data, errors, concurrency, stale data, a11y
4. **Alternatives**: Simpler approaches, existing patterns to reuse, better data structures
5. **Scalability**: Easy to modify in 6 months? New devs will understand?

Generates Mermaid diagrams: component tree, data flow, state machine.

Verdict: **SOLID** | **GOOD_WITH_CONCERNS** | **NEEDS_RETHINKING** | **MAJOR_ISSUES**

## Step 3: Enrich

Cross-reference with:
- `references/quality-standards.md` for MODO-specific patterns
- Previous critiques in engram for this ticket (if re-running)
- Team structure to understand who might review the PR

## Step 4: Present Full Critique

Display the solution-critic's report with enrichments. The report includes:
- Executive summary (2-3 sentences)
- Architecture rating + diagram
- Performance analysis + data flow diagram
- Edge cases table
- Alternative approaches with effort estimates
- Prioritized recommendations

## Step 5: Update Vault

1. Write/update `architecture.md` with generated diagrams
2. Create ADRs in `decisions.md` for identified architectural decisions
3. Append critique findings to `review.md`
4. Append to `journal.md`:
```markdown
---

## {YYYY-MM-DD HH:MM} - Solution Critique

- Verdict: {verdict}
- Architecture: {rating}
- Key concern: {main issue}
- Recommendations: {count}
- Diagrams generated: {list}
```

## Step 6: Persist to Engram

Save to `dev-guardian/critiques/{ticket-id}/{timestamp}`:
- Verdict
- Key recommendations
- Architecture rating
- Alternatives suggested

## Rules

- READ full files, not just diffs
- Be opinionated but fair - acknowledge what works well FIRST
- Mermaid diagrams MUST be syntactically valid
- Always suggest at least one alternative, even for SOLID verdicts
- "NEEDS_RETHINKING" only when fundamentally wrong
- This is the DEEP review - quality over speed
- The critique is an opinion, not a mandate - state this clearly
