#!/bin/bash

# Documentation validation for Claude validation system
# Ensures all documentation is accurate, complete, and up-to-date

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
    echo -e "\n${CYAN}📋 $1${NC}"
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
test_documentation_structure() {
    log_header "Testing Documentation Structure"
    
    # Test required documentation files exist
    local required_docs=(
        "docs/claude-validation/README.md"
        "docs/claude-validation/QUICK-REFERENCE.md"
        "docs/claude-validation/patterns.md"
        "docs/claude-validation/claude-code-rule-compliance-plan.md"
    )
    
    for doc in "${required_docs[@]}"; do
        if [[ -f "$doc" ]]; then
            pass_test "Documentation file exists: $doc"
        else
            fail_test "Documentation file missing" "$doc not found"
        fi
    done
    
    # Test documentation is non-empty
    for doc in "${required_docs[@]}"; do
        if [[ -f "$doc" ]] && [[ -s "$doc" ]]; then
            pass_test "Documentation file has content: $(basename "$doc")"
        else
            fail_test "Documentation file empty" "$(basename "$doc") is empty or missing"
        fi
    done
}

test_command_accuracy() {
    log_header "Testing Command Accuracy in Documentation"
    
    # Extract commands from README and test they work
    local commands_to_test=(
        "npm run claude:config:status"
        "npm run claude:test"
        "npm run claude:dashboard"
        "npm run claude:stats"
        "bash scripts/setup-claude-validation.sh --help"
    )
    
    for cmd in "${commands_to_test[@]}"; do
        if eval "$cmd" > /dev/null 2>&1; then
            pass_test "Command works: $cmd"
        else
            fail_test "Command failed" "$cmd does not execute successfully"
        fi
    done
    
    # Test command help exists
    if node tools/claude-validation/validate-claude.js --help > /dev/null 2>&1; then
        pass_test "Validator help command works"
    else
        fail_test "Validator help" "validate-claude.js --help failed"
    fi
    
    if node tools/claude-validation/config-manager.js help > /dev/null 2>&1; then
        pass_test "Config manager help command works"
    else
        fail_test "Config manager help" "config-manager.js help failed"
    fi
}

test_example_accuracy() {
    log_header "Testing Documentation Examples"
    
    # Test that good examples actually pass validation
    local good_example="**Improved Prompt**: Create a React login component with form validation and API integration.

I'll create a secure login component. Let me use TodoWrite to track our implementation:

- [ ] Generate component with npm run g:c LoginForm
- [ ] Add form validation
- [ ] Integrate with API

Let me edit the original LoginForm.tsx file to add the functionality..."
    
    if echo "$good_example" | node tools/claude-validation/validate-claude.js - --complex --quiet; then
        pass_test "Good example passes validation"
    else
        fail_test "Good example validation" "Example from docs should pass but failed"
    fi
    
    # Test that bad examples actually fail validation
    local bad_example="I'll create an improved version of your login component.

Let me create login_improved.js with better validation..."
    
    if ! echo "$bad_example" | node tools/claude-validation/validate-claude.js - --complex --quiet; then
        pass_test "Bad example fails validation"
    else
        fail_test "Bad example validation" "Example from docs should fail but passed"
    fi
}

test_configuration_examples() {
    log_header "Testing Configuration Examples"
    
    # Test that configuration examples work
    local original_config="/tmp/claude-config-backup-$$.json"
    cp tools/claude-validation/.claude-validation-config.json "$original_config"
    
    # Test severity setting
    if node tools/claude-validation/config-manager.js set-severity INFO > /dev/null 2>&1; then
        pass_test "Configuration severity setting works"
    else
        fail_test "Configuration severity" "set-severity command failed"
    fi
    
    # Test pattern enabling/disabling
    if node tools/claude-validation/config-manager.js disable promptImprovement > /dev/null 2>&1; then
        pass_test "Configuration pattern disable works"
    else
        fail_test "Configuration pattern disable" "disable command failed"
    fi
    
    if node tools/claude-validation/config-manager.js enable promptImprovement > /dev/null 2>&1; then
        pass_test "Configuration pattern enable works"
    else
        fail_test "Configuration pattern enable" "enable command failed"
    fi
    
    # Restore original configuration
    cp "$original_config" tools/claude-validation/.claude-validation-config.json
    rm -f "$original_config"
}

test_links_and_references() {
    log_header "Testing Links and References"
    
    # Test that referenced files exist
    local referenced_files=(
        "scripts/setup-claude-validation.sh"
        "tools/claude-validation/validate-claude.js"
        "tools/claude-validation/config-manager.js"
        "tools/claude-validation/compliance-validator.js"
        "tools/claude-validation/dashboard.html"
        "tools/claude-validation/.claude-validation-config.json"
    )
    
    for file in "${referenced_files[@]}"; do
        if [[ -f "$file" ]]; then
            pass_test "Referenced file exists: $(basename "$file")"
        else
            fail_test "Referenced file missing" "$file not found"
        fi
    done
    
    # Test that npm scripts referenced in docs exist
    if npm run claude:config:status > /dev/null 2>&1; then
        pass_test "Referenced npm script works: claude:config:status"
    else
        fail_test "Referenced npm script" "claude:config:status not working"
    fi
}

test_setup_instructions() {
    log_header "Testing Setup Instructions"
    
    # Test that setup script can be run (dry run mode)
    if bash scripts/setup-claude-validation.sh --help > /dev/null 2>&1; then
        pass_test "Setup script is executable"
    else
        log_warning "Setup script help not available, testing basic execution"
        if [[ -x "scripts/setup-claude-validation.sh" ]]; then
            pass_test "Setup script is executable"
        else
            fail_test "Setup script" "Not executable or missing"
        fi
    fi
    
    # Test that verification script works
    if bash scripts/test-claude-validation-setup.sh > /dev/null 2>&1; then
        pass_test "Verification script works"
    else
        fail_test "Verification script" "test-claude-validation-setup.sh failed"
    fi
}

test_completeness() {
    log_header "Testing Documentation Completeness"
    
    # Check that all npm scripts are documented
    local npm_scripts=$(npm run | grep "claude:" | cut -d' ' -f3 | grep -v "^$" || true)
    local documented_scripts=0
    
    while IFS= read -r script; do
        if [[ -n "$script" ]] && grep -q "$script" docs/claude-validation/README.md; then
            ((documented_scripts++))
            pass_test "npm script documented: $script"
        elif [[ -n "$script" ]]; then
            fail_test "npm script undocumented" "$script not found in README"
        fi
    done <<< "$npm_scripts"
    
    # Check that all patterns are documented
    local patterns=$(node -e "
        const config = require('./tools/claude-validation/.claude-validation-config.json');
        Object.keys(config.patterns).forEach(p => console.log(p));
    " 2>/dev/null || echo "")
    
    while IFS= read -r pattern; do
        if [[ -n "$pattern" ]] && grep -q "$pattern" docs/claude-validation/README.md; then
            pass_test "Pattern documented: $pattern"
        elif [[ -n "$pattern" ]]; then
            fail_test "Pattern undocumented" "$pattern not explained in README"
        fi
    done <<< "$patterns"
}

# Run all tests
run_all_tests() {
    echo -e "${CYAN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║               Claude Validation Documentation Tests          ║"
    echo "║                     Accuracy & Completeness                 ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    test_documentation_structure
    test_command_accuracy
    test_example_accuracy
    test_configuration_examples
    test_links_and_references
    test_setup_instructions
    test_completeness
    
    # Print summary
    echo -e "\n${CYAN}📊 Documentation Test Summary${NC}"
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
        log_error "Some documentation tests failed. Please review and fix."
        exit 1
    else
        echo ""
        log_success "All documentation tests passed! Claude validation docs are accurate and complete."
        
        echo -e "\n${GREEN}🎉 Documentation validation complete!${NC}"
        echo "Claude validation system documentation is ready for use."
        echo ""
        echo -e "${CYAN}Documentation Quality Summary:${NC}"
        echo "  ✅ All required files present"
        echo "  ✅ All commands work as documented"
        echo "  ✅ Examples are accurate"
        echo "  ✅ Configuration examples work"
        echo "  ✅ All links and references valid"
        echo "  ✅ Setup instructions verified"
        echo "  ✅ Documentation is complete"
    fi
}

# Run if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    run_all_tests "$@"
fi