#!/bin/bash

# User Experience Test Suite
# Tests the usability and developer experience of the ProjectTemplate
# Usage: ./scripts/testing/test-user-experience.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo "👥 User Experience Test Suite"
echo "============================"
echo ""

# Test results
UX_SCORE=0
MAX_SCORE=0

# Helper functions
measure_time() {
    local start_time=$(date +%s)
    "$@"
    local end_time=$(date +%s)
    echo $((end_time - start_time))
}

score_ux() {
    local points="$1"
    local max_points="$2"
    local description="$3"
    
    UX_SCORE=$((UX_SCORE + points))
    MAX_SCORE=$((MAX_SCORE + max_points))
    
    local percentage=$((points * 100 / max_points))
    
    if [[ $percentage -ge 80 ]]; then
        echo -e "${GREEN}✅ $description: $points/$max_points points (${percentage}%)${NC}"
    elif [[ $percentage -ge 60 ]]; then
        echo -e "${YELLOW}⚠️  $description: $points/$max_points points (${percentage}%)${NC}"
    else
        echo -e "${RED}❌ $description: $points/$max_points points (${percentage}%)${NC}"
    fi
}

# Test 1: Initial Setup Experience
echo "🚀 Testing Initial Setup Experience..."
test_initial_setup() {
    local setup_score=0
    local max_setup=20
    
    # Test: Quick Start documentation clarity
    if grep -q "Quick Start\|Getting Started\|Setup" README.md; then
        ((setup_score += 5))
        echo "  ✅ Quick start documentation found"
    else
        echo "  ❌ Quick start documentation missing"
    fi
    
    # Test: Clear installation instructions
    if grep -q "npm install\|yarn install\|installation" README.md; then
        ((setup_score += 5))
        echo "  ✅ Installation instructions found"
    else
        echo "  ❌ Installation instructions missing"
    fi
    
    # Test: Environment setup guidance
    if [[ -f ".env.example" ]] || grep -q "environment\|\.env" README.md; then
        ((setup_score += 5))
        echo "  ✅ Environment setup guidance found"
    else
        echo "  ❌ Environment setup guidance missing"
    fi
    
    # Test: First-run experience
    if grep -q "first time\|getting started\|initial setup" CLAUDE.md; then
        ((setup_score += 5))
        echo "  ✅ First-run experience documented"
    else
        echo "  ❌ First-run experience not documented"
    fi
    
    score_ux $setup_score $max_setup "Initial Setup Experience"
}

test_initial_setup

# Test 2: Navigation and Discoverability
echo "🧭 Testing Navigation and Discoverability..."
test_navigation() {
    local nav_score=0
    local max_nav=20
    
    # Test: Clear directory structure
    if [[ -f "CLAUDE.md" ]] && grep -q "File Organization\|Directory Structure" CLAUDE.md; then
        ((nav_score += 5))
        echo "  ✅ Directory structure documented"
    else
        echo "  ❌ Directory structure not documented"
    fi
    
    # Test: Table of contents in main docs
    if grep -q "TABLE OF CONTENTS\|Contents\|Index" CLAUDE.md; then
        ((nav_score += 5))
        echo "  ✅ Table of contents found"
    else
        echo "  ❌ Table of contents missing"
    fi
    
    # Test: Cross-references between docs
    local cross_refs=$(grep -c "See also\|📖\|See:" CLAUDE.md 2>/dev/null || echo 0)
    if [[ $cross_refs -ge 3 ]]; then
        ((nav_score += 5))
        echo "  ✅ Cross-references help navigation ($cross_refs found)"
    else
        echo "  ❌ Insufficient cross-references ($cross_refs found)"
    fi
    
    # Test: Quick reference section
    if grep -q "Quick Reference\|Cheat Sheet\|Summary" CLAUDE.md; then
        ((nav_score += 5))
        echo "  ✅ Quick reference section found"
    else
        echo "  ❌ Quick reference section missing"
    fi
    
    score_ux $nav_score $max_nav "Navigation and Discoverability"
}

test_navigation

# Test 3: Command Line Experience
echo "⌨️  Testing Command Line Experience..."
test_cli_experience() {
    local cli_score=0
    local max_cli=20
    
    # Test: npm scripts are intuitive
    local scripts=(
        "dev\|start"
        "test"
        "build"
        "lint"
    )
    
    for script_pattern in "${scripts[@]}"; do
        if grep -q "$script_pattern" package.json; then
            ((cli_score += 2))
            echo "  ✅ Standard script pattern found: $script_pattern"
        else
            echo "  ❌ Standard script pattern missing: $script_pattern"
        fi
    done
    
    # Test: AI-specific commands are discoverable
    if grep -q "ai:\|g:\|generate:" package.json; then
        ((cli_score += 5))
        echo "  ✅ AI-specific commands found"
    else
        echo "  ❌ AI-specific commands missing"
    fi
    
    # Test: Help text available
    if grep -q "help\|--help\|-h" package.json; then
        ((cli_score += 3))
        echo "  ✅ Help commands found"
    else
        echo "  ❌ Help commands missing"
    fi
    
    # Test: Scripts have descriptive names
    local unclear_scripts=$(grep -c "script[0-9]\|temp\|test[0-9]" package.json 2>/dev/null || echo 0)
    if [[ $unclear_scripts -eq 0 ]]; then
        ((cli_score += 2))
        echo "  ✅ Scripts have clear names"
    else
        echo "  ❌ Some scripts have unclear names"
    fi
    
    score_ux $cli_score $max_cli "Command Line Experience"
}

test_cli_experience

# Test 4: Documentation Quality
echo "📚 Testing Documentation Quality..."
test_documentation_quality() {
    local doc_score=0
    local max_doc=25
    
    # Test: Documentation completeness
    local doc_files=$(find docs -name "*.md" 2>/dev/null | wc -l)
    if [[ $doc_files -ge 5 ]]; then
        ((doc_score += 5))
        echo "  ✅ Comprehensive documentation ($doc_files files)"
    else
        echo "  ❌ Limited documentation ($doc_files files)"
    fi
    
    # Test: Examples and code samples
    local code_blocks=$(grep -c "\`\`\`\|~~~" CLAUDE.md 2>/dev/null || echo 0)
    if [[ $code_blocks -ge 10 ]]; then
        ((doc_score += 5))
        echo "  ✅ Rich code examples ($code_blocks blocks)"
    else
        echo "  ❌ Limited code examples ($code_blocks blocks)"
    fi
    
    # Test: Clear language (avoid jargon)
    local jargon_words=("utilize" "leverage" "synergize" "paradigm" "holistic")
    local jargon_count=0
    for word in "${jargon_words[@]}"; do
        if grep -qi "$word" CLAUDE.md; then
            ((jargon_count++))
        fi
    done
    
    if [[ $jargon_count -le 1 ]]; then
        ((doc_score += 5))
        echo "  ✅ Clear language (low jargon count: $jargon_count)"
    else
        echo "  ❌ Too much jargon ($jargon_count instances)"
    fi
    
    # Test: Troubleshooting section
    if grep -q "Troubleshooting\|Common Issues\|Problems" CLAUDE.md; then
        ((doc_score += 5))
        echo "  ✅ Troubleshooting section found"
    else
        echo "  ❌ Troubleshooting section missing"
    fi
    
    # Test: Up-to-date information
    local current_year=$(date +%Y)
    local old_years=$((current_year - 2))
    if ! grep -q "201[0-9]\|$old_years" CLAUDE.md; then
        ((doc_score += 5))
        echo "  ✅ Documentation appears current"
    else
        echo "  ❌ Documentation may be outdated"
    fi
    
    score_ux $doc_score $max_doc "Documentation Quality"
}

test_documentation_quality

# Test 5: Error Handling and Feedback
echo "🚨 Testing Error Handling and Feedback..."
test_error_handling() {
    local error_score=0
    local max_error=15
    
    # Test: Scripts provide helpful error messages
    local test_script="scripts/init/cleanup-template.sh"
    if [[ -f "$test_script" ]]; then
        if grep -q "echo\|Error\|Warning" "$test_script"; then
            ((error_score += 5))
            echo "  ✅ Scripts provide user feedback"
        else
            echo "  ❌ Scripts lack user feedback"
        fi
    else
        echo "  ⚠️  Test script not found"
    fi
    
    # Test: Configuration validation
    if grep -q "validate\|check\|verify" package.json; then
        ((error_score += 5))
        echo "  ✅ Configuration validation available"
    else
        echo "  ❌ Configuration validation missing"
    fi
    
    # Test: Graceful degradation
    if grep -q "fallback\|default\|||" scripts/dev/ai-context-dump.sh 2>/dev/null; then
        ((error_score += 5))
        echo "  ✅ Graceful degradation implemented"
    else
        echo "  ❌ Graceful degradation missing"
    fi
    
    score_ux $error_score $max_error "Error Handling and Feedback"
}

test_error_handling

# Test 6: Customization and Flexibility
echo "⚙️  Testing Customization and Flexibility..."
test_customization() {
    local custom_score=0
    local max_custom=15
    
    # Test: Configuration files are modular
    local config_files=$(find config -name "*.json" -o -name "*.js" -o -name "*.ts" 2>/dev/null | wc -l)
    if [[ $config_files -ge 3 ]]; then
        ((custom_score += 5))
        echo "  ✅ Modular configuration files ($config_files files)"
    else
        echo "  ❌ Limited configuration modularity ($config_files files)"
    fi
    
    # Test: Template generators are customizable
    if [[ -d "templates" ]]; then
        local template_dirs=$(find templates -type d -maxdepth 1 | wc -l)
        if [[ $template_dirs -ge 2 ]]; then
            ((custom_score += 5))
            echo "  ✅ Multiple template types available"
        else
            echo "  ❌ Limited template variety"
        fi
    else
        echo "  ❌ Templates directory not found"
    fi
    
    # Test: Environment-specific configurations
    if [[ -f ".env.example" ]] || grep -q "NODE_ENV\|ENVIRONMENT" package.json; then
        ((custom_score += 5))
        echo "  ✅ Environment-specific configuration available"
    else
        echo "  ❌ Environment-specific configuration missing"
    fi
    
    score_ux $custom_score $max_custom "Customization and Flexibility"
}

test_customization

# Test 7: Performance and Responsiveness
echo "⚡ Testing Performance and Responsiveness..."
test_performance() {
    local perf_score=0
    local max_perf=15
    
    # Test: Template size is reasonable (excluding node_modules)
    local template_size_kb=$(find . -type f -not -path "./node_modules/*" -not -path "./.git/*" -exec ls -l {} \; | awk '{sum+=$5} END {print int(sum/1024)}')
    if [[ $template_size_kb -lt 10000 ]]; then  # Less than 10MB
        ((perf_score += 5))
        echo "  ✅ Template size is reasonable (${template_size_kb}KB)"
    else
        echo "  ❌ Template size is large (${template_size_kb}KB)"
    fi
    
    # Test: Scripts execute quickly
    local start_time=$(date +%s)
    if [[ -x "scripts/dev/ai-context-dump.sh" ]]; then
        timeout 30s ./scripts/dev/ai-context-dump.sh > /dev/null 2>&1 || true
    fi
    local end_time=$(date +%s)
    local execution_time=$((end_time - start_time))
    local execution_time_ms=$((execution_time * 1000))
    
    if [[ $execution_time -lt 5 ]]; then  # Less than 5 seconds
        ((perf_score += 5))
        echo "  ✅ Scripts execute quickly (${execution_time_ms}ms)"
    else
        echo "  ❌ Scripts are slow (${execution_time_ms}ms)"
    fi
    
    # Test: Documentation loads quickly
    local doc_size=$(wc -c < CLAUDE.md)
    if [[ $doc_size -lt 100000 ]]; then  # Less than 100KB
        ((perf_score += 5))
        echo "  ✅ Documentation is reasonably sized (${doc_size} bytes)"
    else
        echo "  ❌ Documentation is very large (${doc_size} bytes)"
    fi
    
    score_ux $perf_score $max_perf "Performance and Responsiveness"
}

test_performance

# Test 8: Accessibility and Inclusivity
echo "♿ Testing Accessibility and Inclusivity..."
test_accessibility() {
    local access_score=0
    local max_access=10
    
    # Test: Multiple learning styles supported
    local learning_formats=0
    if grep -q "example\|sample" CLAUDE.md; then ((learning_formats++)); fi
    if grep -q "diagram\|graph\|flowchart" CLAUDE.md; then ((learning_formats++)); fi
    if grep -q "video\|screencast" CLAUDE.md; then ((learning_formats++)); fi
    
    if [[ $learning_formats -ge 2 ]]; then
        ((access_score += 5))
        echo "  ✅ Multiple learning formats supported ($learning_formats types)"
    else
        echo "  ❌ Limited learning format variety ($learning_formats types)"
    fi
    
    # Test: Inclusive language
    local exclusive_terms=("guys" "master" "slave" "blacklist" "whitelist")
    local exclusive_count=0
    for term in "${exclusive_terms[@]}"; do
        if grep -qi "$term" CLAUDE.md README.md; then
            ((exclusive_count++))
        fi
    done
    
    if [[ $exclusive_count -eq 0 ]]; then
        ((access_score += 5))
        echo "  ✅ Inclusive language used"
    else
        echo "  ❌ Some exclusive terms found ($exclusive_count instances)"
    fi
    
    score_ux $access_score $max_access "Accessibility and Inclusivity"
}

test_accessibility

# Final UX Score Calculation
echo ""
echo "🎯 User Experience Score Summary"
echo "==============================="
echo "Total Score: $UX_SCORE / $MAX_SCORE"

if [[ $MAX_SCORE -gt 0 ]]; then
    final_percentage=$((UX_SCORE * 100 / MAX_SCORE))
    echo "UX Score: $final_percentage%"
    echo ""
    
    if [[ $final_percentage -ge 85 ]]; then
        echo -e "${GREEN}🎉 Excellent user experience! Template is highly usable.${NC}"
    elif [[ $final_percentage -ge 70 ]]; then
        echo -e "${YELLOW}⚠️  Good user experience with room for improvement.${NC}"
    elif [[ $final_percentage -ge 55 ]]; then
        echo -e "${RED}❌ User experience needs significant improvement.${NC}"
    else
        echo -e "${RED}❌ Poor user experience - major usability issues.${NC}"
    fi
fi

echo ""
echo "📊 UX Improvement Recommendations"
echo "================================"
echo "1. 🚀 Reduce initial setup friction"
echo "2. 🧭 Improve navigation and discoverability"
echo "3. 📚 Enhance documentation clarity"
echo "4. 🚨 Add better error handling and feedback"
echo "5. ⚙️  Increase customization options"
echo "6. ⚡ Optimize performance and responsiveness"
echo "7. ♿ Ensure accessibility for all users"
echo ""

# UX Testing Survey Questions
echo "💬 Additional UX Testing Questions"
echo "================================="
echo "Consider asking real users these questions:"
echo ""
echo "1. How long did it take you to create your first working project?"
echo "2. What was the most confusing part of the setup process?"
echo "3. Which documentation did you find most/least helpful?"
echo "4. What would you change about the command line interface?"
echo "5. How does this template compare to starting from scratch?"
echo "6. What features would you add or remove?"
echo "7. Would you recommend this template to a colleague?"
echo "8. On a scale of 1-10, how would you rate the overall experience?"
echo ""

# Exit with appropriate code
if [[ $UX_SCORE -ge $((MAX_SCORE * 70 / 100)) ]]; then
    exit 0
else
    exit 1
fi