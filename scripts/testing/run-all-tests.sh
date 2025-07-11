#!/bin/bash

# ProjectTemplate Comprehensive Test Runner
# Runs all validation tests and provides overall assessment
# Usage: ./scripts/testing/run-all-tests.sh [--verbose] [--html-report]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Options
VERBOSE=false
HTML_REPORT=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --verbose|-v)
            VERBOSE=true
            shift
            ;;
        --html-report|--html)
            HTML_REPORT=true
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [--verbose] [--html-report]"
            echo "  --verbose, -v     Show detailed output"
            echo "  --html-report     Generate HTML report"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Test results tracking (using regular arrays since associative arrays may not be available)
TEST_NAMES=()
TEST_RESULTS=()
TEST_DURATIONS=()
START_TIME=$(date +%s)

echo -e "${CYAN}🧪 ProjectTemplate Comprehensive Validation Suite${NC}"
echo -e "${CYAN}=================================================${NC}"
echo ""
echo "Starting comprehensive validation at $(date)"
echo ""

# Helper function to run a test suite
run_test_suite() {
    local test_name="$1"
    local test_script="$2"
    local description="$3"
    
    echo -e "${BLUE}🔍 Running $test_name...${NC}"
    echo -e "${BLUE}$description${NC}"
    echo ""
    
    local suite_start=$(date +%s)
    local result=0
    
    if [[ $VERBOSE == true ]]; then
        if $test_script; then
            result=0
        else
            result=1
        fi
    else
        if $test_script > /tmp/test-${test_name}.log 2>&1; then
            result=0
        else
            result=1
        fi
    fi
    
    local suite_end=$(date +%s)
    local duration=$((suite_end - suite_start))
    
    TEST_NAMES+=("$test_name")
    TEST_RESULTS+=($result)
    TEST_DURATIONS+=($duration)
    
    if [[ $result -eq 0 ]]; then
        echo -e "${GREEN}✅ $test_name completed successfully${NC} (${duration}s)"
    else
        echo -e "${RED}❌ $test_name failed${NC} (${duration}s)"
        if [[ $VERBOSE == false ]]; then
            echo -e "${RED}   Check /tmp/test-${test_name}.log for details${NC}"
        fi
    fi
    
    echo ""
}

# Test Suite 1: Functional Validation
run_test_suite "Functional" \
    "./scripts/testing/test-template-functionality.sh" \
    "Tests basic template functionality, structure, and scripts"

# Test Suite 2: AI Integration
run_test_suite "AI-Integration" \
    "./scripts/testing/test-ai-integration.sh" \
    "Tests AI tool integration and effectiveness"

# Test Suite 3: User Experience
run_test_suite "User-Experience" \
    "./scripts/testing/test-user-experience.sh" \
    "Tests usability, documentation, and developer experience"

# Calculate overall results
TOTAL_TESTS=${#TEST_RESULTS[@]}
PASSED_TESTS=0
FAILED_TESTS=0
TOTAL_DURATION=0

for ((i=0; i<${#TEST_RESULTS[@]}; i++)); do
    if [[ ${TEST_RESULTS[$i]} -eq 0 ]]; then
        ((PASSED_TESTS++))
    else
        ((FAILED_TESTS++))
    fi
    TOTAL_DURATION=$((TOTAL_DURATION + TEST_DURATIONS[$i]))
done

END_TIME=$(date +%s)
OVERALL_DURATION=$((END_TIME - START_TIME))

# Generate Summary Report
echo -e "${CYAN}📊 Overall Test Results Summary${NC}"
echo -e "${CYAN}===============================${NC}"
echo ""
echo "Test Execution Summary:"
echo "  Total Test Suites: $TOTAL_TESTS"
echo -e "  Passed: ${GREEN}$PASSED_TESTS${NC}"
echo -e "  Failed: ${RED}$FAILED_TESTS${NC}"
echo "  Total Duration: ${OVERALL_DURATION}s"
echo ""

# Detailed Results
echo "Detailed Results:"
for ((i=0; i<${#TEST_NAMES[@]}; i++)); do
    test_name=${TEST_NAMES[$i]}
    result=${TEST_RESULTS[$i]}
    duration=${TEST_DURATIONS[$i]}
    
    if [[ $result -eq 0 ]]; then
        echo -e "  ${GREEN}✅ $test_name${NC} (${duration}s)"
    else
        echo -e "  ${RED}❌ $test_name${NC} (${duration}s)"
    fi
done

echo ""

# Calculate overall score
if [[ $TOTAL_TESTS -gt 0 ]]; then
    OVERALL_SCORE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo "Overall Template Health Score: $OVERALL_SCORE%"
    echo ""
    
    # Health assessment
    if [[ $OVERALL_SCORE -eq 100 ]]; then
        echo -e "${GREEN}🎉 EXCELLENT: Template is production-ready!${NC}"
        echo -e "${GREEN}All test suites passed. Template is ready for use.${NC}"
    elif [[ $OVERALL_SCORE -ge 80 ]]; then
        echo -e "${YELLOW}⚠️  GOOD: Template is mostly ready with minor issues${NC}"
        echo -e "${YELLOW}Most tests passed. Address failed tests before production use.${NC}"
    elif [[ $OVERALL_SCORE -ge 60 ]]; then
        echo -e "${RED}❌ NEEDS IMPROVEMENT: Template has significant issues${NC}"
        echo -e "${RED}Multiple test failures. Significant work needed before use.${NC}"
    else
        echo -e "${RED}❌ POOR: Template is not ready for use${NC}"
        echo -e "${RED}Major test failures. Template needs substantial work.${NC}"
    fi
fi

echo ""

# Recommendations based on failed tests
echo -e "${PURPLE}🔧 Recommendations${NC}"
echo -e "${PURPLE}=================${NC}"

# Check results by finding the test index
FUNCTIONAL_FAILED=false
AI_FAILED=false
UX_FAILED=false

for ((i=0; i<${#TEST_NAMES[@]}; i++)); do
    case ${TEST_NAMES[$i]} in
        "Functional")
            if [[ ${TEST_RESULTS[$i]} -ne 0 ]]; then
                FUNCTIONAL_FAILED=true
            fi
            ;;
        "AI-Integration")
            if [[ ${TEST_RESULTS[$i]} -ne 0 ]]; then
                AI_FAILED=true
            fi
            ;;
        "User-Experience")
            if [[ ${TEST_RESULTS[$i]} -ne 0 ]]; then
                UX_FAILED=true
            fi
            ;;
    esac
done

if [[ $FUNCTIONAL_FAILED == true ]]; then
    echo "❌ Functional Issues Detected:"
    echo "  • Fix basic template structure and script errors"
    echo "  • Ensure all configuration files are valid"
    echo "  • Test all npm scripts and generators"
fi

if [[ $AI_FAILED == true ]]; then
    echo "❌ AI Integration Issues Detected:"
    echo "  • Review and improve .cursorrules configuration"
    echo "  • Add more comprehensive AI prompt templates"
    echo "  • Optimize context management and file exclusions"
fi

if [[ $UX_FAILED == true ]]; then
    echo "❌ User Experience Issues Detected:"
    echo "  • Improve documentation clarity and navigation"
    echo "  • Enhance error handling and user feedback"
    echo "  • Simplify initial setup and onboarding"
fi

if [[ $FAILED_TESTS -eq 0 ]]; then
    echo -e "${GREEN}✅ All tests passed! No immediate issues detected.${NC}"
    echo ""
    echo "Next Steps:"
    echo "  1. Consider real-world testing with actual projects"
    echo "  2. Gather feedback from other developers"
    echo "  3. Monitor template usage and iterate based on feedback"
fi

echo ""

# Generate HTML Report (if requested)
if [[ $HTML_REPORT == true ]]; then
    echo -e "${BLUE}📝 Generating HTML Report...${NC}"
    
    local report_file="template-validation-report-$(date +%Y%m%d-%H%M%S).html"
    
    cat > "$report_file" << EOF
<!DOCTYPE html>
<html>
<head>
    <title>ProjectTemplate Validation Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f0f0f0; padding: 20px; border-radius: 5px; }
        .pass { color: #28a745; }
        .fail { color: #dc3545; }
        .score { font-size: 24px; font-weight: bold; }
        .test-suite { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .recommendations { background: #fff3cd; padding: 15px; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>ProjectTemplate Validation Report</h1>
        <p>Generated: $(date)</p>
        <p class="score">Overall Health Score: $OVERALL_SCORE%</p>
    </div>
    
    <h2>Test Results</h2>
EOF

    for ((i=0; i<${#TEST_NAMES[@]}; i++)); do
        test_name=${TEST_NAMES[$i]}
        result=${TEST_RESULTS[$i]}
        duration=${TEST_DURATIONS[$i]}
        status_class="fail"
        status_text="FAILED"
        
        if [[ $result -eq 0 ]]; then
            status_class="pass"
            status_text="PASSED"
        fi
        
        cat >> "$report_file" << EOF
    <div class="test-suite">
        <h3 class="$status_class">$test_name - $status_text</h3>
        <p>Duration: ${duration}s</p>
    </div>
EOF
    done
    
    cat >> "$report_file" << EOF
    
    <div class="recommendations">
        <h2>Recommendations</h2>
        <p>Review failed test suites and address identified issues before production use.</p>
    </div>
    
</body>
</html>
EOF

    echo -e "${GREEN}✅ HTML report generated: $report_file${NC}"
    echo ""
fi

# Additional validation suggestions
echo -e "${CYAN}🚀 Additional Validation Suggestions${NC}"
echo -e "${CYAN}===================================${NC}"
echo ""
echo "For comprehensive validation, consider these additional tests:"
echo ""
echo "1. 🏗️  Real Project Creation:"
echo "   • Create actual projects using the template"
echo "   • Test with different tech stacks"
echo "   • Measure setup time and developer productivity"
echo ""
echo "2. 🤖 AI Tool Integration:"
echo "   • Test with Claude, Cursor, GitHub Copilot"
echo "   • Measure AI suggestion accuracy improvements"
echo "   • Test context optimization effectiveness"
echo ""
echo "3. 👥 User Testing:"
echo "   • Onboard new developers using the template"
echo "   • Gather feedback through surveys"
echo "   • Measure time-to-productivity metrics"
echo ""
echo "4. 📈 Long-term Monitoring:"
echo "   • Track template usage patterns"
echo "   • Monitor code quality in template-based projects"
echo "   • Measure maintenance overhead"
echo ""

# Final exit code
if [[ $FAILED_TESTS -eq 0 ]]; then
    echo -e "${GREEN}🎉 All validation tests passed! Template is ready for use.${NC}"
    exit 0
else
    echo -e "${RED}❌ $FAILED_TESTS test suite(s) failed. Please address issues before use.${NC}"
    exit 1
fi