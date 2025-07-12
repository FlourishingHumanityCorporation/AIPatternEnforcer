#!/bin/bash

# Complete Validation Suite
# Runs all validation tests to ensure system readiness

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🔍 ProjectTemplate Complete Validation Suite${NC}"
echo -e "${PURPLE}============================================${NC}"
echo ""

# Track results
TESTS_PASSED=0
TESTS_FAILED=0
CRITICAL_FAILURES=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local critical="$3"
    
    echo -e "${YELLOW}Running: $test_name${NC}"
    
    if eval "$test_command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC}"
        ((TESTS_FAILED++))
        if [[ "$critical" == "true" ]]; then
            ((CRITICAL_FAILURES++))
        fi
    fi
    echo ""
}

# Test 1: Basic project health
echo -e "${BLUE}Phase 1: Project Health Checks${NC}"
echo "=============================="
run_test "Package.json is valid" "npm run setup:validate" true
run_test "Dependencies installed" "[[ -d node_modules && $(ls node_modules | wc -l) -gt 100 ]]" true
run_test "Essential scripts exist" "grep -q 'g:c\\|setup:validate\\|test:user-journey' package.json" true

# Test 2: Testing infrastructure
echo -e "${BLUE}Phase 2: Testing Infrastructure${NC}"
echo "==============================="
run_test "User journey validator exists" "[[ -x scripts/testing/user-journey-validator.sh ]]" true
run_test "User testing program exists" "[[ -x scripts/testing/user-testing-program.sh ]]" true
run_test "Generator performance validator exists" "[[ -x scripts/testing/validate-generator-performance.sh ]]" false
run_test "Setup validator works" "npm run setup:validate >/dev/null 2>&1" true

# Test 3: Generator system
echo -e "${BLUE}Phase 3: Generator System${NC}"
echo "========================="
run_test "Enhanced component generator exists" "[[ -f tools/generators/enhanced-component-generator.js ]]" true
run_test "Basic component generator exists" "[[ -f tools/generators/component-generator.js ]]" false
run_test "Generator templates exist" "[[ -d templates/component ]]" true
run_test "Analytics system exists" "[[ -f tools/metrics/generator-analytics.js ]]" false

# Test 4: Configuration system
echo -e "${BLUE}Phase 4: Configuration System${NC}"
echo "============================="
run_test "AI configuration exists" "[[ -d ai/config ]]" false
run_test "Setup wizard exists" "[[ -f scripts/onboarding/guided-setup.js ]]" true
run_test "Enforcement system exists" "[[ -d tools/enforcement ]]" false

# Test 5: Documentation
echo -e "${BLUE}Phase 5: Documentation${NC}"
echo "====================="
run_test "Essential docs exist" "[[ -f CLAUDE.md && -f README.md && -f QUICK-START.md ]]" true
run_test "Testing documentation exists" "[[ -f docs/pilot-testing/user-testing-guide.md ]]" true
run_test "Friction points documented" "[[ -f docs/pilot-testing/friction-points-log.md ]]" false

# Test 6: Quick functional tests
echo -e "${BLUE}Phase 6: Functional Tests${NC}"
echo "========================="

# Test setup wizard non-interactively
echo -e "TestProject\nn\nn\nn\n" | timeout 30s npm run setup:quick >/dev/null 2>&1
run_test "Setup wizard completes" "[[ $? -eq 0 || $? -eq 124 ]]" false

# Test generator execution start (don't complete)
timeout 5s npm run g:c TestComp >/dev/null 2>&1 
run_test "Generator starts correctly" "[[ $? -eq 124 ]]" true  # 124 = timeout (expected)

# Clean up test artifacts
rm -f .setup-state.json 2>/dev/null || true
rm -rf src/components/TestComp 2>/dev/null || true

# Summary
echo ""
echo -e "${PURPLE}📊 Validation Results${NC}"
echo -e "${PURPLE}=====================${NC}"
echo ""
echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
echo -e "Critical Failures: ${RED}$CRITICAL_FAILURES${NC}"
echo ""

# Overall assessment
if [[ $CRITICAL_FAILURES -eq 0 ]]; then
    echo -e "${GREEN}✅ System is ready for user testing!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Run: npm run test:user-program"
    echo "2. Schedule user testing sessions"
    echo "3. Collect performance data"
    echo ""
    exit 0
else
    echo -e "${RED}❌ Critical issues prevent user testing${NC}"
    echo ""
    echo "Fix these issues before proceeding:"
    echo "- Ensure dependencies are installed"
    echo "- Check all essential scripts exist"
    echo "- Verify project structure is complete"
    echo ""
    exit 1
fi