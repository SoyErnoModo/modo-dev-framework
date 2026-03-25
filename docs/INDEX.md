# MODO Dev Framework — Documentation Index

**MODO Dev Framework** is a collaborative development framework built as an MCP (Model Context Protocol) server that provides AI-powered development workflows, automated PR reviews, spec-first enforcement, and leadership council analysis. It packages prompts, agents, skills, and instructions as discoverable, searchable content served over stdio to Claude Code.

**Version:** v1.1.0

**Repository:** [github.com/SoyErnoModo/modo-dev-framework](https://github.com/SoyErnoModo/modo-dev-framework)

---

## Start Here

New to the framework? Begin with the getting started guide:

> **[GETTING-STARTED.md](./GETTING-STARTED.md)** — Installation, configuration, and your first development cycle.

---

## Documentation

| Document | Description |
|----------|-------------|
| [GETTING-STARTED.md](./GETTING-STARTED.md) | Installation, setup, and first-use walkthrough |
| [WORKFLOWS.md](./WORKFLOWS.md) | Visual Mermaid diagrams showing how framework components connect |
| [COMMANDS.md](./COMMANDS.md) | Reference for all slash commands (/dev-start, /guardia, /dev-council, etc.) |
| [AGENTS.md](./AGENTS.md) | Catalog of all 19 agent definitions and their roles |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | MCP server design, services, and content model |
| [HOOKS.md](./HOOKS.md) | Hook system: prompt interceptor, session start, tool watcher |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | How to add new prompts, agents, skills, and instructions |

---

## Component Inventory

| Component | Count | Location | Description |
|-----------|-------|----------|-------------|
| Agents | 19 | `agents/` | Specialized review and council personas |
| Commands | 9 | `commands/` | Slash commands for the development lifecycle |
| Skills | 3 | `skills/` | Composable skill packages (protocol, review standards, tech architect) |
| Prompts | 9 | `prompts/` | Template prompts across architecture, development, and documentation |
| Instructions | 8 | `instructions/` | Coding standards for React, TypeScript, security, and documentation |
| MCP Tools | 7 | `src/index.ts` | Server tools for search and retrieval |
| Hooks | 3 | `hooks/` | Session start, prompt interceptor, tool watcher |

---

## Quick Reference

**Key commands:**
- `/dev-start <ticket>` — Begin a development cycle with tracking and specs
- `/dev-check` — Run quality checks against current work
- `/dev-critique` — Get a critical solution review
- `/guardia <PR>` — Automated 6-agent PR review
- `/dev-council <topic>` — 8-persona leadership analysis
- `/dev-complete` — Close the development cycle

**Key tools (MCP):**
- `search_all` — Unified search across prompts, agents, skills, and instructions
- `search_prompts` / `get_prompt` — Find and render prompt templates
- `search_agents` / `search_skills` / `search_instructions` — Discover content by tags
- `get_instruction` — Retrieve full instruction content by ID
