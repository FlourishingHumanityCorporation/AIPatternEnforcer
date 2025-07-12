#!/bin/bash
# AI Setup Verification Script
# Checks that all AI development tools are properly configured

set -e

echo "🔍 ProjectTemplate AI Setup Verification"
echo "========================================"

# Safety check - ensure we're in a ProjectTemplate directory
if [ ! -f "CLAUDE.md" ] || [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: This doesn't appear to be a ProjectTemplate directory${NC}"
    echo "Please run this script from the root of a ProjectTemplate project"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

check_file() {
    local file=$1
    local description=$2
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $description found: $file"
    else
        echo -e "${RED}❌${NC} $description missing: $file"
        ERRORS=$((ERRORS + 1))
    fi
}

check_optional_file() {
    local file=$1
    local description=$2
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $description found: $file"
    else
        echo -e "${YELLOW}⚠️${NC}  $description optional: $file"
        WARNINGS=$((WARNINGS + 1))
    fi
}

check_command() {
    local cmd=$1
    local description=$2
    if command -v "$cmd" >/dev/null 2>&1; then
        echo -e "${GREEN}✅${NC} $description available"
        return 0
    else
        echo -e "${RED}❌${NC} $description not found: $cmd"
        ERRORS=$((ERRORS + 1))
        return 1
    fi
}

echo
echo "📁 Checking Core Configuration Files..."
check_file "CLAUDE.md" "AI instructions"
check_file "package.json" "Package configuration"
check_file ".aiignore" "AI context control"

echo
echo "🤖 Checking AI Tool Configurations..."
check_optional_file ".cursorrules" "Cursor AI rules"
check_optional_file ".vscode/settings.json" "VS Code settings"
check_optional_file "ai/config/.cursorrules" "Backup Cursor rules"

echo
echo "🛠️ Checking Required Commands..."
check_command "npm" "Node Package Manager"
check_command "node" "Node.js runtime"

echo
echo "📦 Checking NPM Scripts..."
if npm run 2>/dev/null | grep -q "g:c\|generate:component"; then
    echo -e "${GREEN}✅${NC} Component generator available: npm run g:c"
else
    echo -e "${RED}❌${NC} Component generator not found"
    ERRORS=$((ERRORS + 1))
fi

if npm run 2>/dev/null | grep -q "setup:verify-ai"; then
    echo -e "${GREEN}✅${NC} AI verification script available"
else
    echo -e "${YELLOW}⚠️${NC}  AI verification script not found"
    WARNINGS=$((WARNINGS + 1))
fi

echo
echo "🧪 Testing Generator Availability..."
if [ -f "tools/generators/enhanced-component-generator.js" ]; then
    echo -e "${GREEN}✅${NC} Enhanced component generator file exists"
else
    echo -e "${RED}❌${NC} Enhanced component generator file missing"
    ERRORS=$((ERRORS + 1))
fi

echo
echo "📊 Verification Results"
echo "======================"

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 AI setup verification PASSED!${NC}"
    echo
    echo "Next steps:"
    echo "  1. Generate your first component: npm run g:c TestComponent"
    echo "  2. Start development: npm run dev"
    echo "  3. Choose your learning path: see QUICK-START.md"
    exit 0
else
    echo -e "${RED}❌ AI setup verification FAILED with $ERRORS error(s)${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Also found $WARNINGS warning(s)${NC}"
    fi
    echo
    echo "To fix these issues:"
    echo "  1. Run: npm install"
    echo "  2. Copy AI configs: cp ai/config/.cursorrules .cursorrules"
    echo "  3. See: docs/guides/ai-development/ai-assistant-setup.md"
    exit 1
fi