#!/bin/bash
# Verifies all imports in the project are valid and packages exist

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 Verifying all imports...${NC}"

# Check if we're in a Node.js project
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: No package.json found${NC}"
    exit 1
fi

# Track errors
ERRORS=0
WARNINGS=0

# Check TypeScript/JavaScript imports
echo -e "\n${BLUE}Checking import statements...${NC}"

# Find all TS/JS files
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
    -not -path "*/node_modules/*" \
    -not -path "*/dist/*" \
    -not -path "*/build/*" \
    -not -path "*/coverage/*" | while read -r file; do
    
    # Extract imports
    grep -E "^import .* from ['\"]|^const .* = require\(['\"]" "$file" 2>/dev/null | while read -r line; do
        # Extract package name
        if echo "$line" | grep -q "from"; then
            # ES6 import
            package=$(echo "$line" | sed -E "s/.*from ['\"]([^'\"]+)['\"].*/\1/")
        else
            # CommonJS require
            package=$(echo "$line" | sed -E "s/.*require\(['\"]([^'\"]+)['\"]\).*/\1/")
        fi
        
        # Skip relative imports
        if [[ "$package" =~ ^\.\.?/ ]]; then
            continue
        fi
        
        # Skip Node.js built-ins
        if [[ "$package" =~ ^(fs|path|http|https|crypto|util|stream|events|os|child_process|cluster|url|querystring|buffer|process)$ ]]; then
            continue
        fi
        
        # Skip alias imports (starting with @/ or ~/)
        if [[ "$package" =~ ^[@~]/ ]]; then
            # Check if tsconfig has this alias
            if [ -f "tsconfig.json" ] && grep -q "\"${package%%/*}\"" tsconfig.json 2>/dev/null; then
                continue
            else
                echo -e "${YELLOW}⚠️  Alias import without tsconfig mapping: $package in $file${NC}"
                ((WARNINGS++))
            fi
            continue
        fi
        
        # Extract main package name (handle scoped packages)
        if [[ "$package" =~ ^@[^/]+/[^/]+ ]]; then
            main_package=$(echo "$package" | grep -oE "^@[^/]+/[^/]+")
        else
            main_package=$(echo "$package" | cut -d'/' -f1)
        fi
        
        # Check if package exists in package.json
        if ! grep -q "\"$main_package\"" package.json; then
            echo -e "${RED}❌ Missing package: $main_package (imported in $file)${NC}"
            ((ERRORS++))
        fi
    done
done

# Check for common hallucinated imports
echo -e "\n${BLUE}Checking for common AI hallucinations...${NC}"

HALLUCINATED_PACKAGES=(
    "useServerState"
    "next/server-components"
    "react-server-hooks"
    "@prisma/client/edge"
    "zustand/persist"
    "vite/client/hmr"
)

for pkg in "${HALLUCINATED_PACKAGES[@]}"; do
    if grep -r "from ['\"]$pkg['\"]" . --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude-dir=node_modules 2>/dev/null; then
        echo -e "${RED}❌ Found hallucinated import: $pkg${NC}"
        ((ERRORS++))
    fi
done

# Check for deprecated imports
echo -e "\n${BLUE}Checking for deprecated imports...${NC}"

DEPRECATED_PATTERNS=(
    "console\.log"
    "require\("
    "module\.exports"
)

for pattern in "${DEPRECATED_PATTERNS[@]}"; do
    count=$(grep -r "$pattern" . --include="*.ts" --include="*.tsx" --exclude-dir=node_modules --exclude-dir=dist 2>/dev/null | wc -l)
    if [ "$count" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Found $count instances of deprecated pattern: $pattern${NC}"
        ((WARNINGS++))
    fi
done

# Summary
echo -e "\n${BLUE}=== Import Verification Summary ===${NC}"
echo -e "Errors found: $ERRORS"
echo -e "Warnings found: $WARNINGS"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All imports verified successfully!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Verification completed with warnings${NC}"
    exit 0
else
    echo -e "${RED}❌ Import verification failed${NC}"
    exit 1
fi