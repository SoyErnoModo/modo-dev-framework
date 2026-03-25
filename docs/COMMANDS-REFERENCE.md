# Commands Reference

Complete reference for all 9 slash commands in the MODO Dev Framework. Each command is a markdown file in `commands/` that Claude Code interprets as a structured workflow.

---

## /dev-start

**Initialize a feature development lifecycle.**

### Syntax

```
/dev-start <ticket-id> [--source linear|jira] [--branch <branch-name>]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `ticket-id` | Yes | Ticket identifier (e.g., `MOD-1234`, `MODO-567`, `FE-89`) |
| `--source` | No | Force Linear or Jira. Auto-detected from prefix if omitted. |
| `--branch` | No | Custom branch name. Default: `feat/{ticket-id}-{slug}` |

### What It Does Step by Step

1. **Parses arguments** and auto-detects the ticket source from the prefix.
2. **Fetches ticket data** from Linear MCP or Atlassian MCP: title, description, priority, labels, acceptance criteria, assignee, linked issues, comments, and status.
3. **Validates acceptance criteria** using the **criteria-validator** agent. Each criterion is scored on clarity (0-25), testability (0-25), and completeness (0-25). Common concerns like error handling, loading states, empty states, accessibility, and security are checked.
4. **Creates a documentation vault** at `~/Documents/dev-vault/features/{YYYY-MM}/{ticket-id}-{slug}/` with six files: `journal.md`, `acceptance.md`, `architecture.md`, `decisions.md`, `review.md`, `summary.md`.
5. **Updates the vault index** at `~/Documents/dev-vault/index.md` with the new feature entry.
6. **Persists to engram** with topic key `dev-guardian/features/{ticket-id}` for cross-session memory.
7. **Presents a summary** with ticket metadata, AC score table, flagged issues, and next steps.

### Agents Triggered

- **criteria-validator** -- scores acceptance criteria quality

### Example

```
/dev-start MOD-1234 --branch feat/payment-retry
```

Output includes:

- AC score: 78/100 with per-criterion breakdown
- Recommendation: "Proceed with caution" (score 60-80)
- Flagged missing concerns: no error handling defined, no mobile/responsive behavior mentioned
- Vault path and branch name

### Expected Output Format

```markdown
# Dev Guardian: MOD-1234 Initialized

**Ticket**: [Payment retry logic](https://linear.app/...)
**Branch**: `feat/payment-retry`
**Vault**: `~/Documents/dev-vault/features/2026-03/MOD-1234-payment-retry/`
**AC Score**: 78/100 - Proceed with caution

## Acceptance Criteria (4)
| # | Criterion | Clarity | Testable | Score |
|---|-----------|---------|----------|-------|
| AC-1 | ... | 22/25 | Yes | 85 |

## Flagged Issues
...

## Next Steps
1. Review acceptance criteria in acceptance.md
2. Start coding on branch feat/payment-retry
3. Run /dev-check periodically during development
4. Run /dev-critique before creating PR
```

---

## /dev-check

**In-progress quality monitor.**

### Syntax

```
/dev-check [<ticket-id>] [--quick] [--full]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `ticket-id` | No | Resolves from engram or branch name if omitted |
| `--quick` | No | Show only AC completion %, blockers, and quality score |
| `--full` | No | Full report (default behavior) |

### What It Does Step by Step

1. **Resolves the active feature** from arguments, engram (`dev-guardian/features/*`), or the current git branch name.
2. **Gathers current state** via git commands: unstaged changes, staged changes, branch commits, total diff stats, and per-file line counts.
3. **Launches 3 agents in parallel**:
   - **acceptance-checker** (progress mode): maps each AC to done, in-progress, not-started, or blocked by searching the diff for evidence.
   - **code-auditor**: analyzes the branch diff for SonarQube rule violations, React anti-patterns, security issues, and test coverage gaps. Produces a 0-100 score.
   - **Scope analyzer** (inline): compares changed files against ticket scope and flags scope creep. Classifies branch size as small (<200 lines), medium (200-500), large (500-1000), or too large (>1000).
4. **Outputs the report** with progress tables, quality scores, scope analysis, and trend comparison against previous checks.
5. **Updates the vault** journal and acceptance files.
6. **Persists scores to engram** for trend tracking.

### Agents Triggered

- **acceptance-checker** (progress mode)
- **code-auditor**

### Example

```
/dev-check --quick
```

Quick output:

```
AC: 50% (2/4 done) | Quality: 82/100 | Blockers: 1
```

Full output includes per-criterion status table, quality score breakdown by dimension, blocker and warning lists with file:line references, scope analysis, and trend comparison.

### Expected Output Format

```markdown
# Dev Check: MOD-1234 - Payment retry logic

**Branch**: `feat/payment-retry` | **Commits**: 5 | **Files**: 8 | +320/-45
**Time since start**: 2 days

## Progress: 50% of Acceptance Criteria
| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| AC-1 | Retry up to 3 times | Done | src/services/payment.ts:42 |
| AC-2 | Show retry count | In Progress | src/components/PaymentStatus.tsx |

## Quality Score: 82/100
| Dimension | Score | Issues |
|-----------|-------|--------|
| Code Quality | 85 | 2 |
| Test Coverage | 75 | 1 gap |
| Security | 95 | 0 |
| React Patterns | 80 | 1 |
```

---

## /dev-critique

**Deep architectural and approach review.**

### Syntax

```
/dev-critique [<ticket-id>] [--focus architecture|performance|security|alternatives]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `ticket-id` | No | Resolves from engram or branch name if omitted |
| `--focus` | No | Narrow the review to a specific area |

### What It Does Step by Step

1. **Resolves context** from arguments, engram, or branch.
2. **Reads full file content** of every changed file (not just diffs), plus related imported files.
3. **Launches the solution-critic agent** with full file content, ticket context, codebase patterns, and focus area. The agent analyzes:
   - Architecture: pattern appropriateness, separation of concerns, error strategy
   - Performance: re-renders, waterfalls, memory leaks, bundle impact
   - Edge cases: empty data, large data, errors, concurrency, a11y
   - Alternatives: simpler approaches, existing patterns, better data structures
   - Scalability: modifiability in 6 months, understandability for new developers
4. **Generates Mermaid diagrams**: component hierarchy, data flow, state machine.
5. **Returns a verdict**: SOLID, GOOD_WITH_CONCERNS, NEEDS_RETHINKING, or MAJOR_ISSUES.
6. **Updates vault** files: `architecture.md` with diagrams, `decisions.md` with ADRs, `review.md` with findings, `journal.md` with timestamped entry.
7. **Persists to engram** for cross-session reference.

### Agents Triggered

- **solution-critic**

### Example

```
/dev-critique --focus performance
```

Output narrows to performance analysis with data flow diagram, re-render risks, N+1 query patterns, memory leak risks, and bundle impact assessment.

### Expected Output Format

```markdown
## Solution Critique

**Verdict**: GOOD_WITH_CONCERNS
**Files reviewed**: 8 (1,240 lines)

### Executive Summary
The approach is sound but has a data fetching waterfall...

### Architecture
**Rating**: Good
...

### Recommendations (Priority Order)
1. **Must do**: Fix the waterfall in PaymentService
2. **Should do**: Add error boundary around retry component
3. **Consider**: Extract retry logic into a shared hook
```

---

## /dev-council

**8-persona leadership review.**

### Syntax

```
/dev-council [<ticket-id>] [--focus <persona>] [--quick]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `ticket-id` | No | Resolves from engram or branch name if omitted |
| `--focus` | No | Run only one persona: `cto`, `team-lead`, `po`, `pm`, `ui`, `data`, `tech`, `ai` |
| `--quick` | No | Run only 4 personas: CTO, Team Lead, PO, Tech Director |

### What It Does Step by Step

1. **Resolves context** and loads all ticket data, full branch diff, file content, and previous review results.
2. **Prepares a context package** with ticket metadata, code content, branch stats, and prior review scores.
3. **Launches 8 agents in parallel** (or 4 with `--quick`, or 1 with `--focus`):
   - **council-cto**: strategic alignment, tech debt, scalability, risk
   - **council-team-lead**: readability, conventions, PR hygiene, team impact
   - **council-po**: acceptance criteria, user stories, feature completeness
   - **council-pm**: scope, timeline, dependencies, release readiness
   - **council-ui**: design system, accessibility, responsive, UI states
   - **council-data-director**: analytics, data models, privacy, observability
   - **council-tech-director**: production readiness, infrastructure, monitoring, security
   - **council-ai-engineer**: AI integration, opportunities, cost, safety
4. **Synthesizes a unified report** with:
   - Verdicts-at-a-glance table
   - Weighted overall score (A-F grade)
   - Consensus items (unanimously praised, unanimously flagged, conflicting opinions)
   - Prioritized action items (must-fix, should-fix, consider, future backlog)
   - Full detailed reviews from each persona

### Score Weights

| Persona | Weight |
|---------|--------|
| CTO (Strategy) | 15% |
| Team Lead (Engineering) | 15% |
| Product Owner (Product) | 15% |
| Project Manager (Delivery) | 10% |
| UI/UX Director (Design) | 15% |
| Data Director (Data) | 10% |
| Tech Director (Operations) | 10% |
| AI Engineer (Intelligence) | 10% |

### Grading Scale

| Grade | Score Range | Meaning |
|-------|------------|---------|
| A | 90-100 | Ship with confidence |
| B | 75-89 | Ship with noted improvements |
| C | 60-74 | Address concerns before shipping |
| D | 40-59 | Significant rework needed |
| F | <40 | Back to the drawing board |

### Agents Triggered

All 8 council agents (or subset with `--quick` / `--focus`).

### Example

```
/dev-council --quick
```

Runs CTO, Team Lead, PO, and Tech Director only for a rapid re-check after addressing issues.

---

## /dev-complete

**Finalize the feature lifecycle.**

### Syntax

```
/dev-complete <ticket-id> [--skip-review] [--skip-notify]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `ticket-id` | Yes | The ticket to close out |
| `--skip-review` | No | Skip the /guardia integration review |
| `--skip-notify` | No | Skip the Slack notification suggestion |

### What It Does Step by Step

1. **Loads all feature data** from engram: ticket data, vault path, previous checks and critiques, PR information.
2. **Runs 5 agents in parallel for final validation**:
   - **acceptance-checker** (strict mode): every criterion must be "done" or explicitly "deferred" with a reason. Implementation AND test evidence required.
   - **code-auditor** (full mode): complete quality audit with no shortcuts.
   - **Documentation checker** (inline): verifies vault files are populated.
   - **Test coverage analyzer** (inline): runs `npx jest --coverage` and maps coverage to ACs.
   - **Code Guardian** (unless `--skip-review`): full /guardia review.
3. **Calculates lifecycle quality score** across 6 dimensions:

   | Dimension | Weight |
   |-----------|--------|
   | AC Clarity | 10% |
   | AC Coverage | 25% |
   | Code Quality | 20% |
   | Test Coverage | 20% |
   | Documentation | 15% |
   | Code Guardian | 10% |

4. **Generates feature summary** in `summary.md`: what was built, AC status, quality metrics, architecture highlights, key decisions, files changed, lessons learned, and full timeline.
5. **Archives the vault entry**: moves from "Active" to "Completed" in the index, updates `stats.md` with running averages.
6. **Updates engram** with completion status, lifecycle grade, and duration.
7. **Optionally updates the ticket** in Linear/Jira (move to "Done", add summary comment).
8. **Suggests Slack notification** via `/dev-notify merged` unless `--skip-notify`.

### Agents Triggered

- **acceptance-checker** (strict mode)
- **code-auditor** (full mode)
- Optionally all 6 **guardia** review agents

### Example

```
/dev-complete MOD-1234 --skip-notify
```

---

## /dev-docs

**Generate or update feature documentation.**

### Syntax

```
/dev-docs [<ticket-id>] [--section architecture|decisions|api|components|tests|all]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `ticket-id` | No | Resolves from engram or branch name if omitted |
| `--section` | No | Focus on a specific documentation area. Defaults to `all`. |

### What It Does Step by Step

1. **Resolves context** and gathers data in parallel: git diff, commit history, existing vault files, engram check/critique results, and (if `tests` section) test coverage.
2. **Launches the doc-generator agent** which produces:
   - **Architecture**: overview, component hierarchy diagram, module dependency graph, data flow diagram, integration points
   - **Decisions**: ADRs extracted from code patterns, critique results, and comments
   - **API**: new/changed routes, request/response shapes, breaking changes
   - **Components**: React components with path, type (server/client), props, state, tests
   - **Tests**: coverage mapped to acceptance criteria
3. **Updates vault files**: `architecture.md`, `decisions.md`, `acceptance.md`, `review.md`.
4. **Calculates documentation quality score** (0-100) across architecture docs (25%), ADR completeness (25%), AC mapping (25%), API/component docs (15%), and readability (10%).

### Agents Triggered

- **doc-generator**

### Example

```
/dev-docs --section architecture
```

Generates only the architecture documentation with Mermaid diagrams.

---

## /dev-notify

**Post structured Slack notifications.**

### Syntax

```
/dev-notify <milestone> [--channel "#channel"] [--mention @person]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `milestone` | Yes | One of: `started`, `in-progress`, `blocked`, `ready-for-review`, `merged`, `deployed` |
| `--channel` | No | Override the default target channel |
| `--mention` | No | Additional people to tag |

### What It Does Step by Step

1. **Parses the milestone** and loads feature context from engram.
2. **Determines the channel and mentions** from `instructions/modo-channels.md` and team structure.
3. **Formats a milestone-specific message** with ticket link, branch, scores, and relevant metadata.
4. **Posts via Slack MCP** `post_message`.
5. **Logs to journal** and **updates engram**.

### Message Formats by Milestone

| Milestone | Key Information |
|-----------|----------------|
| `started` | Ticket link, branch name, AC score |
| `in-progress` | AC completion %, quality score, branch stats |
| `blocked` | Blocker description, what/who is needed, cc mentions |
| `ready-for-review` | PR link, AC coverage, quality score, reviewer mentions |
| `merged` | PR link, lifecycle grade, duration |
| `deployed` | Environment, duration, docs pointer |

### Anti-Spam Rule

The framework warns you if the last notification was less than 2 hours ago to prevent channel noise.

### Example

```
/dev-notify ready-for-review --mention @sarah @james
```

---

## /dev-history

**Browse the documentation vault.**

### Syntax

```
/dev-history [<ticket-id>] [--search "query"] [--stats] [--recent N]
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `ticket-id` | No | Show detailed summary for a specific feature |
| `--search` | No | Search across all vault files by keyword |
| `--stats` | No | Show aggregate quality metrics |
| `--recent N` | No | List the N most recent features (default: 10) |

### What It Does Step by Step

**Default (no args)**: Reads `~/Documents/dev-vault/index.md` and displays the 10 most recent features in a table with date, ticket, title, status, grade, and duration.

**With ticket-id**: Reads and presents the feature's `summary.md` with quick links to journal, architecture, decisions, and review files.

**With --search**: Performs a case-insensitive grep across all vault files (journal, architecture, decisions, acceptance) and groups results by feature.

**With --stats**: Reads `~/Documents/dev-vault/stats.md` and calculates aggregates: total features completed, average lifecycle score, average duration, average AC coverage, monthly breakdown, grade distribution, common issues, and quality trends.

### Agents Triggered

None -- this command reads directly from the vault file system.

### Example

```
/dev-history --stats
```

Shows team quality trends over time. Useful for retrospectives and identifying systemic issues.

```
/dev-history --search "retry logic"
```

Finds all features that involved retry logic, showing matching context from journal, architecture, and decision files.

---

## /guardia

**Comprehensive parallel PR review.**

### Syntax

```
/guardia <pr-number-or-url>
```

### Arguments

| Argument | Required | Description |
|----------|----------|-------------|
| `pr-number-or-url` | Yes* | PR number in the current repo, or a full GitHub PR URL. If omitted, auto-detects from the current branch's open PR. |

### What It Does Step by Step

1. **Resolves the PR**: fetches metadata via `gh pr view` including title, branches, files, additions, deletions, commits, and check status.
2. **Classifies changed files** into categories: source, tests, styles, config, ci, docs. Agents whose file categories have no changes are skipped.
3. **Launches up to 6 agents in parallel**:
   - **sonar-reviewer**: SonarCloud quality gate status, code smells, bugs, vulnerabilities, coverage on new code
   - **test-reviewer**: test coverage, test quality, missing tests, snapshot abuse, anti-patterns
   - **react-reviewer**: React Doctor scan + manual pattern analysis for performance, correctness, architecture, accessibility, and Next.js issues
   - **security-reviewer**: OWASP Top 10 frontend checks, secrets scan, XSS, injection, auth, data exposure, dependency audit
   - **workflow-reviewer**: CI/CD check status, workflow configuration, branch protection compliance, deploy readiness
   - **bundle-reviewer**: new dependency analysis, import optimization, code splitting opportunities, asset optimization
4. **Synthesizes a unified report** with:
   - Overall verdict: APPROVE, REQUEST_CHANGES, or NEEDS_DISCUSSION
   - Per-dimension scores table
   - Blockers (must fix), warnings (should fix), suggestions (nice to have)
   - Detailed findings from each agent
5. **Asks for follow-up action**: auto-fix blockers, post report as PR comment, or acknowledge.

### Scoring

| Dimension | Weight |
|-----------|--------|
| SonarCloud | 20% |
| Tests & Coverage | 25% |
| React Health | 20% |
| Security | 20% |
| CI/CD | 10% |
| Bundle Size | 5% |

**Verdict Rules**:
- Overall >= 80 AND no blockers: **APPROVE**
- Overall >= 60 OR has blockers: **REQUEST_CHANGES**
- Otherwise: **NEEDS_DISCUSSION**

### Agents Triggered

- **sonar-reviewer**
- **test-reviewer**
- **react-reviewer**
- **security-reviewer**
- **workflow-reviewer**
- **bundle-reviewer**

### Example

```
/guardia 456
```

```
/guardia https://github.com/org/repo/pull/456
```

If you omit the argument and your current branch has an open PR, it auto-detects:

```
/guardia
```

### Expected Output Format

```markdown
# Code Guardian Report - PR #456

**Add payment retry logic** | `feat/payment-retry` -> `main`
**Files changed**: 12 | **Additions**: +380 | **Deletions**: -45

---

## Verdict: REQUEST_CHANGES

Good progress but security review found token handling issue.

---

## Scores

| Dimension | Score | Status |
|-----------|-------|--------|
| SonarCloud | 85 | pass |
| Tests & Coverage | 78 | pass |
| React Health | 82 | pass |
| Security | 45 | fail |
| CI/CD | 100 | pass |
| Bundle Size | 90 | pass |
| **Overall** | **76** | **REQUEST_CHANGES** |

## Blockers (must fix before merge)
- [ ] src/services/auth.ts:23 - Token stored in localStorage

## Warnings (should fix)
- [ ] src/components/RetryButton.tsx:45 - Missing error boundary
```
