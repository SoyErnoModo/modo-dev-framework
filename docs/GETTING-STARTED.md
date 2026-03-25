# Getting Started with MODO Dev Framework

After completing this guide, you will have the MODO Dev Framework installed, its hooks active in your Claude Code sessions, and a working understanding of the full feature development lifecycle.

**Time to complete**: 10 minutes

**What you will learn**:

- How to install the plugin with a single command
- What activates automatically when you start a session
- How to develop a feature from ticket to merge using the framework's slash commands

---

## Prerequisites

Before you begin, make sure you have the following installed and configured:

- [ ] **Node.js 18+** -- verify with `node --version`
- [ ] **Claude Code CLI** -- verify with `claude --version`
- [ ] **GitHub CLI** (`gh`) -- required for `/guardia` PR reviews
- [ ] Access to your team's Linear or Jira workspace (for ticket fetching)

Optional but recommended:

- [ ] Slack MCP configured (for `/dev-notify` notifications)
- [ ] Linear or Atlassian MCP configured (for `/dev-start` ticket fetching)

---

## Installation

Install the plugin in one command:

```bash
claude plugins install --from github SoyErnoModo/modo-dev-framework
```

That is it. The plugin registers itself, builds the MCP server, and activates hooks automatically.

### Verify the installation

Open a new Claude Code session and confirm the framework loaded:

```bash
# List available prompts
npx @playsistemico/modo-dev-framework list-prompts

# List available agents
npx @playsistemico/modo-dev-framework list-agents

# List available instructions
npx @playsistemico/modo-dev-framework list-instructions
```

You should see 9 prompts, 19 agents, and 8 instruction sets.

---

## What Happens After Install

When you start a new Claude Code session in any project, the framework activates three layers automatically. You do not need to configure anything per-project.

### 1. Session Start Hook

The `session-start.sh` hook fires on every new session. It loads the MODO protocol context so that Claude is aware of your team's quality gates, coding conventions, and development workflow from the first prompt.

### 2. Prompt Interceptor

The `prompt-interceptor.sh` hook runs on every message you send. It detects code generation intent and enforces **spec-first discipline** -- if you jump straight to code without a plan, the framework prompts you to think through the approach first.

### 3. Tool Watcher

The `tool-watcher.sh` hook runs after every tool call. It monitors for patterns that violate MODO standards (such as writing code without tests) and nudges you back on track.

### 4. MCP Server

A built-in MCP server starts alongside your session, exposing 7 tools for searching prompts, agents, instructions, and skills. You interact with these indirectly through slash commands, but they are also available for custom workflows.

---

## Your First Feature: End-to-End Walkthrough

This section walks you through the full lifecycle of developing a feature, from ticket to merge. The example uses ticket `MOD-1234`.

### Step 1: Start the Feature

```
/dev-start MOD-1234
```

**What happens**:

1. The framework fetches the ticket from Linear (auto-detected from the `MOD-` prefix).
2. The **criteria-validator** agent scores your acceptance criteria for clarity, testability, and completeness.
3. A documentation vault is created at `~/Documents/dev-vault/features/{YYYY-MM}/{MOD-1234-slug}/` with six structured files: journal, acceptance, architecture, decisions, review, and summary.
4. The vault index is updated and feature data is saved to engram for context across sessions.
5. You receive a summary with the AC score, flagged issues, and recommended next steps.

**What you see**:

```
# Dev Guardian: MOD-1234 Initialized

Ticket: [Add payment retry logic](https://linear.app/...)
Branch: `feat/MOD-1234-payment-retry`
Vault: `~/Documents/dev-vault/features/2026-03/MOD-1234-payment-retry/`
AC Score: 78/100 - Proceed with caution

## Acceptance Criteria (4)
| # | Criterion           | Clarity | Testable | Score |
|---|---------------------|---------|----------|-------|
| AC-1 | Retry failed payments up to 3 times | 22/25 | Yes | 85 |
...
```

**Next action**: Review the acceptance criteria, refine if needed, then start coding on the suggested branch.

### Step 2: Check Progress During Development

After writing some code, run a progress check:

```
/dev-check
```

**What happens**:

1. Three agents run in parallel: **acceptance-checker** (maps your diff to ACs), **code-auditor** (checks quality against SonarQube rules), and a scope analyzer (flags scope creep).
2. The journal is updated with a timestamped progress entry.
3. Scores are persisted to engram so trends are tracked across checks.

**When to run**: Periodically during development. The `--quick` flag gives you a 15-second summary of just AC completion and blockers.

### Step 3: Get an Architecture Review Before PR

When you think the implementation is ready, run the deep critique:

```
/dev-critique
```

**What happens**:

1. The **solution-critic** agent reads the full content of every changed file (not just the diff).
2. It evaluates architecture, performance, edge cases, and alternative approaches.
3. Mermaid diagrams are generated for the component hierarchy, data flow, and state machines.
4. A verdict is returned: SOLID, GOOD_WITH_CONCERNS, NEEDS_RETHINKING, or MAJOR_ISSUES.
5. ADRs are written to your vault's `decisions.md` file.

**When to run**: Once, before creating the PR. This is the deep review -- quality over speed.

### Step 4: Create Your PR and Run Guardia

Create your pull request through your normal workflow, then run the automated review:

```
/guardia 456
```

(Where `456` is the PR number, or pass a full URL.)

**What happens**:

1. Six review agents run in parallel against the PR: SonarCloud, Tests, React, Security, CI/CD, and Bundle Size.
2. Each agent scores the PR on a 0-100 scale.
3. A weighted overall score determines the verdict: APPROVE, REQUEST_CHANGES, or NEEDS_DISCUSSION.
4. You receive a unified report with blockers, warnings, and suggestions organized by severity.

**Scoring weights**: SonarCloud 20%, Tests 25%, React 20%, Security 20%, CI/CD 10%, Bundle 5%.

### Step 5: (Optional) Run the Leadership Council

For high-stakes features, run the full 8-persona council review:

```
/dev-council
```

**What happens**:

Eight expert personas -- CTO, Team Lead, Product Owner, Project Manager, UI/UX Director, Data Director, Tech Director, and AI Engineer -- each review your implementation from their unique perspective. Their verdicts are synthesized into a unified report with consensus items, conflicting opinions, and prioritized action items graded A through F.

Use `--quick` for a 4-persona subset (CTO, Team Lead, PO, Tech Director) when re-checking after fixes.

### Step 6: Complete the Feature

After your PR is merged:

```
/dev-complete MOD-1234
```

**What happens**:

1. Five agents run a final validation: strict acceptance check, full code audit, documentation check, test coverage analysis, and (optionally) a /guardia review.
2. A lifecycle quality score is calculated across six dimensions: AC clarity, AC coverage, code quality, test coverage, documentation, and Code Guardian results.
3. A comprehensive feature summary is written to the vault.
4. The vault index entry moves from "Active" to "Completed" and aggregate stats are updated.
5. The ticket is optionally moved to "Done" in Linear/Jira.

---

## Other Commands You Should Know

| Command | When to Use |
|---------|-------------|
| `/dev-docs` | Generate or update architecture diagrams, ADRs, and API docs mid-development |
| `/dev-notify started` | Post a structured Slack update when you start a feature |
| `/dev-notify ready-for-review` | Alert reviewers with PR link and quality scores |
| `/dev-history --stats` | View aggregate quality metrics across all completed features |
| `/dev-history MOD-1234` | Pull up the full summary of a past feature |

---

## Troubleshooting

### Hooks not firing

**Symptom**: You start a session but the framework does not load, or the prompt interceptor does not activate.

**Diagnosis**:

1. Verify the plugin is installed: `claude plugins list`
2. Check that `hooks/hooks.json` exists and is valid JSON.
3. Confirm the hook scripts are executable: `ls -la hooks/scripts/`
4. Start a fresh session -- hooks only register on session start.

**Fix**: Reinstall the plugin: `claude plugins install --from github SoyErnoModo/modo-dev-framework`

### MCP server not responding

**Symptom**: Slash commands that depend on MCP tools (like `search_prompts`) return errors.

**Diagnosis**:

1. Check that the server builds: `npm run build:ts` (from the plugin directory)
2. Test the server directly: `node dist/index.js` -- it should start without errors and wait for stdio input.
3. Verify `.mcp.json` points to the correct `dist/index.js` path.
4. Check environment variables: the server expects `MCP_PROMPTS_DIR`, `MCP_AGENTS_DIR`, `MCP_INSTRUCTIONS_DIR`, and `MCP_SKILLS_DIR` to be set (`.mcp.json` configures these automatically).

**Fix**: Rebuild the server: `cd <plugin-root> && npm install && npm run build:ts`

### /dev-start cannot find ticket

**Symptom**: The command fails with "ticket not found."

**Diagnosis**:

1. Verify the ticket ID format matches your project management tool (e.g., `MOD-1234` for Linear, `JIRA-567` for Jira).
2. Confirm the Linear or Atlassian MCP is configured and authenticated.
3. Try specifying the source explicitly: `/dev-start MOD-1234 --source linear`

### /guardia returns empty report

**Symptom**: The Guardia report shows no findings or agents fail to run.

**Diagnosis**:

1. Verify `gh` CLI is authenticated: `gh auth status`
2. Confirm the PR number is correct and the PR exists.
3. Some agents are skipped if no relevant files changed (e.g., React reviewer skips if no `.tsx` files were modified). This is expected behavior.

### Quality scores seem wrong

The framework scores are advisory, not absolute. Scores are calculated by deducting points from a 100-point baseline based on specific rule violations. A score of 70 does not mean "70% correct" -- it means the baseline was reduced by specific identified issues. Review the detailed findings under each score to understand what was flagged.

---

## Next Steps

- Read the [Commands Reference](./COMMANDS-REFERENCE.md) for detailed syntax and options on all 9 commands.
- Browse the [Agents Guide](./AGENTS-GUIDE.md) to understand the 19 agents and how to get the best output from them.
- Check the [Use Cases](./USE-CASES.md) for realistic scenarios showing the framework in action for developers, tech leads, and PMs.
