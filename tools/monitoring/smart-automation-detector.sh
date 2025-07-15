#!/bin/bash

# Smart Automation Detector - NON-BLOCKING protection
# Detects runaway automation without interfering with legitimate operations

DETECTION_LOG="/tmp/automation_detection.log"
ALERT_THRESHOLD_MINUTES=30
MAX_CONCURRENT_PROCESSES=3

echo "🔍 Smart Automation Detector - $(date)" >> $DETECTION_LOG

# 1. DETECT: Multiple long-running Claude processes
detect_runaway_processes() {
    local long_running_count=$(ps aux | grep claude | grep -v grep | awk '$10 ~ /[0-9]+:[0-9]{2}:[0-9]{2}/ {print $10}' | awk -F: '$1 >= '$ALERT_THRESHOLD_MINUTES' {count++} END {print count+0}')
    local total_claude_processes=$(ps aux | grep claude | grep -v grep | wc -l)
    
    if [ "$long_running_count" -gt 0 ] || [ "$total_claude_processes" -gt $MAX_CONCURRENT_PROCESSES ]; then
        echo "⚠️  AUTOMATION ALERT - $(date)" | tee -a $DETECTION_LOG
        echo "   Long-running processes: $long_running_count" | tee -a $DETECTION_LOG
        echo "   Total Claude processes: $total_claude_processes" | tee -a $DETECTION_LOG
        echo "   Threshold: ${ALERT_THRESHOLD_MINUTES}+ minutes" | tee -a $DETECTION_LOG
        echo "" | tee -a $DETECTION_LOG
        
        # NON-BLOCKING: Just alert, don't stop anything
        return 1
    fi
    return 0
}

# 2. DETECT: Rapid git pattern (but don't block)
detect_rapid_git_pattern() {
    local recent_resets=$(git reflog --since="1 minute ago" | grep "reset:" | wc -l)
    if [ "$recent_resets" -gt 3 ]; then
        echo "⚠️  RAPID GIT PATTERN DETECTED - $(date)" | tee -a $DETECTION_LOG
        echo "   Recent resets in last minute: $recent_resets" | tee -a $DETECTION_LOG
        echo "   🚨 This matches the original problem pattern!" | tee -a $DETECTION_LOG
        echo "" | tee -a $DETECTION_LOG
        return 1
    fi
    return 0
}

# 3. ALERT: Show current status and recommendations
show_status() {
    echo ""
    echo "📊 CURRENT STATUS:"
    echo "   Claude processes: $(ps aux | grep claude | grep -v grep | wc -l)"
    echo "   Recent git operations: $(git reflog --oneline -5 | wc -l)"
    echo "   Detection log: $DETECTION_LOG"
    echo ""
    echo "💡 RECOMMENDATIONS:"
    echo "   - If multiple processes detected: Close unused Claude sessions"
    echo "   - If rapid git pattern: Check for automation loops"
    echo "   - Monitor: tail -f $DETECTION_LOG"
}

# Main detection (NON-BLOCKING)
main() {
    local alerts=0
    
    detect_runaway_processes || alerts=$((alerts + 1))
    detect_rapid_git_pattern || alerts=$((alerts + 1))
    
    if [ $alerts -gt 0 ]; then
        show_status
        echo "🚨 $alerts automation alerts detected - see recommendations above"
        return 1
    else
        echo "✅ No automation issues detected - $(date)" >> $DETECTION_LOG
        return 0
    fi
}

# Run detection
main "$@"