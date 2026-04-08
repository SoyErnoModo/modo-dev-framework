---
name: pr-quality-review
description: Comprehensive PR quality review against team standards. Analyzes PR metadata, code quality, SonarCloud results, architecture, SEO, accessibility, and generates a Slack-ready report. Use when asked to "review PR", "analyze PR", "check PR quality", or given a GitHub PR URL to evaluate.
---

# PR Quality Review Skill

## When to use
- User asks to review, analyze, or check a PR
- User provides a GitHub PR URL for evaluation
- User asks to compare two PRs

## Data Collection

Gather ALL of the following for each PR using `gh` CLI:

```bash
# 1. PR metadata
gh pr view {PR_NUMBER} --json title,body,headRefName,additions,deletions,files,state

# 2. SonarCloud results
gh api repos/{OWNER}/{REPO}/commits/$(gh pr view {PR_NUMBER} --json headRefOid --jq '.headRefOid')/check-runs --jq '.check_runs[] | select(.name | contains("Sonar")) | {conclusion: .conclusion, summary: .output.summary}'

# 3. All CI checks
gh pr checks {PR_NUMBER}

# 4. Full diff
gh pr diff {PR_NUMBER}
```

## Analysis Checklist

### 1. PR Metadata
- [ ] Title follows commit convention: `type(SCOPE-XXX): description`
- [ ] Description filled (not template placeholders)
- [ ] Evidence: screenshots/videos for visual changes
- [ ] JIRA/ticket linked
- [ ] Checklist items marked
- [ ] Branch name follows convention

### 2. SonarCloud Quality Gate
- [ ] 0 new code smells
- [ ] 0 security hotspots
- [ ] Duplication ≤ 3%
- [ ] Reliability A
- [ ] Maintainability A
- [ ] 0 bugs

### 3. Code Quality
- [ ] No hardcoded credentials or API keys (should be env vars)
- [ ] No `console.log/error/warn` in production code
- [ ] No placeholder values (`XXXXXXXX`, `TODO`, `FIXME`)
- [ ] No hardcoded URLs for external images/resources
- [ ] PropTypes or TypeScript types for all component props
- [ ] No duplicate/copy-pasted components (DRY)

### 4. Architecture & Patterns
- [ ] Follows existing project patterns (Tailwind vs CSS modules, styled-components)
- [ ] Uses design system tokens (not hardcoded colors/fonts)
- [ ] Uses existing shared components (not reinventing)
- [ ] New pages have proper SEO (`<Head>` with title, description, canonical)
- [ ] Scripts loaded via `next/script` not `document.createElement`
- [ ] SSR guards where `window`/`document` is accessed

### 5. Accessibility
- [ ] All images have `alt` attributes
- [ ] Interactive elements are semantic (`<button>`, `<a>`) not `<div>`
- [ ] No emoji as functional UI content
- [ ] Keyboard navigation supported

### 6. Testing
- [ ] New components have tests
- [ ] Existing snapshots updated intentionally (not side-effect)
- [ ] No test regressions

## Output Format

Generate a report with these sections:

```markdown
## Análisis PR #{number} — `{title}`

### Estado de CI
{table with all check results}

### PR Metadata
{table with metadata compliance}

### Problemas críticos
{numbered list, most severe first}

### Arquitectura
{bullet points on structural issues}

### SEO / Accesibilidad
{bullet points}

### Calidad
{bullet points on code quality}

### Cambios necesarios (priorizados)
{numbered list from most to least critical}
```

## Comparison Mode

When comparing two PRs, add:
- Side-by-side metrics table
- File diff (what's in one but not the other)
- Delta analysis (what improved, what regressed, what's unchanged)
- Conclusion stating which is closer to merge-ready

## PR Fragmentation Suggestion

When a PR is too large (>500 added lines) or touches multiple unrelated features, suggest splitting it into smaller PRs. Only suggest this when there is clear justification:

**When to suggest:**
- PR mixes infrastructure changes (e.g., `_document.js`, navbar) with feature code
- PR contains components that serve different purposes and could be merged independently
- PR modifies shared/core files AND adds new isolated features
- PR has >1000 added lines with distinct functional boundaries

**How to suggest:**
- Identify 2-4 logical fragments based on functionality
- Name each fragment as a potential PR with scope
- Explain the dependency order (which should merge first)
- Justify why splitting improves reviewability and reduces risk

**Format:**
```markdown
### Sugerencia de fragmentación

Este PR se podría dividir en {N} PRs más pequeños:

1. **`type(scope): description`** ({N} archivos, ~{N} líneas)
   - {files list}
   - Justificación: {why this is independent}

2. **`type(scope): description`** ({N} archivos, ~{N} líneas)
   - {files list}
   - Justificación: {why this is independent}
   - Depende de: PR 1

...
```

## Slack Format

When user asks for Slack format:
- Use the same structure but ensure it renders well in Slack markdown
- Keep tables as simple aligned text
- Use emoji sparingly: ❌ for fail, ✅ for pass, ⚠️ for warning
- End with a clear "Cambios necesarios" numbered list
