#!/bin/bash
# Gathers comprehensive context for AI debugging sessions
# Optimized version with timeouts to prevent hanging

set -e

# Timeout for individual commands (in seconds)
TIMEOUT=5

# Helper function to run commands with timeout
run_with_timeout() {
    timeout "$TIMEOUT" "$@" 2>/dev/null || echo "Command timed out or failed"
}

echo "=== AI Context Dump ==="
echo "Generated at: $(date)"
echo ""

echo "=== Environment Information ==="
echo "Node: $(run_with_timeout node --version || echo 'Not installed')"
echo "npm: $(run_with_timeout npm --version || echo 'Not installed')"
echo "TypeScript: $(run_with_timeout npx tsc --version || echo 'Not installed')"
echo "OS: $(uname -s)"
echo "Current directory: $(pwd)"
echo ""

echo "=== Git Information ==="
echo "Current branch: $(run_with_timeout git branch --show-current || echo 'Not in git repo')"
echo "Last commit: $(run_with_timeout git log -1 --oneline || echo 'No commits')"
echo ""

echo "=== Recent Git History ==="
run_with_timeout git log --oneline -5 || echo "No git history"
echo ""

echo "=== Modified Files (current directory only) ==="
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    run_with_timeout git status --porcelain . | head -10 || echo "No local changes"
else
    echo "Not in a git repository"
fi
echo ""

echo "=== Project Structure ==="
find . -maxdepth 3 -type f -name "package.json" -not -path "*/node_modules/*" | head -5
echo ""

echo "=== Key Dependencies ==="
if [ -f "package.json" ]; then
    echo "Production dependencies:"
    cat package.json | grep -A 20 '"dependencies"' | grep -E '^\s*"' | head -10
    echo ""
    echo "Dev dependencies:"
    cat package.json | grep -A 20 '"devDependencies"' | grep -E '^\s*"' | head -10
else
    echo "No package.json found"
fi
echo ""

echo "=== Recent Error Logs ==="
if [ -f "error.log" ]; then
    echo "Last 20 lines of error.log:"
    tail -20 error.log
elif [ -f "logs/error.log" ]; then
    echo "Last 20 lines of logs/error.log:"
    tail -20 logs/error.log
else
    echo "No error logs found"
fi
echo ""

echo "=== Running Processes ==="
echo "Port 3000: $(run_with_timeout lsof -i :3000 | grep LISTEN || echo 'Nothing running')"
echo "Port 3001: $(run_with_timeout lsof -i :3001 | grep LISTEN || echo 'Nothing running')"
echo "Port 5432: $(run_with_timeout lsof -i :5432 | grep LISTEN || echo 'Nothing running')"
echo ""

echo "=== Environment Variables (filtered) ==="
env | grep -E '^(NODE_|REACT_|NEXT_|VITE_|API_|DATABASE_|PORT)' | cut -d= -f1 | sort
echo ""

echo "=== TypeScript Errors ==="
if [ -f "tsconfig.json" ]; then
    run_with_timeout npx tsc --noEmit | head -20 || echo "No TypeScript errors or check timed out"
else
    echo "No tsconfig.json found"
fi
echo ""

echo "=== Test Status ==="
if [ -f "package.json" ] && grep -q '"test"' package.json; then
    echo "Test script found in package.json"
    echo "Run 'npm test' to execute tests"
else
    echo "No test script found"
fi
echo ""

echo "=== Recent Console Output ==="
if [ -f "console.log" ]; then
    tail -20 console.log
else
    echo "No console.log file found"
fi
echo ""

echo "=== Memory Usage ==="
if command -v free &> /dev/null; then
    run_with_timeout free -h || echo "Memory check timed out"
else
    echo "Memory info not available on this system"
fi
echo ""

echo "=== Disk Usage ==="
run_with_timeout df -h . | grep -v "Filesystem" || echo "Disk usage check timed out"
echo ""

echo "=== AI-Specific Files ==="
echo "AI rules: $([ -f ".cursorrules" ] && echo "Present" || echo "Missing")"
echo "AI ignore: $([ -f ".aiignore" ] && echo "Present" || echo "Missing")"
echo "Copilot config: $([ -f ".github/copilot-instructions.md" ] && echo "Present" || echo "Missing")"
echo ""

echo "=== Context dump complete ==="
echo "Copy everything above this line for your AI debugging session"