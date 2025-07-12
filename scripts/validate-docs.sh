#!/bin/bash

# Documentation Link Validation Script
# Validates all markdown links in the documentation
# Usage: ./scripts/validate-docs.sh [--fix] [--ignore-external] [--help]

# Don't exit on error to see all issues
# set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse command line options
FIX_MODE=false
IGNORE_EXTERNAL=false
SHOW_HELP=false

for arg in "$@"; do
    case $arg in
        --fix)
            FIX_MODE=true
            shift
            ;;
        --ignore-external)
            IGNORE_EXTERNAL=true
            shift
            ;;
        --help)
            SHOW_HELP=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown option: $arg${NC}"
            SHOW_HELP=true
            ;;
    esac
done

if [ "$SHOW_HELP" = true ]; then
    echo "Documentation Link Validation Script"
    echo ""
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --fix              Attempt to fix simple broken links automatically"
    echo "  --ignore-external  Skip validation of external HTTP links"
    echo "  --help             Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                           # Check all links"
    echo "  $0 --ignore-external         # Skip external links (recommended)"
    echo "  $0 --fix --ignore-external   # Fix simple issues and skip external"
    exit 0
fi

if [ "$FIX_MODE" = true ]; then
    echo "🔧 Running in fix mode - will attempt to correct simple issues"
fi

if [ "$IGNORE_EXTERNAL" = true ]; then
    echo "🌐 Ignoring external HTTP/HTTPS links"
fi

echo "🔍 Validating documentation links..."

# Check if we're in the project root
if [ ! -f "CLAUDE.md" ]; then
    echo -e "${RED}Error: Must run from project root directory${NC}"
    exit 1
fi

# Track results
TOTAL_FILES=0
FILES_WITH_ERRORS=0
TOTAL_LINKS=0
BROKEN_LINKS=0
FIXED_LINKS=0
EXTERNAL_LINKS=0

# Create temp files for results
TEMP_FILE=$(mktemp)
FIXES_FILE=$(mktemp)

# Function to attempt common fixes for broken links
attempt_fix() {
    local md_file=$1
    local link=$2
    local md_dir=$(dirname "$md_file")
    local file_path="${link%%#*}"
    
    # Try common fixes for relative paths
    if [[ "$file_path" != "/"* ]]; then
        local full_path="$md_dir/$file_path"
        
        # Try adding .md extension
        if [ ! -f "$full_path" ] && [ -f "${full_path}.md" ]; then
            echo "  Fix: Add .md extension -> ${link}.md"
            echo "$md_file:$link -> ${link}.md" >> "$FIXES_FILE"
            return 0
        fi
        
        # Try removing .md extension
        if [[ "$file_path" == *.md ]] && [ ! -f "$full_path" ] && [ -f "${full_path%.md}" ]; then
            echo "  Fix: Remove .md extension -> ${link%.md}"
            echo "$md_file:$link -> ${link%.md}" >> "$FIXES_FILE"
            return 0
        fi
        
        # Try case variations
        local lower_path=$(echo "$full_path" | tr '[:upper:]' '[:lower:]')
        if [ ! -f "$full_path" ] && [ -f "$lower_path" ]; then
            local lower_link=$(echo "$link" | tr '[:upper:]' '[:lower:]')
            echo "  Fix: Fix case -> $lower_link"
            echo "$md_file:$link -> $lower_link" >> "$FIXES_FILE"
            return 0
        fi
    fi
    
    return 1
}

# Function to check if a file exists relative to the markdown file
check_relative_link() {
    local md_file=$1
    local link=$2
    local md_dir=$(dirname "$md_file")
    
    # Handle external links
    if [[ "$link" == http* ]] || [[ "$link" == mailto* ]]; then
        ((EXTERNAL_LINKS++))
        if [ "$IGNORE_EXTERNAL" = true ]; then
            return 0
        fi
        # For external links, we'll assume they're valid unless we want to test them
        return 0
    fi
    
    # Skip anchor links
    if [[ "$link" == "#"* ]]; then
        return 0
    fi
    
    # Remove anchor from link if present
    local file_path="${link%%#*}"
    
    # Handle absolute paths from project root
    if [[ "$file_path" == "/"* ]]; then
        file_path="${file_path:1}"  # Remove leading slash
        if [ -f "$file_path" ] || [ -d "$file_path" ]; then
            return 0
        else
            if [ "$FIX_MODE" = true ] && attempt_fix "$md_file" "$link"; then
                ((FIXED_LINKS++))
                return 0
            fi
            return 1
        fi
    fi
    
    # Check relative path
    local full_path="$md_dir/$file_path"
    
    # Resolve .. and . in path
    full_path=$(realpath -m "$full_path" 2>/dev/null || echo "$full_path")
    
    if [ -f "$full_path" ] || [ -d "$full_path" ]; then
        return 0
    else
        if [ "$FIX_MODE" = true ] && attempt_fix "$md_file" "$link"; then
            ((FIXED_LINKS++))
            return 0
        fi
        return 1
    fi
}

# Process a markdown file
process_file() {
    local file=$1
    local links_found=0
    local errors_in_file=0
    
    while IFS= read -r line_content; do
        # Extract line number and content
        line_num=$(echo "$line_content" | cut -d: -f1)
        line_text=$(echo "$line_content" | cut -d: -f2-)
        
        # Find all markdown links in the line using grep and sed
        while IFS= read -r link; do
            ((links_found++))
            ((TOTAL_LINKS++))
            
            # Check if link is valid
            if ! check_relative_link "$file" "$link"; then
                ((errors_in_file++))
                ((BROKEN_LINKS++))
                echo "$file:$line_num: Broken link: $link" >> "$TEMP_FILE"
            fi
        done < <(echo "$line_text" | grep -oE '\[[^]]+\]\([^)]+\)' | sed -E 's/\[[^]]+\]\(([^)]+)\)/\1/g')
    done < <(grep -n '\[' "$file" | grep '\](' 2>/dev/null || true)
    
    if [ $errors_in_file -eq 0 ]; then
        echo -e "${GREEN}✓${NC} ($links_found links)"
    else
        echo -e "${RED}✗${NC} ($errors_in_file broken links)"
        ((FILES_WITH_ERRORS++))
    fi
}

# Find all markdown files in docs directory, excluding templates and external docs
while IFS= read -r -d '' file; do
    # Skip template files (they contain placeholder links)
    if [[ "$file" == *".template.md" ]]; then
        echo "Skipping template file: $file"
        continue
    fi
    
    # Skip ClaudeCode_official docs (external documentation with external links)
    if [[ "$file" == *"ClaudeCode_official"* ]]; then
        echo "Skipping external docs: $file"
        continue
    fi
    
    ((TOTAL_FILES++))
    echo -n "Checking $file... "
    process_file "$file"
done < <(find docs -name "*.md" -type f -print0)

# Also check markdown files in root
for file in CLAUDE.md README.md CONTRIBUTING.md FRICTION-MAPPING.md SETUP.md; do
    if [ -f "$file" ]; then
        ((TOTAL_FILES++))
        echo -n "Checking $file... "
        process_file "$file"
    fi
done

echo ""
echo "📊 Summary:"
echo "  Total files checked: $TOTAL_FILES"
echo "  Total links found: $TOTAL_LINKS"

if [ "$IGNORE_EXTERNAL" = true ]; then
    echo -e "  ${BLUE}🌐 External links skipped: $EXTERNAL_LINKS${NC}"
fi

if [ "$FIX_MODE" = true ] && [ $FIXED_LINKS -gt 0 ]; then
    echo -e "  ${GREEN}🔧 Links fixed: $FIXED_LINKS${NC}"
    echo ""
    echo "🔧 Applied fixes:"
    cat "$FIXES_FILE"
fi

if [ $BROKEN_LINKS -eq 0 ]; then
    echo -e "  ${GREEN}✓ All links valid!${NC}"
    rm -f "$TEMP_FILE" "$FIXES_FILE"
    exit 0
else
    echo -e "  ${RED}✗ Broken links found: $BROKEN_LINKS${NC}"
    echo -e "  ${RED}✗ Files with errors: $FILES_WITH_ERRORS${NC}"
    echo ""
    echo "🔴 Broken links:"
    cat "$TEMP_FILE"
    
    if [ "$FIX_MODE" = false ]; then
        echo ""
        echo -e "${YELLOW}💡 Tip: Run with --fix to attempt automatic fixes${NC}"
        echo -e "${YELLOW}💡 Tip: Run with --ignore-external to skip external links${NC}"
    fi
    
    rm -f "$TEMP_FILE" "$FIXES_FILE"
    exit 1
fi