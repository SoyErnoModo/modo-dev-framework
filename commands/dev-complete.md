---
description: >
  Complete the feature lifecycle. Final AC validation, full quality review, documentation
  check, feature summary with lifecycle grade, vault archive, Slack notification.
argument-hint: <ticket-id> [--skip-review] [--skip-notify]
---

# /dev-complete - Feature Completion

Final quality gate. Verify everything is done, generate the lifecycle report, close out the feature.

## Step 0: Resolve Context

Load all feature data from engram `dev-guardian/features/{ticket-id}`:
- All ticket data, vault path
- Previous checks, critiques
- PR information

## Step 1: Final Validation (5 Agents in Parallel)

### Agent 1: acceptance-checker (STRICT mode)
- Every criterion MUST have implementation evidence
- Every criterion MUST have test coverage
- No criterion can be "in-progress" - must be "done" or explicitly "deferred" with reason
- Calculate final AC coverage percentage

### Agent 2: code-auditor (full mode)
- Full quality analysis of complete branch diff
- All SonarQube rules, React patterns, security, TypeScript strictness
- No "quick" shortcuts - full audit

### Agent 3: Documentation Checker (inline)
Read all vault files and verify:
- architecture.md has diagrams? Populated?
- decisions.md has ADRs for significant decisions?
- acceptance.md fully mapped with evidence?
- journal.md has entries throughout development?
Calculate documentation completeness score (0-100)

### Agent 4: Test Coverage Analyzer (inline)
```bash
npx jest --coverage --silent
```
- Check coverage thresholds per changed file
- Verify all ACs have corresponding tests
- Generate coverage summary

### Agent 5: Code Guardian Integration
Unless `--skip-review`:
- If PR exists, invoke the full code-guardian /guardia review
- Capture report and score
- Append to vault review.md

## Step 2: Calculate Lifecycle Quality Score

| Dimension | Weight | Score | Source |
|-----------|--------|-------|--------|
| AC Clarity | 10% | {0-100} | /dev-start validation |
| AC Coverage | 25% | {0-100} | Final acceptance check |
| Code Quality | 20% | {0-100} | Code auditor final |
| Test Coverage | 20% | {0-100} | Test analyzer |
| Documentation | 15% | {0-100} | Doc completeness |
| Code Guardian | 10% | {0-100} | /guardia report |

**Lifecycle Grade**:
- **A** (90-100): Exemplary lifecycle discipline
- **B** (75-89): Good, minor gaps
- **C** (60-74): Adequate, notable gaps
- **D** (40-59): Needs improvement
- **F** (0-39): Major lifecycle issues

## Step 3: Generate Feature Summary

Write comprehensive `summary.md`:
- What Was Built (2-3 paragraphs)
- AC Final Status table with evidence
- Quality Metrics table
- Architecture highlights + key diagrams
- Key Decisions summary
- Files Changed summary
- Lessons Learned (auto-generated from deviations, scope creep, blocked items)
- Full Timeline (from start through all checks/critiques to completion)

## Step 4: Archive to Vault

1. Finalize all vault files
2. Move entry from "Active" to "Completed" in `~/Documents/dev-vault/index.md`
3. Update `~/Documents/dev-vault/stats.md` with this feature's metrics
4. Calculate running averages

## Step 5: Update Engram

Update `dev-guardian/features/{ticket-id}`:
- Status: "completed"
- Completion timestamp
- Lifecycle grade and score
- Duration

Save aggregate to `dev-guardian/stats/monthly/{YYYY-MM}`.

## Step 6: Update Ticket (optional)

Using Linear/Jira MCP:
- Move ticket to "Done" or "Ready for QA"
- Add comment with lifecycle summary and grade

## Step 7: Slack Notification

Unless `--skip-notify`, suggest `/dev-notify merged`.

## Step 8: Present Final Report

```markdown
# Feature Complete: {ticket-id} - {title}

**Lifecycle Grade**: {grade} ({score}/100)
**Duration**: {days/hours} | **Branch**: +{add}/-{del}

---

## Lifecycle Score Breakdown
| Dimension | Weight | Score | Status |
|-----------|--------|-------|--------|
| AC Clarity | 10% | {score} | {pass/flag} |
| AC Coverage | 25% | {score} | {pass/flag} |
| Code Quality | 20% | {score} | {pass/flag} |
| Test Coverage | 20% | {score} | {pass/flag} |
| Documentation | 15% | {score} | {pass/flag} |
| Code Guardian | 10% | {score} | {pass/flag} |
| **Total** | **100%** | **{score}** | **{grade}** |

## Acceptance Criteria: {done}/{total} ({%}%)
{Summary of any deferred criteria with reasons}

## Key Achievements
- {highlight}

## Issues Remaining
- {any unresolved items}

## Lessons Learned
- {auto-generated insights}

---
_Full documentation available at: ~/Documents/dev-vault/features/{path}_
_Feature archived. Run `/dev-history {ticket-id}` to review anytime._
```

## Rules

- This is the FINAL quality gate - be thorough, not fast
- If AC coverage < 80%, warn prominently
- If any code-guardian blockers remain, flag them
- Summary must be readable by PMs, designers, other devs
- Deferred criteria MUST have documented reasons
- Lifecycle score tracks process discipline, not just code quality
- If same item was "Planned but not done" for 3+ checks, flag in lessons learned
