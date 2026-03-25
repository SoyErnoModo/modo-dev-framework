# Agents Guide

The MODO Dev Framework includes 19 AI agents organized into three functional groups: Leadership Council (8), Validation Agents (5), and Review Agents (6). Each agent is a markdown file in `agents/` with frontmatter metadata (name, tags, description, model) and a detailed system prompt.

---

## How Agents Work

Agents are invoked by slash commands, not called directly by users. Each agent receives a context package (code, ticket data, review history) and produces a structured report in a specific format.

**Automatic invocation**: Slash commands launch agents as part of their workflow. For example, `/dev-council` launches all 8 council agents in parallel.

**Manual invocation**: You can ask Claude to "run the solution-critic agent" or "review this code as the CTO persona" to invoke an agent outside of its standard command context.

**Discovery via MCP**: Use the `search_agents` tool to find agents by tag:

```json
// Find all council agents
{ "tags": ["council"] }

// Find all guardia review agents
{ "tags": ["guardia"] }

// Find agents that handle both review and architecture
{ "tags": ["review", "architecture"], "match": "and" }
```

---

## Leadership Council (8 Agents)

**Purpose**: Provide a comprehensive multi-perspective review of an implementation, simulating presenting your work to the entire leadership team.

**Invoked by**: `/dev-council` (all 8), `/dev-council --quick` (top 4), `/dev-council --focus <persona>` (single)

**When to use**: Before shipping high-stakes features. The council review is the most thorough quality gate in the framework.

### council-cto

| Field | Value |
|-------|-------|
| **Tags** | `council`, `strategy`, `tech-debt`, `scalability` |
| **Focus** | Strategic technology alignment, technical debt, scalability, build-vs-buy, platform thinking |
| **Key Question** | Will this solution still make sense in 2 years? |
| **Verdict Scale** | ALIGNED, TACTICAL_OK, MISALIGNED, RETHINK |

The CTO persona does not review syntax or formatting. It questions whether the problem should have been solved differently at a higher level, flags organizational bottlenecks, identifies patterns that should be platform capabilities, and assesses production risk and blast radius. Output includes a technical debt assessment (debt level, payoff timeline, interest rate) and platform opportunities.

### council-team-lead

| Field | Value |
|-------|-------|
| **Tags** | `council`, `code-quality`, `conventions`, `team` |
| **Focus** | Readability, team conventions, PR reviewability, knowledge distribution, mentoring opportunities |
| **Key Question** | Can any team member pick this up and modify it? |
| **Verdict Scale** | EXCELLENT, GOOD, NEEDS_WORK, CONCERNING |

Reviews as if reading a PR from a team member. Checks naming, structure, and patterns against conventions. Flags magic numbers, unclear abbreviations, missing error messages, commented-out code, TODOs without ticket references, and console.logs. Assesses bus factor, test maintainability, and whether the PR should be split. Includes mentoring notes highlighting good patterns to share with the team.

### council-po

| Field | Value |
|-------|-------|
| **Tags** | `council`, `product`, `acceptance-criteria`, `user-stories` |
| **Focus** | Acceptance criteria compliance, user story coverage, feature completeness, business value |
| **Key Question** | Does this solve the user's actual problem? |
| **Verdict Scale** | ACCEPTED, ACCEPTED_WITH_NOTES, NEEDS_WORK, REJECTED |

Does not review code quality. Focuses entirely on whether the user's problem is solved. Walks through the happy path and unhappy paths, checks error messages for user-friendliness, flags feature gaps the ACs did not cover but users will expect, and produces QA handoff notes with test scenarios and known limitations.

### council-pm

| Field | Value |
|-------|-------|
| **Tags** | `council`, `project-management`, `scope`, `timeline` |
| **Focus** | Scope adherence, timeline impact, dependencies, risks, communication, release readiness |
| **Key Question** | Is this on track and ready to ship? |
| **Verdict Scale** | ON_TRACK, AT_RISK, DELAYED, BLOCKED |

Reviews process and delivery, not code. Checks scope against original commitment, flags scope creep, assesses timeline, identifies risk register items, verifies dependencies, and evaluates release readiness with a checklist (feature complete, tests passing, docs updated, QA scenarios defined, rollback plan, stakeholders informed).

### council-ui

| Field | Value |
|-------|-------|
| **Tags** | `council`, `design`, `accessibility`, `ux`, `responsive` |
| **Focus** | Design system compliance, accessibility (WCAG 2.1 AA), responsive design, interaction patterns, UI states |
| **Key Question** | Is this accessible, responsive, and consistent with the design system? |
| **Verdict Scale** | POLISHED, GOOD, NEEDS_REFINEMENT, DESIGN_DEBT |

Checks for design system token usage versus hardcoded values, verifies accessibility markup (ARIA, semantic HTML, roles, keyboard navigation, focus indicators, color contrast, touch targets), assesses responsive behavior, and audits UI state coverage (default, loading, empty, error, success, hover/focus). Hardcoded hex colors and magic number spacing are always flagged as violations.

### council-data-director

| Field | Value |
|-------|-------|
| **Tags** | `council`, `analytics`, `privacy`, `observability` |
| **Focus** | Analytics events, data models, data quality, privacy compliance, observability, feature success measurement |
| **Key Question** | Can we measure whether this feature is successful? |
| **Verdict Scale** | INSTRUMENTED, PARTIALLY_TRACKED, BLIND_SPOT, DATA_RISK |

Checks for analytics/tracking code, data model correctness, PII exposure in logs/error messages/API responses, structured logging, error tracking, performance metrics, and alerting. PII in logs is always a blocker. Ships without analytics coverage are flagged as blind spots. Every user-facing feature must have a measurable success metric with a trackable baseline.

### council-tech-director

| Field | Value |
|-------|-------|
| **Tags** | `council`, `infrastructure`, `production`, `reliability` |
| **Focus** | Production readiness, infrastructure impact, deployment strategy, monitoring, incident response, security posture |
| **Key Question** | Would I deploy this on a Friday afternoon? |
| **Verdict Scale** | SHIP_IT, SHIP_WITH_MONITORING, NEEDS_HARDENING, NOT_PRODUCTION_READY |

Owns production. Checks for N+1 queries, missing indexes, missing caching, memory leaks, bundle size. Assesses infrastructure impact (new services, database changes, API call volume, cost). Verifies monitoring, alerting, health checks, dashboards. Evaluates deployment strategy (feature flags, rollback plan, migration safety). Runs the "3am test": if this fails at 3am, can the on-call engineer find the problem, understand the error, roll back safely, and fix forward? No monitoring or no rollback plan means NOT_PRODUCTION_READY.

### council-ai-engineer

| Field | Value |
|-------|-------|
| **Tags** | `council`, `ai`, `ml`, `cost-optimization` |
| **Focus** | AI integration patterns, prompt engineering, model selection, cost optimization, hallucination prevention, AI safety |
| **Key Question** | Is AI being used correctly, and could it add value here? |
| **Verdict Scale** | WELL_INTEGRATED, OPPORTUNITIES_EXIST, AI_DEBT, MISUSING_AI |

If AI integrations exist: reviews architecture, prompt quality, cost per request, token usage, caching/batching opportunities, hallucination risk, output validation, fallback strategy, and evaluation approach. If no AI exists: identifies opportunities where AI could add value. Does not suggest AI where it does not add real value. Key rules: LLM calls need timeouts and fallbacks, prompts are code (version, test, review), if AI output reaches users there must be guardrails, if a rule-based system works it is better than AI.

### Tips for Getting the Best Output from the Council

1. **Run /dev-check and /dev-critique first.** The council uses previous review results as context. Running them first gives the council richer input.
2. **Provide clear ticket descriptions.** The Product Owner and Project Manager personas depend heavily on ticket context. Detailed acceptance criteria produce better product reviews.
3. **Use --focus for targeted feedback.** If you only need the security perspective, run `/dev-council --focus tech` instead of the full council.
4. **Use --quick for iteration.** After fixing "must-fix" items, run `--quick` to re-check with 4 personas instead of waiting for all 8.
5. **Read the consensus items first.** Issues flagged by 3+ personas are high-confidence findings. Conflicting opinions need your judgment.

---

## Validation Agents (5 Agents)

**Purpose**: Validate code quality, acceptance criteria coverage, and documentation completeness during and after development.

**Invoked by**: `/dev-start` (criteria-validator), `/dev-check` (acceptance-checker, code-auditor), `/dev-critique` (solution-critic), `/dev-docs` and `/dev-complete` (doc-generator, acceptance-checker, code-auditor)

### criteria-validator

| Field | Value |
|-------|-------|
| **Tags** | `validation`, `acceptance-criteria`, `requirements` |
| **Focus** | AC quality before development starts: clarity, testability, completeness |
| **Key Question** | Are these criteria clear enough to implement without guessing? |
| **Invoked by** | `/dev-start` |

Parses acceptance criteria from various formats (numbered lists, Gherkin, checkboxes, prose). Scores each criterion on clarity (0-25), testability (0-25), and completeness (0-25). Deducts 5 points per vague word ("appropriate", "nice", "fast", "good", "proper"). Checks for 8 common missing concerns: error handling, loading states, empty states, mobile/responsive, accessibility, edge cases, performance, security. Scoring: <60 = "Clarify before starting", 60-80 = "Proceed with caution", >80 = "Proceed".

### solution-critic

| Field | Value |
|-------|-------|
| **Tags** | `review`, `architecture`, `design-patterns` |
| **Focus** | Deep architectural review: pattern appropriateness, performance, edge cases, alternatives |
| **Key Question** | Is this the RIGHT approach, not just clean code? |
| **Invoked by** | `/dev-critique` |

Reads full file content (not diffs). Analyzes architecture (pattern appropriateness, separation of concerns, error strategy), performance (re-renders, waterfalls, memory leaks, O(n) vs O(1)), edge cases (8 categories checked systematically), and alternatives (simpler approaches, existing patterns, better data structures). Generates 3 Mermaid diagrams: component hierarchy, data flow sequence, and state machine. Verdict: SOLID, GOOD_WITH_CONCERNS, NEEDS_RETHINKING, or MAJOR_ISSUES.

### code-auditor

| Field | Value |
|-------|-------|
| **Tags** | `review`, `quality`, `code-smells`, `complexity` |
| **Focus** | Inline code quality: SonarQube rules, React patterns, TypeScript strictness, security |
| **Key Question** | Does this code meet MODO quality standards? |
| **Invoked by** | `/dev-check`, `/dev-complete` |

Checks source files against SonarQube rules (cognitive complexity >15, console.log, unused variables, floating promises), React patterns (objects in JSX, missing keys, incorrect useEffect deps, components >200 lines), TypeScript strictness (`any` types, unnecessary assertions, missing return types), and security (hardcoded secrets, dangerouslySetInnerHTML, eval, tokens in localStorage). Analyzes test files for anti-patterns (snapshots, fireEvent instead of userEvent, container.querySelector). Scoring starts at 100 and deducts points per violation. Modes: "quick" (blockers only) and "full" (everything).

### acceptance-checker

| Field | Value |
|-------|-------|
| **Tags** | `validation`, `testing`, `acceptance-criteria` |
| **Focus** | Mapping implementation progress against acceptance criteria |
| **Key Question** | Which acceptance criteria have implementation and test evidence? |
| **Invoked by** | `/dev-check` (progress mode), `/dev-complete` (strict mode) |

Searches the git diff and changed files for implementation evidence (code implementing the behavior, UI components, API endpoints, state management) and test evidence (test files verifying the criterion, matching descriptions, relevant assertions). **Progress mode** (during dev): generous classification -- done, in-progress, not-started, blocked. **Strict mode** (at completion): every AC must be "done" (implementation + test) or explicitly "deferred" with a documented reason. Provides completion percentage and specific file:line references for each AC's evidence.

### doc-generator

| Field | Value |
|-------|-------|
| **Tags** | `documentation`, `vault`, `mermaid`, `diagrams` |
| **Focus** | Generating comprehensive feature documentation with diagrams, ADRs, API docs, component docs |
| **Key Question** | Can someone unfamiliar with this feature understand it from the documentation alone? |
| **Invoked by** | `/dev-docs`, `/dev-complete` |

Reads all changed files and produces: overview (2-3 paragraphs), component hierarchy (Mermaid graph TD), module dependency graph, data flow (Mermaid sequence diagram), integration points, ADRs (extracted from code patterns, critique results, and comments), API documentation (routes, request/response shapes), component documentation (path, type, props, state, tests), and test coverage mapped to ACs. All Mermaid diagrams must be syntactically valid. Produces a documentation quality score across 5 dimensions.

### Tips for Getting the Best Output from Validation Agents

1. **Write clear commit messages.** The acceptance-checker uses commit messages as evidence signals when mapping ACs to implementation.
2. **Keep branches focused.** The code-auditor and scope analyzer work best when the branch changes relate to a single ticket.
3. **Run /dev-check early and often.** The trend tracking is most useful when you have multiple data points across the development cycle.
4. **Provide focus areas to /dev-critique.** If you know the concern area, `--focus performance` produces a deeper analysis than the default all-areas review.

---

## Review Agents (6 Agents)

**Purpose**: Perform parallel, specialized PR reviews covering code quality, testing, React patterns, security, CI/CD, and bundle impact.

**Invoked by**: `/guardia` (all 6 in parallel, skipping agents whose file categories have no changes)

### sonar-reviewer

| Field | Value |
|-------|-------|
| **Tags** | `guardia`, `sonarcloud`, `quality`, `code-smells` |
| **Focus** | SonarCloud quality gate status, code smells, bugs, vulnerabilities, coverage |
| **Key Question** | Does this PR pass the SonarCloud quality gate? |

Checks the PR's SonarCloud check-run via the GitHub API, retrieves annotations (issues with file/line references), classifies each as blocker/warning/suggestion, suggests concrete fixes, and parses coverage metrics. Scoring: 100 (gate passed, 0 issues) to 0 (gate failed, multiple bugs/vulnerabilities).

### test-reviewer

| Field | Value |
|-------|-------|
| **Tags** | `guardia`, `testing`, `coverage`, `jest` |
| **Focus** | Test coverage, test quality, missing tests, testing anti-patterns |
| **Key Question** | Does every changed source file have adequate, well-written tests? |

Maps source files to test files, runs `npx jest` with coverage for changed files, and analyzes test quality. Anti-patterns (score deductions): snapshot-heavy testing (-15), no user interaction tests (-10), testing implementation details (-10), unexplained test.skip (-5), no error/edge case coverage (-10). Good patterns (bonuses): behavior-driven descriptions (+5), accessibility testing (+5), integration tests (+5), proper async handling (+5). Coverage thresholds: statements >= 80%, branches >= 70%.

### react-reviewer

| Field | Value |
|-------|-------|
| **Tags** | `guardia`, `react`, `frontend`, `components` |
| **Focus** | React performance, correctness, architecture, accessibility, Next.js patterns |
| **Key Question** | Is this React code performant, correct, and accessible? |

Runs `react-doctor` for automated scanning (50% of score weight) and performs manual pattern analysis (50%). Checks: performance issues (object literals in props, missing keys, functions defined in render, components >200 lines), correctness issues (useEffect missing deps, state updates on unmounted components, incorrect conditional rendering), architecture issues (prop drilling >3 levels, business logic in components, client components that could be server), Next.js specifics (missing "use client", server components importing client modules, missing Suspense boundaries), and accessibility (images without alt, buttons without names, missing ARIA).

### security-reviewer

| Field | Value |
|-------|-------|
| **Tags** | `guardia`, `security`, `owasp`, `vulnerabilities` |
| **Focus** | OWASP Top 10 frontend vulnerabilities, secrets, auth, data exposure |
| **Key Question** | Does this PR introduce any security vulnerabilities? |

Scans for: secrets and credentials (API keys, tokens, passwords, base64-encoded credentials, private keys), XSS vulnerabilities (dangerouslySetInnerHTML, innerHTML, eval, document.write), injection vulnerabilities (SQL, command, path traversal), authentication issues (tokens in localStorage, missing CSRF protection, session exposure in URLs), data exposure (PII in logs, sensitive data in errors, debug mode left enabled), dependency security (npm audit of new deps), and Next.js security (missing CSP headers, server actions without validation, API routes without rate limiting). Secrets found are always blockers (-50 points).

### workflow-reviewer

| Field | Value |
|-------|-------|
| **Tags** | `guardia`, `ci-cd`, `github-actions`, `workflows` |
| **Focus** | CI/CD check status, workflow configuration, branch protection, deploy readiness |
| **Key Question** | Are all checks passing and is this PR ready to merge? |

Runs `gh pr checks` to get status of all CI checks, flags failing or pending checks, verifies workflow configuration if `.github/workflows/` files changed (triggers, secrets, job dependencies, timeouts, caches), checks branch protection compliance (required reviews, required checks, up-to-date with base, no merge conflicts), and assesses deploy readiness (not draft, mergeable, all checks passing).

### bundle-reviewer

| Field | Value |
|-------|-------|
| **Tags** | `guardia`, `performance`, `dependencies`, `bundle-size` |
| **Focus** | Bundle size impact, new dependencies, tree-shaking, code splitting, asset optimization |
| **Key Question** | Does this PR bloat the bundle or miss optimization opportunities? |

Analyzes new dependencies (size, tree-shakeability, maintenance status, popularity), checks imports for barrel import anti-patterns and missing code splitting, identifies dynamic import opportunities for conditionally rendered components, and checks asset optimization (images not using Next.js Image, unoptimized SVGs, inefficient font loading). Scoring: -15 per large dependency (>50KB gzipped), -10 per barrel import of large library, -5 per missed code splitting opportunity.

### Tips for Getting the Best Output from Review Agents

1. **Keep PRs small.** Review agents work best on focused PRs. Branches with 200-500 lines get the most actionable feedback.
2. **Ensure CI is running.** The sonar-reviewer and workflow-reviewer depend on GitHub check runs. If CI has not run on the latest commit, their analysis is limited.
3. **Update package.json carefully.** The bundle-reviewer and security-reviewer both analyze dependency changes. Pin versions and prefer smaller, well-maintained packages.
4. **Address blockers first.** The synthesized report prioritizes blockers over warnings over suggestions. Fix blockers and re-run `/guardia` to validate.
