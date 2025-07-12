#!/bin/bash

# Generator Performance Validation Script
# Tests all generators against the 30-second performance target

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${PURPLE}⚡ Generator Performance Validator${NC}"
echo -e "${PURPLE}===================================${NC}"
echo ""
echo "Testing all generators against 30-second performance target..."
echo ""

# Results tracking
RESULTS_FILE="generator-performance-results-$(date +%Y%m%d-%H%M%S).json"
echo "[]" > "$RESULTS_FILE"

# Function to test a generator
test_generator() {
    local generator_name="$1"
    local generator_command="$2"
    local test_input="$3"
    
    echo -e "${YELLOW}Testing: $generator_name${NC}"
    echo "Command: $generator_command"
    
    # Create a temporary test directory
    TEST_DIR="test-gen-$(date +%s)"
    mkdir -p "$TEST_DIR"
    cd "$TEST_DIR"
    
    # Measure generator execution time
    START_TIME=$(date +%s.%N)
    
    # Run generator with test input
    echo -e "$test_input" | timeout 60s bash -c "$generator_command" > /dev/null 2>&1
    RESULT=$?
    
    END_TIME=$(date +%s.%N)
    DURATION=$(echo "$END_TIME - $START_TIME" | bc)
    DURATION_INT=$(printf "%.0f" $DURATION)
    
    # Check if generator succeeded
    if [[ $RESULT -eq 0 ]]; then
        STATUS="success"
        # Check if files were created
        FILE_COUNT=$(find . -type f -name "*.tsx" -o -name "*.ts" -o -name "*.css" | wc -l)
        echo -e "  ✅ Generator completed in ${DURATION_INT}s (created $FILE_COUNT files)"
    else
        STATUS="failed"
        FILE_COUNT=0
        echo -e "  ❌ Generator failed after ${DURATION_INT}s"
    fi
    
    # Performance assessment
    if [[ $DURATION_INT -le 30 ]]; then
        PERFORMANCE="PASS"
        echo -e "  ${GREEN}✅ Performance: Within 30s target${NC}"
    elif [[ $DURATION_INT -le 45 ]]; then
        PERFORMANCE="WARNING"
        echo -e "  ${YELLOW}⚠️  Performance: Slightly over target (${DURATION_INT}s)${NC}"
    else
        PERFORMANCE="FAIL"
        echo -e "  ${RED}❌ Performance: Significantly over target (${DURATION_INT}s)${NC}"
    fi
    
    # Save result
    cd ..
    rm -rf "$TEST_DIR"
    
    # Append to results file
    jq ". += [{
        \"generator\": \"$generator_name\",
        \"command\": \"$generator_command\",
        \"duration\": $DURATION_INT,
        \"status\": \"$STATUS\",
        \"performance\": \"$PERFORMANCE\",
        \"files_created\": $FILE_COUNT,
        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
    }]" "$RESULTS_FILE" > "$RESULTS_FILE.tmp"
    mv "$RESULTS_FILE.tmp" "$RESULTS_FILE"
    
    echo ""
}

# Test 1: Enhanced Component Generator
test_generator \
    "Enhanced Component Generator" \
    "npm run g:c TestComponent" \
    "TestComponent\nn\nn\nn\nn\n"

# Test 2: Basic Component Generator  
test_generator \
    "Basic Component Generator" \
    "npm run g:component TestBasic" \
    "TestBasic\n"

# Test 3: API Generator
test_generator \
    "API Generator" \
    "npm run g:api UserAPI" \
    "UserAPI\nusers\nn\nn\n"

# Test 4: Feature Generator
test_generator \
    "Feature Generator" \
    "npm run g:feature TestFeature" \
    "TestFeature\nTest feature for validation\nn\n"

# Test 5: Hook Generator
test_generator \
    "Hook Generator" \
    "npm run g:hook useTest" \
    "useTest\nTest hook for validation\n"

# Summary Report
echo -e "${PURPLE}📊 Performance Summary${NC}"
echo -e "${PURPLE}=====================${NC}"
echo ""

# Calculate statistics
TOTAL_GENERATORS=$(jq length "$RESULTS_FILE")
PASSED=$(jq '[.[] | select(.performance == "PASS")] | length' "$RESULTS_FILE")
WARNINGS=$(jq '[.[] | select(.performance == "WARNING")] | length' "$RESULTS_FILE")
FAILED=$(jq '[.[] | select(.performance == "FAIL")] | length' "$RESULTS_FILE")
AVG_DURATION=$(jq '[.[].duration] | add / length' "$RESULTS_FILE")

echo "Total generators tested: $TOTAL_GENERATORS"
echo "Performance results:"
echo -e "  ${GREEN}✅ Passed (≤30s): $PASSED${NC}"
echo -e "  ${YELLOW}⚠️  Warning (31-45s): $WARNINGS${NC}"
echo -e "  ${RED}❌ Failed (>45s): $FAILED${NC}"
echo ""
printf "Average generation time: %.1fs\n" $AVG_DURATION
echo ""

# Detailed results
echo "Detailed Results:"
echo "----------------"
jq -r '.[] | "\(.generator): \(.duration)s (\(.performance))"' "$RESULTS_FILE"

echo ""
echo -e "${BLUE}Full results saved to: $RESULTS_FILE${NC}"

# Overall assessment
echo ""
if [[ $FAILED -eq 0 ]] && [[ $WARNINGS -le 1 ]]; then
    echo -e "${GREEN}✅ OVERALL: Generator performance meets targets!${NC}"
    exit 0
else
    echo -e "${RED}❌ OVERALL: Generator performance needs optimization${NC}"
    echo ""
    echo "Recommendations:"
    echo "1. Profile slow generators to identify bottlenecks"
    echo "2. Consider async/parallel file generation"
    echo "3. Optimize template compilation"
    echo "4. Review dependency loading"
    exit 1
fi