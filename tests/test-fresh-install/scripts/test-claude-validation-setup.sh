#!/bin/bash

# Comprehensive test script for claude-validation setup
# Tests all components and functionality after installation

set -euo pipefail

# ANSI color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test results tracking
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=()

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_header() {
    echo -e "\n${CYAN}🧪 $1${NC}"
}

# Test result tracking
pass_test() {
    local test_name="$1"
    ((TESTS_PASSED++))
    log_success "PASS: $test_name"
}

fail_test() {
    local test_name="$1"
    local reason="$2"
    ((TESTS_FAILED++))
    FAILED_TESTS+=("$test_name: $reason")
    log_error "FAIL: $test_name - $reason"
}

# Test functions
test_project_structure() {
    log_header "Testing Project Structure"
    
    # Test required directories
    if [[ -d "tools/claude-validation" ]]; then
        pass_test "claude-validation directory exists"
    else
        fail_test "claude-validation directory" "Directory not found"
    fi
    
    # Test required files
    local required_files=(
        "tools/claude-validation/compliance-validator.js"
        "tools/claude-validation/validate-claude.js"
        "tools/claude-validation/test-compliance.js"
        "tools/claude-validation/config-manager.js"
        "tools/claude-validation/.claude-validation-config.json"
        "scripts/setup-claude-validation.sh"
        "scripts/ensure-claude-scripts.js"
    )
    
    for file in "${required_files[@]}"; do
        if [[ -f "$file" ]]; then
            pass_test "File exists: $file"
        else
            fail_test "File missing" "$file not found"
        fi
    done
}

test_configuration() {
    log_header "Testing Configuration"
    
    # Test config file is valid JSON
    local config_file="tools/claude-validation/.claude-validation-config.json"
    if node -e "JSON.parse(require('fs').readFileSync('$config_file', 'utf-8'))" 2>/dev/null; then
        pass_test "Configuration file is valid JSON"
    else
        fail_test "Configuration JSON" "Invalid JSON format"
    fi
    
    # Test config manager
    if node tools/claude-validation/config-manager.js status > /dev/null 2>&1; then
        pass_test "Configuration manager works"
    else
        fail_test "Configuration manager" "Status command failed"
    fi
    
    # Test configuration changes
    local original_severity=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$config_file', 'utf-8')).severityLevels.global)")
    
    if node tools/claude-validation/config-manager.js set-severity INFO > /dev/null 2>&1; then
        local new_severity=$(node -e "console.log(JSON.parse(require('fs').readFileSync('$config_file', 'utf-8')).severityLevels.global)")
        if [[ "$new_severity" == "INFO" ]]; then
            pass_test "Configuration modification works"
            # Restore original
            node tools/claude-validation/config-manager.js set-severity "$original_severity" > /dev/null 2>&1
        else
            fail_test "Configuration modification" "Severity not changed"
        fi
    else
        fail_test "Configuration modification" "set-severity command failed"
    fi
}

test_npm_scripts() {
    log_header "Testing npm Scripts"
    
    local required_scripts=(
        "claude:config:status"
        "claude:test"
        "claude:validate"
        "claude:stats"
        "claude:config"
    )
    
    for script in "${required_scripts[@]}"; do
        if npm run "$script" --silent > /dev/null 2>&1; then
            pass_test "npm script: $script"
        else
            fail_test "npm script" "$script does not run successfully"
        fi
    done
    
    # Test script installer
    if node scripts/ensure-claude-scripts.js validate > /dev/null 2>&1; then
        pass_test "Script installer validation"
    else
        fail_test "Script installer" "Validation failed"
    fi
}

test_validation_functionality() {
    log_header "Testing Validation Functionality"
    
    # Test compliance validator module loading
    if node -e "require('./tools/claude-validation/compliance-validator.js')" 2>/dev/null; then
        pass_test "Compliance validator module loads"
    else
        fail_test "Compliance validator" "Module loading failed"
    fi
    
    # Test pattern detection with sample inputs
    local test_response_dir="/tmp/claude-test-$$"
    mkdir -p "$test_response_dir"
    
    # Test case 1: Good response (should pass)
    cat > "$test_response_dir/good.txt" << 'EOF'
**Improved Prompt**: You are a React developer. Create a login component that handles authentication.

I'll create a login component with proper form validation and error handling.
EOF
    
    if echo "$(cat "$test_response_dir/good.txt")" | node tools/claude-validation/validate-claude.js - --complex --quiet; then
        pass_test "Good response validation"
    else
        fail_test "Good response validation" "Should have passed validation"
    fi
    
    # Test case 2: Bad response (should fail)
    cat > "$test_response_dir/bad.txt" << 'EOF'
I'll create login_improved.js with better authentication handling.
EOF
    
    if ! echo "$(cat "$test_response_dir/bad.txt")" | node tools/claude-validation/validate-claude.js - --complex --quiet; then
        pass_test "Bad response validation"
    else
        fail_test "Bad response validation" "Should have failed validation"
    fi
    
    # Cleanup
    rm -rf "$test_response_dir"
    
    # Test compliance test suite
    if npm run claude:test > /dev/null 2>&1; then
        pass_test "Compliance test suite runs"
    else
        fail_test "Compliance test suite" "Test suite failed to run"
    fi
}

test_pattern_rules() {
    log_header "Testing Pattern Rules"
    
    # Test each pattern individually by temporarily enabling/disabling
    local patterns=("promptImprovement" "noImprovedFiles" "generatorUsage" "todoWriteUsage" "originalFileEditing" "conciseResponse")
    
    for pattern in "${patterns[@]}"; do
        # Test enabling pattern
        if node tools/claude-validation/config-manager.js enable "$pattern" > /dev/null 2>&1; then
            # Verify it's enabled
            local enabled=$(node -e "console.log(JSON.parse(require('fs').readFileSync('tools/claude-validation/.claude-validation-config.json', 'utf-8')).patterns.$pattern.enabled)")
            if [[ "$enabled" == "true" ]]; then
                pass_test "Pattern enable: $pattern"
            else
                fail_test "Pattern enable" "$pattern not enabled"
            fi
        else
            fail_test "Pattern enable" "$pattern enable command failed"
        fi
        
        # Test disabling pattern
        if node tools/claude-validation/config-manager.js disable "$pattern" > /dev/null 2>&1; then
            # Verify it's disabled
            local enabled=$(node -e "console.log(JSON.parse(require('fs').readFileSync('tools/claude-validation/.claude-validation-config.json', 'utf-8')).patterns.$pattern.enabled)")
            if [[ "$enabled" == "false" ]]; then
                pass_test "Pattern disable: $pattern"
                # Re-enable for consistency
                node tools/claude-validation/config-manager.js enable "$pattern" > /dev/null 2>&1
            else
                fail_test "Pattern disable" "$pattern not disabled"
            fi
        else
            fail_test "Pattern disable" "$pattern disable command failed"
        fi
    done
}

test_error_handling() {
    log_header "Testing Error Handling"
    
    # Test invalid pattern name
    if ! node tools/claude-validation/config-manager.js enable "invalidPattern" > /dev/null 2>&1; then
        pass_test "Invalid pattern name rejected"
    else
        fail_test "Error handling" "Invalid pattern name accepted"
    fi
    
    # Test invalid severity level
    if ! node tools/claude-validation/config-manager.js set-severity "INVALID" > /dev/null 2>&1; then
        pass_test "Invalid severity level rejected"
    else
        fail_test "Error handling" "Invalid severity level accepted"
    fi
    
    # Test missing input file
    if ! node tools/claude-validation/validate-claude.js "/nonexistent/file.txt" > /dev/null 2>&1; then
        pass_test "Missing input file handled"
    else
        fail_test "Error handling" "Missing file not handled"
    fi
}

# Run all tests
run_all_tests() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║              Claude Validation Setup Tests                  ║"
    echo "║                 Comprehensive Verification                  ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    test_project_structure
    test_configuration
    test_npm_scripts
    test_validation_functionality
    test_pattern_rules
    test_error_handling
    
    # Print summary
    echo -e "\n${CYAN}📊 Test Summary${NC}"
    echo "─────────────────────────────────────────────"
    echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
    echo -e "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
    
    if [[ $TESTS_FAILED -gt 0 ]]; then
        echo -e "\n${RED}❌ Failed Tests:${NC}"
        for failed_test in "${FAILED_TESTS[@]}"; do
            echo -e "  ${RED}•${NC} $failed_test"
        done
        echo ""
        log_error "Some tests failed. Please review the setup."
        exit 1
    else
        echo ""
        log_success "All tests passed! Claude validation system is working correctly."
        
        echo -e "\n${GREEN}🎉 Setup verification complete!${NC}"
        echo "Claude validation system is ready for use."
        echo ""
        echo -e "${CYAN}Next steps:${NC}"
        echo "  1. Try: npm run claude:config:status"
        echo "  2. Try: echo 'test response' | npm run claude:validate"
        echo "  3. Customize patterns in tools/claude-validation/.claude-validation-config.json"
    fi
}

# Run if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    run_all_tests "$@"
fi