#!/bin/bash
# Progress Tracking Script
# Checks user progress through ProjectTemplate learning paths

set -e

echo "📊 ProjectTemplate Progress Tracker"
echo "=================================="

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
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BEGINNER_SCORE=0
INTERMEDIATE_SCORE=0
EXPERT_SCORE=0

check_exists() {
    local item=$1
    local description=$2
    if eval "$item" >/dev/null 2>&1; then
        echo -e "  ${GREEN}✅${NC} $description"
        return 0
    else
        echo -e "  ${RED}❌${NC} $description"
        return 1
    fi
}

echo
echo -e "${BLUE}🟢 Beginner Path Progress${NC}"
echo "========================="

if check_exists "[ -f package.json ]" "Project setup complete"; then
    BEGINNER_SCORE=$((BEGINNER_SCORE + 1))
fi

if check_exists "[ -f scripts/verify-ai-setup.sh ]" "AI setup verification script exists"; then
    BEGINNER_SCORE=$((BEGINNER_SCORE + 1))
fi

if check_exists "[ -d templates ] || [ -d src ]" "Project structure ready"; then
    BEGINNER_SCORE=$((BEGINNER_SCORE + 1))
fi

if check_exists "[ -f package.json ] && npm run --silent 2>/dev/null | grep -q test" "Test script available"; then
    BEGINNER_SCORE=$((BEGINNER_SCORE + 1))
fi

echo -e "Beginner Score: ${GREEN}$BEGINNER_SCORE/4${NC}"

echo
echo -e "${BLUE}🟡 Intermediate Path Progress${NC}"
echo "============================"

if check_exists "[ -f .cursorrules ] || [ -f ai/config/.cursorrules ]" "AI rules configured"; then
    INTERMEDIATE_SCORE=$((INTERMEDIATE_SCORE + 1))
fi

if check_exists "[ -f .aiignore ]" "Context control configured"; then
    INTERMEDIATE_SCORE=$((INTERMEDIATE_SCORE + 1))
fi

if check_exists "[ -d tools/enforcement ]" "Enforcement system available"; then
    INTERMEDIATE_SCORE=$((INTERMEDIATE_SCORE + 1))
fi

if check_exists "[ -d templates ]" "Generator templates available"; then
    INTERMEDIATE_SCORE=$((INTERMEDIATE_SCORE + 1))
fi

echo -e "Intermediate Score: ${GREEN}$INTERMEDIATE_SCORE/4${NC}"

echo
echo -e "${BLUE}🔴 Expert Path Progress${NC}"
echo "======================"

if check_exists "[ -f tools/generators/enhanced-component-generator.js ]" "Advanced generators available"; then
    EXPERT_SCORE=$((EXPERT_SCORE + 1))
fi

if check_exists "[ -d docs/architecture ]" "Architecture documentation exists"; then
    EXPERT_SCORE=$((EXPERT_SCORE + 1))
fi

if check_exists "[ -f scripts/dev/debug-snapshot.sh ]" "Advanced debugging tools available"; then
    EXPERT_SCORE=$((EXPERT_SCORE + 1))
fi

if check_exists "[ -d .github/workflows ] || [ -f .github/workflows/test.yml ]" "CI/CD configured"; then
    EXPERT_SCORE=$((EXPERT_SCORE + 1))
fi

echo -e "Expert Score: ${GREEN}$EXPERT_SCORE/4${NC}"

echo
echo "📈 Overall Progress Summary"
echo "=========================="

TOTAL_SCORE=$((BEGINNER_SCORE + INTERMEDIATE_SCORE + EXPERT_SCORE))
MAX_SCORE=12

echo -e "Total Progress: ${GREEN}$TOTAL_SCORE/$MAX_SCORE${NC} ($(($TOTAL_SCORE * 100 / $MAX_SCORE))%)"

if [ $BEGINNER_SCORE -eq 4 ] && [ $INTERMEDIATE_SCORE -lt 2 ]; then
    echo -e "${YELLOW}💡 Ready for Intermediate Path!${NC} See USER-JOURNEY.md#intermediate-path"
elif [ $INTERMEDIATE_SCORE -eq 4 ] && [ $EXPERT_SCORE -lt 2 ]; then
    echo -e "${YELLOW}💡 Ready for Expert Path!${NC} See USER-JOURNEY.md#expert-path"
elif [ $BEGINNER_SCORE -lt 4 ]; then
    echo -e "${YELLOW}💡 Continue with Beginner Path${NC} See USER-JOURNEY.md#beginner-path"
fi

echo
echo "🎯 Next Steps"
echo "============"

if [ $BEGINNER_SCORE -lt 4 ]; then
    echo "1. Complete basic setup: npm run setup:verify-ai"
    echo "2. Generate first component: npm run g:c TestComponent"
    echo "3. Run tests: npm test"
elif [ $INTERMEDIATE_SCORE -lt 4 ]; then
    echo "1. Configure AI tools: docs/guides/ai-development/ai-assistant-setup.md"
    echo "2. Understand enforcement: npm run check:all"
    echo "3. Customize generators: docs/guides/generators/"
else
    echo "1. Study architecture: docs/architecture/"
    echo "2. Create custom tools: tools/generators/"
    echo "3. Contribute improvements: CONTRIBUTING.md"
fi

exit 0