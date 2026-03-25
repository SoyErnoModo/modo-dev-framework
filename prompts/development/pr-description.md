---
id: pr-description
title: "PR Description Generator"
description: "Generate a well-structured pull request description following MODO conventions"
category: development
tags: [pr, git, workflow, documentation]
variables:
  - name: ticket_id
    description: "Jira or Linear ticket identifier"
    type: string
    required: true
  - name: changes_summary
    description: "Brief summary of what was changed and why"
    type: string
    required: true
  - name: breaking_changes
    description: "Description of any breaking changes introduced"
    type: string
    required: false
    defaultValue: "none"
---

# PR Description Generator

Generate a pull request description for the MODO platform following our standard conventions. Use the information below to produce a complete, reviewer-friendly PR body.

**Ticket**: {ticket_id}
**Changes**: {changes_summary}
**Breaking Changes**: {breaking_changes}

## Instructions

Produce the PR description using the exact structure below. Each section is mandatory — if information is not available, state what is missing so the author can fill it in before submitting.

### Output Structure

```markdown
## Summary

<!-- One to three sentences explaining WHAT changed and WHY. Link the ticket. -->

Refs {ticket_id}

<brief, high-level explanation of the change derived from {changes_summary}>

## Changes

<!-- Bulleted list of concrete modifications grouped by area -->

### Added
- <new files, features, endpoints, or components>

### Modified
- <updated files with a short explanation of what changed>

### Removed
- <deleted files, deprecated code, or removed features>

## Test Plan

<!-- How reviewers and QA can verify this change works correctly -->

- [ ] Unit tests pass locally (`npm run test`)
- [ ] Coverage meets the 80% threshold for new/modified files
- [ ] <specific manual verification steps relevant to the change>
- [ ] <edge cases that should be tested>
- [ ] SonarCloud quality gate passes with no new issues

## Breaking Changes

<!-- If {breaking_changes} is "none", state "No breaking changes." Otherwise detail migration steps. -->

<If breaking changes exist, include:>
- What breaks and for which consumers
- Migration steps with before/after code examples
- Timeline or version where the old behavior will be fully removed

## Additional Context

<!-- Screenshots, architecture diagrams, or links to related PRs -->
```

### Guidelines

1. **Summary**: Derive the explanation from {changes_summary}. Keep it concise but informative — a reviewer who reads only this section should understand the purpose of the PR.
2. **Changes**: Group items logically (Added / Modified / Removed). Reference specific file paths when useful.
3. **Test Plan**: Always include the standard CI checks (unit tests, coverage, SonarCloud). Add manual verification steps that are specific to this change.
4. **Breaking Changes**: If {breaking_changes} is "none", write "No breaking changes." If breaking changes are present, provide explicit migration instructions with code examples showing the before and after.
5. **Tone**: Professional, direct, and helpful. Avoid filler language.
6. **Refs**: The ticket reference `Refs {ticket_id}` must appear in the Summary section so it is automatically linked by the project management integration.
