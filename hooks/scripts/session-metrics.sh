#!/bin/bash
# MODO Dev Framework — Session Metrics (PostToolUse)
#
# Lightweight tracker: counts tool calls, file modifications, and
# flags test/build failures. Single atomic awk pass per invocation.
#
# Must be FAST (<2s timeout). No output to stdout (silent tracker).

set -euo pipefail

INPUT=$(cat)

# Parse all fields in a single python call for efficiency
eval "$(echo "$INPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(f'TOOL_NAME={json.dumps(data.get(\"tool_name\", data.get(\"name\", \"\")))}')
    ti = data.get('tool_input', data.get('input', data.get('parameters', '')))
    print(f'TOOL_INPUT={json.dumps(str(ti) if not isinstance(ti, str) else ti)}')
    to = data.get('tool_output', data.get('output', ''))
    print(f'TOOL_OUTPUT={json.dumps(str(to)[:500] if to else \"\")}')
    print(f'SESSION_ID={json.dumps(data.get(\"session_id\", \"default\"))}')
except:
    print('TOOL_NAME=\"\"')
    print('TOOL_INPUT=\"\"')
    print('TOOL_OUTPUT=\"\"')
    print('SESSION_ID=\"default\"')
" 2>/dev/null)"

# ── Metrics file
METRICS_DIR="/tmp/modo-boost"
mkdir -p "$METRICS_DIR"
METRICS_FILE="${METRICS_DIR}/${SESSION_ID}.metrics"

# Initialize if first call
if [ ! -f "$METRICS_FILE" ]; then
  cat > "$METRICS_FILE" <<EOF
start_time=$(date +%s)
tool_calls=0
files_written=0
files_edited=0
bash_commands=0
searches=0
test_fail=false
build_fail=false
EOF
fi

# ── Single awk pass: read, increment, write atomically
awk -v tool="$TOOL_NAME" -v tinput="$TOOL_INPUT" -v toutput="$TOOL_OUTPUT" '
BEGIN { FS="="; OFS="=" }
{
  key=$1; val=$2
  if (key == "tool_calls") val = val + 1
  else if (key == "files_written" && tool == "Write") val = val + 1
  else if (key == "files_edited" && tool == "Edit") val = val + 1
  else if (key == "bash_commands" && tool == "Bash") val = val + 1
  else if (key == "searches" && (tool == "Grep" || tool == "Glob")) val = val + 1
  else if (key == "test_fail" && tool == "Bash") {
    if (tinput ~ /(test|jest|vitest|mocha|pytest)/) {
      if (toutput ~ /(FAIL|failed|Exit code: [1-9])/) val = "true"
      else val = "false"
    }
  }
  else if (key == "build_fail" && tool == "Bash") {
    if (tinput ~ /(build|compile|tsc|webpack|vite|next build)/) {
      if (toutput ~ /(error|failed|Exit code: [1-9])/) val = "true"
      else val = "false"
    }
  }
  print key "=" val
}
' "$METRICS_FILE" > "${METRICS_FILE}.tmp" && mv "${METRICS_FILE}.tmp" "$METRICS_FILE"

# Silent — no stdout output
exit 0
