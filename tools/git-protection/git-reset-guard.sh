#!/bin/bash

# Git Reset Protection - Prevents runaway git reset automation
# This script should be used instead of direct git reset commands

RESET_LIMIT_FILE="/tmp/git_reset_limit_$(pwd | sed 's/\//_/g')"
CURRENT_TIME=$(date +%s)
MAX_RESETS_PER_MINUTE=3

echo "🛡️ Git Reset Guard - Checking for automation safety..."

# Create or read the reset limit file
if [ -f "$RESET_LIMIT_FILE" ]; then
    RESETS=($(cat "$RESET_LIMIT_FILE"))
else
    RESETS=()
fi

# Remove resets older than 1 minute
FILTERED_RESETS=()
for reset_time in "${RESETS[@]}"; do
    if [ $((CURRENT_TIME - reset_time)) -lt 60 ]; then
        FILTERED_RESETS+=($reset_time)
    fi
done

# Check if we're over the limit
if [ ${#FILTERED_RESETS[@]} -ge $MAX_RESETS_PER_MINUTE ]; then
    echo "🚨 RUNAWAY GIT RESET AUTOMATION DETECTED!"
    echo "Too many git reset operations (${#FILTERED_RESETS[@]}) in the last minute."
    echo "Maximum allowed: $MAX_RESETS_PER_MINUTE"
    echo ""
    echo "This is exactly the pattern that caused your data loss!"
    echo ""
    echo "Recent reset times:"
    for reset_time in "${FILTERED_RESETS[@]}"; do
        echo "  $(date -r $reset_time)"
    done
    echo ""
    echo "To override (if legitimate):"
    echo "  rm $RESET_LIMIT_FILE"
    echo "  $0 $@"
    echo ""
    echo "To check what's causing this:"
    echo "  ps aux | grep claude"
    exit 1
fi

# Add current reset
FILTERED_RESETS+=($CURRENT_TIME)
printf "%s\n" "${FILTERED_RESETS[@]}" > "$RESET_LIMIT_FILE"

# Execute the actual git reset with all original arguments
echo "✅ Reset approved. Executing: git reset $@"
exec git reset "$@"