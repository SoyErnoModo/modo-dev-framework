---
name: modo-tech-architect
description: >
  AI Technical Architect for MODO projects. Analyzes PRDs, consults MODO resources (Swagger APIs, Confluence docs, GitHub repos), identifies gaps, and generates comprehensive technical documentation including OpenSpec specs, implementation plans, sprint breakdowns, and Jira tasks.

  Use when: (1) Starting a new MODO project from a PRD, (2) Analyzing technical feasibility of features, (3) Creating technical specs and implementation plans, (4) Identifying reusable MODO components and APIs, (5) Generating consolidated technical documentation.

  Triggers: analyze this PRD, create tech specs for, implementation plan for, what MODO APIs/components exist for.
tags: [architecture, prd, tech-spec, planning, swagger]
---

# MODO Technical Architect

AI-powered technical planning and architecture for MODO projects. Transforms PRDs into actionable technical specs with MODO-specific resource discovery.

## Core Capabilities

This skill automates the complete technical planning workflow:

1. **PRD Analysis** - Extract requirements and technical constraints
2. **Resource Discovery** - Find existing MODO APIs, libraries, and components
3. **Gap Analysis** - Identify what needs to be built vs what exists
4. **Spec Generation** - Create OpenSpec specs, ADRs, and technical docs
5. **Implementation Planning** - Generate sprint plans and Jira tasks
6. **Iterative Refinement** - Review and improve with user feedback

## Workflow

### Phase 1: Input & Context Gathering

**Accept any of these inputs:**
- PRD document (attached file or pasted text)
- Feature description ("Implement push notifications for promotions")
- User story ("As a user, I want to...")
- Technical requirement ("Integrate biometric authentication")

**Immediately ask the user for MODO resources:**

```
To analyze this properly, I need access to MODO's technical resources.
Please provide URLs/access for:

1. **Swagger/OpenAPI docs** (APIs available)
   Example: https://api.modo.com.ar/swagger
   Example: https://promoshub.modo.com.ar/api-docs

2. **Confluence spaces** (architecture patterns, best practices)
   Example: https://modo.atlassian.net/wiki/spaces/ENG
   Example: https://modo.atlassian.net/wiki/spaces/API

3. **GitHub organization/repos** (existing projects, libraries)
   Example: @playsistemico/*
   Example: modo-mobile-app, modo-web-platform

4. **Other resources** (optional)
   - Jira project key (for creating tasks): MODO-XXX
   - Design system URL
   - Component library docs

Provide what you have access to - we'll work with what's available.
```

**If user doesn't have all URLs:**
- Proceed with available resources
- Note gaps in final documentation
- Suggest who to contact for missing info

### Phase 2: Multi-Source Analysis

**For each resource type, execute specialized analysis:**

#### 2.1 Swagger/OpenAPI Analysis

Use `scripts/analyze_swagger.py` to:
- List all available endpoints
- Extract parameters (required vs optional)
- Identify authentication methods
- Map endpoints to PRD requirements

**Example execution:**
```bash
python scripts/analyze_swagger.py \
  --url https://promoshub.modo.com.ar/api-docs \
  --requirements "search promotions, get promo details, list banks"
```

**Output**: JSON mapping requirements → endpoints with gaps identified

#### 2.2 Confluence Documentation Search

Use `scripts/search_confluence.py` to:
- Search for architecture patterns
- Find existing tech specs
- Discover design system documentation
- Locate component libraries

**Example execution:**
```bash
python scripts/search_confluence.py \
  --space ENG \
  --queries "authentication,design system,API patterns,mobile SDK"
```

**Output**: Relevant Confluence pages with summaries

#### 2.3 GitHub Repository Analysis

**Use existing GitHub skill** to:
- Find similar projects
- Identify reusable components
- Check library versions
- Analyze implementation patterns

**Invoke GitHub skill:**
```
Analyze @playsistemico repositories for:
- UI component libraries (React, mobile)
- API client SDKs
- Design system implementations
- Projects similar to: [PRD description]
```

**Output**: List of reusable components, libraries, patterns

#### 2.4 Gap Identification

**Cross-reference PRD requirements with discovered resources:**

Create gap matrix:
| PRD Requirement | Existing API | Existing Component | Existing Docs | Status |
|-----------------|--------------|-------------------|---------------|--------|
| Search promotions | ✅ `/api/rewards/slots` | ✅ `SearchInput` | ✅ Confluence | Complete |
| Promo details | ❌ Missing | ❌ `PromoDetailCard` needed | 🟡 Partial | **GAP** |
| Deep linking | ❌ Missing | ❌ `CTAButton` needed | ❌ No docs | **CRITICAL GAP** |

**Categorize gaps:**
- 🔴 **Critical**: Blocks core functionality
- 🟡 **Important**: Affects UX/quality
- ⚪ **Minor**: Nice-to-have, polish

### Phase 3: Spec Generation

**Generate OpenSpec specs using opsx skills:**

#### 3.1 Create Change Artifact

```
Use opsx:new to create a new change:

Change name: [feature-name-from-PRD]
Description: [1-2 sentence summary]
```

#### 3.2 Generate Specs with opsx:ff

```
Use opsx:ff to fast-forward through all artifacts:
- proposal.md (context from PRD)
- design.md (architecture decisions)
- spec.md (technical specifications)
- plan.md (implementation plan)
```

**Fill artifacts with:**
- **Proposal**: PRD requirements + discovered resources
- **Design**: Architecture decisions based on MODO patterns
- **Spec**: Detailed specs referencing Swagger endpoints, libraries
- **Plan**: Sprint breakdown with tasks

#### 3.3 Create ADRs (if architectural decisions needed)

**When to create ADR:**
- Choosing between multiple approaches
- Significant architectural impact
- New pattern introduction

**Use template from `assets/adr-template.md`**

### Phase 4: Consolidated Documentation

**Generate TECHNICAL_IMPLEMENTATION_GUIDE.md**

Use template from `assets/tech-guide-template.md` and populate:

1. **Stack & Dependencies**
   - From GitHub analysis: existing libraries
   - From Confluence: approved tech stack
   - New dependencies needed (with justification)

2. **API Integration Details**
   - From Swagger: complete endpoint documentation
   - Parameters (required, optional, defaults)
   - Request/Response examples
   - Error handling patterns

3. **Design System & UI Library**
   - From Confluence: design tokens, color palette
   - From GitHub: UI component library
   - Gaps in component library

4. **Architecture**
   - Diagrams (Mermaid syntax)
   - Data flow
   - Integration points

5. **Implementation Workflow**
   - Checklist before coding
   - "Consult X before building Y"
   - References to MODO resources

6. **Glosario de Tecnologías**
   - MODO-specific tech stack
   - Libraries and their purposes
   - Acronyms and concepts

See `references/tech-guide-structure.md` for detailed sections.

### Phase 5: Sprint Planning

**Generate sprint breakdown:**

Use `scripts/generate_sprint_plan.py` to:
- Break down specs into tasks
- Estimate complexity (S/M/L/XL)
- Identify dependencies
- Suggest sprint allocation

**Sprint structure:**
```
Sprint 1 (Week 1): Foundation
- [ ] Critical API integrations
- [ ] Core components
- [ ] Design system setup

Sprint 2 (Week 2): Features
- [ ] Feature implementations
- [ ] Component development
- [ ] Integration testing

Sprint 3 (Week 3): Polish
- [ ] UI refinement
- [ ] Error handling
- [ ] Performance optimization

Sprint 4 (Week 4): QA & Deploy
- [ ] End-to-end testing
- [ ] Documentation
- [ ] Deployment
```

### Phase 6: Jira Task Creation (Optional)

**If user provides Jira project key:**

Use `scripts/create_jira_tasks.py` to:
- Create epics for each sprint
- Create stories from sprint tasks
- Link related tasks
- Set priority based on gaps (Critical → High priority)

**Example:**
```bash
python scripts/create_jira_tasks.py \
  --project MODO-CHATGPT \
  --sprint-plan sprint_plan.json \
  --assignee unassigned
```

**Output**: List of created Jira ticket URLs

### Phase 7: Enhanced PRD

**Generate improved PRD with technical details:**

Take original PRD and enrich with:
- ✅ API endpoints mapped to features
- ✅ Reusable components identified
- ✅ Technical constraints documented
- ✅ Implementation estimates
- ✅ Dependencies and risks

**Save as**: `PRD_[name]_TECHNICAL.md`

### Phase 8: Review & Iteration

**Present all generated artifacts:**

```
✅ Generated documentation:

1. OpenSpec Change: [change-name]
   - proposal.md
   - design.md
   - spec.md
   - plan.md

2. Technical Guide: TECHNICAL_IMPLEMENTATION_GUIDE.md
   - API integration details
   - Component inventory
   - Gap analysis
   - Implementation workflow

3. Sprint Plan: sprint_plan.md
   - 4 sprints breakdown
   - Task dependencies
   - Complexity estimates

4. Enhanced PRD: PRD_[name]_TECHNICAL.md

5. Jira Tasks: [if created]
   - Epic: MODO-XXX
   - Stories: MODO-XXX, MODO-XXX, ...

---

Review the documentation above. What would you like to:
- Clarify or expand?
- Adjust in the plan?
- Add or remove?

I can iterate on any part based on your feedback.
```

**Iterate based on user input:**
- Update specs
- Adjust sprint allocation
- Add missing details
- Refine architecture decisions

## Best Practices

### Before Starting

**Always ask for resources first** - Don't proceed without knowing what Swagger/Confluence/GitHub access is available.

**Understand the domain** - If PRD references MODO-specific concepts (e.g., "slots", "reintegro"), search Confluence first.

### During Analysis

**Prefer existing over new** - MODO has extensive libraries. Always check:
1. `@playsistemico/modo-sdk-web-ui-lib` for UI components
2. Remote Config for design system
3. Existing APIs before proposing new ones

**Document gaps, don't fill them** - If an API is missing, document it as a gap for backend team, don't invent the endpoint.

**Use MODO patterns** - Reference Confluence for:
- Naming conventions
- Code structure
- Architecture patterns

### During Spec Generation

**Be specific with references** - Link to:
- Exact Swagger endpoints with line numbers
- Specific Confluence pages
- GitHub file paths

**Include "why" not just "what"** - Explain architectural decisions:
- "Using `HubCardPromo` from UI lib because it matches PRD design and avoids custom components"

**Quantify estimates** - Don't say "a few weeks", say "2-3 weeks (8-12 sprints @ 2-3 days/sprint)"

### After Generation

**Validate completeness** - Check:
- [ ] All PRD requirements mapped
- [ ] All critical gaps identified
- [ ] Sprint plan is realistic
- [ ] Jira tasks are actionable

**Provide next steps** - End with:
- Who to contact for gaps (e.g., "Backend team for `obtener_detalle_promo` API")
- What to do first (e.g., "Start with Sprint 1: Setup Remote Config")

## Common Patterns

### Pattern 1: Web Feature with New API

**Scenario**: PRD requires new API endpoint

**Workflow**:
1. Search Swagger → Confirm API doesn't exist
2. Document as **CRITICAL GAP** in tech guide
3. Create separate spec for backend API
4. Frontend spec depends on backend completion
5. Suggest interim mock data approach

### Pattern 2: Mobile Feature with Existing SDK

**Scenario**: PRD maps to existing mobile SDK

**Workflow**:
1. Search GitHub → Find SDK repo
2. Read SDK docs/README
3. Identify SDK version and methods
4. Tech guide references SDK extensively
5. No gaps, just integration tasks

### Pattern 3: UI Component Missing

**Scenario**: PRD requires component not in UI lib

**Workflow**:
1. Search `@playsistemico/modo-sdk-web-ui-lib`
2. Check if similar component exists (can extend?)
3. If not → Document as gap
4. Spec includes component design (follow UI lib patterns)
5. Suggest contributing back to UI lib after implementation

## Troubleshooting

### "I don't have access to Swagger/Confluence"

**Solution**: Work with what's available
- Use GitHub analysis heavily
- Search for API docs in repos (openapi.yaml, swagger.json)
- Note in tech guide: "API docs not reviewed - validate endpoints"

### "PRD is vague on technical requirements"

**Solution**: Make assumptions, document them
- List assumptions in tech guide
- Ask user: "PRD mentions X, does this mean Y or Z?"
- Iterate after clarification

### "Too many gaps identified"

**Solution**: Prioritize
- Focus on critical gaps (blockers)
- Important gaps → separate phase
- Minor gaps → "Future improvements"

### "GitHub repos are private"

**Solution**: Ask for specific info
- "Can you share package.json from @playsistemico/modo-sdk-web-ui-lib?"
- "What components are in the UI library?"
- Work with provided info, note limitations

## Resources

### Scripts (see `scripts/`)

- `analyze_swagger.py` - Parse Swagger/OpenAPI, map to requirements
- `search_confluence.py` - Search Confluence spaces for patterns
- `generate_sprint_plan.py` - Convert specs to sprint tasks
- `create_jira_tasks.py` - Create Jira tickets from plan

### References (see `references/`)

- `tech-guide-structure.md` - Template for TECHNICAL_IMPLEMENTATION_GUIDE.md
- `modo-patterns.md` - Common MODO architectural patterns
- `api-documentation-guide.md` - How to document API integrations

### Assets (see `assets/`)

- `tech-guide-template.md` - Blank technical guide template
- `adr-template.md` - Architecture Decision Record template
- `sprint-plan-template.md` - Sprint planning template

## Examples

### Example 1: Promotions Feature

**Input**: PRD for "Search promotions with AI hints"

**Discovered Resources**:
- ✅ Swagger: `/api/rewards/slots` with `search_ia=true`
- ✅ GitHub: `@playsistemico/modo-sdk-web-ui-lib` has `HubCardPromo`
- ✅ Confluence: "Design System - Promotion Cards" page

**Gaps Identified**:
- 🔴 Missing: `/api/rewards/promo/{id}` for detail view
- 🟡 Component: `PromoDetailCard` not in UI lib

**Generated**:
- OpenSpec spec with API integration
- Tech guide with Swagger endpoint details
- 3 sprint plan (API gap handled separately)
- 12 Jira tasks created

### Example 2: Authentication Feature

**Input**: "Implement biometric authentication"

**Discovered Resources**:
- ❌ No Swagger docs for auth (user doesn't have access)
- ✅ GitHub: Found `@playsistemico/modo-auth-sdk`
- ✅ Confluence: "Mobile Authentication Patterns"

**Approach**:
- Tech guide references Confluence patterns
- Specs based on SDK docs from GitHub
- Note: "Validate auth endpoints with backend team"

**Generated**:
- ADR: "Why biometric over password-only"
- Tech guide with SDK integration
- 2 sprint plan (auth is well-defined)

---

**Next**: Ready to analyze a PRD? Provide the PRD and MODO resource URLs to begin.
