---
name: github-actions-security
description: Audit and harden GitHub Actions workflows. Auto-invoke when editing files in .github/workflows/. Covers action version upgrades, secret management, and pipeline consolidation.
---

# GitHub Actions Security for modo-landing

## When to Use
- Auto-invoke when editing any file in `.github/workflows/`
- Manual invoke for CI/CD security audits

## Critical Action Version Upgrades

### IMMEDIATE (Security Risk)
| Current | Target | File | Risk |
|---------|--------|------|------|
| `aws-actions/configure-aws-credentials@v1` | `@v4` | cd.yaml | v1 uses deprecated Node 12 runner |
| `actions/checkout@v3` | `@v4` | e2e.yaml, playwright.yml | Outdated |
| `actions/setup-node@v3` | `@v4` | e2e.yaml, playwright.yml | Outdated |
| `actions/upload-artifact@v3` | `@v4` | e2e.yaml, playwright.yml | v3 deprecated |
| `actions/github-script@v6` | `@v7` | cache-cleaner.yaml | Outdated |

### Org Workflows Audit
All 7 reusable workflows are pinned to `@v1`:
- `playsistemico/workflows/.github/workflows/ci-ms.yaml@v1`
- `playsistemico/workflows/.github/workflows/cd-ms.yaml@v1`
- `playsistemico/workflows/.github/workflows/pr-ms.yaml@v1`
Coordinate with DevOps team to verify @v1 is latest or upgrade needed.

## Hardcoded Secrets to Move
In `cd.yaml`, CloudFront distribution IDs are hardcoded:
- develop: `E2QJLMWRLEIYP0`
- qa: `ETF746X95H4TU`
- preprod: `E3OUUNWYD3VF1G`
- production: `E1FTIUUSM13SGZ`
These should be GitHub Secrets or SSM parameters.

## Package Manager Inconsistency
- Main project: `pnpm`
- `e2e.yaml`: uses `yarn`
- `playwright.yml`: uses `yarn`
All workflows must use `pnpm` for consistency.

## Duplicate Workflows
`e2e.yaml` and `playwright.yml` are essentially the same. Consolidate into one.

## Rules for New/Modified Workflows
1. Pin all actions to specific SHA or major version tag (@v4)
2. Use `concurrency` groups to prevent duplicate runs
3. Never hardcode secrets in workflow files
4. Always use `pnpm` as package manager
5. Set `permissions` explicitly (least privilege)
6. Use `GITHUB_TOKEN` with minimal scopes
