# MODO Dev Framework

Collaborative development framework for the MODO engineering team. Install this plugin so every team member shares the same rules, quality gates, and tools when working with Claude Code.

## What You Get

### Always-Active Protocols
- **Spec-First Enforcement** — Hooks detect code generation intent and prompt you to plan before coding
- **Quality Gates** — 80% test coverage, complexity <15, no `any` types, Server Components by default
- **MODO Patterns** — Use the UI library, Remote Config for tokens, centralized API services
- **Documentation Discipline** — ADRs for decisions, vault for features, Mermaid for diagrams

### MCP Server (v1.1.0)

Built-in MCP server exposes all plugin content via 7 tools:

| Tool | Purpose |
|------|---------|
| `search_prompts` | Find prompts by tags, query, or category |
| `get_prompt` | Render a prompt with variable substitution |
| `search_agents` | Find agents by tags (OR/AND logic) |
| `search_skills` | Find skills by tags |
| `search_instructions` | Find instructions by tags |
| `get_instruction` | Get granular instruction content |
| `search_all` | Cross-type search across everything |

### Prompt Library (9 templates with variables)

| Category | Prompt | Key Variables |
|----------|--------|---------------|
| development | `code-review` | pr_url, focus, language |
| development | `pr-description` | ticket_id, changes_summary |
| development | `bug-analysis` | error_message, context |
| development | `feature-kickoff` | ticket_id, feature_name |
| architecture | `adr-decision` | decision_title, context, options |
| architecture | `tech-spec` | feature_name, requirements |
| architecture | `sprint-plan` | epic_name, capacity |
| documentation | `feature-summary` | feature_name, ticket_id, outcomes |
| documentation | `api-docs` | endpoint, method, request_schema |

### Granular Instructions (tag-based search)

| Instruction | Tags |
|-------------|------|
| `quality-standards` | core, quality, testing, security, react |
| `documentation-standards` | core, documentation, vault, mermaid |
| `modo-context` | context, architecture, seo |
| `modo-channels` | slack, channels, communication |
| `react/components` | react, server-components, hooks |
| `react/testing` | react, testing, jest, testing-library |
| `security/owasp-frontend` | security, owasp, xss, auth |
| `typescript/strict-mode` | typescript, strict-mode, generics |

### Slash Commands

| Command | Purpose |
|---------|---------|
| `/dev-start <ticket>` | Initialize feature lifecycle with tracking and specs |
| `/dev-check` | Validate progress, quality, and AC coverage |
| `/dev-critique` | Architecture and solution review before PR |
| `/dev-council` | 8-persona leadership review (CTO, Team Lead, PO, PM, UI, Data, Tech, AI) |
| `/dev-complete` | Finalize lifecycle after merge |
| `/dev-docs` | Generate/update documentation |
| `/dev-notify` | Send Slack notifications at milestones |
| `/dev-history` | Browse past features |
| `/guardia <PR>` | Parallel 6-agent PR review (sonar, tests, react, security, CI/CD, bundle) |

### AI Agents (19 total, all tagged for search)

**Leadership Council** (8 personas, tag: `council`):
CTO, Team Lead, Product Owner, Project Manager, UI/UX Director, Data Director, Tech Director, AI Engineer

**Validation Agents** (5, tags: `validation`, `review`):
Criteria Validator, Solution Critic, Code Auditor, Acceptance Checker, Doc Generator

**Review Agents** (6, tag: `guardia`):
Sonar Reviewer, Test Reviewer, React Reviewer, Security Reviewer, Workflow Reviewer, Bundle Reviewer

### Skills (3, all tagged)

| Skill | Tags | Trigger |
|-------|------|---------|
| `modo-protocol` | core, spec-first, lifecycle | Always active |
| `modo-tech-architect` | architecture, prd, planning | "analyze this PRD" |
| `modo-review-standards` | review, guardia, code-quality | Auto-loaded for reviews |

## Installation

```bash
claude plugins install --from github SoyErnoModo/modo-dev-framework
```

### CLI

```bash
npx @playsistemico/modo-dev-framework list-prompts      # List all prompts
npx @playsistemico/modo-dev-framework list-agents        # List all agents
npx @playsistemico/modo-dev-framework list-instructions   # List all instructions
npx @playsistemico/modo-dev-framework detect              # Detect installed AI tools
```

## Structure

```
modo-dev-framework/
├── .claude-plugin/          # Plugin metadata + marketplace
├── .mcp.json                # MCP server registration
├── src/                     # MCP server source (TypeScript)
│   ├── index.ts             # Server entry (stdio transport)
│   └── services/            # Content loading + search services
├── dist/                    # Compiled MCP server
├── prompts/                 # 9 templated prompts with variables
│   ├── development/         # code-review, pr-description, bug-analysis, feature-kickoff
│   ├── architecture/        # adr-decision, tech-spec, sprint-plan
│   └── documentation/       # feature-summary, api-docs
├── instructions/            # Granular instructions with frontmatter tags
│   ├── *.md                 # Core instructions (quality, docs, context, channels)
│   ├── react/               # React component + testing standards
│   ├── security/            # OWASP frontend security
│   └── typescript/          # Strict mode standards
├── skills/                  # 3 skills (protocol, tech-architect, review-standards)
├── agents/                  # 19 tagged agents
├── commands/                # 9 slash commands
├── hooks/                   # Lifecycle hooks (session, prompt interceptor, tool watcher)
├── references/              # (deprecated, migrated to instructions/)
├── bin/cli.js               # CLI installer
└── package.json             # Dependencies (MCP SDK, gray-matter)
```

## Customization

### Adjust Quality Thresholds
Edit `instructions/quality-standards.md` to change coverage targets, complexity limits, etc.

### Add Prompts
Add `.md` files to `prompts/{category}/` with gray-matter frontmatter (id, title, tags, variables).

### Add Instructions
Add `.instructions.md` files to `instructions/{topic}/` with a `metadata.json` for shared tags.

### Add Slack Channels
Edit `instructions/modo-channels.md` with your actual team channels.

## Contributing

1. Clone this repo
2. `npm install && npm run build:ts`
3. Test: `node bin/cli.js list-prompts`
4. Submit a PR

## License

MIT
