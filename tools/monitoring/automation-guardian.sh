#!/bin/bash

# Automation Guardian - Smart monitoring without blocking
# Run this periodically to monitor for automation issues

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DETECTOR="$SCRIPT_DIR/smart-automation-detector.sh"

echo "🛡️  Automation Guardian - $(date)"
echo "=================================="

# Run the smart detector
if ! $DETECTOR; then
    echo ""
    echo "🎯 AUTOMATED RESPONSE OPTIONS:"
    echo ""
    echo "1. VIEW CURRENT PROCESSES:"
    echo "   ps aux | grep claude | grep -v grep"
    echo ""
    echo "2. CHECK GIT ACTIVITY:"
    echo "   git reflog --oneline -10"
    echo ""
    echo "3. SAFE CLEANUP (if needed):"
    echo "   ./tools/monitoring/safe-cleanup.sh"
    echo ""
    echo "4. MONITOR LIVE:"
    echo "   watch -n 5 './tools/monitoring/smart-automation-detector.sh'"
else
    echo "✅ All systems normal - no automation issues detected"
fi

echo ""
echo "📋 QUICK HEALTH CHECK:"
echo "   Claude processes: $(ps aux | grep claude | grep -v grep | wc -l)"
echo "   Git status: $(git status --porcelain | wc -l) uncommitted changes"
echo "   Last commit: $(git log --oneline -1)"
echo ""
echo "🔧 To set up automatic monitoring:"
echo "   # Run every 5 minutes (add to crontab if desired)"
echo "   # */5 * * * * $SCRIPT_DIR/automation-guardian.sh"