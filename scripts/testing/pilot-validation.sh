#!/bin/bash

echo "🧪 ProjectTemplate Pilot Validation"
echo "Testing core functionality for pilot teams..."
echo

PASSED=0
FAILED=0

# Helper function
test_command() {
    echo -n "  Testing $1... "
    if timeout 5 bash -c "$2" >/dev/null 2>&1; then
        echo "✅ PASS"
        PASSED=$((PASSED + 1))
    else
        echo "❌ FAIL"
        FAILED=$((FAILED + 1))
    fi
}

# Test basic dependencies
echo "📦 Testing Dependencies"
test_command "Node.js" "node --version"
test_command "npm" "npm --version"
test_command "Git" "git --version"
echo

# Test core scripts
echo "🔧 Testing Core Scripts"
test_command "Enforcement status" "npm run enforcement:status"
test_command "File naming check" "npm run check:no-improved-files"
test_command "Import checking" "npm run check:imports"
echo

# Test enforcement configuration
echo "⚙️ Testing Enforcement Configuration"  
test_command "Set WARNING level" "npm run enforcement:config set-level WARNING"
test_command "Set PARTIAL level" "npm run enforcement:config set-level PARTIAL"
echo

# Test git hooks
echo "🪝 Testing Git Hooks"
test_command "Pre-commit hook exists" "test -f .husky/pre-commit"
test_command "Pre-commit hook content" "grep -q 'check:all' .husky/pre-commit"
echo

# Test VS Code extension file
echo "🆚 Testing VS Code Extension"
test_command "VSIX file exists" "test -f dist/projecttemplate-assistant-0.1.0.vsix"
if command -v code >/dev/null 2>&1; then
    test_command "VS Code available" "code --version"
else
    echo "  ⚠️ VS Code not installed (optional)"
fi
echo

# Test documentation
echo "📚 Testing Documentation"
test_command "CLAUDE.md exists" "test -f CLAUDE.md"
test_command "Pilot guide exists" "test -f docs/pilot-testing/PILOT_TESTING_GUIDE.md"
echo

# Summary
echo "📊 Summary"
TOTAL=$((PASSED + FAILED))
echo "  Tests passed: $PASSED"
echo "  Tests failed: $FAILED"
if [ $TOTAL -gt 0 ]; then
    PERCENTAGE=$(( (PASSED * 100) / TOTAL ))
    echo "  Success rate: ${PERCENTAGE}%"
fi
echo

if [ $FAILED -eq 0 ]; then
    echo "🎉 All tests passed! Ready for pilot testing."
    echo
    echo "Next steps:"
    echo "  1. Install VS Code extension: code --install-extension dist/projecttemplate-assistant-0.1.0.vsix"
    echo "  2. Review pilot guide: docs/pilot-testing/PILOT_TESTING_GUIDE.md"
    echo "  3. Start using in daily workflow"
    exit 0
else
    echo "🚨 Some tests failed. Review issues above before pilot testing."
    exit 1
fi