#!/bin/bash
# MODO Dev Framework — Magic Keywords (UserPromptSubmit)
#
# Detects power keywords in user prompts and injects thoroughness
# instructions. Zero learning curve — natural language triggers.
#
# Keywords:
#   deep / profundo / exhaustivo  → exhaustive multi-source analysis
#   parallel / paralelo           → concurrent agent orchestration
#   review + code/pr/security     → structured code review protocol
#   ultrathink / pensá bien       → extended reasoning with edge cases
#   quick / rápido / fast         → minimal output, skip ceremony
#
# NEVER blocks. Context injection only.

set -euo pipefail

INPUT=$(cat)

PROMPT=$(echo "$INPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    prompt = data.get('query', data.get('content', data.get('prompt', '')))
    if isinstance(prompt, list):
        prompt = ' '.join([p.get('text', str(p)) for p in prompt if isinstance(p, dict)] + [str(p) for p in prompt if not isinstance(p, dict)])
    print(str(prompt).lower())
except:
    print('')
" 2>/dev/null || echo "")

[ -z "$PROMPT" ] && exit 0

# Strip code blocks to avoid false positives
CLEAN=$(echo "$PROMPT" | sed '/```/,/```/d')

# ── Keyword detection (priority order: quick > deep > think > parallel > review)

BOOST=""

if echo "$CLEAN" | grep -qE '\b(quick|rápido|rapido|fast|breve|corto|resumido|tldr)\b'; then
  BOOST="quick"
elif echo "$CLEAN" | grep -qE '\b(deep|profundo|profundiz|exhausti|thorough|a fondo|en detalle|minucioso)\b'; then
  BOOST="deep"
elif echo "$CLEAN" | grep -qE '\b(ultrathink|think hard|pensá bien|razon[aá]|think deeply|piensa bien|analyze deeply)\b'; then
  BOOST="think"
elif echo "$CLEAN" | grep -qE '\b(parallel|paralelo|concurrent|simultáneo|en paralelo|multi-agent)\b'; then
  BOOST="parallel"
elif echo "$CLEAN" | grep -qE '\b(review|revisar|revis[aeá]|audit|auditar|inspect|inspeccionar)\b'; then
  if echo "$CLEAN" | grep -qE '(code|código|pr |pull request|cambios|changes|diff|refactor|security|performance|sonar)'; then
    BOOST="review"
  fi
fi

[ -z "$BOOST" ] && exit 0

# ── Inject boost context

case "$BOOST" in

deep)
cat << 'EOF'
{
  "systemMessage": "## MODO Boost: Deep Analysis Mode\n\n1. **Multi-source verification**: Cross-reference code, tests, types, and git history.\n2. **Exhaustive search**: Use Grep/Glob across the entire codebase before concluding something doesn't exist.\n3. **Root cause over symptoms**: Trace issues to their origin.\n4. **Edge cases**: Enumerate edge cases and how they're handled.\n5. **Impact analysis**: Map all affected files and functions.\n\nReport findings with evidence (file:line references)."
}
EOF
;;

parallel)
cat << 'EOF'
{
  "systemMessage": "## MODO Boost: Parallel Mode\n\n1. **Maximize concurrent agents**: Spawn multiple subagents for independent tasks in a SINGLE message.\n2. **Identify independence**: Classify subtasks with zero dependencies.\n3. **Batch tool calls**: Make all independent calls in one message block.\n4. **Fan-out strategy**: Spawn 3+ Explore agents with different search angles simultaneously.\n5. **Aggregate results**: Synthesize all parallel results into a unified response.\n\nGoal: minimum wall-clock time."
}
EOF
;;

review)
cat << 'EOF'
{
  "systemMessage": "## MODO Boost: Structured Review\n\n### Checklist\n1. **Correctness**: Logic errors?\n2. **Security**: OWASP top 10, input validation, XSS, injection\n3. **Performance**: N+1 queries, re-renders, memoization, bundle impact\n4. **Maintainability**: Naming, SRP, DRY without premature abstraction\n5. **Tests**: Critical paths covered? Behavior-driven?\n6. **Types**: No `any`, no unsafe casts\n7. **MODO patterns**: UI lib, Remote Config, centralized APIs\n\n### Output Format\nFor each finding: **File:line** — issue — **Severity** (critical/warning/suggestion) — **Fix**: concrete code.\n\nPrioritize critical issues. Skip style nits."
}
EOF
;;

think)
cat << 'EOF'
{
  "systemMessage": "## MODO Boost: Extended Thinking\n\n1. **Enumerate options**: List at least 3 approaches before choosing.\n2. **Trade-off analysis**: Pros, cons, and when each is the right choice.\n3. **Edge cases first**: List what could go wrong, then design around it.\n4. **Second-order effects**: What breaks downstream if this changes?\n5. **Validate assumptions**: Verify against the codebase.\n6. **Decision record**: End with clear decision + reasoning.\n\nDepth over speed."
}
EOF
;;

quick)
cat << 'EOF'
{
  "systemMessage": "## MODO Boost: Quick Mode\n\n1. Minimal output — fewest words possible.\n2. Skip ceremony — no plan mode, no spec check.\n3. Code over prose — just write the code.\n4. One-shot — solve in a single response."
}
EOF
;;

esac

exit 0
