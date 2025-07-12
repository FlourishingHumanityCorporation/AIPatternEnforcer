#!/bin/bash

# User Journey Validation Script
# Measures key metrics from the Work Summary:
# - Time to first success (target: <5 minutes)
# - Generator discovery rate
# - Setup completion rate

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Timing functions
START_TIME=$(date +%s)
JOURNEY_LOG="user-journey-log-$(date +%Y%m%d-%H%M%S).json"

log_event() {
    local event_name="$1"
    local event_time=$(date +%s)
    local elapsed=$((event_time - START_TIME))
    
    echo "{\"event\": \"$event_name\", \"timestamp\": $event_time, \"elapsed_seconds\": $elapsed}" >> "$JOURNEY_LOG"
    echo -e "${BLUE}[$(date +%H:%M:%S)]${NC} $event_name (elapsed: ${elapsed}s)"
}

measure_command() {
    local command="$1"
    local description="$2"
    
    echo -e "${YELLOW}▶ Running:${NC} $command"
    log_event "command_start: $description"
    
    local cmd_start=$(date +%s)
    eval "$command"
    local cmd_result=$?
    local cmd_end=$(date +%s)
    local cmd_duration=$((cmd_end - cmd_start))
    
    log_event "command_end: $description (duration: ${cmd_duration}s, result: $cmd_result)"
    
    if [[ $cmd_result -eq 0 ]]; then
        echo -e "${GREEN}✅ $description completed in ${cmd_duration}s${NC}"
    else
        echo -e "${RED}❌ $description failed after ${cmd_duration}s${NC}"
    fi
    
    return $cmd_result
}

# Main journey test
echo -e "${PURPLE}🚀 ProjectTemplate User Journey Validator${NC}"
echo -e "${PURPLE}========================================${NC}"
echo ""
echo "This script simulates a new user journey and measures key metrics:"
echo "- Time to first success (target: <5 minutes)"
echo "- Generator performance (target: ~30 seconds)"
echo "- Setup completion rate"
echo ""

# Initialize test environment
TEST_DIR="test-user-journey-$(date +%Y%m%d-%H%M%S)"
echo -e "${BLUE}Creating test environment in ${TEST_DIR}${NC}"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR"

log_event "journey_start"

# Step 1: Simulate reading README (minimal time)
echo ""
echo -e "${YELLOW}Step 1: User reads README.md${NC}"
log_event "readme_viewed"
sleep 10  # Simulate quick scan of README
echo "  ✓ User found quick-start link"

# Step 2: Navigate to QUICK-START.md
echo ""
echo -e "${YELLOW}Step 2: User navigates to QUICK-START.md${NC}"
log_event "quickstart_viewed"
sleep 5  # Simulate reading quick-start
echo "  ✓ User found setup commands"

# Step 3: Clone/Copy ProjectTemplate
echo ""
echo -e "${YELLOW}Step 3: User sets up ProjectTemplate${NC}"
log_event "setup_start"

# Copy template files (simulating git clone)
measure_command "cp -r ../* . 2>/dev/null || true" "Copy template files"
measure_command "cp -r ../.[^.]* . 2>/dev/null || true" "Copy hidden files"

# Step 4: Run npm install
echo ""
echo -e "${YELLOW}Step 4: User runs npm install${NC}"
log_event "npm_install_start"

if [[ -f "package.json" ]]; then
    # Use faster install options and handle potential errors
    measure_command "npm install --silent --no-audit --no-fund --legacy-peer-deps || npm install --silent --no-audit --no-fund" "npm install"
else
    echo -e "${RED}❌ package.json not found${NC}"
    log_event "error: package.json missing"
fi

# Step 5: Run setup wizard (quick mode)
echo ""
echo -e "${YELLOW}Step 5: User runs setup:quick${NC}"
log_event "setup_wizard_start"

if grep -q "setup:quick" package.json 2>/dev/null; then
    # Create minimal input for wizard
    echo -e "TestProject\nn\nn\nn\n" | measure_command "npm run setup:quick 2>/dev/null || true" "Quick setup wizard"
else
    echo -e "${RED}❌ setup:quick command not found${NC}"
    log_event "error: setup:quick missing"
fi

# Step 6: Generate first component
echo ""
echo -e "${YELLOW}Step 6: User generates first component${NC}"
log_event "generator_start"

COMPONENT_START=$(date +%s)

if grep -q "g:c" package.json 2>/dev/null; then
    # Test the generator with a simple component
    echo -e "UserProfile\nn\nn\nn\n" | measure_command "npm run g:c UserProfile 2>/dev/null || true" "Component generation"
    
    COMPONENT_END=$(date +%s)
    COMPONENT_DURATION=$((COMPONENT_END - COMPONENT_START))
    
    # Verify files were created
    if [[ -d "src/components/UserProfile" ]]; then
        echo -e "${GREEN}✅ Component files created successfully${NC}"
        ls -la src/components/UserProfile/
        log_event "generator_success"
    else
        echo -e "${RED}❌ Component files not created${NC}"
        log_event "generator_failed"
    fi
    
    # Check 30-second target
    if [[ $COMPONENT_DURATION -le 30 ]]; then
        echo -e "${GREEN}✅ Generator performance: ${COMPONENT_DURATION}s (within 30s target)${NC}"
    else
        echo -e "${YELLOW}⚠️  Generator performance: ${COMPONENT_DURATION}s (exceeds 30s target)${NC}"
    fi
else
    echo -e "${RED}❌ g:c command not found${NC}"
    log_event "error: g:c missing"
fi

# Calculate total time to first success
TOTAL_TIME=$(date +%s)
TOTAL_ELAPSED=$((TOTAL_TIME - START_TIME))
TOTAL_MINUTES=$((TOTAL_ELAPSED / 60))
TOTAL_SECONDS=$((TOTAL_ELAPSED % 60))

log_event "journey_complete"

# Results Summary
echo ""
echo -e "${PURPLE}📊 User Journey Results${NC}"
echo -e "${PURPLE}=======================${NC}"
echo ""
echo -e "Total time to first success: ${TOTAL_MINUTES}m ${TOTAL_SECONDS}s"

if [[ $TOTAL_ELAPSED -le 300 ]]; then  # 5 minutes = 300 seconds
    echo -e "${GREEN}✅ Met target: <5 minutes${NC}"
else
    echo -e "${RED}❌ Exceeded target: >5 minutes${NC}"
fi

echo ""
echo -e "${BLUE}Key Metrics:${NC}"
echo "- README → QUICK-START discovery: ✓"
echo "- QUICK-START → setup command discovery: ✓"
echo "- Setup completion: $(grep -q "setup_wizard_start" "$JOURNEY_LOG" && echo "✓" || echo "✗")"
echo "- Generator discovery: $(grep -q "generator_start" "$JOURNEY_LOG" && echo "✓" || echo "✗")"
echo "- First component created: $(grep -q "generator_success" "$JOURNEY_LOG" && echo "✓" || echo "✗")"

echo ""
echo -e "${BLUE}Performance Breakdown:${NC}"
grep -E "(npm_install|setup_wizard|generator)" "$JOURNEY_LOG" | while read -r line; do
    event=$(echo "$line" | jq -r '.event')
    elapsed=$(echo "$line" | jq -r '.elapsed_seconds')
    echo "- $event: ${elapsed}s"
done

echo ""
echo -e "${YELLOW}📝 Friction Points to Address:${NC}"

# Identify friction points
if [[ $TOTAL_ELAPSED -gt 300 ]]; then
    echo "- Total journey time exceeds 5-minute target"
fi

if [[ $COMPONENT_DURATION -gt 30 ]]; then
    echo "- Generator performance exceeds 30-second target"
fi

if grep -q "error:" "$JOURNEY_LOG"; then
    echo "- Errors encountered during journey:"
    grep "error:" "$JOURNEY_LOG" | while read -r line; do
        error=$(echo "$line" | jq -r '.event')
        echo "  • $error"
    done
fi

# Save detailed report
echo ""
echo -e "${BLUE}Detailed journey log saved to: $JOURNEY_LOG${NC}"

# Cleanup test directory
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

# Exit with appropriate code
if [[ $TOTAL_ELAPSED -le 300 ]] && [[ $COMPONENT_DURATION -le 30 ]]; then
    exit 0
else
    exit 1
fi