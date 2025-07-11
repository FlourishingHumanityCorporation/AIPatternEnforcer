#!/bin/bash

# Template Functionality Test Suite
# Tests all core functionality of the ProjectTemplate system
# Usage: ./scripts/testing/test-template-functionality.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Test result tracking
TEST_RESULTS=()

echo "🧪 ProjectTemplate Functionality Test Suite"
echo "=========================================="
echo ""

# Helper functions
pass_test() {
    local test_name="$1"
    echo -e "${GREEN}✅ PASS${NC}: $test_name"
    ((TESTS_PASSED++))
    ((TESTS_TOTAL++))
    TEST_RESULTS+=("PASS: $test_name")
}

fail_test() {
    local test_name="$1"
    local error_msg="$2"
    echo -e "${RED}❌ FAIL${NC}: $test_name"
    if [[ -n "$error_msg" ]]; then
        echo -e "${RED}   Error: $error_msg${NC}"
    fi
    ((TESTS_FAILED++))
    ((TESTS_TOTAL++))
    TEST_RESULTS+=("FAIL: $test_name - $error_msg")
}

skip_test() {
    local test_name="$1"
    local reason="$2"
    echo -e "${YELLOW}⏭️  SKIP${NC}: $test_name ($reason)"
    ((TESTS_TOTAL++))
    TEST_RESULTS+=("SKIP: $test_name - $reason")
}

# Test 1: Template Structure Validation
echo "📁 Testing Template Structure..."
test_template_structure() {
    local required_dirs=("docs" "ai" "config" "scripts" "templates" "tools")
    local required_files=("CLAUDE.md" "README.md" "package.json" ".aiignore")
    
    for dir in "${required_dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            fail_test "Directory $dir exists" "Directory not found"
            return 1
        fi
    done
    
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            fail_test "File $file exists" "File not found"
            return 1
        fi
    done
    
    pass_test "Template structure is complete"
}

test_template_structure

# Test 2: Package.json Scripts
echo "📦 Testing Package.json Scripts..."
test_package_scripts() {
    local required_scripts=("cleanup:template" "g:component" "ai:context" "debug:snapshot")
    
    for script in "${required_scripts[@]}"; do
        if ! npm run-script --silent "$script" --help &>/dev/null; then
            # Check if script exists in package.json
            if ! grep -q "\"$script\":" package.json; then
                fail_test "Script $script exists" "Script not found in package.json"
                return 1
            fi
        fi
    done
    
    pass_test "All required npm scripts are defined"
}

test_package_scripts

# Test 3: Configuration Files Validation
echo "⚙️  Testing Configuration Files..."
test_configurations() {
    # Test TypeScript config
    if [[ -f "config/typescript/tsconfig.base.json" ]]; then
        if ! node -e "JSON.parse(require('fs').readFileSync('config/typescript/tsconfig.base.json', 'utf8'))" &>/dev/null; then
            fail_test "TypeScript config is valid JSON" "Invalid JSON in tsconfig.base.json"
            return 1
        fi
    fi
    
    # Test package.json is valid
    if ! node -e "JSON.parse(require('fs').readFileSync('package.json', 'utf8'))" &>/dev/null; then
        fail_test "package.json is valid JSON" "Invalid JSON in package.json"
        return 1
    fi
    
    # Test .aiignore exists and has content
    if [[ -f ".aiignore" && -s ".aiignore" ]]; then
        pass_test "Configuration files are valid"
    else
        fail_test "Configuration files are valid" ".aiignore is empty or missing"
        return 1
    fi
}

test_configurations

# Test 4: AI Configuration Files
echo "🤖 Testing AI Configuration Files..."
test_ai_configs() {
    # Test .cursorrules exists
    if [[ ! -f "ai/config/.cursorrules" ]]; then
        fail_test "AI cursorrules file exists" "File not found"
        return 1
    fi
    
    # Test AI prompts directory structure
    local prompt_dirs=("feature" "debugging" "testing" "refactoring")
    for dir in "${prompt_dirs[@]}"; do
        if [[ ! -d "ai/prompts/$dir" ]]; then
            fail_test "AI prompt directory $dir exists" "Directory not found"
            return 1
        fi
    done
    
    # Test examples directory structure
    if [[ ! -d "ai/examples/good-patterns" ]] || [[ ! -d "ai/examples/anti-patterns" ]]; then
        fail_test "AI examples directories exist" "Good-patterns or anti-patterns directory not found"
        return 1
    fi
    
    pass_test "AI configuration files are present"
}

test_ai_configs

# Test 5: Script Executability
echo "🔧 Testing Script Executability..."
test_script_executability() {
    local scripts=("scripts/init/cleanup-template.sh" "scripts/dev/ai-context-dump.sh")
    
    for script in "${scripts[@]}"; do
        if [[ -f "$script" ]]; then
            if [[ ! -x "$script" ]]; then
                fail_test "Script $script is executable" "Script exists but is not executable"
                return 1
            fi
        else
            fail_test "Script $script exists" "Script not found"
            return 1
        fi
    done
    
    pass_test "All scripts are executable"
}

test_script_executability

# Test 6: Documentation Completeness
echo "📚 Testing Documentation..."
test_documentation() {
    # Test CLAUDE.md has required sections
    local required_sections=("Critical Rules" "Quick Start Commands" "Testing Requirements")
    
    for section in "${required_sections[@]}"; do
        if ! grep -q "$section" CLAUDE.md; then
            fail_test "CLAUDE.md contains $section section" "Section not found"
            return 1
        fi
    done
    
    # Test README.md has basic content
    if [[ ! -s "README.md" ]]; then
        fail_test "README.md has content" "README.md is empty"
        return 1
    fi
    
    pass_test "Documentation is complete"
}

test_documentation

# Test 7: Template Generator Structure
echo "🏗️  Testing Template Generators..."
test_generators() {
    # Test component generator files exist
    if [[ ! -d "templates/component" ]]; then
        fail_test "Component generator templates exist" "templates/component directory not found"
        return 1
    fi
    
    # Test generator tools exist
    if [[ ! -f "tools/generators/component-generator.js" ]]; then
        fail_test "Component generator tool exists" "component-generator.js not found"
        return 1
    fi
    
    # Test template files have proper structure
    local template_files=("templates/component/Component.tsx.hbs" "templates/component/index.ts.hbs")
    
    for file in "${template_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            fail_test "Template file $file exists" "Template file not found"
            return 1
        fi
    done
    
    pass_test "Template generators are properly structured"
}

test_generators

# Test 8: Cleanup Script Functionality
echo "🧹 Testing Cleanup Script..."
test_cleanup_script() {
    # Test cleanup script exists and is executable
    if [[ ! -x "scripts/init/cleanup-template.sh" ]]; then
        fail_test "Cleanup script is executable" "Script not found or not executable"
        return 1
    fi
    
    # Test cleanup would remove expected files (dry run simulation)
    local files_to_remove=("docs/newproject_decisions" "SETUP.md" "FRICTION-MAPPING.md" "examples" "starters")
    local found_files=0
    
    for file in "${files_to_remove[@]}"; do
        if [[ -e "$file" ]]; then
            ((found_files++))
        fi
    done
    
    if [[ $found_files -eq 0 ]]; then
        skip_test "Cleanup script functionality" "No template files to clean up"
    else
        pass_test "Cleanup script would remove template files"
    fi
}

test_cleanup_script

# Test 9: File Permissions and Security
echo "🔐 Testing File Permissions..."
test_file_permissions() {
    # Test no files have overly permissive permissions
    if find . -type f -perm 777 | grep -q .; then
        fail_test "No files have 777 permissions" "Found files with 777 permissions"
        return 1
    fi
    
    # Test executable files are properly marked
    local should_be_executable=("scripts/init/cleanup-template.sh" "scripts/dev/ai-context-dump.sh")
    
    for file in "${should_be_executable[@]}"; do
        if [[ -f "$file" && ! -x "$file" ]]; then
            fail_test "Executable files have proper permissions" "$file should be executable"
            return 1
        fi
    done
    
    pass_test "File permissions are correct"
}

test_file_permissions

# Test 10: Template Size and Complexity
echo "📊 Testing Template Size..."
test_template_size() {
    # Test template distribution size (excluding node_modules and other generated files)
    # Use find to calculate size excluding node_modules for macOS compatibility
    local size_kb=$(find . -type f -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./dist/*" -not -path "./build/*" -exec ls -l {} \; | awk '{sum+=$5} END {print int(sum/1024)}')
    local max_size_kb=50000  # 50MB max
    
    if [[ $size_kb -gt $max_size_kb ]]; then
        fail_test "Template size is reasonable" "Template is ${size_kb}KB (max: ${max_size_kb}KB)"
        return 1
    fi
    
    # Test not too many files (excluding node_modules)
    local file_count=$(find . -type f -not -path "./node_modules/*" -not -path "./.git/*" | wc -l)
    local max_files=500
    
    if [[ $file_count -gt $max_files ]]; then
        fail_test "Template file count is reasonable" "Template has $file_count files (max: $max_files)"
        return 1
    fi
    
    pass_test "Template size and complexity are reasonable"
}

test_template_size

# Final Results
echo ""
echo "🎯 Test Results Summary"
echo "======================"
echo "Total Tests: $TESTS_TOTAL"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

# Show detailed results
echo "📋 Detailed Results:"
for result in "${TEST_RESULTS[@]}"; do
    if [[ $result == PASS* ]]; then
        echo -e "${GREEN}$result${NC}"
    elif [[ $result == FAIL* ]]; then
        echo -e "${RED}$result${NC}"
    else
        echo -e "${YELLOW}$result${NC}"
    fi
done

echo ""

# Exit with appropriate code
if [[ $TESTS_FAILED -eq 0 ]]; then
    echo -e "${GREEN}🎉 All tests passed! Template is ready for use.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed. Please fix issues before using template.${NC}"
    exit 1
fi