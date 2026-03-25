---
name: modo-protocol
description: >
  Always-active unified protocol for MODO development. Combines spec-first enforcement,
  development lifecycle awareness, quality gates, and architectural patterns into a single
  cross-team standard. Auto-invocable — loaded at session start for every team member.

  This protocol ensures: (1) No code without a plan, (2) Feature lifecycle tracking,
  (3) Quality standards enforcement, (4) MODO architectural pattern compliance,
  (5) Documentation discipline across all development work.
tags: [core, protocol, spec-first, lifecycle, enforcement]
license: MIT
metadata:
  author: MODO Engineering
  version: 1.0.0
---

# MODO Development Protocol

This protocol is ALWAYS ACTIVE for every team member using the MODO Dev Framework plugin.

## Core Principles

1. **Plan before code** — No production code without an active plan or spec
2. **Track everything** — Every feature has a lifecycle from ticket to production
3. **Quality is non-negotiable** — Shared standards, enforced consistently
4. **Use what exists** — Check MODO libraries, APIs, and patterns before building new
5. **Document decisions** — ADRs for architecture, vault for features

---

## 1. Spec-First Enforcement

### Intent Detection

Every user prompt is classified:

| Intent | Keywords | Action |
|--------|----------|--------|
| CODE_INTENT | "create", "implement", "build", "fix", "refactor", "genera", "crea", "hace" | Check for plan/specs |
| PLANNING_INTENT | "plan", "design", "spec", "architecture" | Allow (good behavior) |
| RESEARCH_INTENT | "explain", "search", "what is", "how does" | Allow (no enforcement) |
| OTHER | Everything else | Allow (no enforcement) |

### Gate Matrix

When CODE_INTENT is detected:

| Plan exists? | Specs exist? | Action |
|-------------|-------------|--------|
| No | No | **STRONG**: Demand planning first |
| No | Yes | **MILD**: Suggest creating a plan |
| Yes | No | **MILD**: Suggest creating specs |
| Yes | Yes | **PASS**: Proceed with coding |

### What Satisfies the Gate

| Source | Satisfies Plan? | Satisfies Specs? |
|--------|----------------|-----------------|
| `.claude/plans/*.md` | Yes | No |
| `EnterPlanMode` (active) | Yes | No |
| `openspec/` with files | No | Yes |
| `.specs/` with files | No | Yes |
| `/dev-start` initialized | No | Yes |

### Recommended Workflows

**From a ticket (recommended)**:
```
/dev-start <ticket-id>     -> Creates vault + specs -> satisfies specs
EnterPlanMode              -> Plan the approach -> satisfies plan
ExitPlanMode               -> Start coding
```

**Ad-hoc work**:
```
EnterPlanMode              -> Design approach -> satisfies plan
/sdd-spec                  -> Create formal specs -> satisfies specs
ExitPlanMode               -> Start coding
```

### Override

The protocol injects context, it doesn't block. If the user explicitly says "skip planning" or "just do it", respect that decision.

---

## 2. Feature Lifecycle

### States

```
started -> in-progress -> ready-for-review -> merged -> deployed -> completed
               |                |
               +-- blocked -----+
```

### Proactive Suggestions

| Context | Suggestion |
|---------|-----------|
| User mentions a ticket ID | "Run `/dev-start {id}` to initialize the lifecycle" |
| User starts coding without /dev-start | "Consider `/dev-start` to set up tracking" |
| Active feature, no /dev-check in >2 hours | "Run `/dev-check` to validate progress" |
| User says "ready for PR" or creates PR | "Run `/dev-critique` before creating PR" |
| User wants thorough review | "Run `/dev-council` for 8-persona leadership review" |
| PR merged | "Run `/dev-complete` to finalize the lifecycle" |

### Quality Reminders

- Code without tests -> remind about test-first approach
- Architectural decisions -> suggest documenting as ADR
- Blocker encountered -> suggest `/dev-notify blocked`
- End of day with active feature -> suggest updating journal

---

## 3. Available Commands

### Development Lifecycle

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/dev-start` | Initialize feature lifecycle | Before coding |
| `/dev-check` | Progress + quality validation | During development |
| `/dev-critique` | Architecture + solution review | Before PR |
| `/dev-council` | 8-persona leadership review | Before shipping critical features |
| `/dev-docs` | Generate/update documentation | Anytime during dev |
| `/dev-notify` | Slack notification to team | At milestones or blockers |
| `/dev-complete` | Finalize lifecycle | After merge |
| `/dev-history` | Browse past features | Research/reference |

### Code Review

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/guardia <PR>` | Parallel 6-agent PR review | Before merge |

### Architecture

| Trigger | Skill | Purpose |
|---------|-------|---------|
| "analyze this PRD" | modo-tech-architect | Full PRD analysis with resource discovery |
| "create tech specs for" | modo-tech-architect | Technical specification generation |
| "implementation plan for" | modo-tech-architect | Sprint planning and task breakdown |

---

## 4. The Leadership Council

`/dev-council` launches 8 expert personas in parallel:

| Persona | Focus | Key Question |
|---------|-------|-------------|
| **CTO** | Strategy, tech debt, scale | "Does this fit our 2-year vision?" |
| **Team Lead** | Code quality, conventions | "Can any dev maintain this?" |
| **Product Owner** | ACs, user stories | "Does this solve the user's problem?" |
| **Project Manager** | Scope, timeline, risks | "Will this ship on time?" |
| **UI/UX Director** | Design system, a11y | "Is this beautiful and accessible?" |
| **Data Director** | Analytics, privacy | "Can we measure success?" |
| **Tech Director** | Production, infra | "Will this survive 3am?" |
| **AI Engineer** | AI patterns, cost | "Is AI used well (or needed)?" |

Use `--quick` for 4-persona fast review (CTO, Team Lead, PO, Tech Director).

---

## 5. Code Review Standards (Guardia)

### Severity Classification

**Blocker** (must fix before merge):
- Security vulnerabilities (XSS, injection, secrets)
- Bugs causing crashes or data loss
- Failing CI checks / SonarCloud quality gate failures
- Missing tests for critical business logic
- Breaking changes without migration path

**Warning** (should fix):
- Code smells (cognitive complexity, duplication)
- Missing tests for non-critical code
- Performance issues affecting UX
- Accessibility violations

**Suggestion** (nice to have):
- Style improvements, better naming
- Additional test cases
- Documentation improvements

### Review Sub-Agents

| Agent | Focus |
|-------|-------|
| sonar-reviewer | SonarCloud rules and quality |
| test-reviewer | Test coverage and patterns |
| react-reviewer | React best practices |
| security-reviewer | OWASP and security |
| workflow-reviewer | CI/CD and GitHub Actions |
| bundle-reviewer | Bundle size and dependencies |

---

## 6. Integration Points

- **dev-guardian** + **code-guardian**: `/dev-complete` invokes `/guardia` for final review
- **spec-first** + **dev-guardian**: `/dev-start` creates specs that satisfy the planning gate
- **modo-tech-architect**: Feeds into spec-first workflow with PRD analysis
- **All tools**: Track state via engram/claude-mem for continuity across sessions
