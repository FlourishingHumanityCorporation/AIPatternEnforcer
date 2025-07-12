#!/bin/bash

# Test script for Claude validation pre-commit hook
# This script creates test files to verify the hook catches violations

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Testing Claude validation pre-commit hook...${NC}\n"

# Create a temporary test directory
TEST_DIR="test-claude-hook-$$"
mkdir -p "$TEST_DIR"
cd "$TEST_DIR" || exit 1

# Initialize git repo
git init -q

# Test 1: File with _improved pattern
echo -e "${YELLOW}Test 1: Creating file with _improved pattern...${NC}"
echo "// Test file" > auth_improved.js
git add auth_improved.js

echo "Running hook..."
if ../pre-commit-hook.sh; then
    echo -e "${RED}❌ Test 1 FAILED: Hook should have caught _improved pattern${NC}"
else
    echo -e "${GREEN}✅ Test 1 PASSED: Hook correctly caught _improved pattern${NC}"
fi

git reset -q
rm auth_improved.js

# Test 2: File with announcement-style content
echo -e "\n${YELLOW}Test 2: Creating file with announcement-style content...${NC}"
cat > feature.md << 'EOF'
# New Feature

We're excited to announce this new feature!
Successfully implemented the authentication system.
EOF

git add feature.md
echo "Running hook..."
if ../pre-commit-hook.sh; then
    echo -e "${RED}❌ Test 2 FAILED: Hook should have caught announcement style${NC}"
else
    echo -e "${GREEN}✅ Test 2 PASSED: Hook correctly caught announcement style${NC}"
fi

git reset -q
rm feature.md

# Test 3: Import of _improved file
echo -e "\n${YELLOW}Test 3: Creating file that imports _improved module...${NC}"
cat > main.js << 'EOF'
import { auth } from './auth_improved.js';
const utils = require('./utils_enhanced.js');
EOF

git add main.js
echo "Running hook..."
if ../pre-commit-hook.sh; then
    echo -e "${RED}❌ Test 3 FAILED: Hook should have caught import of _improved files${NC}"
else
    echo -e "${GREEN}✅ Test 3 PASSED: Hook correctly caught import of anti-pattern files${NC}"
fi

git reset -q
rm main.js

# Test 4: Clean file (should pass)
echo -e "\n${YELLOW}Test 4: Creating clean file...${NC}"
cat > auth.js << 'EOF'
// Clean authentication module
export function authenticate(user) {
    return user.isValid;
}
EOF

git add auth.js
echo "Running hook..."
if ../pre-commit-hook.sh; then
    echo -e "${GREEN}✅ Test 4 PASSED: Hook correctly allowed clean file${NC}"
else
    echo -e "${RED}❌ Test 4 FAILED: Hook should have allowed clean file${NC}"
fi

git reset -q
rm auth.js

# Test 5: Binary file (should be skipped)
echo -e "\n${YELLOW}Test 5: Testing binary file handling...${NC}"
# Create a small binary file
printf '\x00\x01\x02\x03' > test_improved.bin
git add test_improved.bin

echo "Running hook..."
if ../pre-commit-hook.sh; then
    echo -e "${GREEN}✅ Test 5 PASSED: Hook correctly skipped binary file${NC}"
else
    echo -e "${RED}❌ Test 5 FAILED: Hook should skip binary files${NC}"
fi

git reset -q
rm test_improved.bin

# Test 6: SKIP_CLAUDE_CHECK environment variable
echo -e "\n${YELLOW}Test 6: Testing SKIP_CLAUDE_CHECK override...${NC}"
echo "// Test file" > auth_v2.js
git add auth_v2.js

echo "Running hook with SKIP_CLAUDE_CHECK=1..."
if SKIP_CLAUDE_CHECK=1 ../pre-commit-hook.sh; then
    echo -e "${GREEN}✅ Test 6 PASSED: Hook correctly honored skip flag${NC}"
else
    echo -e "${RED}❌ Test 6 FAILED: Hook should have been skipped${NC}"
fi

# Cleanup
cd ..
rm -rf "$TEST_DIR"

echo -e "\n${BLUE}🎉 All tests completed!${NC}"