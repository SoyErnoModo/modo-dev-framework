#!/bin/bash
# MODO Dev Framework — Post-Compaction Recovery Hook
# Re-injects critical context after conversation compaction

set -euo pipefail

INPUT=$(cat)

cat << 'RECOVERY_EOF'
{
  "systemMessage": "## MODO Dev Framework — Context Recovery\n\nPost-compaction: MODO protocols re-activated.\n\n**Active rules**: Spec-first enforcement, quality gates (80% coverage, <15 complexity), MODO patterns (UI lib first, Remote Config for tokens, centralized APIs).\n\n**Commands available**: /dev-start, /dev-check, /dev-critique, /dev-council, /dev-complete, /guardia\n\n**Key patterns**: Use `@playsistemico/modo-sdk-web-ui-lib`, `var(--color-default)`, Sentry conventional commits."
}
RECOVERY_EOF
