#!/bin/bash
# MODO Dev Framework — Tool Watcher Hook
# Monitors Write/Edit tool calls and warns when source code is written without plan/specs

set -euo pipefail

INPUT=$(cat)

# Extract tool name and file path
TOOL_NAME=$(echo "$INPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get('tool_name', data.get('name', '')))
except:
    print('')
" 2>/dev/null || echo "")

FILE_PATH=$(echo "$INPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    params = data.get('tool_input', data.get('input', data.get('parameters', {})))
    if isinstance(params, dict):
        print(params.get('file_path', params.get('path', '')))
    else:
        print('')
except:
    print('')
" 2>/dev/null || echo "")

# Only monitor Write and Edit tools
if [ "$TOOL_NAME" != "Write" ] && [ "$TOOL_NAME" != "Edit" ]; then
    echo '{}'
    exit 0
fi

# Skip if no file path
if [ -z "$FILE_PATH" ]; then
    echo '{}'
    exit 0
fi

# Skip non-source-code files
EXTENSION="${FILE_PATH##*.}"
case "$EXTENSION" in
    md|json|yaml|yml|toml|ini|cfg|conf|env|lock|log|txt|csv)
        echo '{}'
        exit 0
        ;;
esac

# Skip config files
BASENAME=$(basename "$FILE_PATH")
case "$BASENAME" in
    package.json|tsconfig*|jest*|.eslint*|.prettier*|*.config.*|Dockerfile|docker-compose*|Makefile|*.lock)
        echo '{}'
        exit 0
        ;;
esac

# Skip test files
if echo "$FILE_PATH" | grep -qiE "(test|spec|__test__|__spec__|\.test\.|\.spec\.|/tests/|/__tests__/)"; then
    echo '{}'
    exit 0
fi

# Skip plans, specs, docs, node_modules
if echo "$FILE_PATH" | grep -qiE "(\.claude/|openspec/|\.specs/|node_modules/|\.git/|dev-vault/)"; then
    echo '{}'
    exit 0
fi

# This is source code — check for plan/specs
PROJECT_ROOT="$(pwd)"

HAS_PLAN=false
if [ -d "$PROJECT_ROOT/.claude/plans" ] && [ "$(find "$PROJECT_ROOT/.claude/plans" -name "*.md" -maxdepth 1 2>/dev/null | head -1)" ]; then
    HAS_PLAN=true
fi

HAS_SPECS=false
if [ -d "$PROJECT_ROOT/openspec" ] && [ "$(find "$PROJECT_ROOT/openspec" -name "*.md" -maxdepth 2 2>/dev/null | head -1)" ]; then
    HAS_SPECS=true
fi
if [ -d "$PROJECT_ROOT/.specs" ] && [ "$(find "$PROJECT_ROOT/.specs" -name "*.md" -maxdepth 2 2>/dev/null | head -1)" ]; then
    HAS_SPECS=true
fi

if [ "$HAS_PLAN" = true ] || [ "$HAS_SPECS" = true ]; then
    echo '{}'
    exit 0
fi

# Source code written without plan or specs — warn
cat << EOF
{
  "systemMessage": "## MODO Tool Watcher\n\nSource code written to \`$BASENAME\` without an active plan or specs. Consider pausing to create a plan (EnterPlanMode) or specs (/dev-start) before continuing."
}
EOF
