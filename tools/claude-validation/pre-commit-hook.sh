#!/bin/bash

# ProjectTemplate Claude Validation Pre-commit Hook
# Checks staged files for Claude-generated anti-patterns
# Usage: Called automatically by git pre-commit hook

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Check if validation should be skipped
if [ "$SKIP_CLAUDE_CHECK" = "1" ]; then
    echo -e "${YELLOW}⚠️  Claude validation skipped (SKIP_CLAUDE_CHECK=1)${NC}"
    exit 0
fi

# Get list of staged files (excluding deleted files)
STAGED_FILES=$(git diff --cached --name-only --diff-filter=d)

# If no files staged, nothing to check
if [ -z "$STAGED_FILES" ]; then
    exit 0
fi

# Track violations
VIOLATIONS=()
VIOLATION_COUNT=0

# Anti-patterns to check
IMPROVED_PATTERN='_improved\.|_enhanced\.|_v2\.|_better\.|_new\.|_updated\.|_fixed\.'
ANNOUNCEMENT_PATTERN='We.*re excited to|Successfully implemented|I.*ve created|I.*ve successfully'

# Function to check if file is binary
is_binary() {
    local file="$1"
    # Check if file exists and use file command to detect binary
    if [ -f "$file" ]; then
        file_type=$(file -b --mime-type "$file" 2>/dev/null)
        case "$file_type" in
            text/*|application/json|application/javascript|application/xml)
                return 1 # Not binary
                ;;
            *)
                return 0 # Binary
                ;;
        esac
    fi
    return 1 # Default to not binary if file doesn't exist
}

# Function to check file for violations
check_file() {
    local file="$1"
    local violations_found=0
    
    # Skip binary files
    if is_binary "$file"; then
        return 0
    fi
    
    # Check filename for anti-patterns
    if echo "$file" | grep -qE "$IMPROVED_PATTERN"; then
        VIOLATIONS+=("${RED}❌ Anti-pattern in filename:${NC} $file")
        VIOLATIONS+=("   ${YELLOW}→ Files ending with _improved, _enhanced, _v2, etc. are not allowed${NC}")
        VIOLATIONS+=("   ${GREEN}→ Fix: Edit the original file instead of creating a new version${NC}")
        ((VIOLATION_COUNT++))
        violations_found=1
    fi
    
    # For text files, check content
    if [ -f "$file" ] && ! is_binary "$file"; then
        # Check for announcement-style documentation
        if grep -qE "$ANNOUNCEMENT_PATTERN" "$file" 2>/dev/null; then
            VIOLATIONS+=("${RED}❌ Announcement-style content in:${NC} $file")
            VIOLATIONS+=("   ${YELLOW}→ Found phrases like 'We're excited to' or 'Successfully implemented'${NC}")
            VIOLATIONS+=("   ${GREEN}→ Fix: Use technical, timeless language without superlatives${NC}")
            ((VIOLATION_COUNT++))
            violations_found=1
        fi
        
        # Check for references to improved/enhanced files in code
        if grep -qE "require.*$IMPROVED_PATTERN|import.*$IMPROVED_PATTERN|from.*$IMPROVED_PATTERN" "$file" 2>/dev/null; then
            VIOLATIONS+=("${RED}❌ Import/require of anti-pattern files in:${NC} $file")
            VIOLATIONS+=("   ${YELLOW}→ Found imports of files with _improved, _enhanced, _v2 patterns${NC}")
            VIOLATIONS+=("   ${GREEN}→ Fix: Update imports to use original filenames${NC}")
            ((VIOLATION_COUNT++))
            violations_found=1
        fi
    fi
    
    return $violations_found
}

# Main validation loop
echo -e "${BLUE}🔍 Checking staged files for Claude anti-patterns...${NC}"

for file in $STAGED_FILES; do
    # Only check files that exist (not deleted)
    if [ -f "$file" ]; then
        check_file "$file"
    fi
done

# Report results
if [ ${#VIOLATIONS[@]} -gt 0 ]; then
    echo -e "\n${BOLD}${RED}Claude Validation Failed!${NC}"
    echo -e "${RED}Found $VIOLATION_COUNT violation(s) in staged files:${NC}\n"
    
    for violation in "${VIOLATIONS[@]}"; do
        echo -e "$violation"
    done
    
    echo -e "\n${BOLD}How to proceed:${NC}"
    echo -e "1. ${GREEN}Fix the issues${NC} mentioned above"
    echo -e "2. ${YELLOW}Override (not recommended):${NC} SKIP_CLAUDE_CHECK=1 git commit ..."
    echo -e "3. ${BLUE}Learn more:${NC} See CLAUDE.md for coding standards"
    
    exit 1
else
    echo -e "${GREEN}✅ No Claude anti-patterns detected${NC}"
    exit 0
fi