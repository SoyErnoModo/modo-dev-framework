---
description: >
  In-progress quality check. Analyzes git diff against acceptance criteria,
  checks code quality inline, validates test coverage, flags deviations.
  Updates feature journal with progress. Run periodically during development.
argument-hint: [<ticket-id>] [--quick] [--full]
---

# /dev-check - In-Progress Quality Monitor

You run during active development to catch issues early and track progress.

## Step 0: Resolve Active Feature

If `$ARGUMENTS` has a ticket ID, use it. Otherwise:
1. Search engram `dev-guardian/features/*` with status "started" or "in-progress"
2. Check current git branch name for ticket ID pattern
3. If multiple active features, ask which one

Load from engram: ticket data, vault path, previous check results.

## Step 1: Gather Current State

```bash
git diff --stat HEAD                    # Unstaged changes
git diff --stat --cached                # Staged changes
git log --oneline main..HEAD            # Branch commits
git diff main..HEAD --stat              # Total branch diff
git diff main..HEAD --numstat           # Lines added/removed per file
```

Classify changed files: source, tests, styles, config, ci, docs.

## Step 2: Launch 3 Agents in Parallel

### Agent 1: acceptance-checker (progress mode)
- Load ACs from vault `acceptance.md`
- Search branch diff for evidence of implementation
- Map each AC to: done, in-progress, not-started, blocked
- Calculate completion percentage

### Agent 2: code-auditor
- Analyze branch diff for quality issues
- Check SonarQube rules, React patterns, security, TypeScript strictness
- Check test coverage for new code
- Score: 0-100

### Agent 3: Scope Analyzer (inline, no separate agent)
- Compare changed files against ticket scope
- Flag files that seem outside ticket scope (scope creep)
- Check branch size: <200 lines (small), 200-500 (medium), 500-1000 (large), >1000 (too large)

## Step 3: Output

If `--quick`: Only show AC completion %, blockers, quality score.

Default/`--full`:

```markdown
# Dev Check: {ticket-id} - {title}

**Branch**: `{branch}` | **Commits**: {N} | **Files**: {N} | +{add}/-{del}
**Time since start**: {duration}

---

## Progress: {completion}% of Acceptance Criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| AC-1 | {text} | {emoji} {status} | {file:line or "no evidence"} |

---

## Quality Score: {score}/100

| Dimension | Score | Issues |
|-----------|-------|--------|
| Code Quality | {score} | {count} |
| Test Coverage | {score} | {count} gaps |
| Security | {score} | {count} |
| React Patterns | {score} | {count} |

### Blockers ({count})
- **{file}:{line}** - {issue} → {fix}

### Warnings ({count})
- **{file}:{line}** - {issue} → {fix}

---

## Scope Analysis
- **On track**: {N} files within ticket scope
- **Scope creep**: {files outside scope, if any}
- **Branch size**: {classification} (+{additions} lines)

## Trend (vs previous check)
| Metric | Previous | Current | Trend |
|--------|----------|---------|-------|
| AC completion | {%} | {%} | {arrow} |
| Quality score | {score} | {score} | {arrow} |
| Branch size | {lines} | {lines} | {arrow} |

---
_Run `/dev-critique` for architectural review. Run `/dev-docs` to update documentation._
```

## Step 4: Update Vault

Append to `journal.md`:
```markdown
---

## {YYYY-MM-DD HH:MM} - Dev Check

- AC Completion: {%} ({done}/{total})
- Quality Score: {score}/100
- Branch: +{add}/-{del} across {N} files
- Key issues: {top issue if any}
```

Update `acceptance.md` with current status for each AC.

## Step 5: Persist to Engram

Save to `dev-guardian/checks/{ticket-id}/{timestamp}`:
- AC completion %
- Quality score
- Issues count (blockers, warnings)
- Branch size

Update `dev-guardian/features/{ticket-id}`:
- Status: "in-progress"
- Last check: {timestamp}
- Latest scores

## Rules

- Be FAST - this runs during development, not at review time
- `--quick` should complete in under 15 seconds
- Never modify source code - analyze and report only
- Journal is append-only
- Show trends to motivate progress (or flag regression)
- If quality score drops >20 points from last check, flag prominently
- Don't be pedantic during development - save that for /dev-complete
