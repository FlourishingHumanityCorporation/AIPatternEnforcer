#!/bin/bash
# Integration test for behavioral compliance tools

echo "🧪 Testing ProjectTemplate Behavioral Compliance Tools"
echo "=================================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Test function
test_command() {
    local description="$1"
    local command="$2"
    local expected_exit="$3"
    
    echo -n "Testing: $description... "
    
    eval "$command" > /tmp/test-output.log 2>&1
    local actual_exit=$?
    
    if [ "$actual_exit" -eq "$expected_exit" ]; then
        echo -e "${GREEN}✅ PASSED${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC} (expected exit $expected_exit, got $actual_exit)"
        echo "Output:"
        cat /tmp/test-output.log
        ((FAILED++))
    fi
}

# 1. Test validator exists
test_command "Validator script exists" "[ -f tools/claude-validation/compliance-validator.js ]" 0

# 2. Test pre-commit hook
test_command "Pre-commit hook exists" "[ -f .husky/pre-commit ]" 0
test_command "Pre-commit hook is executable" "[ -x .husky/pre-commit ]" 0

# 3. Test VS Code snippets
test_command "VS Code snippets exist" "[ -f .vscode/claude-compliance.code-snippets ]" 0

# 4. Test dashboard
test_command "Dashboard exists" "[ -f tools/claude-validation/dashboard.html ]" 0

# 5. Test validation with good response
echo "**Improved Prompt**: Test response

Using component generator:
\`\`\`bash
npm run g:c TestComponent
\`\`\`" > /tmp/good-response.txt

test_command "Validate good response" "node tools/claude-validation/validate-claude.js /tmp/good-response.txt --complex --quiet" 0

# 6. Test validation with bad response
echo "I'll create Login_improved.jsx with better error handling." > /tmp/bad-response.txt

test_command "Validate bad response" "node tools/claude-validation/validate-claude.js /tmp/bad-response.txt --complex --quiet" 1

# 7. Test stats command
test_command "Stats command runs" "node tools/claude-validation/validate-claude.js --stats" 0

# 8. Test compliance test suite
test_command "Test suite runs" "node tools/claude-validation/test-compliance.js > /tmp/test-suite.log 2>&1" 0

# 9. Test npm scripts
test_command "npm claude:stats works" "npm run claude:stats > /tmp/npm-stats.log 2>&1" 0

# Summary
echo ""
echo "=================================================="
echo "Test Results:"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed! Behavioral compliance tools are working correctly.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please check the output above.${NC}"
    exit 1
fi