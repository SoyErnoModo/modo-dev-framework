#!/bin/bash
# MODO Dev Framework — Prompt Interceptor Hook
# Analyzes user prompts for code generation intent and enforces spec-first discipline

set -euo pipefail

INPUT=$(cat)

# Extract the user's prompt text
PROMPT=$(echo "$INPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    # Handle different input formats
    prompt = data.get('query', data.get('content', data.get('prompt', '')))
    if isinstance(prompt, list):
        prompt = ' '.join([p.get('text', str(p)) for p in prompt if isinstance(p, dict)] + [str(p) for p in prompt if not isinstance(p, dict)])
    print(str(prompt).lower())
except:
    print('')
" 2>/dev/null || echo "")

# If we couldn't extract prompt, pass through
if [ -z "$PROMPT" ]; then
    echo '{"decision": "allow"}'
    exit 0
fi

# --- Intent Classification ---

# Research/question intent — always allow
RESEARCH_PATTERNS="explain|search|what is|how does|how do|why does|show me|tell me|describe|list|find|look up|investigate|explore|analiz|review|read|check|qué es|cómo|por qué|cuál|dónde|explica|busca|investiga|muestra|dame info|contame"
if echo "$PROMPT" | grep -qiE "$RESEARCH_PATTERNS"; then
    echo '{"decision": "allow"}'
    exit 0
fi

# Planning intent — allow and encourage
PLANNING_PATTERNS="plan|design|spec|architecture|architect|proposal|propose|strateg|roadmap|planifica|diseña|especifica|propone"
if echo "$PROMPT" | grep -qiE "$PLANNING_PATTERNS"; then
    echo '{"decision": "allow"}'
    exit 0
fi

# Config/settings intent — always allow
CONFIG_PATTERNS="config|setting|install|setup|permission|hook|plugin|env|variable|\.env|package\.json|tsconfig|eslint|prettier"
if echo "$PROMPT" | grep -qiE "$CONFIG_PATTERNS"; then
    echo '{"decision": "allow"}'
    exit 0
fi

# Code generation intent
CODE_PATTERNS="create|implement|build|code|develop|write|add feature|add component|fix bug|refactor|genera|crea|implementa|construi|desarrolla|escribi|agrega|hace|haceme|arma|armame|programa"
if ! echo "$PROMPT" | grep -qiE "$CODE_PATTERNS"; then
    # No code intent detected, allow
    echo '{"decision": "allow"}'
    exit 0
fi

# --- Code intent detected: check for plan/specs ---

# Find project root (look for common markers)
PROJECT_ROOT="$(pwd)"

# Check for active plans
HAS_PLAN=false
if [ -d "$PROJECT_ROOT/.claude/plans" ] && [ "$(find "$PROJECT_ROOT/.claude/plans" -name "*.md" -maxdepth 1 2>/dev/null | head -1)" ]; then
    HAS_PLAN=true
fi

# Check for specs
HAS_SPECS=false
if [ -d "$PROJECT_ROOT/openspec" ] && [ "$(find "$PROJECT_ROOT/openspec" -name "*.md" -maxdepth 2 2>/dev/null | head -1)" ]; then
    HAS_SPECS=true
fi
if [ -d "$PROJECT_ROOT/.specs" ] && [ "$(find "$PROJECT_ROOT/.specs" -name "*.md" -maxdepth 2 2>/dev/null | head -1)" ]; then
    HAS_SPECS=true
fi

# --- Enforcement ---

if [ "$HAS_PLAN" = true ] && [ "$HAS_SPECS" = true ]; then
    # Both present — clean pass
    echo '{"decision": "allow"}'
    exit 0
fi

if [ "$HAS_PLAN" = false ] && [ "$HAS_SPECS" = false ]; then
    # Strong enforcement
    cat << 'EOF'
{
  "decision": "allow",
  "systemMessage": "## MODO Spec-First Protocol\n\nCode generation intent detected but NO active plan or specs found.\n\n**Before writing production code, you should:**\n1. Enter Plan Mode to design the approach\n2. Create specs with `/sdd-spec` or `/dev-start <ticket>`\n3. Then proceed with implementation\n\n**Quick start**: `/dev-start <ticket-id>` sets up both tracking and specs.\n\nIf this is a quick fix or exploration, the user can say 'skip planning' to proceed."
}
EOF
    exit 0
fi

if [ "$HAS_PLAN" = false ]; then
    cat << 'EOF'
{
  "decision": "allow",
  "systemMessage": "## MODO Spec-First — Mild Reminder\n\nSpecs found but no active plan. Consider entering Plan Mode to design the approach before coding."
}
EOF
    exit 0
fi

if [ "$HAS_SPECS" = false ]; then
    cat << 'EOF'
{
  "decision": "allow",
  "systemMessage": "## MODO Spec-First — Mild Reminder\n\nPlan found but no specs. Consider creating specs with `/sdd-spec` or `/dev-start <ticket>` to document requirements."
}
EOF
    exit 0
fi

echo '{"decision": "allow"}'
