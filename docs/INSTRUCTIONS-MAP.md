# Instructions Map

The MODO Dev Framework includes 8 instruction sets that define the team's coding standards, architectural patterns, and quality requirements. Agents load specific instructions based on their tags to ensure consistent enforcement across all reviews and validations.

Instructions live in `instructions/` and are searchable via the `search_instructions` and `get_instruction` MCP tools.

---

## Instruction Structure

Each instruction file has:

- **Frontmatter**: `title`, `description`, and `tags` (YAML in markdown files)
- **Body**: Structured markdown content with rules, standards, and examples

**Root instructions** are standalone `.md` files in `instructions/`.

**Categorized instructions** live in subdirectories (e.g., `instructions/react/`) with a `metadata.json` providing shared tags and individual `.instructions.md` files adding their own.

---

## Core Instructions

### quality-standards

| Field | Value |
|-------|-------|
| **ID** | `quality-standards` |
| **Title** | MODO Quality Standards |
| **Tags** | `core`, `quality`, `testing`, `security`, `react`, `sonarcloud` |
| **File** | `instructions/quality-standards.md` |

**What it covers**: The central quality reference for all MODO agents. Defines numeric thresholds and patterns that every code review, audit, and validation checks against.

**Key rules**:

- Test coverage on new code: minimum 80%, target 90% (SonarCloud-enforced)
- Branch coverage: minimum 70%, target 80%
- Cognitive complexity: maximum 15 per function (SonarCloud S3776), target <10
- File length: maximum 400 lines, target <250
- Function length: maximum 50 lines, target <30
- No `any` types in component props
- Server Components by default; `"use client"` only when needed
- Error boundaries for async components, Suspense for lazy content
- No secrets in code, no `dangerouslySetInnerHTML` without sanitization, no `eval()`
- Commit format: `<type>(<scope>): <subject>` with ticket reference in footer

**Used by agents**: code-auditor, sonar-reviewer, test-reviewer, react-reviewer, security-reviewer, acceptance-checker, solution-critic -- virtually every agent references these thresholds.

---

### documentation-standards

| Field | Value |
|-------|-------|
| **ID** | `documentation-standards` |
| **Title** | Documentation Standards |
| **Tags** | `core`, `documentation`, `vault`, `mermaid`, `diagrams` |
| **File** | `instructions/documentation-standards.md` |

**What it covers**: Defines how the framework generates and maintains documentation in the dev-vault. Specifies vault file purposes, Mermaid diagram standards, ADR templates, journal entry format, and documentation quality scoring.

**Key rules**:

- 6 vault files per feature: journal (append-only), acceptance (status updates), architecture (regenerated), decisions (append-only ADRs), review (append-only entries), summary (final write)
- Mermaid diagrams must follow standard templates: graph TD for component hierarchies, sequenceDiagram for data flow, stateDiagram-v2 for state machines, erDiagram for entities
- ADRs follow a structured template: status, date, context, options considered (with pros/cons), decision, consequences (positive/negative/risks)
- Journal entries are timestamped with event type, context, and key metrics
- Documentation quality score: architecture docs (25%), ADR completeness (25%), AC mapping (25%), journal completeness (15%), summary readability (10%)

**Used by agents**: doc-generator, solution-critic (for diagram generation), acceptance-checker (for vault file updates)

---

### modo-context

| Field | Value |
|-------|-------|
| **ID** | `modo-context` |
| **Title** | MODO General Context |
| **Tags** | `context`, `architecture`, `seo`, `telepathic` |
| **File** | `instructions/modo-context.md` |

**What it covers**: Project-specific context about the MODO platform: application architecture, URLs, project management setup, social presence, and SEO/AI search audit findings.

**Key rules**:

- MODO has two main web applications: `modo-landing` (Storyblok CMS) and `promos-hub`
- Shared component library (Footer, Navbar, Layout) used across both
- Production URL: `https://modo.com.ar`
- Linear workspace: `modoapp`, project: Integracion Telephatic
- SEO strengths: structured site, good FAQs, strong YouTube/LinkedIn presence
- SEO gaps: content freshness, footer linking, PR presence, AI search feeds
- Opportunities: use-case content, ROI measurement, agentic commerce, UCP updates

**Used by agents**: council-cto (platform alignment), council-po (product context), solution-critic (codebase patterns)

---

### modo-channels

| Field | Value |
|-------|-------|
| **ID** | `modo-channels` |
| **Title** | Slack Channel Map |
| **Tags** | `slack`, `channels`, `communication`, `notifications` |
| **File** | `instructions/modo-channels.md` |

**What it covers**: Slack channel configuration for the `/dev-notify` command and team communication routing.

**Key rules**:

- 4 priority levels: critical, high, medium, low
- Critical channels: `#incidents` (production incidents), `#deploys` (deployment notifications)
- High channels: `#backend`, `#frontend`, `#mobile`, `#platform` (team-specific)
- Medium channels: `#architecture` (RFCs), `#code-review` (PR discussions), `#managers`, `#product`
- Low channels: `#general`, `#random`, `#ci-cd`, `#bot-alerts`
- DMs and group DMs are always classified as high priority
- Direct questions are classified as "needs-response"

**Used by agents**: `/dev-notify` command (channel routing), council-pm (communication assessment)

---

## React Instructions

### react/components

| Field | Value |
|-------|-------|
| **ID** | `react/components` |
| **Title** | React Component Standards |
| **Tags** | `react`, `components`, `server-components`, `hooks` |
| **File** | `instructions/react/components.instructions.md` |

**What it covers**: MODO-specific React component development standards covering server/client components, component structure, type safety, performance, error handling, and design system usage.

**Key rules**:

- Server Components by default -- only add `"use client"` when the component requires browser APIs, event handlers, or client-side hooks
- Keep client boundaries as low in the component tree as possible
- Components must stay under 200 lines; split if exceeded
- One component per file; co-locate helpers only if not reused elsewhere
- No `any` in props -- define explicit interfaces with discriminated unions for variants
- Use `useCallback` for event handlers passed to children, `useMemo` for expensive computations
- Avoid inline object/array literals in JSX props (causes re-renders)
- Wrap async components with Error Boundaries, lazy content with Suspense
- Check `@playsistemico/modo-sdk-web-ui-lib` before creating custom components; use wrapper pattern for adaptations
- Use Remote Config design tokens via CSS custom properties (`var(--color-default)`); never hardcode colors, spacing, or typography

**Used by agents**: react-reviewer, code-auditor, solution-critic, council-ui

---

### react/testing

| Field | Value |
|-------|-------|
| **ID** | `react/testing` |
| **Title** | React Testing Standards |
| **Tags** | `react`, `testing`, `jest`, `testing-library` |
| **File** | `instructions/react/testing.instructions.md` |

**What it covers**: Testing methodology for React components and features.

**Key rules**:

- Test what the user sees and does, not implementation details
- Never assert on internal state, ref values, or component instance methods
- Always use `userEvent` over `fireEvent` (simulates real browser behavior)
- Query priority: `getByRole` > `getByLabelText` > `getByText` > `getByTestId`; never use `getByClassName` or `querySelector`
- Snapshot tests only for static presentational markup; never for behavior or dynamic rendering
- Every test suite must cover: empty state, error state, loading state, large data
- Integration tests for critical user flows using MSW for API mocking
- Coverage targets: line coverage 80% minimum (90% target), branch coverage 70% minimum (80% target)
- Mock at boundaries (API calls, third-party services, browser APIs); do not mock internal modules or child components

**Used by agents**: test-reviewer, code-auditor, acceptance-checker (test evidence validation)

---

## Security Instructions

### security/owasp-frontend

| Field | Value |
|-------|-------|
| **ID** | `security/owasp-frontend` |
| **Title** | OWASP Frontend Security |
| **Tags** | `security`, `owasp`, `xss`, `injection`, `auth` |
| **File** | `instructions/security/owasp-frontend.instructions.md` |

**What it covers**: Frontend security rules aligned with OWASP guidelines, specific to the MODO tech stack.

**Key rules**:

- No secrets in source code; use `.env.local` (never committed) and server-side injection; audit with gitleaks or trufflehog in CI
- `dangerouslySetInnerHTML` only allowed with DOMPurify sanitization
- `eval()` banned -- no exceptions
- `document.write()` banned -- breaks streaming SSR
- Auth tokens in httpOnly cookies with `Secure` flag; never in localStorage or sessionStorage
- Validate inputs on both client and server; use Zod/Yup for schema validation; reject unexpected fields (allowlist approach)
- CSP headers with nonce-based script loading; no `'unsafe-inline'` for scripts
- CSRF protection: `SameSite=Strict` or `Lax` cookies; anti-CSRF tokens for state-changing operations
- Additional headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`

**Used by agents**: security-reviewer, code-auditor, council-tech-director

---

## TypeScript Instructions

### typescript/strict-mode

| Field | Value |
|-------|-------|
| **ID** | `typescript/strict-mode` |
| **Title** | TypeScript Strict Mode Standards |
| **Tags** | `typescript`, `strict-mode`, `types`, `generics` |
| **File** | `instructions/typescript/strict-mode.instructions.md` |

**What it covers**: Type safety rules and TypeScript patterns for reliable code.

**Key rules**:

- No `any` in new code; use `unknown` and narrow with type guards; incrementally replace existing `any` during refactors
- Constrain generics with `extends`; avoid over-generic signatures where the generic is used only once
- Prefer discriminated unions over type assertions; avoid `as` (document if necessary); never use `as any`
- Mark parameters as `readonly` when not mutated; use `Readonly<T>` for props and state; prefer `ReadonlyArray<T>`
- `strictNullChecks` must be enabled; handle null/undefined explicitly with `?.` and `??`
- Non-null assertion `!` discouraged; if used, add a comment explaining why the value is guaranteed non-null
- Use `interface` for public APIs/props/contracts; use `type` for unions, intersections, and internal aliases
- Leverage utility types: `Pick`, `Omit`, `Partial`, `Required`, `Record`, `ReturnType`
- Use branded types for IDs to prevent mixing up primitives at compile time (e.g., `UserId` vs `OrderId`)

**Used by agents**: code-auditor, react-reviewer, solution-critic

---

## Agent-to-Instruction Mapping

This table shows which agents load which instructions as context for their analysis.

| Agent | Instructions Used |
|-------|------------------|
| **code-auditor** | quality-standards, react/components, react/testing, typescript/strict-mode, security/owasp-frontend |
| **solution-critic** | quality-standards, react/components, documentation-standards, modo-context |
| **criteria-validator** | quality-standards (threshold references) |
| **acceptance-checker** | quality-standards, react/testing (test evidence patterns) |
| **doc-generator** | documentation-standards (templates, scoring) |
| **sonar-reviewer** | quality-standards (SonarCloud thresholds) |
| **test-reviewer** | react/testing, quality-standards |
| **react-reviewer** | react/components, quality-standards |
| **security-reviewer** | security/owasp-frontend, quality-standards |
| **workflow-reviewer** | quality-standards (CI expectations) |
| **bundle-reviewer** | quality-standards (bundle thresholds) |
| **council-cto** | modo-context, quality-standards |
| **council-team-lead** | quality-standards, react/components |
| **council-po** | modo-context |
| **council-pm** | modo-channels |
| **council-ui** | react/components, quality-standards |
| **council-data-director** | quality-standards, security/owasp-frontend (PII rules) |
| **council-tech-director** | security/owasp-frontend, quality-standards |
| **council-ai-engineer** | quality-standards |

---

## Customizing Instructions

### Adjusting Quality Thresholds

Edit `instructions/quality-standards.md` to change coverage targets, complexity limits, or other thresholds. All agents that reference quality-standards will pick up the changes on the next session.

### Adding a New Instruction Set

1. Create the file in `instructions/` (root level) or a subdirectory.
2. Add frontmatter with `title`, `description`, and `tags`.
3. For subdirectory instructions, create or update `metadata.json` with shared tags.
4. Reference the new instruction in agent prompts by mentioning it in the "references" or "context" section.
5. Tag it so `search_instructions` can find it.
