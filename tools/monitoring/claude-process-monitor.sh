#!/bin/bash

# Claude Process Monitor
# Detects multiple Claude processes in the same directory without killing them
# Provides user with information to make informed decisions

echo "🔍 Claude Process Monitor - Scanning for potential issues..."
echo ""

PROJECT_DIR="/Users/paulrohde/CodeProjects/AIPatternEnforcer"
CLAUDE_PROCESSES=$(ps aux | grep -E "claude|node.*claude" | grep -v grep | grep -v "claude-process-monitor")

if [ -z "$CLAUDE_PROCESSES" ]; then
    echo "✅ No Claude processes detected"
    exit 0
fi

echo "🔍 Found Claude processes:"
echo "$CLAUDE_PROCESSES" | while read line; do
    PID=$(echo "$line" | awk '{print $2}')
    RUNTIME=$(echo "$line" | awk '{print $10}')
    
    # Get working directory for each process
    CWD=$(lsof -p "$PID" 2>/dev/null | grep cwd | awk '{print $NF}')
    
    echo ""
    echo "Process ID: $PID"
    echo "Runtime: $RUNTIME"
    echo "Working Directory: ${CWD:-Unknown}"
    
    # Check if it's in our project directory
    if [[ "$CWD" == *"AIPatternEnforcer"* ]]; then
        echo "⚠️  WARNING: This process is in the AIPatternEnforcer directory"
        
        # Check runtime duration
        if [[ "$RUNTIME" =~ ^[0-9]+:[0-9]{2}:[0-9]{2} ]]; then
            HOURS=$(echo "$RUNTIME" | cut -d: -f1)
            if [ "$HOURS" -gt 1 ]; then
                echo "🚨 ALERT: Long-running process ($RUNTIME) - potential runaway!"
            fi
        fi
    fi
done

echo ""
echo "📊 Summary:"
TOTAL_PROCESSES=$(echo "$CLAUDE_PROCESSES" | wc -l)
PROJECT_PROCESSES=$(echo "$CLAUDE_PROCESSES" | while read line; do
    PID=$(echo "$line" | awk '{print $2}')
    CWD=$(lsof -p "$PID" 2>/dev/null | grep cwd | awk '{print $NF}')
    if [[ "$CWD" == *"AIPatternEnforcer"* ]]; then
        echo "1"
    fi
done | wc -l)

echo "Total Claude processes: $TOTAL_PROCESSES"
echo "In AIPatternEnforcer: $PROJECT_PROCESSES"

if [ "$PROJECT_PROCESSES" -gt 1 ]; then
    echo ""
    echo "🚨 MULTIPLE CLAUDE PROCESSES IN SAME PROJECT!"
    echo "This is the pattern that caused the git reset loops."
    echo ""
    echo "Recommended actions:"
    echo "1. Check which sessions you're actively using"
    echo "2. Gracefully close unused Claude sessions"
    echo "3. Monitor git operations for automation loops"
    echo ""
    echo "⚠️  Do NOT kill processes unless you're certain they're not in use"
fi

echo ""
echo "To monitor git operations:"
echo "  tail -f /tmp/claude_git_operations.json"