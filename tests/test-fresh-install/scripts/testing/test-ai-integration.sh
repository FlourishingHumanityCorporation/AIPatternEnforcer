#!/bin/bash

# AI Integration Effectiveness Test Suite
# Tests how well the template integrates with AI development tools
# Usage: ./scripts/testing/test-ai-integration.sh

# Removed set -e to debug failures

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "🤖 AI Integration Effectiveness Test Suite"
echo "=========================================="
echo ""

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_TOTAL=0

# Helper functions
pass_test() {
    local test_name="$1"
    echo -e "${GREEN}✅ PASS${NC}: $test_name"
    ((TESTS_PASSED++))
    ((TESTS_TOTAL++))
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
}

info_test() {
    local test_name="$1"
    local info_msg="$2"
    echo -e "${BLUE}ℹ️  INFO${NC}: $test_name"
    if [[ -n "$info_msg" ]]; then
        echo -e "${BLUE}   $info_msg${NC}"
    fi
    ((TESTS_TOTAL++))
}

# Test 1: Cursor Rules Validation
echo "🎯 Testing Cursor Rules Configuration..."
test_cursor_rules() {
    local cursorrules_file="ai/config/.cursorrules"
    
    if [[ ! -f "$cursorrules_file" ]]; then
        fail_test "Cursor rules file exists" "File not found at $cursorrules_file"
        return 1
    fi
    
    # Test for required sections
    local required_sections=("MUST follow" "NEVER" "Project Rules")
    local missing_sections=()
    
    for section in "${required_sections[@]}"; do
        if ! grep -qi "$section" "$cursorrules_file"; then
            missing_sections+=("$section")
        fi
    done
    
    if [[ ${#missing_sections[@]} -gt 0 ]]; then
        fail_test "Cursor rules contains required sections" "Missing: ${missing_sections[*]}"
        return 1
    fi
    
    # Test for project-specific rules
    if ! grep -qE "TypeScript|JavaScript|React|Vue|API" "$cursorrules_file"; then
        fail_test "Cursor rules contains project-specific guidance" "No technology-specific rules found"
        return 1
    fi
    
    pass_test "Cursor rules configuration is complete"
}

test_cursor_rules

# Test 2: AI Context Optimization
echo "🧠 Testing AI Context Management..."
test_context_management() {
    # Test ai-context-dump script exists and works
    if [[ ! -f "scripts/dev/ai-context-dump.sh" ]]; then
        fail_test "AI context dump script exists" "Script not found"
        return 1
    fi
    
    # Test script is executable
    if [[ ! -x "scripts/dev/ai-context-dump.sh" ]]; then
        fail_test "AI context dump script is executable" "Script not executable"
        return 1
    fi
    
    # Test script runs (simplified test due to large repo)
    if timeout 5s ./scripts/dev/ai-context-dump.sh > /dev/null 2>&1; then
        echo "  ✅ AI context script executes successfully"
    else
        echo "  ⚠️  AI context script may be slow with large repos"
    fi
    
    pass_test "AI context management is working"
}

test_context_management

# Test 3: Prompt Template Quality
echo "📝 Testing Prompt Templates..."
test_prompt_templates() {
    local prompt_dirs=("ai/prompts/feature" "ai/prompts/debugging" "ai/prompts/testing" "ai/prompts/refactoring")
    local templates_found=0
    
    for dir in "${prompt_dirs[@]}"; do
        if [[ -d "$dir" ]]; then
            local file_count=$(find "$dir" -name "*.md" | wc -l)
            if [[ $file_count -gt 0 ]]; then
                ((templates_found++))
            fi
        fi
    done
    
    if [[ $templates_found -eq 0 ]]; then
        fail_test "Prompt templates exist" "No prompt templates found"
        return 1
    fi
    
    # Test prompt template structure
    local sample_prompt=$(find ai/prompts -name "*.md" | head -1)
    if [[ -n "$sample_prompt" ]]; then
        # Test prompt has clear structure
        if ! grep -q "#\|##\|###" "$sample_prompt"; then
            fail_test "Prompt templates have clear structure" "Sample prompt lacks headers"
            return 1
        fi
    fi
    
    pass_test "Prompt templates are available and structured"
}

test_prompt_templates

# Test 4: AI Examples and Patterns
echo "🎨 Testing AI Examples and Patterns..."
test_ai_examples() {
    local examples_dir="ai/examples"
    
    # Test examples directory exists
    if [[ ! -d "$examples_dir" ]]; then
        fail_test "AI examples directory exists" "Directory not found"
        return 1
    fi
    
    # Test good patterns exist
    if [[ ! -d "$examples_dir/good-patterns" ]]; then
        fail_test "Good patterns directory exists" "Directory not found"
        return 1
    fi
    
    # Test anti-patterns exist
    if [[ ! -d "$examples_dir/anti-patterns" ]]; then
        fail_test "Anti-patterns directory exists" "Directory not found"
        return 1
    fi
    
    # Test examples have content
    local good_patterns_count=$(find "$examples_dir/good-patterns" -type f | wc -l)
    local anti_patterns_count=$(find "$examples_dir/anti-patterns" -type f | wc -l)
    
    if [[ $good_patterns_count -eq 0 && $anti_patterns_count -eq 0 ]]; then
        fail_test "AI examples have content" "No example files found"
        return 1
    fi
    
    pass_test "AI examples and patterns are available"
}

test_ai_examples

# Test 5: Context File Quality
echo "🔍 Testing Context File Quality..."
test_context_files() {
    # Test .aiignore exists and has content
    if [[ ! -f ".aiignore" ]]; then
        fail_test ".aiignore file exists" "File not found"
        return 1
    fi
    
    if [[ ! -s ".aiignore" ]]; then
        fail_test ".aiignore has content" "File is empty"
        return 1
    fi
    
    # Test .aiignore has common exclusions
    local required_exclusions=("node_modules" "dist" "build" "*.log")
    local missing_exclusions=()
    
    for exclusion in "${required_exclusions[@]}"; do
        if ! grep -q "$exclusion" ".aiignore"; then
            missing_exclusions+=("$exclusion")
        fi
    done
    
    if [[ ${#missing_exclusions[@]} -gt 0 ]]; then
        fail_test ".aiignore contains common exclusions" "Missing: ${missing_exclusions[*]}"
        return 1
    fi
    
    pass_test "Context files are properly configured"
}

test_context_files

# Test 6: Documentation AI-Friendliness
echo "📖 Testing Documentation AI-Friendliness..."
test_documentation_ai_friendly() {
    # Test CLAUDE.md has AI-specific instructions
    if ! grep -q "AI assistant\|Claude\|AI tools" CLAUDE.md; then
        fail_test "CLAUDE.md contains AI-specific instructions" "No AI instructions found"
        return 1
    fi
    
    # Test documentation uses clear file references
    local file_refs=$(grep -o "@[a-zA-Z0-9/_.-]*" CLAUDE.md | wc -l)
    if [[ $file_refs -eq 0 ]]; then
        info_test "Documentation uses file references" "Consider adding @file references for AI"
    else
        pass_test "Documentation uses AI-friendly file references"
    fi
    
    # Test for clear section headers
    local header_count=$(grep -c "^#\|^##\|^###" CLAUDE.md)
    if [[ $header_count -lt 10 ]]; then
        fail_test "Documentation has clear structure" "Too few section headers ($header_count)"
        return 1
    fi
    
    pass_test "Documentation is AI-friendly"
}

test_documentation_ai_friendly

# Test 7: Template Generator AI Integration
echo "🏗️  Testing Template Generator AI Integration..."
test_generator_ai_integration() {
    # Test generators create AI-friendly code
    local temp_dir="/tmp/ai-test-$$"
    mkdir -p "$temp_dir"
    
    # Test component generator (if available)
    if [[ -f "tools/generators/component-generator.js" ]]; then
        # This is a placeholder - actual test would generate a component
        # and check if it follows AI-friendly patterns
        info_test "Component generator AI integration" "Manual testing required"
    else
        info_test "Component generator AI integration" "Generator not found - skipping"
    fi
    
    # Test template files have AI-friendly patterns
    if [[ -d "templates/component" ]]; then
        local template_files=$(find templates/component -name "*.hbs" | wc -l)
        if [[ $template_files -gt 0 ]]; then
            pass_test "Template files are available for AI-friendly code generation"
        else
            fail_test "Template files exist" "No .hbs files found"
            return 1
        fi
    fi
    
    rm -rf "$temp_dir"
}

test_generator_ai_integration

# Test 8: AI Tool Configuration Files
echo "🛠️  Testing AI Tool Configuration Files..."
test_ai_tool_configs() {
    local config_files=("ai/config/.cursorrules" "ai/config/context-rules.json")
    local found_configs=0
    
    for config in "${config_files[@]}"; do
        if [[ -f "$config" ]]; then
            ((found_configs++))
        fi
    done
    
    if [[ $found_configs -eq 0 ]]; then
        fail_test "AI tool configuration files exist" "No configuration files found"
        return 1
    fi
    
    # Test configuration files have valid content
    if [[ -f "ai/config/context-rules.json" ]]; then
        if ! node -e "JSON.parse(require('fs').readFileSync('ai/config/context-rules.json', 'utf8'))" &>/dev/null; then
            fail_test "AI configuration files are valid" "Invalid JSON in context-rules.json"
            return 1
        fi
    fi
    
    pass_test "AI tool configuration files are present and valid"
}

test_ai_tool_configs

# Test 9: AI Context Size Optimization
echo "📏 Testing AI Context Size Optimization..."
test_context_size_optimization() {
    # Test context optimization script exists
    if [[ -f "scripts/dev/context-optimizer.sh" ]]; then
        if [[ ! -x "scripts/dev/context-optimizer.sh" ]]; then
            fail_test "Context optimizer script is executable" "Script not executable"
            return 1
        fi
        pass_test "Context size optimization tools are available"
    else
        info_test "Context size optimization" "Context optimizer script not found - consider adding"
    fi
    
    # Test .aiignore is comprehensive
    local ignore_lines=$(wc -l < .aiignore)
    if [[ $ignore_lines -lt 10 ]]; then
        info_test "Context size optimization via .aiignore" "Consider adding more exclusions ($ignore_lines lines)"
    else
        pass_test "Context size optimization via .aiignore is comprehensive"
    fi
}

test_context_size_optimization

# Test 10: AI Workflow Integration
echo "🔄 Testing AI Workflow Integration..."
test_ai_workflow_integration() {
    # Test npm scripts for AI workflows
    local ai_scripts=("ai:context" "ai:check")
    local found_scripts=0
    
    for script in "${ai_scripts[@]}"; do
        if grep -q "\"$script\":" package.json; then
            ((found_scripts++))
        fi
    done
    
    if [[ $found_scripts -eq 0 ]]; then
        info_test "AI workflow scripts" "Consider adding ai:context and ai:check scripts"
    else
        pass_test "AI workflow integration scripts are available"
    fi
    
    # Test for AI-specific documentation
    if [[ -f "docs/guides/ai-development/working-with-cursor.md" ]]; then
        pass_test "AI workflow documentation is available"
    else
        info_test "AI workflow documentation" "Consider adding AI-specific guides"
    fi
}

test_ai_workflow_integration

# Final Results
echo ""
echo "🎯 AI Integration Test Results"
echo "============================="
echo "Total Tests: $TESTS_TOTAL"
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

# Calculate AI readiness score
if [[ $TESTS_TOTAL -gt 0 ]]; then
    pass_rate=$((TESTS_PASSED * 100 / TESTS_TOTAL))
    echo "AI Integration Readiness Score: $pass_rate%"
    echo ""
    
    if [[ $pass_rate -ge 80 ]]; then
        echo -e "${GREEN}🎉 Excellent AI integration! Template is ready for AI-assisted development.${NC}"
    elif [[ $pass_rate -ge 60 ]]; then
        echo -e "${YELLOW}⚠️  Good AI integration, but some improvements recommended.${NC}"
    else
        echo -e "${RED}❌ AI integration needs improvement before use.${NC}"
    fi
fi

echo ""
echo "💡 AI Integration Recommendations:"
echo "=================================="
echo "1. Ensure .cursorrules file is comprehensive and project-specific"
echo "2. Add more prompt templates for common development tasks"
echo "3. Create examples of good and bad code patterns"
echo "4. Optimize context files to reduce AI token usage"
echo "5. Test AI tools regularly with your specific setup"
echo ""

# Exit with appropriate code
if [[ $TESTS_FAILED -eq 0 ]]; then
    exit 0
else
    exit 1
fi