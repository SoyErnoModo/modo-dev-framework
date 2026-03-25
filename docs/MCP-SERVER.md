# MCP Server Technical Documentation

The MODO Dev Framework includes a built-in MCP (Model Context Protocol) server that exposes all plugin content -- prompts, agents, skills, and instructions -- through a standardized interface. This document covers the server architecture, all exposed tools, resources, prompts, configuration, testing, and extension.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                Claude Code Session               │
│                                                   │
│  ┌─────────────┐     ┌──────────────────────┐   │
│  │ Slash        │     │ MCP Client           │   │
│  │ Commands     │────>│ (built into Claude)  │   │
│  └─────────────┘     └──────────┬───────────┘   │
│                                  │ stdio          │
│                      ┌───────────▼───────────┐   │
│                      │ modo-dev-framework    │   │
│                      │ MCP Server v1.1.0     │   │
│                      │                       │   │
│                      │ ┌───────────────────┐ │   │
│                      │ │ PromptService     │ │   │
│                      │ │ AgentService      │ │   │
│                      │ │ SkillService      │ │   │
│                      │ │ InstructionsService│ │   │
│                      │ │ SearchService     │ │   │
│                      │ └───────────────────┘ │   │
│                      │          │            │   │
│                      │    ┌─────▼─────┐      │   │
│                      │    │ In-Memory │      │   │
│                      │    │   Cache   │      │   │
│                      │    └─────┬─────┘      │   │
│                      │          │            │   │
│                      │    ┌─────▼─────┐      │   │
│                      │    │ File System│      │   │
│                      │    │ (markdown) │      │   │
│                      │    └───────────┘      │   │
│                      └───────────────────────┘   │
└─────────────────────────────────────────────────┘
```

**Transport**: stdio (standard input/output). The server communicates with Claude Code through stdin/stdout using JSON-RPC messages as defined by the MCP specification.

**Caching**: All content (prompts, agents, skills) is loaded into an in-memory `Map` cache on server startup. Instructions are loaded on demand but cached after first access. This means the server starts quickly and subsequent reads are instant.

**Parsing**: All markdown files use [gray-matter](https://github.com/jonschlinkert/gray-matter) to parse YAML frontmatter from the markdown body. The frontmatter contains structured metadata (id, title, tags, variables) while the body contains the prompt/agent/instruction content.

**Capabilities**: The server registers three MCP capability groups:
- **Tools** (7): Searchable, callable functions for finding and rendering content
- **Prompts**: Native MCP prompt listing and rendering with variable substitution
- **Resources**: URI-addressable content for direct access to any piece of content

---

## MCP Tools (7)

### search_prompts

Search MODO prompts by tags, text query, or category.

**Input Schema**:

```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Search query (matches title, description)"
    },
    "category": {
      "type": "string",
      "description": "Filter by category (development, architecture, documentation)"
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Tags to filter by (OR logic)"
    }
  }
}
```

**Behavior**:
- If `tags` is provided, filters prompts where any tag matches (OR logic), optionally scoped to `category`.
- If `query` is provided (and no tags), performs case-insensitive text search across title, description, and tags.
- If neither is provided, returns all prompts (optionally filtered by category).

**Example Request**:

```json
{
  "name": "search_prompts",
  "arguments": {
    "tags": ["review", "quality"],
    "category": "development"
  }
}
```

**Example Response**:

```json
[
  {
    "id": "code-review",
    "title": "Structured Code Review",
    "description": "Comprehensive code review with configurable focus areas and MODO quality standards",
    "category": "development",
    "tags": ["review", "quality", "code", "guardia"],
    "variables": [
      { "name": "pr_url", "description": "Pull request URL or number", "type": "string", "required": true },
      { "name": "focus", "description": "Review focus area", "type": "string", "required": false, "defaultValue": "all" },
      { "name": "language", "description": "Primary programming language", "type": "string", "required": false, "defaultValue": "TypeScript" }
    ]
  }
]
```

---

### get_prompt

Get a prompt by ID and render it with variable substitution.

**Input Schema**:

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Prompt ID (e.g., 'code-review', 'tech-spec')"
    },
    "variables": {
      "type": "object",
      "additionalProperties": true,
      "description": "Variables for {placeholder} substitution"
    }
  },
  "required": ["id"]
}
```

**Behavior**:
- Looks up the prompt by `id` in the cache.
- For each defined variable: uses the provided value, falls back to `defaultValue`, or throws an error if required and missing.
- Replaces all `{variable_name}` placeholders in the prompt body with resolved values.
- Returns the rendered content along with metadata.

**Example Request**:

```json
{
  "name": "get_prompt",
  "arguments": {
    "id": "code-review",
    "variables": {
      "pr_url": "https://github.com/org/repo/pull/456",
      "focus": "security"
    }
  }
}
```

**Example Response**:

```json
{
  "id": "code-review",
  "title": "Structured Code Review",
  "description": "Comprehensive code review with configurable focus areas and MODO quality standards",
  "category": "development",
  "content": "# Structured Code Review\n\nYou are performing a thorough code review for the MODO platform. Review the pull request at **https://github.com/org/repo/pull/456** with a primary focus on **security** using **TypeScript** best practices.\n\n...",
  "variablesUsed": ["pr_url", "focus", "language"]
}
```

---

### search_agents

Search MODO agents by tags with configurable match logic.

**Input Schema**:

```json
{
  "type": "object",
  "properties": {
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Tags to filter by (OR logic by default)"
    },
    "match": {
      "type": "string",
      "enum": ["or", "and"],
      "description": "Match mode: 'or' (default) returns agents matching any tag, 'and' returns agents matching all tags"
    }
  }
}
```

**Example Request**:

```json
{
  "name": "search_agents",
  "arguments": {
    "tags": ["council", "strategy"],
    "match": "and"
  }
}
```

**Example Response**:

```json
[
  {
    "id": "council-cto",
    "title": "CTO Critic",
    "description": "CTO persona. Reviews code and solutions from a strategic technology perspective...",
    "tags": ["council", "strategy", "tech-debt", "scalability"]
  }
]
```

---

### search_skills

Search MODO skills by tags.

**Input Schema**:

```json
{
  "type": "object",
  "properties": {
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Tags to search for (OR logic)"
    }
  }
}
```

**Example Request**:

```json
{
  "name": "search_skills",
  "arguments": {
    "tags": ["core", "lifecycle"]
  }
}
```

---

### search_instructions

Search MODO instructions by tags.

**Input Schema**:

```json
{
  "type": "object",
  "properties": {
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Tags to search for (OR logic)"
    }
  }
}
```

**Example Request**:

```json
{
  "name": "search_instructions",
  "arguments": {
    "tags": ["react", "testing"]
  }
}
```

**Example Response**:

```json
[
  {
    "id": "react/components",
    "name": "React Component Standards",
    "description": "React Component Standards",
    "tags": ["react", "components", "server-components", "hooks"]
  },
  {
    "id": "react/testing",
    "name": "React Testing Standards",
    "description": "React Testing Standards",
    "tags": ["react", "testing", "jest", "testing-library"]
  }
]
```

---

### get_instruction

Get the full content of an instruction by ID.

**Input Schema**:

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Instruction ID (e.g., 'quality-standards', 'react/components', 'security/owasp-frontend')"
    }
  },
  "required": ["id"]
}
```

**Behavior**:

The service resolves the ID through multiple strategies:

1. Direct file: `instructions/{id}.md` (e.g., `quality-standards` resolves to `instructions/quality-standards.md`)
2. Sub-path with `.instructions.md` extension: `instructions/{dir}/{topic}.instructions.md` (e.g., `react/components` resolves to `instructions/react/components.instructions.md`)
3. Sub-path with `.md` extension: `instructions/{dir}/{topic}.md`
4. Directory: if the ID resolves to a directory, all instruction files in it are concatenated with `---` separators

Path traversal is blocked: IDs containing `..` or starting with `/` are rejected.

**Example Request**:

```json
{
  "name": "get_instruction",
  "arguments": {
    "id": "react/components"
  }
}
```

**Example Response**: Returns the full markdown content of the instruction file as a text string.

---

### search_all

Cross-type search across prompts, agents, skills, and instructions.

**Input Schema**:

```json
{
  "type": "object",
  "properties": {
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Tags to search for (OR logic)"
    },
    "query": {
      "type": "string",
      "description": "Additional text filter applied to results"
    }
  }
}
```

**Behavior**:

1. Searches all four content types (prompts, agents, skills, instructions) by tags in parallel.
2. Merges results into a unified array with a `type` field identifying the content type.
3. If `query` is provided, filters the merged results by case-insensitive text match on title, description, or tags.

**Example Request**:

```json
{
  "name": "search_all",
  "arguments": {
    "tags": ["security"],
    "query": "owasp"
  }
}
```

**Example Response**:

```json
[
  {
    "type": "agent",
    "id": "security-reviewer",
    "title": "Security Reviewer",
    "description": "Reviews code for OWASP Top 10 frontend vulnerabilities...",
    "tags": ["guardia", "security", "owasp", "vulnerabilities"]
  },
  {
    "type": "instruction",
    "id": "security/owasp-frontend",
    "title": "OWASP Frontend Security",
    "description": "OWASP Frontend Security Standards",
    "tags": ["security", "owasp", "xss", "injection", "auth"]
  }
]
```

---

## MCP Resources

The server exposes all content as MCP Resources, enabling direct URI-based access.

### URI Schemes

| Scheme | Content Type | Example |
|--------|-------------|---------|
| `prompts://` | Prompt templates | `prompts://code-review` |
| `agents://` | Agent definitions | `agents://council-cto` |
| `skills://` | Skill definitions | `skills://modo-protocol` |
| `instructions://` | Instruction content | `instructions://quality-standards` |

### Listing Resources

The `resources/list` endpoint returns all resources across all types. Each resource includes:

```json
{
  "uri": "prompts://code-review",
  "name": "Structured Code Review",
  "description": "Comprehensive code review with configurable focus areas...",
  "mimeType": "text/markdown"
}
```

### Reading Resources

The `resources/read` endpoint accepts a URI and returns the full markdown content:

```json
{
  "uri": "agents://council-cto",
  "contents": [
    {
      "uri": "agents://council-cto",
      "mimeType": "text/markdown",
      "text": "# CTO Critic\n\nYou are the CTO of a fintech company (MODO)..."
    }
  ]
}
```

---

## MCP Prompts (Native)

The server implements the MCP native prompt protocol (`prompts/list` and `prompts/get`), which allows Claude Code to discover and render prompts with argument validation.

### prompts/list

Returns all 9 prompts with their arguments:

```json
{
  "prompts": [
    {
      "name": "code-review",
      "description": "Comprehensive code review with configurable focus areas and MODO quality standards",
      "arguments": [
        { "name": "pr_url", "description": "Pull request URL or number", "required": true },
        { "name": "focus", "description": "Review focus area", "required": false },
        { "name": "language", "description": "Primary programming language", "required": false }
      ]
    }
  ]
}
```

### prompts/get

Renders a prompt with variable substitution, returning it as a user message:

```json
{
  "description": "Comprehensive code review with configurable focus areas and MODO quality standards",
  "messages": [
    {
      "role": "user",
      "content": {
        "type": "text",
        "text": "# Structured Code Review\n\nYou are performing a thorough code review..."
      }
    }
  ]
}
```

---

## Configuration

### Environment Variables

The server reads content directories from environment variables. The `.mcp.json` file at the project root configures these automatically when running as a Claude Code plugin.

| Variable | Default | Description |
|----------|---------|-------------|
| `MCP_PROMPTS_DIR` | `${CWD}/prompts` | Directory containing prompt markdown files |
| `MCP_AGENTS_DIR` | `${CWD}/agents` | Directory containing agent markdown files |
| `MCP_SKILLS_DIR` | `${CWD}/skills` | Directory containing skill markdown files |
| `MCP_INSTRUCTIONS_DIR` | `${CWD}/instructions` | Directory containing instruction files |

### .mcp.json

The plugin registration file configures the MCP server:

```json
{
  "mcpServers": {
    "modo-dev-framework": {
      "type": "stdio",
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/dist/index.js"],
      "env": {
        "MCP_PROMPTS_DIR": "${CLAUDE_PLUGIN_ROOT}/prompts",
        "MCP_INSTRUCTIONS_DIR": "${CLAUDE_PLUGIN_ROOT}/instructions",
        "MCP_AGENTS_DIR": "${CLAUDE_PLUGIN_ROOT}/agents",
        "MCP_SKILLS_DIR": "${CLAUDE_PLUGIN_ROOT}/skills"
      }
    }
  }
}
```

`${CLAUDE_PLUGIN_ROOT}` is resolved by Claude Code to the plugin's installation directory.

---

## Testing the Server Locally

### Build

```bash
cd /path/to/modo-dev-framework
npm install
npm run build:ts
```

### Run Standalone

```bash
node dist/index.js
```

The server starts and waits for JSON-RPC messages on stdin. You can test by piping messages:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/index.js
```

### Run in Development Mode

```bash
npm run dev
```

Uses `tsx` for direct TypeScript execution without compilation.

### Test with CLI

```bash
# List all prompts
node bin/cli.js list-prompts

# List all agents
node bin/cli.js list-agents

# List all instructions
node bin/cli.js list-instructions

# Detect installed AI tools
node bin/cli.js detect
```

### Test Specific Tools

To test MCP tools interactively, send JSON-RPC requests to stdin. Example testing `search_all`:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/call","params":{"name":"search_all","arguments":{"tags":["security"]}}}' | node dist/index.js
```

---

## How to Extend

### Adding a New Prompt

1. Create a markdown file in the appropriate category directory:

   ```
   prompts/{category}/{prompt-name}.md
   ```

2. Add frontmatter with required fields:

   ```yaml
   ---
   id: my-prompt
   title: "My New Prompt"
   description: "What this prompt does"
   category: development
   tags: [relevant, tags]
   variables:
     - name: input_var
       description: "What this variable is"
       type: string
       required: true
     - name: optional_var
       description: "Optional configuration"
       type: string
       required: false
       defaultValue: "default"
   ---
   ```

3. Write the prompt body using `{variable_name}` placeholders:

   ```markdown
   # My New Prompt

   You are doing something with **{input_var}** using the **{optional_var}** approach.
   ```

4. Restart the server (or start a new Claude Code session) to load the new prompt.

### Adding a New Instruction

1. For a root-level instruction, create `instructions/{name}.md` with frontmatter tags:

   ```yaml
   ---
   title: My Instruction
   description: What this instruction covers
   tags: [topic, subtopic]
   ---
   ```

2. For a categorized instruction, create a subdirectory:

   ```
   instructions/{category}/metadata.json
   instructions/{category}/{topic}.instructions.md
   ```

   The `metadata.json` provides shared tags for all files in the directory:

   ```json
   {
     "tags": ["category-tag"]
   }
   ```

   Each `.instructions.md` file can add its own tags via frontmatter.

### Adding a New Agent

1. Create `agents/{agent-name}.md` with frontmatter:

   ```yaml
   ---
   name: my-agent
   tags: [group, specialization]
   description: >
     What this agent does and when it is invoked.
   model: sonnet
   ---
   ```

2. Write the agent system prompt with: perspective, review process, tone, output format, and rules.

3. Tag the agent appropriately so it appears in `search_agents` queries:
   - `council` for leadership council agents
   - `validation` and `review` for validation agents
   - `guardia` for PR review agents

### Source Code Reference

| File | Purpose |
|------|---------|
| `src/index.ts` | Server entry point, tool/prompt/resource handler registration |
| `src/types.ts` | TypeScript interfaces for all content types |
| `src/services/promptService.ts` | Prompt loading, caching, search, and variable rendering |
| `src/services/agentService.ts` | Agent loading, caching, and tag search |
| `src/services/skillService.ts` | Skill loading, caching, and tag search |
| `src/services/instructionsService.ts` | Instruction loading with directory/file resolution |
| `src/services/searchService.ts` | Unified cross-type search service |

### Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@modelcontextprotocol/sdk` | ^1.27.1 | MCP server framework (Server, StdioServerTransport, schemas) |
| `gray-matter` | ^4.0.3 | YAML frontmatter parsing from markdown files |
