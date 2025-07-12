#!/bin/bash

# User Testing Program
# Facilitates testing with real users and collects metrics + feedback

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Test session ID
SESSION_ID=$(date +%Y%m%d-%H%M%S)
TEST_RESULTS_DIR="tests/user-testing-results"
SESSION_DIR="$TEST_RESULTS_DIR/session-$SESSION_ID"

# Create results directory
mkdir -p "$SESSION_DIR"

# User info collection
echo -e "${PURPLE}🧪 ProjectTemplate User Testing Program${NC}"
echo -e "${PURPLE}======================================${NC}"
echo ""
echo "Thank you for helping us test ProjectTemplate!"
echo "This session will take approximately 10-15 minutes."
echo ""

# Collect user info
echo -e "${YELLOW}Please provide some information:${NC}"
echo -n "Your name (or identifier): "
read -r USER_NAME
echo -n "Your experience level (beginner/intermediate/expert): "
read -r EXPERIENCE_LEVEL
echo -n "Primary development stack (react/vue/node/other): "
read -r DEV_STACK

# Create session file
cat > "$SESSION_DIR/session-info.json" << EOF
{
  "session_id": "$SESSION_ID",
  "user_name": "$USER_NAME",
  "experience_level": "$EXPERIENCE_LEVEL",
  "dev_stack": "$DEV_STACK",
  "start_time": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

# Instructions
echo ""
echo -e "${BLUE}📋 Testing Instructions${NC}"
echo "================================"
echo "1. We'll guide you through setting up a new project"
echo "2. We'll measure how long each step takes"
echo "3. Please think aloud and share any confusion"
echo "4. Be honest - we want to find problems!"
echo ""
echo "Press Enter when ready to start..."
read -r

# Start timer
START_TIME=$(date +%s)
METRICS_FILE="$SESSION_DIR/metrics.json"
echo "[]" > "$METRICS_FILE"

# Function to log metrics
log_metric() {
    local task="$1"
    local start_time="$2"
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    local success="$3"
    
    # Update metrics file
    jq ". += [{\"task\": \"$task\", \"duration\": $duration, \"success\": $success}]" "$METRICS_FILE" > "$METRICS_FILE.tmp"
    mv "$METRICS_FILE.tmp" "$METRICS_FILE"
}

# Function to collect feedback
collect_feedback() {
    local task="$1"
    local feedback_file="$SESSION_DIR/feedback-$task.txt"
    
    echo ""
    echo -e "${YELLOW}Quick feedback for: $task${NC}"
    echo "What was confusing or difficult? (Press Ctrl+D when done)"
    cat > "$feedback_file"
    echo ""
}

# Test 1: README Discovery
echo ""
echo -e "${GREEN}Task 1: Find the getting started instructions${NC}"
echo "Please open README.md and find how to get started."
echo "Press Enter when you've found the instructions..."
TASK1_START=$(date +%s)
read -r
log_metric "readme_discovery" "$TASK1_START" true
collect_feedback "readme_discovery"

# Test 2: QUICK-START Navigation
echo ""
echo -e "${GREEN}Task 2: Navigate to the quick start guide${NC}"
echo "Following the README, find and open the quick start guide."
echo "Press Enter when you're viewing the quick start..."
TASK2_START=$(date +%s)
read -r
log_metric "quickstart_navigation" "$TASK2_START" true
collect_feedback "quickstart_navigation"

# Test 3: Setup Command Discovery
echo ""
echo -e "${GREEN}Task 3: Find the setup commands${NC}"
echo "In the quick start guide, find the commands to set up the project."
echo "What command would you run first? "
TASK3_START=$(date +%s)
read -r SETUP_COMMAND
log_metric "setup_discovery" "$TASK3_START" true

if [[ "$SETUP_COMMAND" == *"npm install"* ]] || [[ "$SETUP_COMMAND" == *"setup"* ]]; then
    echo -e "${GREEN}✅ Correct!${NC}"
else
    echo -e "${YELLOW}The typical first command is 'npm install'${NC}"
fi
collect_feedback "setup_discovery"

# Test 4: Run Setup Wizard
echo ""
echo -e "${GREEN}Task 4: Run the setup wizard${NC}"
echo "Try running: npm run setup:guided"
echo "Complete the setup wizard and press Enter when done..."
TASK4_START=$(date +%s)
read -r
echo "Were you able to complete the setup? (yes/no): "
read -r SETUP_SUCCESS
log_metric "setup_wizard" "$TASK4_START" "$([[ "$SETUP_SUCCESS" == "yes" ]] && echo true || echo false)"
collect_feedback "setup_wizard"

# Test 5: Generator Discovery
echo ""
echo -e "${GREEN}Task 5: Discover the code generators${NC}"
echo "Find how to generate a new component."
echo "What command would you use? "
TASK5_START=$(date +%s)
read -r GENERATOR_COMMAND
log_metric "generator_discovery" "$TASK5_START" true

if [[ "$GENERATOR_COMMAND" == *"g:c"* ]] || [[ "$GENERATOR_COMMAND" == *"demo:generators"* ]]; then
    echo -e "${GREEN}✅ Great job!${NC}"
else
    echo -e "${YELLOW}Hint: Try 'npm run demo:generators' to see all generators${NC}"
fi
collect_feedback "generator_discovery"

# Test 6: Generate Component
echo ""
echo -e "${GREEN}Task 6: Generate your first component${NC}"
echo "Use the generator to create a component called 'UserCard'"
echo "Starting timer now..."
TASK6_START=$(date +%s)
echo "Press Enter when the component is generated..."
read -r
TASK6_END=$(date +%s)
GENERATOR_DURATION=$((TASK6_END - TASK6_START))

echo "Were you able to generate the component? (yes/no): "
read -r GEN_SUCCESS
log_metric "component_generation" "$TASK6_START" "$([[ "$GEN_SUCCESS" == "yes" ]] && echo true || echo false)"

echo -e "${BLUE}Generation took: ${GENERATOR_DURATION} seconds${NC}"
if [[ $GENERATOR_DURATION -le 30 ]]; then
    echo -e "${GREEN}✅ Within 30-second target!${NC}"
else
    echo -e "${YELLOW}⚠️  Exceeded 30-second target${NC}"
fi
collect_feedback "component_generation"

# Calculate total time
TOTAL_END=$(date +%s)
TOTAL_DURATION=$((TOTAL_END - START_TIME))
TOTAL_MINUTES=$((TOTAL_DURATION / 60))

# Final Survey
echo ""
echo -e "${PURPLE}📝 Final Survey${NC}"
echo "================"

SURVEY_FILE="$SESSION_DIR/final-survey.txt"
{
    echo "Session: $SESSION_ID"
    echo "User: $USER_NAME"
    echo "Total Duration: ${TOTAL_MINUTES} minutes"
    echo ""
    echo "1. How long did it take to create your first component?"
    read -r -p "   Answer: " ANSWER1
    echo "   Answer: $ANSWER1"
    echo ""
    
    echo "2. What was the most confusing part?"
    read -r -p "   Answer: " ANSWER2
    echo "   Answer: $ANSWER2"
    echo ""
    
    echo "3. Which documentation was most helpful?"
    read -r -p "   Answer: " ANSWER3
    echo "   Answer: $ANSWER3"
    echo ""
    
    echo "4. What would you change about the setup process?"
    read -r -p "   Answer: " ANSWER4
    echo "   Answer: $ANSWER4"
    echo ""
    
    echo "5. Would you recommend this to a colleague? (1-10)"
    read -r -p "   Rating: " RATING
    echo "   Rating: $RATING"
    echo ""
    
    echo "6. Overall experience rating (1-10)"
    read -r -p "   Rating: " OVERALL
    echo "   Rating: $OVERALL"
    echo ""
    
    echo "7. Any other comments?"
    echo "   (Press Ctrl+D when done)"
    echo "   Comments:"
    cat
} > "$SURVEY_FILE"

# Generate summary report
REPORT_FILE="$SESSION_DIR/summary-report.md"
cat > "$REPORT_FILE" << EOF
# User Testing Session Report

**Session ID:** $SESSION_ID  
**User:** $USER_NAME  
**Experience Level:** $EXPERIENCE_LEVEL  
**Date:** $(date)

## Time Metrics

Total Duration: ${TOTAL_MINUTES} minutes

### Task Breakdown:
EOF

# Add metrics from JSON
echo '```' >> "$REPORT_FILE"
jq -r '.[] | "\(.task): \(.duration)s (\(.success))"' "$METRICS_FILE" >> "$REPORT_FILE"
echo '```' >> "$REPORT_FILE"

cat >> "$REPORT_FILE" << EOF

## Key Findings

### Time to First Success
- Target: <5 minutes
- Actual: ${TOTAL_MINUTES} minutes
- Status: $([[ $TOTAL_MINUTES -le 5 ]] && echo "✅ PASS" || echo "❌ FAIL")

### Generator Performance  
- Target: ~30 seconds
- Actual: ${GENERATOR_DURATION} seconds
- Status: $([[ $GENERATOR_DURATION -le 30 ]] && echo "✅ PASS" || echo "❌ FAIL")

## Recommendations

Based on this session:
1. Review feedback files for specific friction points
2. Update documentation where users got confused
3. Optimize any slow-performing steps

## Files Generated
- session-info.json - Basic session data
- metrics.json - Timing data for each task
- feedback-*.txt - User feedback for each task
- final-survey.txt - Exit survey responses
- summary-report.md - This report
EOF

# Display summary
echo ""
echo -e "${GREEN}✅ Testing session complete!${NC}"
echo ""
echo -e "${BLUE}Summary:${NC}"
echo "- Total time: ${TOTAL_MINUTES} minutes"
echo "- Generator performance: ${GENERATOR_DURATION} seconds"
echo "- Session data saved to: $SESSION_DIR"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Review feedback files in $SESSION_DIR"
echo "2. Add findings to user testing tracker"
echo "3. Prioritize fixes based on friction points"
echo ""

# Create aggregate report if multiple sessions exist
if [[ $(find "$TEST_RESULTS_DIR" -name "session-*" -type d | wc -l) -ge 5 ]]; then
    echo -e "${PURPLE}📊 Generating aggregate report (5+ sessions found)${NC}"
    
    AGGREGATE_FILE="$TEST_RESULTS_DIR/aggregate-report-$(date +%Y%m%d).md"
    echo "# Aggregate User Testing Report" > "$AGGREGATE_FILE"
    echo "Generated: $(date)" >> "$AGGREGATE_FILE"
    echo "" >> "$AGGREGATE_FILE"
    echo "## Sessions Analyzed" >> "$AGGREGATE_FILE"
    
    # Analyze all sessions
    for session in "$TEST_RESULTS_DIR"/session-*/; do
        if [[ -f "$session/metrics.json" ]]; then
            echo "- $(basename "$session")" >> "$AGGREGATE_FILE"
        fi
    done
    
    echo "" >> "$AGGREGATE_FILE"
    echo "Full aggregate analysis available at: $AGGREGATE_FILE"
fi