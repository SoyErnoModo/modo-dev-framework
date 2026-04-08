---
name: cicd-pipeline-optimization
description: Optimize CI/CD pipeline for faster builds and deployments. Use when modifying GitHub Actions workflows or build processes.
---

# CI/CD Pipeline Optimization

## When to Use
- Manual invoke when modifying CI/CD
- Reference for build optimization

## Current Issues

### 1. Duplicate Workflows
`e2e.yaml` and `playwright.yml` are identical. Consolidate into one.

### 2. CD Cache Invalidation (4 duplicate jobs)
Replace with matrix strategy in `cd.yaml`.

### 3. Package Manager Inconsistency
E2E workflows use `yarn`, main project uses `pnpm`. Align to `pnpm`.

### 4. Build ID Strategy
Current: timestamp. Better: Git SHA for traceability.

### 5. Concurrency Groups
Add to prevent duplicate runs:
```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

## Workflow Map
| Workflow | Trigger | Purpose |
|----------|---------|---------|
| ci.yaml | Push to main | Build + SonarQube |
| pr.yaml | PR on main | Validate PRs |
| cd.yaml | PR close / manual | Deploy to envs |
| ci-alpha.yaml | Manual | Alpha releases |
| e2e.yaml | Manual | E2E + CI alpha |
| playwright.yml | Manual | E2E only (DUPLICATE) |
| cache-cleaner.yaml | Manual | CloudFront cache |
| catalog.yaml | Push to catalog/ | IaC management |
| ssm.yaml | Push to parameters/ | SOPS validation |
