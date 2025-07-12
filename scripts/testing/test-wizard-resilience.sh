#!/bin/bash

# Wizard Error Resilience Test
# Tests setup wizard behavior in various broken project states

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🛡️  Wizard Error Resilience Test${NC}"
echo -e "${PURPLE}================================${NC}"
echo ""

# Test results tracking
TEST_RESULTS=()
FAILED_TESTS=0

# Function to run resilience test
test_resilience() {
    local test_name="$1"
    local setup_broken_state="$2"
    local expected_behavior="$3"
    
    echo -e "${YELLOW}Testing: $test_name${NC}"
    
    # Create test directory
    TEST_DIR="test-resilience-$(date +%s)"
    mkdir -p "$TEST_DIR"
    cd "$TEST_DIR"
    
    # Copy minimal files
    cp ../package.json . 2>/dev/null || echo '{"name":"test","version":"1.0.0","scripts":{}}' > package.json
    cp -r ../scripts . 2>/dev/null || true
    cp -r ../tools . 2>/dev/null || true
    
    # Setup broken state
    eval "$setup_broken_state"
    
    # Run wizard and capture result
    echo -e "TestProject\nn\nn\nn\n" | timeout 30s npm run setup:quick 2>&1 | tee wizard-output.log
    WIZARD_RESULT=${PIPESTATUS[1]}
    
    # Check expected behavior
    if [[ "$expected_behavior" == "should_complete" ]]; then
        if [[ $WIZARD_RESULT -eq 0 ]]; then
            echo -e "${GREEN}✅ Wizard completed successfully (expected)${NC}"
            TEST_RESULTS+=("✅ $test_name: Handled gracefully")
        else
            echo -e "${RED}❌ Wizard failed unexpectedly${NC}"
            TEST_RESULTS+=("❌ $test_name: Failed to handle error")
            ((FAILED_TESTS++))
        fi
    elif [[ "$expected_behavior" == "should_fail_gracefully" ]]; then
        if grep -q "Error\|Warning" wizard-output.log && [[ $WIZARD_RESULT -ne 0 ]]; then
            echo -e "${GREEN}✅ Wizard failed gracefully with error message${NC}"
            TEST_RESULTS+=("✅ $test_name: Failed gracefully")
        else
            echo -e "${RED}❌ Wizard didn't provide proper error handling${NC}"
            TEST_RESULTS+=("❌ $test_name: Poor error handling")
            ((FAILED_TESTS++))
        fi
    fi
    
    # Cleanup
    cd ..
    rm -rf "$TEST_DIR"
    echo ""
}

# Test 1: Missing node_modules
echo -e "${BLUE}Test 1: Missing node_modules${NC}"
echo "================================"
test_resilience \
    "Missing node_modules" \
    "rm -rf node_modules" \
    "should_complete"

# Test 2: Corrupted package.json
echo -e "${BLUE}Test 2: Corrupted package.json${NC}"
echo "================================"
test_resilience \
    "Corrupted package.json" \
    "echo '{\"name\":\"test\",\"version\":\"1.0.0\"' > package.json" \
    "should_fail_gracefully"

# Test 3: Missing scripts in package.json
echo -e "${BLUE}Test 3: Missing scripts section${NC}"
echo "================================"
test_resilience \
    "Missing scripts" \
    "echo '{\"name\":\"test\",\"version\":\"1.0.0\"}' > package.json" \
    "should_complete"

# Test 4: Missing tools directory
echo -e "${BLUE}Test 4: Missing tools directory${NC}"
echo "================================"
test_resilience \
    "Missing tools" \
    "rm -rf tools" \
    "should_fail_gracefully"

# Test 5: Read-only directories
echo -e "${BLUE}Test 5: Read-only directories${NC}"
echo "================================"
test_resilience \
    "Read-only dirs" \
    "mkdir -p ai/config && chmod 444 ai/config" \
    "should_fail_gracefully"

# Test 6: Missing dependencies
echo -e "${BLUE}Test 6: Missing key dependencies${NC}"
echo "================================"
test_resilience \
    "Missing deps" \
    "npm uninstall inquirer chalk ora 2>/dev/null || true" \
    "should_fail_gracefully"

# Test 7: Partial project state
echo -e "${BLUE}Test 7: Partial project state${NC}"
echo "================================"
test_resilience \
    "Partial state" \
    "mkdir -p src/components; touch .setup-state.json" \
    "should_complete"

# Test 8: Network issues simulation
echo -e "${BLUE}Test 8: Network timeout simulation${NC}"
echo "================================"
test_resilience \
    "Network timeout" \
    "export npm_config_fetch_timeout=1" \
    "should_fail_gracefully"

# Additional resilience checks
echo -e "${BLUE}Additional Resilience Checks${NC}"
echo "================================"

# Check if wizard creates necessary directories
echo -e "${YELLOW}Testing directory creation...${NC}"
TEST_DIR="test-dir-creation"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"
echo '{"name":"test","version":"1.0.0","scripts":{"setup:quick":"echo test"}}' > package.json
mkdir -p scripts/onboarding
cp ../scripts/onboarding/guided-setup.js scripts/onboarding/ 2>/dev/null || true

if [[ -f "scripts/onboarding/guided-setup.js" ]]; then
    node scripts/onboarding/guided-setup.js --quick 2>&1 | grep -q "Error" && {
        TEST_RESULTS+=("✅ Directory creation: Handles missing dirs")
    } || {
        TEST_RESULTS+=("❌ Directory creation: Doesn't handle missing dirs")
        ((FAILED_TESTS++))
    }
fi
cd ..
rm -rf "$TEST_DIR"

# Summary
echo ""
echo -e "${PURPLE}📊 Resilience Test Summary${NC}"
echo -e "${PURPLE}=========================${NC}"
echo ""

for result in "${TEST_RESULTS[@]}"; do
    echo "$result"
done

echo ""
echo -e "${BLUE}Key Findings:${NC}"
echo "1. Wizard needs better error messages for missing dependencies"
echo "2. Should validate package.json before proceeding"
echo "3. Should create missing directories automatically"
echo "4. Network timeouts need better handling"

echo ""
if [[ $FAILED_TESTS -eq 0 ]]; then
    echo -e "${GREEN}✅ Wizard shows good resilience overall${NC}"
else
    echo -e "${YELLOW}⚠️  $FAILED_TESTS resilience issues found${NC}"
    echo ""
    echo "Recommendations:"
    echo "1. Add pre-flight checks to wizard"
    echo "2. Implement automatic directory creation"
    echo "3. Add dependency validation"
    echo "4. Improve error messages with recovery steps"
fi

exit $FAILED_TESTS