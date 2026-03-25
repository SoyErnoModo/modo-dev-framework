# Use Cases

16 realistic scenarios showing the MODO Dev Framework in action, organized by role. Each use case includes the scenario context, step-by-step commands, what the framework does at each step, and the expected outcome.

---

## For Developers

### 1. Starting a New Feature from a Linear Ticket

**Scenario**: You are assigned ticket MOD-2045 "Add promo code validation to checkout flow." The ticket has 5 acceptance criteria. You want to set up the feature lifecycle before writing any code.

**Steps**:

1. Start the feature lifecycle:
   ```
   /dev-start MOD-2045
   ```
2. The framework fetches the ticket from Linear, runs the criteria-validator agent on the 5 ACs, creates the vault directory at `~/Documents/dev-vault/features/2026-03/MOD-2045-promo-code-validation/`, and presents the AC score.
3. Review the output. The criteria-validator flags AC-3 ("Promo codes should work properly") as vague (clarity: 8/25) and suggests rewriting it to "Valid promo code reduces cart total by the discount percentage; expired codes show error message with expiration date."
4. Refine the AC in the ticket, then check out the suggested branch:
   ```bash
   git checkout -b feat/MOD-2045-promo-code-validation
   ```
5. Optionally notify the team:
   ```
   /dev-notify started
   ```

**Outcome**: You have a structured vault, validated ACs, a named branch, and the team is informed. Development begins with clear expectations.

---

### 2. Doing a Self-Review Before PR

**Scenario**: You have been working on MOD-2045 for two days. Before creating the PR, you want to catch issues yourself.

**Steps**:

1. Run a progress check:
   ```
   /dev-check
   ```
2. Review the output: 4/5 ACs are done, quality score is 74/100. The code-auditor flags two warnings: a function with cognitive complexity 18 (limit is 15) and a source file with no tests.
3. Fix the complexity issue by extracting a helper function. Write tests for the untested file.
4. Run the deep critique:
   ```
   /dev-critique
   ```
5. The solution-critic returns GOOD_WITH_CONCERNS: the promo validation logic is well-structured, but there is no error boundary around the async promo code API call and the component is 230 lines (should be under 200).
6. Split the component and add an error boundary.
7. Run one more quick check:
   ```
   /dev-check --quick
   ```
8. Quality score is now 91/100 with 5/5 ACs done. Create your PR.

**Outcome**: You identified and fixed 4 issues before any reviewer saw the code. The PR will be cleaner and the review cycle shorter.

---

### 3. Getting Unstuck on a Bug

**Scenario**: A user reports that promo codes intermittently fail to apply. The error message in Sentry is "TypeError: Cannot read property 'discount' of undefined." You are not sure where to start.

**Steps**:

1. Use the bug analysis prompt:
   ```
   Ask Claude: "Use the bug-analysis prompt with error_message 'TypeError: Cannot read property discount of undefined' and context 'Intermittent failure when applying promo codes in checkout. Started after deploy v3.2.1. Frequency: ~30/day.'"
   ```
2. The prompt guides a 4-phase investigation:
   - **Reproduce**: Identifies that the bug is environment-specific (production only) and data-dependent (only for expired promo codes where the API returns null instead of an error).
   - **Root cause**: Traces the data flow and finds that the API client does not handle the null response case -- it passes the raw API response to the discount calculator without null checking.
   - **Fix**: Suggests adding a null check with a user-friendly error message.
   - **Regression test**: Proposes a test that mocks a null API response and verifies the error is caught.
3. Implement the fix, write the regression test.
4. Run the fix through `/dev-check` to verify quality.

**Outcome**: Structured investigation instead of scattered debugging. The fix includes a regression test, and the root cause is documented for the post-mortem.

---

### 4. Writing an ADR for a Technical Decision

**Scenario**: Your team is debating whether to use Redis or a database-backed queue for promo code validation retries. You need to document the decision.

**Steps**:

1. Use the ADR prompt:
   ```
   Ask Claude: "Use the adr-decision prompt with decision_title 'Promo code retry queue implementation', context 'Need reliable retry mechanism for promo code validation API calls that fail. Current in-process retry loses state on server restart.', options 'Redis with Bull, PostgreSQL with pg-boss, In-memory with setTimeout'"
   ```
2. The prompt produces a complete ADR with:
   - Context expansion (what triggered the decision, constraints, current state)
   - Decision drivers (reliability, operational complexity, team familiarity)
   - Three options analyzed with pros/cons, effort (S/M/L/XL), risk, and reversibility
   - Recommended decision with rationale referencing specific drivers
   - Consequences (positive, negative, neutral)
   - Implementation plan (3 phases with validation criteria)
3. Review and adjust the ADR, then add it to the vault's `decisions.md`.

**Outcome**: A structured, reviewable decision record that captures the reasoning, not just the choice. Future team members understand why this approach was selected.

---

### 5. Generating API Documentation

**Scenario**: You built a new endpoint `POST /api/v1/promo-codes/validate` and need to document it for the frontend team.

**Steps**:

1. Use the api-docs prompt:
   ```
   Ask Claude: "Use the api-docs prompt with endpoint '/api/v1/promo-codes/validate', method 'POST', base_url 'https://api.modo.com.ar', request_schema '{ code: string, cart_total: number, user_id: string }', response_schema '{ valid: boolean, discount_amount: number, discount_type: percentage|fixed, new_total: number, expiry: ISO8601 }'"
   ```
2. The prompt generates comprehensive documentation:
   - Endpoint summary table (URL, method, auth, rate limit, idempotency, cache policy)
   - Authentication details (Bearer token, scopes, expiry behavior)
   - Headers table
   - Request body with JSON example and TypeScript interface
   - Success response with TypeScript interface
   - Error responses table (400, 401, 403, 404, 409, 422, 429, 500)
   - Usage examples (cURL and TypeScript fetch)
   - Rate limiting details
3. Copy the documentation into your project's API docs.

**Outcome**: A frontend developer can integrate the endpoint without reading the backend source code. All error cases are documented.

---

## For Tech Leads

### 6. Running a Comprehensive PR Review

**Scenario**: A junior developer submitted PR #789 with 450 lines of changes across 12 files. You want a thorough automated review before doing your manual review.

**Steps**:

1. Run Guardia:
   ```
   /guardia 789
   ```
2. Six agents analyze the PR in parallel. Results come back in about 60 seconds.
3. The report shows:
   - Overall score: 68/100 (NEEDS_DISCUSSION)
   - SonarCloud: 82 (pass) -- 2 code smells
   - Tests: 55 (fail) -- 3 source files with no test files, branch coverage at 58%
   - React: 75 (pass) -- missing key prop in one list, one component at 240 lines
   - Security: 90 (pass) -- no issues
   - CI/CD: 100 (pass) -- all checks green
   - Bundle: 85 (pass) -- one new dependency (acceptable size)
4. You see 2 blockers (missing tests, component too large) and 3 warnings.
5. Share the report with the developer as a PR comment and ask them to address blockers before your manual review.

**Outcome**: You identified the critical issues in 60 seconds instead of a 30-minute manual review. Your manual review can focus on architecture and logic instead of finding missing tests.

---

### 7. Planning a Sprint from an Epic

**Scenario**: You need to plan the "Promo Code System" epic across 3 sprints with a team of 4 developers.

**Steps**:

1. Use the sprint plan prompt:
   ```
   Ask Claude: "Use the sprint-plan prompt with epic_name 'Promo Code System', capacity '4 devs', duration '3 sprints', priorities '1. Core validation API, 2. Checkout integration, 3. Admin dashboard, 4. Analytics and reporting'"
   ```
2. The prompt produces:
   - Epic breakdown into discrete work items with complexity (S/M/L/XL), type, and dependencies
   - Phase allocation: Foundation (Sprint 1: types, contracts, feature flags), Features (Sprint 2: API + checkout), Polish + QA (Sprint 3: admin dashboard, analytics, E2E)
   - Dependency graph with critical path identification
   - Risk assessment (4 categories: technical, dependency, scope, capacity)
   - Team allocation matrix (developer x sprint) at 80% capacity
   - Sprint summary table
3. Review the plan with the team, adjust based on their input, and create tickets.

**Outcome**: A structured, phased plan with clear dependencies, risk mitigation, and capacity-aware assignments. The team starts Sprint 1 with confidence.

---

### 8. Creating a Tech Spec from a PRD

**Scenario**: Product delivered a PRD for a new "Merchant Promo Dashboard." You need to turn it into a technical specification the team can implement.

**Steps**:

1. Use the tech-spec prompt:
   ```
   Ask Claude: "Use the tech-spec prompt with feature_name 'Merchant Promo Dashboard', requirements 'Display active and expired promos per merchant. Filter by date range, status, and promo type. Show redemption count and revenue impact. Export to CSV. Real-time updates when promos are redeemed.', existing_apis 'GET /api/v1/merchants/:id/promos, GET /api/v1/promos/:id/stats, WebSocket /ws/promo-events'"
   ```
2. The prompt generates a 10-section spec:
   - Overview, stack analysis, API integration (mapping requirements to existing endpoints, flagging gaps)
   - Design system compliance (component inventory from the MODO UI library, Remote Config keys, responsive behavior, a11y)
   - Data model, component architecture, gap analysis table
   - Testing strategy, implementation plan (ordered tasks with dependencies), open questions
3. Get the spec peer-reviewed, then create the implementation tasks.

**Outcome**: A complete, implementable specification that any team member can follow. API gaps are identified before implementation starts, preventing mid-sprint blockers.

---

### 9. Reviewing Architecture with the Leadership Council

**Scenario**: Your team is about to ship a significant new payment processing module. You want a comprehensive multi-perspective review before it goes to production.

**Steps**:

1. Ensure the branch has been through `/dev-check` and `/dev-critique` first (the council uses previous results).
2. Run the full council:
   ```
   /dev-council
   ```
3. Eight personas review in parallel. The report returns with:
   - Council Grade: B (82/100)
   - Unanimously praised: clean separation of concerns, good test coverage
   - Unanimously flagged: no monitoring/alerting configured, missing rate limiting on the new endpoint
   - Conflicting: CTO wants to generalize the retry logic as a platform capability; Team Lead says keep it feature-specific for now
   - Must-fix: 2 items (monitoring, rate limiting)
   - Should-fix: 3 items
4. Address the must-fix items, then re-validate:
   ```
   /dev-council --quick
   ```
5. Quick council (4 personas) confirms the fixes. Grade improves to A- (88/100).

**Outcome**: You caught a monitoring gap and a security concern that would have caused a production incident. The conflicting opinions about platform generalization are documented for a future architecture discussion.

---

### 10. Onboarding a New Team Member

**Scenario**: A new developer joins the team. You want them productive within their first week using MODO conventions.

**Steps**:

1. Have them install the framework:
   ```bash
   claude plugins install --from github SoyErnoModo/modo-dev-framework
   ```
2. Point them to the [Getting Started](./GETTING-STARTED.md) guide for the end-to-end walkthrough.
3. Assign them a small ticket (S-size) and have them run the full lifecycle:
   ```
   /dev-start ONBOARD-001
   ```
   The AC validation teaches them what "good criteria" look like.
4. During development, have them run:
   ```
   /dev-check
   ```
   The code-auditor teaches them MODO quality standards (complexity limits, test coverage, React patterns) with specific file:line feedback.
5. Before their first PR:
   ```
   /dev-critique
   ```
   The solution-critic teaches them about architecture patterns, performance, and edge cases.
6. After the PR:
   ```
   /guardia
   ```
   Six review dimensions give them a comprehensive understanding of what the team values.

**Outcome**: The new developer learns MODO conventions through practice, not documentation reading. They get personalized feedback on their actual code. By the end of their first feature, they understand the quality standards, testing expectations, and review process.

---

## For Product/PM

### 11. Validating Acceptance Criteria Coverage

**Scenario**: As a Product Owner, you want to verify that your feature's acceptance criteria are fully implemented before accepting the sprint delivery.

**Steps**:

1. Ask the developer to run:
   ```
   /dev-check MOD-2045
   ```
2. Review the Acceptance Criteria Status table in the output:
   - Each AC shows status (done/in-progress/not-started), implementation evidence (file:line), and test evidence.
   - AC-3 shows "Deferred" with reason: "Admin UI for promo code management moved to Sprint 4 per PM request."
3. For the final validation:
   ```
   /dev-complete MOD-2045
   ```
   This runs the strict mode check where every AC must be "done" or explicitly "deferred" with a documented reason.

**Outcome**: You have concrete evidence that each AC is implemented and tested, not just a developer saying "it's done." Deferred items are tracked with reasons.

---

### 12. Getting a Feature Summary After Completion

**Scenario**: A feature shipped last week and you need a summary for stakeholder communication.

**Steps**:

1. Pull up the feature history:
   ```
   /dev-history MOD-2045
   ```
2. The framework reads the vault's `summary.md` and presents:
   - What was built (user-perspective description)
   - AC validation table (5/5 met, 0 deferred)
   - Quality metrics (coverage: 92%, complexity: all functions <10, zero SonarCloud issues)
   - Key decisions (chose Redis for retry queue -- ADR reference)
   - Challenges and solutions
   - Lessons learned
   - Duration: 8 working days (from /dev-start to /dev-complete)

**Outcome**: A stakeholder-ready summary without asking the developer to write a report. The summary was generated automatically as part of the development lifecycle.

---

### 13. Understanding Codebase Quality Metrics

**Scenario**: As a PM, you want to understand the team's quality trends for the quarterly review.

**Steps**:

1. Request aggregate stats:
   ```
   /dev-history --stats
   ```
2. The framework calculates from all completed features:
   - Total features completed this quarter: 14
   - Average lifecycle score: 81/100 (up from 72 last quarter)
   - Average duration: 6.2 days (down from 8.1 last quarter)
   - Average AC coverage: 94%
   - Grade distribution: 4 As, 7 Bs, 3 Cs
   - Common issues: missing monitoring (5 features), insufficient branch coverage (4 features)
   - Trend: quality improving, velocity increasing, monitoring is a systemic gap

**Outcome**: Data-driven quality insights for the quarterly review. The systemic monitoring gap becomes an action item for the next quarter's process improvement.

---

## For the Team

### 14. Setting Up a New Project with MODO Standards

**Scenario**: The team is starting a new project and wants MODO standards enforced from day one.

**Steps**:

1. Install the framework in the new project:
   ```bash
   claude plugins install --from github SoyErnoModo/modo-dev-framework
   ```
2. The plugin activates automatically. On the first session:
   - Hooks load MODO protocol context
   - Spec-first enforcement activates
   - Quality gates are active (80% coverage, complexity <15, no `any` types)
3. Customize the channel configuration for the new project:
   - Edit `instructions/modo-channels.md` to add the project's Slack channels
4. Run `npx @playsistemico/modo-dev-framework detect` to verify all AI tools are detected.
5. Create the first feature using `/dev-start` to initialize the dev-vault structure.

**Outcome**: The project starts with consistent quality standards, automated enforcement, and a documentation vault from the first commit.

---

### 15. Customizing Quality Thresholds for a Specific Repo

**Scenario**: Your team's legacy project cannot immediately meet the 80% test coverage threshold. You want to set a temporary lower bar while you incrementally improve coverage.

**Steps**:

1. Open the quality standards instruction:
   ```
   instructions/quality-standards.md
   ```
2. Adjust the thresholds in the "Code Quality Thresholds" table:
   ```markdown
   | Test coverage (new code) | 60% | 80% | SonarCloud |
   | Branch coverage | 50% | 70% | SonarCloud |
   ```
3. Add a note explaining the temporary adjustment and the timeline for reaching standard thresholds:
   ```markdown
   > **Note**: Thresholds temporarily reduced for legacy-project migration.
   > Target: reach standard thresholds (80%/70%) by Q3 2026.
   > Track progress via /dev-history --stats.
   ```
4. All agents will now use the adjusted thresholds for this repo.
5. Track progress monthly using `/dev-history --stats` to verify the team is trending toward standard thresholds.

**Outcome**: The team works with realistic thresholds instead of ignoring unachievable ones. The adjustment is documented and tracked, preventing it from becoming permanent technical debt.

---

### 16. Adding a New Prompt Template for Recurring Work

**Scenario**: Your team frequently writes migration guides for breaking API changes. You want a reusable prompt template.

**Steps**:

1. Create a new prompt file:
   ```
   prompts/documentation/migration-guide.md
   ```
2. Add the frontmatter:
   ```yaml
   ---
   id: migration-guide
   title: "API Migration Guide"
   description: "Generate a migration guide for breaking API changes"
   category: documentation
   tags: [migration, api, breaking-changes, documentation]
   variables:
     - name: api_version_from
       description: "Previous API version"
       type: string
       required: true
     - name: api_version_to
       description: "New API version"
       type: string
       required: true
     - name: breaking_changes
       description: "List of breaking changes"
       type: string
       required: true
     - name: deadline
       description: "Migration deadline"
       type: string
       required: false
       defaultValue: "No deadline set"
   ---
   ```
3. Write the prompt body with `{variable}` placeholders:
   ```markdown
   # Migration Guide: API {api_version_from} to {api_version_to}

   Generate a migration guide for consumers of the MODO API...

   **Breaking Changes**: {breaking_changes}
   **Deadline**: {deadline}

   ## Instructions
   For each breaking change, provide:
   1. What changed (before vs after)
   2. Why it changed
   3. Code example showing the migration (old code -> new code)
   4. Timeline for deprecation of the old behavior
   ```
4. Rebuild the MCP server or restart your session. The new prompt is immediately available:
   ```json
   { "name": "search_prompts", "arguments": { "tags": ["migration"] } }
   ```
5. Use the prompt:
   ```
   Ask Claude: "Use the migration-guide prompt with api_version_from 'v1', api_version_to 'v2', breaking_changes 'POST /payments now requires idempotency-key header; response shape changed from flat to nested', deadline '2026-06-01'"
   ```

**Outcome**: The team has a reusable, consistent template for migration guides. Every migration guide follows the same structure, reducing the effort from scratch-writing to filling in specifics.
