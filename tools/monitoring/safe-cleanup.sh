#!/bin/bash

# Safe Cleanup - Interactive cleanup when automation issues detected
# NEVER automatically kills processes - always asks user first

echo "🧹 Safe Automation Cleanup Tool"
echo "==============================="

# Show current state
echo ""
echo "📊 CURRENT STATE:"
echo ""
echo "Claude processes:"
ps aux | grep claude | grep -v grep | while read line; do
    PID=$(echo "$line" | awk '{print $2}')
    RUNTIME=$(echo "$line" | awk '{print $10}')
    CMD=$(echo "$line" | awk '{print $11}' | head -c 50)
    echo "  PID $PID | Runtime: $RUNTIME | Command: $CMD"
done

echo ""
echo "Recent git activity:"
git reflog --oneline -8

echo ""
echo "📋 CLEANUP OPTIONS:"
echo ""
echo "1. 🔍 INVESTIGATE FIRST (recommended)"
echo "   - Check which Claude sessions you're actively using"
echo "   - Look for sessions with long runtimes (>30 minutes)"
echo "   - Verify git operations are working normally"
echo ""
echo "2. 🚫 MANUAL PROCESS MANAGEMENT (if needed)"
echo "   - Close unused Claude Code sessions gracefully"
echo "   - Use 'exit' or Ctrl+C in terminal sessions"
echo "   - Only kill processes if they're truly stuck"
echo ""
echo "3. 🔧 GIT STATE CLEANUP (if needed)"
echo "   - Check: git status"
echo "   - Clean: git reset --hard HEAD (if safe)"
echo "   - Remove temp files: rm /tmp/claude_git_operations.json"
echo ""

# Interactive safety checks
echo "⚠️  SAFETY FIRST:"
echo ""
echo "❌ This script will NOT automatically kill processes"
echo "❌ This script will NOT automatically reset git state" 
echo "✅ All actions require your explicit confirmation"
echo "✅ Investigate before taking action"
echo ""

read -p "Do you want to see detailed process information? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "📊 DETAILED PROCESS INFO:"
    ps aux | grep claude | grep -v grep | while read line; do
        PID=$(echo "$line" | awk '{print $2}')
        echo ""
        echo "Process $PID details:"
        echo "  Runtime: $(echo "$line" | awk '{print $10}')"
        echo "  CPU: $(echo "$line" | awk '{print $3}')%"
        echo "  Memory: $(echo "$line" | awk '{print $4}')%"
        echo "  Working directory: $(lsof -p $PID 2>/dev/null | grep cwd | awk '{print $NF}' || echo 'Unknown')"
    done
fi

echo ""
echo "💡 RECOMMENDED NEXT STEPS:"
echo "1. Keep this terminal open for reference"
echo "2. In another terminal, check your active Claude sessions"
echo "3. Gracefully close any sessions you're not using"
echo "4. Monitor with: watch -n 5 './tools/monitoring/smart-automation-detector.sh'"
echo ""
echo "🆘 EMERGENCY ONLY: If processes are truly stuck and unresponsive:"
echo "   kill -TERM <PID>  # Graceful termination"
echo "   kill -KILL <PID>  # Force kill (last resort)"
echo ""
echo "✅ Safe cleanup script completed - no automated actions taken"