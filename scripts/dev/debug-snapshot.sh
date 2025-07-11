#!/bin/bash
# Captures comprehensive runtime state for AI debugging

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

OUTPUT_FILE=${1:-"debug-snapshot-$(date +%Y%m%d-%H%M%S).md"}

echo -e "${BLUE}📸 Capturing debug snapshot...${NC}"

# Start snapshot file
cat > "$OUTPUT_FILE" << EOF
# Debug Snapshot
Generated: $(date)
System: $(uname -a)

## Table of Contents
1. [Process State](#process-state)
2. [Memory Usage](#memory-usage)
3. [Environment](#environment)
4. [Network State](#network-state)
5. [File Descriptors](#file-descriptors)
6. [Recent Logs](#recent-logs)
7. [Application State](#application-state)

---

## Process State
EOF

# Process information
echo -e "\n### Node.js Processes\n" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
ps aux | grep -E "node|npm|yarn|pnpm" | grep -v grep >> "$OUTPUT_FILE" 2>/dev/null || echo "No Node.js processes found" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"

# Memory usage
echo -e "\n## Memory Usage\n" >> "$OUTPUT_FILE"

if command -v node &> /dev/null; then
    echo "### Node.js Memory" >> "$OUTPUT_FILE"
    echo '```javascript' >> "$OUTPUT_FILE"
    node -e "console.log(JSON.stringify(process.memoryUsage(), null, 2))" >> "$OUTPUT_FILE" 2>/dev/null || echo "Unable to get Node memory usage" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
fi

echo -e "\n### System Memory\n" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
if command -v free &> /dev/null; then
    free -h >> "$OUTPUT_FILE"
else
    # macOS
    vm_stat | head -10 >> "$OUTPUT_FILE" 2>/dev/null || echo "Memory info not available" >> "$OUTPUT_FILE"
fi
echo '```' >> "$OUTPUT_FILE"

# Environment variables (filtered)
echo -e "\n## Environment\n" >> "$OUTPUT_FILE"
echo "### Application Variables" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
env | grep -E '^(NODE_|REACT_|NEXT_|VITE_|API_|DATABASE_|PORT|DEBUG)' | sort >> "$OUTPUT_FILE" 2>/dev/null || echo "No relevant env vars found" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"

# Network connections
echo -e "\n## Network State\n" >> "$OUTPUT_FILE"
echo "### Listening Ports" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
if command -v lsof &> /dev/null; then
    lsof -i -P | grep LISTEN | grep -E "node|npm|yarn" >> "$OUTPUT_FILE" 2>/dev/null || echo "No Node.js listeners found" >> "$OUTPUT_FILE"
else
    netstat -an | grep LISTEN >> "$OUTPUT_FILE" 2>/dev/null || echo "Unable to get network info" >> "$OUTPUT_FILE"
fi
echo '```' >> "$OUTPUT_FILE"

echo -e "\n### Active Connections" >> "$OUTPUT_FILE"
echo '```' >> "$OUTPUT_FILE"
if command -v lsof &> /dev/null; then
    lsof -i -P | grep ESTABLISHED | head -20 >> "$OUTPUT_FILE" 2>/dev/null || echo "No active connections" >> "$OUTPUT_FILE"
else
    netstat -an | grep ESTABLISHED | head -20 >> "$OUTPUT_FILE" 2>/dev/null || echo "Unable to get connection info" >> "$OUTPUT_FILE"
fi
echo '```' >> "$OUTPUT_FILE"

# File descriptors
echo -e "\n## File Descriptors\n" >> "$OUTPUT_FILE"
if [ -n "$(pgrep node)" ]; then
    echo "### Open Files (Node.js)" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
    lsof -p $(pgrep node | head -1) | head -30 >> "$OUTPUT_FILE" 2>/dev/null || echo "Unable to get file descriptors" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
fi

# Recent logs
echo -e "\n## Recent Logs\n" >> "$OUTPUT_FILE"

# Check for common log locations
LOG_FILES=(
    "error.log"
    "debug.log"
    "app.log"
    "logs/error.log"
    "logs/app.log"
    ".next/trace"
    "npm-debug.log"
)

for log in "${LOG_FILES[@]}"; do
    if [ -f "$log" ]; then
        echo "### $log (last 50 lines)" >> "$OUTPUT_FILE"
        echo '```' >> "$OUTPUT_FILE"
        tail -50 "$log" >> "$OUTPUT_FILE"
        echo '```' >> "$OUTPUT_FILE"
        echo "" >> "$OUTPUT_FILE"
    fi
done

# Application-specific state
echo -e "\n## Application State\n" >> "$OUTPUT_FILE"

# Check for PM2
if command -v pm2 &> /dev/null; then
    echo "### PM2 Status" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
    pm2 status >> "$OUTPUT_FILE" 2>/dev/null || echo "No PM2 processes" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
fi

# Check for Docker containers
if command -v docker &> /dev/null; then
    echo -e "\n### Docker Containers" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" >> "$OUTPUT_FILE" 2>/dev/null || echo "No Docker containers or permission denied" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
fi

# Database connections (if psql available)
if command -v psql &> /dev/null && [ -n "$DATABASE_URL" ]; then
    echo -e "\n### Database Connections" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
    psql "$DATABASE_URL" -c "SELECT pid, usename, application_name, client_addr, state FROM pg_stat_activity WHERE state != 'idle';" >> "$OUTPUT_FILE" 2>/dev/null || echo "Unable to query database" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
fi

# Recent errors from journalctl (Linux)
if command -v journalctl &> /dev/null; then
    echo -e "\n### System Journal (Node.js errors)" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
    journalctl -u node -n 20 --no-pager >> "$OUTPUT_FILE" 2>/dev/null || echo "No journal entries" >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
fi

# Package versions
if [ -f "package.json" ]; then
    echo -e "\n### Key Dependencies" >> "$OUTPUT_FILE"
    echo '```json' >> "$OUTPUT_FILE"
    cat package.json | grep -A 30 '"dependencies"' | head -40 >> "$OUTPUT_FILE"
    echo '```' >> "$OUTPUT_FILE"
fi

# Summary
echo -e "\n## Summary\n" >> "$OUTPUT_FILE"
echo "- Snapshot file: $OUTPUT_FILE" >> "$OUTPUT_FILE"
echo "- Generated at: $(date)" >> "$OUTPUT_FILE"
echo "- Node version: $(node --version 2>/dev/null || echo 'Not found')" >> "$OUTPUT_FILE"
echo "- NPM version: $(npm --version 2>/dev/null || echo 'Not found')" >> "$OUTPUT_FILE"

echo -e "${GREEN}✅ Debug snapshot saved to: $OUTPUT_FILE${NC}"
echo -e "${YELLOW}Tip: Share this file with AI for debugging assistance${NC}"