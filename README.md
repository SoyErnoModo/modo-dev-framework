# MODO Dev Framework

Collaborative development framework for the MODO engineering team. Install this plugin so every team member shares the same rules, quality gates, and tools when working with Claude Code.

## What You Get

### Always-Active Protocols
- **Spec-First Enforcement** — Hooks detect code generation intent and prompt you to plan before coding
- **Quality Gates** — 80% test coverage, complexity <15, no `any` types, Server Components by default
- **MODO Patterns** — Use the UI library, Remote Config for tokens, centralized API services
- **Documentation Discipline** — ADRs for decisions, vault for features, Mermaid for diagrams

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

### AI Agents (19 total)

**Leadership Council** (8 personas for `/dev-council`):
- CTO, Team Lead, Product Owner, Project Manager, UI/UX Director, Data Director, Tech Director, AI Engineer

**Validation Agents** (5 for lifecycle checks):
- Criteria Validator, Solution Critic, Code Auditor, Acceptance Checker, Doc Generator

**Review Agents** (6 for `/guardia`):
- Sonar Reviewer, Test Reviewer, React Reviewer, Security Reviewer, Workflow Reviewer, Bundle Reviewer

### Skills

| Skill | Trigger |
|-------|---------|
| `modo-protocol` | Always active — enforces all team rules |
| `modo-tech-architect` | "analyze this PRD", "create tech specs for", "implementation plan for" |
| `modo-review-standards` | Auto-loaded during `/guardia` and `/dev-council` |

### Reference Knowledge
- MODO architectural patterns (UI wrappers, Remote Config, centralized APIs)
- Quality standards (SonarCloud thresholds, React rules, security)
- Documentation standards (vault, ADRs, Mermaid diagrams)
- API documentation guide with real examples
- Slack channel priority map

## Installation

```bash
claude plugins install --from github playsistemico/modo-dev-framework
```

Or add to your project's `.claude/plugins/installed_plugins.json` manually.

## Structure

```
modo-dev-framework/
├── .claude-plugin/
│   ├── plugin.json          # Plugin metadata
│   └── marketplace.json     # Marketplace registration
├── skills/
│   ├── modo-protocol/       # Always-active team rules
│   ├── modo-tech-architect/ # PRD analysis and tech specs
│   │   ├── references/      # Patterns, API guide, tech guide structure
│   │   ├── assets/          # Templates (tech guide, ADR, sprint plan)
│   │   └── scripts/         # Swagger analysis, Confluence search, sprint planning
│   └── modo-review-standards/ # Code review checklist
├── agents/                  # 19 specialized agents
├── commands/                # 9 slash commands
├── hooks/
│   ├── hooks.json           # Hook configuration
│   └── scripts/             # Session start, prompt interceptor, tool watcher
├── references/              # Quality standards, documentation standards, MODO context
├── README.md
└── LICENSE
```

## Customization

### Adjust Quality Thresholds
Edit `references/quality-standards.md` to change coverage targets, complexity limits, etc.

### Add Slack Channels
Edit `references/modo-channels.md` with your actual team channels.

### Add MODO Context
Edit `references/modo-context.md` with project-specific information.

## Contributing

1. Clone this repo
2. Make your changes
3. Test locally by symlinking to `~/.claude/plugins/modo-dev-framework`
4. Submit a PR

## License

MIT
