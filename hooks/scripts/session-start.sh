#!/bin/bash
# MODO Dev Framework — Session Start Hook
# Injects the MODO protocol context at session startup

set -euo pipefail

PLUGIN_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

# Read input from stdin (Claude Code sends session context)
INPUT=$(cat)

# Build the system message with MODO protocol context
cat << 'PROTOCOL_EOF'
{
  "systemMessage": "## MODO Dev Framework — ACTIVE\n\nThe MODO Development Framework is loaded. All team rules are enforced:\n\n### Active Protocols\n- **Spec-First**: No production code without a plan/spec\n- **Lifecycle Tracking**: Features tracked from ticket to production\n- **Quality Gates**: 80% coverage min, complexity <15, no `any` types\n- **MODO Patterns**: Use UI library, Remote Config, centralized APIs\n\n### Available Commands\n- `/dev-start <ticket>` — Initialize feature lifecycle\n- `/dev-check` — Validate progress and quality\n- `/dev-critique` — Architecture review before PR\n- `/dev-council` — 8-persona leadership review\n- `/dev-complete` — Finalize after merge\n- `/guardia <PR>` — Parallel 6-agent PR review\n\n### Quick Reference\n- **UI Library**: `@playsistemico/modo-sdk-web-ui-lib` (check before creating components)\n- **Design Tokens**: Use `var(--color-default)`, never hardcode hex values\n- **APIs**: Centralized in `src/shared/services/`, type-safe parameters\n- **Commits**: Sentry conventional commits `<type>(<scope>): <subject>`\n\nReady to work. Use `/dev-start <ticket>` to begin tracked development."
}
PROTOCOL_EOF
