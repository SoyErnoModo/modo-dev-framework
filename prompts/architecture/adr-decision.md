---
id: adr-decision
title: "Architecture Decision Record"
description: "Generate an ADR following the MODO template with structured options analysis"
category: architecture
tags: [adr, architecture, decision, documentation]
variables:
  - name: decision_title
    description: "Short title for the architectural decision"
    type: string
    required: true
  - name: context
    description: "Background and problem statement driving this decision"
    type: string
    required: true
  - name: options
    description: "Comma-separated list of options being considered"
    type: string
    required: false
    defaultValue: "To be explored"
---

# Architecture Decision Record: {decision_title}

Generate a complete Architecture Decision Record for the MODO platform using the information provided.

**Decision**: {decision_title}
**Context**: {context}
**Options Under Consideration**: {options}

---

Produce the ADR using the following template. Every section is required. Be specific and quantitative where possible — avoid vague statements like "better performance" without supporting reasoning.

## ADR Output Template

```markdown
# ADR: {decision_title}

**Status**: Proposed
**Date**: <current date>
**Deciders**: <to be filled by the team>

## Context

<Expand on {context} to provide a complete problem statement. Include:>
- What system or feature this decision affects
- What triggered the need for a decision now (new requirement, scaling issue, tech debt, incident)
- Relevant constraints (timeline, team capacity, existing contracts, regulatory)
- Current state of the system in the affected area

## Decision Drivers

Enumerate the key factors that will determine the right choice, ordered by priority:

1. <most important driver — e.g., "Must not introduce breaking changes to the public API">
2. <second driver — e.g., "Solution must be implementable within the current sprint">
3. <third driver — e.g., "Minimize operational complexity for the on-call team">
4. <additional drivers as needed>

## Considered Options

For each option, provide a structured analysis:

### Option A: <name>

**Description**: <how this option works in concrete terms>

| Dimension | Assessment |
|-----------|------------|
| Pros | <bulleted list of advantages> |
| Cons | <bulleted list of disadvantages> |
| Effort | S / M / L / XL |
| Risk | Low / Medium / High |
| Reversibility | Easy / Moderate / Difficult |

### Option B: <name>

<same structure as Option A>

### Option C: <name>

<same structure as Option A — include at least two options, three if {options} provides them>

## Decision Outcome

**Chosen Option**: <name of the selected option>

**Rationale**: <2-3 sentences explaining why this option best satisfies the decision drivers. Reference specific drivers by number.>

**Trade-offs Accepted**: <explicitly state what downsides the team is accepting with this choice>

## Consequences

### Positive
- <concrete benefit 1>
- <concrete benefit 2>

### Negative
- <accepted downside 1 and its mitigation>
- <accepted downside 2 and its mitigation>

### Neutral
- <changes that are neither positive nor negative but worth noting>

## Implementation Plan

1. **Phase 1**: <first concrete step, with owner if known>
2. **Phase 2**: <second step>
3. **Phase 3**: <third step>
4. **Validation**: <how the team will verify the decision achieved its goals — metrics, review checkpoint, or time-boxed evaluation>

## Related Decisions

- <link to related ADRs or tickets if applicable>
- <note if this decision supersedes or depends on a previous ADR>
```

### Guidelines

- If {options} is "To be explored", research and propose at least two viable options based on the context before completing the analysis.
- Each option analysis must be honest — do not strawman alternatives to make the preferred option look better.
- The effort estimate should consider MODO team capacity and existing codebase patterns.
- The implementation plan should be actionable — each phase should map to a PR or a sprint task.
- Flag any open questions or assumptions that need validation before the decision is finalized.
