---
description: >
  Launch the Leadership Council - 8 expert personas review your code and solution in parallel.
  CTO, Team Lead, Product Owner, Project Manager, UI/UX Director, Data Director,
  Technology Director, and Senior AI Engineer each provide their unique perspective.
  The most thorough review you can get before shipping.
argument-hint: [<ticket-id>] [--focus <persona>] [--quick]
---

# /dev-council - The Leadership Council Review

You orchestrate 8 expert personas to critique the current implementation from every angle. This is the equivalent of presenting your work to the entire leadership team.

## Step 0: Resolve Context

If `$ARGUMENTS` has a ticket ID, use it. Otherwise resolve from engram or branch name.

If `--focus <persona>`: Run only that persona (cto, team-lead, po, pm, ui, data, tech, ai).

Load:
- All ticket data and ACs from engram/vault
- Full branch diff (`git diff main..HEAD`)
- Full content of significantly changed files
- Previous dev-check/dev-critique results if available

## Step 1: Prepare Context Package

Gather everything the council needs:

```bash
git diff main..HEAD --stat                    # Summary of changes
git diff main..HEAD --name-only               # Changed files
git log --oneline main..HEAD                  # Commit history
```

Read full content of all changed source files (not just diffs).

Build context package:
- **Ticket**: title, description, acceptance criteria
- **Code**: full content of changed files + diff
- **Metadata**: branch age, commit count, lines changed, files touched
- **Previous reviews**: dev-check scores, dev-critique verdict (if available)

## Step 2: Launch 8 Agents in Parallel

Launch ALL council members simultaneously, each with the full context package:

1. **council-cto** → Strategic alignment, tech debt, scalability, risk
2. **council-team-lead** → Readability, conventions, PR hygiene, team impact
3. **council-po** → Acceptance criteria, user stories, feature completeness
4. **council-pm** → Scope, timeline, dependencies, release readiness
5. **council-ui** → Design system, accessibility, responsive, UI states
6. **council-data-director** → Analytics, data models, privacy, observability
7. **council-tech-director** → Production readiness, infrastructure, monitoring, security
8. **council-ai-engineer** → AI integration, opportunities, cost, safety

If `--quick`: Launch only CTO, Team Lead, PO, and Tech Director (top 4).

## Step 3: Synthesize the Council Report

Collect all 8 verdicts and create a unified report:

```markdown
# Leadership Council Review
## {ticket-id} - {title}

**Date**: {YYYY-MM-DD HH:MM}
**Branch**: `{branch}` | +{add}/-{del} | {commits} commits
**Council**: {8/8 or N/8 if --focus}

---

## Council Verdicts at a Glance

| Persona | Verdict | Key Concern |
|---------|---------|-------------|
| CTO | {verdict emoji} {verdict} | {1-line concern} |
| Team Lead | {verdict emoji} {verdict} | {1-line concern} |
| Product Owner | {verdict emoji} {verdict} | {1-line concern} |
| Project Manager | {verdict emoji} {verdict} | {1-line concern} |
| UI/UX Director | {verdict emoji} {verdict} | {1-line concern} |
| Data Director | {verdict emoji} {verdict} | {1-line concern} |
| Tech Director | {verdict emoji} {verdict} | {1-line concern} |
| AI Engineer | {verdict emoji} {verdict} | {1-line concern} |

## Overall Council Score: {weighted average}/100

### Score Breakdown
| Persona | Weight | Score | Reasoning |
|---------|--------|-------|-----------|
| CTO (Strategy) | 15% | {0-100} | {1-line} |
| Team Lead (Engineering) | 15% | {0-100} | {1-line} |
| Product Owner (Product) | 15% | {0-100} | {1-line} |
| Project Manager (Delivery) | 10% | {0-100} | {1-line} |
| UI/UX Director (Design) | 15% | {0-100} | {1-line} |
| Data Director (Data) | 10% | {0-100} | {1-line} |
| Tech Director (Operations) | 10% | {0-100} | {1-line} |
| AI Engineer (Intelligence) | 10% | {0-100} | {1-line} |

### Council Grade: {A|B|C|D|F}
- A (90-100): Ship with confidence
- B (75-89): Ship with noted improvements
- C (60-74): Address concerns before shipping
- D (40-59): Significant rework needed
- F (<40): Back to the drawing board

---

## Consensus Items

### Unanimously Praised
{Things ALL or most council members praised - these are your strengths}
- {positive finding agreed upon by multiple personas}

### Unanimously Flagged
{Issues ALL or most council members raised - these are your must-fix items}
- {issue flagged by multiple personas}

### Conflicting Opinions
{Where council members disagreed - these need YOUR judgment}
- {topic}: {persona A says X} vs {persona B says Y}

---

## Priority Action Items

Consolidated from all 8 reviews, deduplicated and prioritized:

### Must Fix Before Ship (Blockers)
1. {action} — flagged by: {personas}
2. {action} — flagged by: {personas}

### Should Fix (High Priority)
1. {action} — flagged by: {personas}
2. {action} — flagged by: {personas}

### Consider (Improvements)
1. {action} — suggested by: {personas}
2. {action} — suggested by: {personas}

### Future Backlog
1. {action} — suggested by: {personas} (not for this PR)

---

## Detailed Reviews

### CTO
{Full council-cto output}

### Team Lead
{Full council-team-lead output}

### Product Owner
{Full council-po output}

### Project Manager
{Full council-pm output}

### UI/UX Director
{Full council-ui output}

### Data Director
{Full council-data-director output}

### Technology Director
{Full council-tech-director output}

### Senior AI Engineer
{Full council-ai-engineer output}

---

_Council review complete. Address "Must Fix" items, then re-run `/dev-council --quick` to validate._
```

## Step 4: Convert Verdicts to Scores

Map each persona's verdict to a score:

| Verdict Category | Score |
|-----------------|-------|
| Best (ALIGNED, EXCELLENT, ACCEPTED, ON_TRACK, POLISHED, INSTRUMENTED, SHIP_IT, WELL_INTEGRATED) | 90 |
| Good (TACTICAL_OK, GOOD, ACCEPTED_WITH_NOTES, SHIP_WITH_MONITORING, OPPORTUNITIES_EXIST) | 75 |
| Concerns (NEEDS_WORK, NEEDS_REFINEMENT, AT_RISK, PARTIALLY_TRACKED, NEEDS_HARDENING) | 55 |
| Bad (MISALIGNED, CONCERNING, REJECTED, DELAYED, DESIGN_DEBT, BLIND_SPOT, NOT_PRODUCTION_READY, AI_DEBT) | 30 |
| Critical (RETHINK, BLOCKED, DATA_RISK, MISUSING_AI) | 15 |

## Step 5: Update Vault

Append full council report to `review.md`:
```markdown
---

## {YYYY-MM-DD HH:MM} - Leadership Council Review

- Council Score: {score}/100 ({grade})
- Verdicts: {summary}
- Must Fix: {count} items
- Should Fix: {count} items
```

Append to `journal.md`:
```markdown
---

## {YYYY-MM-DD HH:MM} - Leadership Council

- Council Grade: {grade} ({score}/100)
- Consensus praise: {key strength}
- Consensus concern: {key issue}
- Action items: {count} must-fix, {count} should-fix
```

## Step 6: Persist to Engram

Save to `dev-guardian/council/{ticket-id}/{timestamp}`:
- Overall score and grade
- Per-persona verdicts
- Must-fix items count
- Key consensus items

## Rules

- ALL 8 agents run in parallel for maximum speed
- The synthesis MUST deduplicate - don't repeat the same issue 8 times
- Consensus items (flagged by 3+ personas) get higher priority
- Conflicting opinions are highlighted, not hidden - the developer decides
- The council report should be scannable in 2 minutes (summary tables) but deep-readable in 15 (full reviews)
- `--quick` with 4 personas is for rapid re-checks after fixing issues
- This is the ULTIMATE quality gate - it replaces multiple standalone reviews
- If even one persona says "NOT_PRODUCTION_READY" or equivalent, the overall grade caps at C
