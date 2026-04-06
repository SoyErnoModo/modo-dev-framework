#!/bin/bash
# MODO Dev Framework — Continuation Enforcement (Stop hook)
#
# Runs when Claude is about to stop. Validates work completeness.
# Checks for uncommitted changes, unpushed commits, and test/build failures.
#
# NEVER blocks. Injects a completion checklist reminder.

set -euo pipefail

INPUT=$(cat)

CWD=$(echo "$INPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get('cwd', ''))
except:
    print('')
" 2>/dev/null || echo "")

SESSION_ID=$(echo "$INPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get('session_id', ''))
except:
    print('')
" 2>/dev/null || echo "")

# ── Collect signals

WARNINGS=""

# Check 1: Uncommitted changes
if [ -n "$CWD" ] && [ -d "$CWD/.git" ]; then
  DIRTY=$(cd "$CWD" && git status --porcelain 2>/dev/null | head -20)
  if [ -n "$DIRTY" ]; then
    CHANGED_COUNT=$(echo "$DIRTY" | wc -l | tr -d ' ')
    WARNINGS="${WARNINGS}\\n- **Uncommitted changes**: ${CHANGED_COUNT} file(s) modified but not committed"
  fi

  UNPUSHED=$(cd "$CWD" && git log --oneline @{upstream}..HEAD 2>/dev/null | head -5)
  if [ -n "$UNPUSHED" ]; then
    PUSH_COUNT=$(echo "$UNPUSHED" | wc -l | tr -d ' ')
    WARNINGS="${WARNINGS}\\n- **Unpushed commits**: ${PUSH_COUNT} commit(s) not pushed to remote"
  fi
fi

# Check 2: Session metrics (test/build failures)
METRICS_FILE="/tmp/modo-boost/${SESSION_ID:-default}.metrics"
if [ -f "$METRICS_FILE" ]; then
  if grep -q "test_fail=true" "$METRICS_FILE" 2>/dev/null; then
    WARNINGS="${WARNINGS}\\n- **Failing tests**: Last test run had failures"
  fi
  if grep -q "build_fail=true" "$METRICS_FILE" 2>/dev/null; then
    WARNINGS="${WARNINGS}\\n- **Build errors**: Last build had errors"
  fi
fi

# No warnings? Clean exit.
[ -z "$WARNINGS" ] && exit 0

# ── Inject completion checklist
cat << EOF
{
  "systemMessage": "## MODO Completion Check\\n\\nBefore wrapping up:${WARNINGS}\\n\\n**Quick resolution**: Ask the user if they want you to commit, push, or fix failing tests before stopping."
}
EOF

exit 0
