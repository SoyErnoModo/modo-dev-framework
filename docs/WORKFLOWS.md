# MODO Dev Framework — Workflow Diagrams

Visual reference for how the framework components connect and interact during development.

---

## 1. Feature Development Lifecycle

```mermaid
flowchart TD
    START["/dev-start &lt;ticket&gt;"] --> PLAN["Plan Mode\n(design approach)"]
    PLAN --> CODE["Coding\n(implementation)"]
    CODE --> CHECK["/dev-check\n(quality scan)"]
    CHECK -->|issues found| CODE
    CHECK -->|clean| CRITIQUE["/dev-critique\n(solution review)"]
    CRITIQUE -->|rework needed| CODE
    CRITIQUE -->|approved| PR["Create PR"]
    PR --> GUARDIA["/guardia\n(automated PR review)"]
    GUARDIA -->|rejected| CODE
    GUARDIA -->|approved| MERGE["Merge to main"]
    MERGE --> COMPLETE["/dev-complete\n(close tracking)"]

    CODE -->|blocked| BLOCKED["Blocked State\n(/dev-notify)"]
    BLOCKED -->|unblocked| CODE

    CRITIQUE -->|complex decision| COUNCIL["/dev-council\n(leadership review)"]
    COUNCIL --> CRITIQUE
```

- `/dev-start` initializes tracking, loads specs, and sets the development context for a ticket.
- Plan Mode and coding iterate until `/dev-check` confirms quality standards are met.
- `/dev-critique` provides a critical review of the solution before PR creation; complex decisions can escalate to `/dev-council`.
- `/guardia` runs 6 parallel review agents against the PR; failures loop back to coding.
- `/dev-complete` closes the development cycle, updates tracking, and generates a summary.

---

## 2. Spec-First Enforcement Flow

```mermaid
flowchart TD
    PROMPT["User Prompt"] --> CLASSIFY["Intent Classification"]

    CLASSIFY -->|research / question| ALLOW_R["Allow\n(no gate)"]
    CLASSIFY -->|planning / design| ALLOW_P["Allow\n(encourage planning)"]
    CLASSIFY -->|config / settings| ALLOW_C["Allow\n(no gate)"]
    CLASSIFY -->|code generation| CODE_INTENT["CODE_INTENT detected"]

    CODE_INTENT --> CHECK_PLANS{"Check .claude/plans/\nand openspec/ or .specs/"}

    CHECK_PLANS -->|plan + specs found| PASS["Pass\n(clean allow)"]
    CHECK_PLANS -->|neither found| STRONG["Strong Gate\n(systemMessage: create plan + specs first)"]
    CHECK_PLANS -->|only one found| MILD["Mild Reminder\n(systemMessage: missing plan or specs)"]

    STRONG --> PROCEED["User proceeds or\nruns /dev-start"]
    MILD --> PROCEED
```

- The `prompt-interceptor` hook fires on every `UserPromptSubmit` event before the LLM processes the request.
- Intent classification uses pattern matching to categorize the prompt (research, planning, config, or code generation).
- Only code-generation intents trigger the spec-first gate; all other intents pass through immediately.
- The gate checks for active plans in `.claude/plans/` and specs in `openspec/` or `.specs/`.
- Enforcement is non-blocking: the decision is always `allow`, but a `systemMessage` is injected to guide the developer.

---

## 3. PR Review Pipeline (/guardia)

```mermaid
flowchart TD
    TRIGGER["/guardia &lt;PR&gt;"] --> LOAD["Load PR diff\nand context"]

    LOAD --> PARALLEL["Run 6 Review Agents\nin Parallel"]

    PARALLEL --> A1["Code Auditor\n(code quality)"]
    PARALLEL --> A2["Security Reviewer\n(vulnerabilities)"]
    PARALLEL --> A3["Test Reviewer\n(test coverage)"]
    PARALLEL --> A4["Bundle Reviewer\n(bundle impact)"]
    PARALLEL --> A5["React Reviewer\n(React patterns)"]
    PARALLEL --> A6["Workflow Reviewer\n(process compliance)"]

    A1 --> MERGE["Merge Results"]
    A2 --> MERGE
    A3 --> MERGE
    A4 --> MERGE
    A5 --> MERGE
    A6 --> MERGE

    MERGE --> CLASSIFY["Severity Classification\n(critical / warning / info)"]
    CLASSIFY --> VERDICT{"Verdict"}
    VERDICT -->|no criticals| APPROVED["Approved"]
    VERDICT -->|criticals found| REJECTED["Changes Requested\n(with actionable feedback)"]
```

- `/guardia` accepts a PR reference and loads the full diff plus repository context.
- Six specialized review agents run in parallel, each focused on a different quality dimension.
- Results from all agents are merged into a unified report with severity levels (critical, warning, info).
- Critical findings block the PR; warnings and info items are reported but do not block.
- Each finding includes actionable feedback pointing to specific files and lines.

---

## 4. Leadership Council (/dev-council)

```mermaid
flowchart TD
    TRIGGER["/dev-council &lt;topic&gt;"] --> CONTEXT["Gather Context\n(codebase, specs, history)"]

    CONTEXT --> PARALLEL["8 Personas Analyze\nin Parallel"]

    PARALLEL --> P1["CTO\n(technical vision)"]
    PARALLEL --> P2["Tech Director\n(architecture)"]
    PARALLEL --> P3["AI Engineer\n(AI/ML patterns)"]
    PARALLEL --> P4["Product Owner\n(business value)"]
    PARALLEL --> P5["Product Manager\n(delivery)"]
    PARALLEL --> P6["Team Lead\n(execution)"]
    PARALLEL --> P7["UI Lead\n(UX/design)"]
    PARALLEL --> P8["Data Director\n(data strategy)"]

    P1 --> CONSOLIDATE["Consolidate\nPerspectives"]
    P2 --> CONSOLIDATE
    P3 --> CONSOLIDATE
    P4 --> CONSOLIDATE
    P5 --> CONSOLIDATE
    P6 --> CONSOLIDATE
    P7 --> CONSOLIDATE
    P8 --> CONSOLIDATE

    CONSOLIDATE --> REPORT["Council Report\n(consensus + dissent + recommendations)"]
```

- `/dev-council` provides multi-perspective analysis for architectural decisions, tech debt trade-offs, or strategic questions.
- Eight leadership personas evaluate the topic concurrently, each from their domain expertise.
- The consolidated report surfaces areas of consensus, points of disagreement, and ranked recommendations.
- This command is designed for high-impact decisions where a single-perspective review would be insufficient.
- The output includes actionable next steps with assigned ownership per persona domain.

---

## 5. MCP Server Architecture

```mermaid
graph LR
    subgraph Content["Plugin Content (Markdown + Frontmatter)"]
        PR["prompts/\n9 prompts"]
        AG["agents/\n19 agents"]
        SK["skills/\n3 skills"]
        IN["instructions/\n8 instructions"]
    end

    subgraph Services["Services (Load + Cache)"]
        PS["PromptService"]
        AS["AgentService"]
        SS["SkillService"]
        IS["InstructionsService"]
        SE["SearchService"]
    end

    subgraph MCP["MCP Server (stdio)"]
        T["7 Tools"]
        R["Resources"]
        P["Prompts"]
    end

    PR --> PS
    AG --> AS
    SK --> SS
    IN --> IS

    PS --> SE
    AS --> SE
    SS --> SE
    IS --> SE

    PS --> T
    AS --> T
    SS --> T
    IS --> T
    SE --> T

    PS --> R
    AS --> R
    SS --> R
    IS --> R

    PS --> P

    MCP -->|stdio transport| CLIENT["Claude Code\n(MCP Client)"]
```

- The MCP server reads markdown files with YAML frontmatter from four content directories: prompts, agents, skills, and instructions.
- Each content type has a dedicated service that handles loading, caching, and tag-based search.
- The `SearchService` aggregates queries across all four services for the `search_all` tool.
- The server exposes 7 tools (search_prompts, get_prompt, search_agents, search_skills, search_instructions, get_instruction, search_all), plus MCP-native Resources and Prompts.
- Communication uses stdio transport, connecting to Claude Code as the MCP client.

---

## 6. Content Discovery Flow (search_all)

```mermaid
flowchart TD
    CALL["search_all(tags, query)"] --> FAN["Fan Out:\nParallel Queries"]

    FAN --> Q1["PromptService\n.searchByTags(tags)"]
    FAN --> Q2["AgentService\n.searchByTags(tags)"]
    FAN --> Q3["SkillService\n.searchByTags(tags)"]
    FAN --> Q4["InstructionsService\n.searchByTags(tags)"]

    Q1 --> MERGE["Merge Results"]
    Q2 --> MERGE
    Q3 --> MERGE
    Q4 --> MERGE

    MERGE --> LABEL["Add Type Labels\n(prompt / agent / skill / instruction)"]
    LABEL --> FILTER{"Query filter\nprovided?"}
    FILTER -->|yes| TEXT["Text Filter\n(title, description)"]
    FILTER -->|no| RETURN["Return Combined\nResults"]
    TEXT --> RETURN
```

- `search_all` is the unified discovery tool that queries across all four content types in a single call.
- Tags use OR logic: any item matching at least one provided tag is included in results.
- Each result is labeled with its content type so the caller can distinguish prompts from agents, skills, and instructions.
- An optional text query further filters results by matching against titles and descriptions.
- This is the recommended entry point when exploring the framework's content without knowing which type to look for.
