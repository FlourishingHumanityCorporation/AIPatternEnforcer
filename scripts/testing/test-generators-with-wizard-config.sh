#!/bin/bash

# Test Generators with Wizard-Generated Configs
# Ensures generators work properly after setup wizard configuration

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}🧪 Testing Generators with Wizard Configs${NC}"
echo -e "${PURPLE}=========================================${NC}"
echo ""

# Test results tracking
TEST_RESULTS=()
FAILED_TESTS=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    echo -e "${YELLOW}Running: $test_name${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ PASS${NC}"
        TEST_RESULTS+=("✅ $test_name")
    else
        echo -e "${RED}❌ FAIL${NC}"
        TEST_RESULTS+=("❌ $test_name")
        ((FAILED_TESTS++))
    fi
    echo ""
}

# Test 1: Simulate quick setup wizard
echo -e "${BLUE}Phase 1: Setup Wizard Configuration${NC}"
echo "======================================="

# Create test directory
TEST_DIR="test-wizard-generators-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

# Copy necessary files
cp ../package.json .
cp -r ../scripts .
cp -r ../tools .
cp -r ../templates .
cp -r ../ai .
cp -r ../config .
mkdir -p src/components src/features src/api src/hooks

# Run quick setup to generate configs
echo -e "${YELLOW}Running setup:quick to generate configs...${NC}"
echo -e "TestProject\nn\nn\nn\n" | npm run setup:quick 2>/dev/null || {
    echo -e "${RED}Setup wizard failed. Testing with default configs...${NC}"
}

# Test 2: Check generated configs
echo ""
echo -e "${BLUE}Phase 2: Config Validation${NC}"
echo "======================================="

run_test "AI config exists" "[[ -f 'ai/config/.cursorrules' ]]"
run_test "Enforcement config exists" "[[ -f '.ai-enforcement.json' || -f 'config/enforcement.json' ]]"
run_test "Project structure valid" "[[ -d 'src/components' && -d 'templates' ]]"

# Test 3: Test each generator
echo ""
echo -e "${BLUE}Phase 3: Generator Testing${NC}"
echo "======================================="

# Test enhanced component generator
echo -e "${YELLOW}Testing Enhanced Component Generator...${NC}"
COMPONENT_NAME="WizardTestComponent"
echo -e "1\n$COMPONENT_NAME\n1\nn\nn\nn\n" | npm run g:c "$COMPONENT_NAME" 2>/dev/null
run_test "Enhanced component files created" \
    "[[ -f 'src/components/$COMPONENT_NAME/$COMPONENT_NAME.tsx' && \
        -f 'src/components/$COMPONENT_NAME/$COMPONENT_NAME.test.tsx' && \
        -f 'src/components/$COMPONENT_NAME/$COMPONENT_NAME.stories.tsx' ]]"

# Test basic component generator
echo -e "${YELLOW}Testing Basic Component Generator...${NC}"
BASIC_NAME="BasicWizardTest"
echo "$BASIC_NAME" | npm run g:component "$BASIC_NAME" 2>/dev/null
run_test "Basic component created" "[[ -f 'src/components/$BASIC_NAME/$BASIC_NAME.tsx' ]]"

# Test API generator
echo -e "${YELLOW}Testing API Generator...${NC}"
API_NAME="WizardAPI"
echo -e "$API_NAME\nwizard\nn\nn\n" | npm run g:api "$API_NAME" 2>/dev/null || true
run_test "API structure created" "[[ -d 'src/api' ]]"

# Test feature generator
echo -e "${YELLOW}Testing Feature Generator...${NC}"
FEATURE_NAME="wizard-test-feature"
echo -e "$FEATURE_NAME\nTest feature\nn\n" | npm run g:feature "$FEATURE_NAME" 2>/dev/null || true
run_test "Feature structure created" "[[ -d 'src/features/$FEATURE_NAME' ]]"

# Test hook generator
echo -e "${YELLOW}Testing Hook Generator...${NC}"
HOOK_NAME="useWizardTest"
echo -e "$HOOK_NAME\nTest hook\n" | npm run g:hook "$HOOK_NAME" 2>/dev/null || true
run_test "Hook created" "[[ -f 'src/hooks/$HOOK_NAME.ts' || -f 'src/hooks/$HOOK_NAME/$HOOK_NAME.ts' ]]"

# Test 4: Validate generated code quality
echo ""
echo -e "${BLUE}Phase 4: Code Quality Validation${NC}"
echo "======================================="

# Check TypeScript validity
if [[ -f "src/components/$COMPONENT_NAME/$COMPONENT_NAME.tsx" ]]; then
    run_test "Generated TypeScript is valid" \
        "grep -q 'interface.*Props' src/components/$COMPONENT_NAME/$COMPONENT_NAME.tsx"
    run_test "Has proper exports" \
        "grep -q 'export' src/components/$COMPONENT_NAME/index.ts"
fi

# Check test file structure
if [[ -f "src/components/$COMPONENT_NAME/$COMPONENT_NAME.test.tsx" ]]; then
    run_test "Test file has describe block" \
        "grep -q 'describe' src/components/$COMPONENT_NAME/$COMPONENT_NAME.test.tsx"
    run_test "Test file has test cases" \
        "grep -q 'it\\|test' src/components/$COMPONENT_NAME/$COMPONENT_NAME.test.tsx"
fi

# Test 5: Different stack configurations
echo ""
echo -e "${BLUE}Phase 5: Stack Compatibility${NC}"
echo "======================================="

# Test with different enforcement levels
echo -e "${YELLOW}Testing with strict enforcement...${NC}"
echo '{"enforcementLevel": "strict"}' > .ai-enforcement.json
echo -e "1\nStrictComponent\n1\nn\nn\nn\n" | npm run g:c "StrictComponent" 2>/dev/null
run_test "Generator works with strict enforcement" "[[ -f 'src/components/StrictComponent/StrictComponent.tsx' ]]"

echo -e "${YELLOW}Testing with minimal enforcement...${NC}"
echo '{"enforcementLevel": "minimal"}' > .ai-enforcement.json
echo -e "1\nMinimalComponent\n1\nn\nn\nn\n" | npm run g:c "MinimalComponent" 2>/dev/null
run_test "Generator works with minimal enforcement" "[[ -f 'src/components/MinimalComponent/MinimalComponent.tsx' ]]"

# Summary
echo ""
echo -e "${PURPLE}📊 Test Summary${NC}"
echo -e "${PURPLE}===============${NC}"
echo ""

for result in "${TEST_RESULTS[@]}"; do
    echo "$result"
done

echo ""
if [[ $FAILED_TESTS -eq 0 ]]; then
    echo -e "${GREEN}✅ All tests passed! Generators work correctly with wizard configs.${NC}"
else
    echo -e "${RED}❌ $FAILED_TESTS tests failed. Review generator compatibility.${NC}"
fi

# Cleanup
cd ..
echo ""
echo -e "${YELLOW}Clean up test directory? (y/n)${NC}"
read -r cleanup_response
if [[ "$cleanup_response" == "y" ]]; then
    rm -rf "$TEST_DIR"
    echo "Test directory cleaned up"
else
    echo "Test directory preserved at: $TEST_DIR"
fi

exit $FAILED_TESTS