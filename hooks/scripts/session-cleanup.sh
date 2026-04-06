#!/bin/bash
# MODO Dev Framework — Session Cleanup (Stop, async)
#
# Cleans up /tmp state files to prevent stale state pollution.

set -euo pipefail

INPUT=$(cat)

SESSION_ID=$(echo "$INPUT" | python3 -c "
import json, sys
try:
    data = json.load(sys.stdin)
    print(data.get('session_id', 'default'))
except:
    print('default')
" 2>/dev/null || echo "default")

rm -f "/tmp/modo-boost/${SESSION_ID}.metrics" 2>/dev/null

exit 0
