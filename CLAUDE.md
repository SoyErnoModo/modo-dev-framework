# MODO Dev Framework

> Source of truth: https://github.com/SoyErnoModo/modo-dev-framework

## Agent Communication

- Sub-agents (guardia reviewers, dev-council, etc.) use **caveman mode** for inter-agent responses (no filler, compressed, technical substance only)
- User-facing output is normal prose
- This repo is the **source of truth** for all cross-project skills, commands, and standards
- Project-specific skills stay in `{project}/.claude/skills/`

## External Tool References

| Tool | Source | Purpose |
|------|--------|---------|
| Caveman | `JuliusBrussee/caveman` | Compressed agent-to-agent communication (~75% token savings) |

**Rule**: reference external tools, never copy their content into skills.

## Workflow Orchestration

### 1. Plan Mode Default
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- If something goes sideways, STOP and re-plan immediately — don't keep pushing
- Use plan mode for verification steps, not just building
- Write detailed specs upfront to reduce ambiguity
- The spec-first hook will remind you if you skip this step

### 2. Subagent Strategy
- Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- For complex problems, throw more compute at it via subagents
- One task per subagent for focused execution
- Use `/dev-council` (8 parallel agents) for comprehensive reviews
- Use `/guardia` (6 parallel agents) for PR reviews

### 3. Self-Improvement Loop
- After ANY correction from the user: update `tasks/lessons.md` with the pattern
- Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done
- Never mark a task complete without proving it works
- Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
- Run tests, check logs, demonstrate correctness
- Run `/dev-check` to validate quality gates before declaring done

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

## Core Principles

- **Simplicity First**: Make every change as simple as possible. Impact minimal code.
- **No Laziness**: Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

## Boost Keywords

Use these words anywhere in your prompt to activate enhanced behaviors:

| Keyword | Aliases | Effect |
|---------|---------|--------|
| **deep** | profundo, exhaustivo, a fondo | Exhaustive multi-source analysis with evidence |
| **parallel** | paralelo, en paralelo | Concurrent agent orchestration, batch tool calls |
| **review** | revisar, audit (+ code/pr/security) | Structured 7-point code review protocol |
| **ultrathink** | pensá bien, think hard | Extended reasoning with trade-off analysis |
| **quick** | rápido, fast, tldr | Minimal output, skip ceremony |

Keywords are auto-detected — just include them naturally in your prompt.

## Completion Enforcement

On session stop, the framework automatically checks:
- Uncommitted git changes
- Unpushed commits
- Failing tests or build errors

If issues are found, you'll get a reminder before the session ends.

---

## MODO Framework Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/dev-start <ticket>` | Initialize feature lifecycle | Before coding anything |
| `/dev-check` | Validate progress + quality | During development |
| `/dev-critique` | Architecture review | Before creating PR |
| `/dev-council` | 8-persona leadership review | Before shipping critical features |
| `/dev-complete` | Finalize lifecycle | After merge |
| `/dev-docs` | Generate documentation | Anytime |
| `/dev-notify` | Slack notification | At milestones or blockers |
| `/dev-history` | Browse past features | Research/reference |
| `/guardia <PR>` | 6-agent parallel PR review | Before merge |

## MCP Tools Available

Search and discover framework content via MCP:
- `search_prompts(tags)` — Find prompt templates
- `get_prompt(id, variables)` — Render a prompt with variable substitution
- `search_agents(tags)` — Find agents by tags (e.g., `["council"]`, `["guardia"]`)
- `search_skills(tags)` — Find skills
- `search_instructions(tags)` — Find granular instructions (e.g., `["react"]`, `["security"]`)
- `get_instruction(id)` — Get instruction content (e.g., `"react/components"`)
- `search_all(tags)` — Cross-type search across everything

## Quality Standards

- Test coverage: 80% minimum, 90% target
- Cognitive complexity: <15 per function (target <10)
- File length: <400 lines (target <250)
- No `any` types in new code
- Server Components by default, `"use client"` only when needed
- Sentry conventional commits: `<type>(<scope>): <subject>`

## MODO Patterns

- **UI Library First**: Check `@playsistemico/modo-sdk-web-ui-lib` before creating components
- **Remote Config**: Use `var(--color-default)`, never hardcode hex values
- **Centralized APIs**: All API calls go through `src/shared/services/`
- **Type-Safe Parameters**: TypeScript interfaces for all API contracts
