#!/bin/bash

# VS Code Integration Test Script
# Tests that VS Code tasks and extension integration work properly

set -e

echo "🧪 Testing VS Code Integration for ProjectTemplate"
echo

# Test 1: Check VS Code configuration files exist
echo "1. Checking VS Code configuration files..."
if [ -f ".vscode/tasks.json" ]; then
    echo "   ✅ tasks.json found"
else
    echo "   ❌ tasks.json missing"
    exit 1
fi

if [ -f ".vscode/launch.json" ]; then
    echo "   ✅ launch.json found"
else
    echo "   ❌ launch.json missing"
    exit 1
fi

# Test 2: Verify extension can be compiled
echo
echo "2. Testing extension compilation..."
cd extensions/projecttemplate-assistant
if npm run compile > /dev/null 2>&1; then
    echo "   ✅ Extension compiles successfully"
else
    echo "   ❌ Extension compilation failed"
    exit 1
fi
cd - > /dev/null

# Test 3: Check Claude validation integration
echo
echo "3. Testing Claude validation integration..."
if node tools/claude-validation/validate-claude.js --help > /dev/null 2>&1; then
    echo "   ✅ Claude validation accessible"
else
    echo "   ❌ Claude validation not accessible"
    exit 1
fi

# Test 4: Verify task definitions
echo
echo "4. Checking task definitions..."
TASK_COUNT=$(grep -c '"label":' .vscode/tasks.json || echo "0")
if [ "$TASK_COUNT" -ge 6 ]; then
    echo "   ✅ Found $TASK_COUNT tasks defined"
else
    echo "   ❌ Expected at least 6 tasks, found $TASK_COUNT"
    exit 1
fi

# Test 5: Check extension package
echo
echo "5. Testing extension package..."
EXTENSION_VERSION=$(grep '"version":' extensions/projecttemplate-assistant/package.json | head -1 | cut -d'"' -f4)
if [ ! -z "$EXTENSION_VERSION" ]; then
    echo "   ✅ Extension version: $EXTENSION_VERSION"
else
    echo "   ❌ Extension version not found"
    exit 1
fi

# Test 6: Verify command mappings
echo
echo "6. Checking command mappings..."
CLAUDE_COMMANDS=$(grep -c 'validateClaude' extensions/projecttemplate-assistant/package.json || echo "0")
if [ "$CLAUDE_COMMANDS" -ge 2 ]; then
    echo "   ✅ Claude validation commands mapped"
else
    echo "   ❌ Claude validation commands missing"
    exit 1
fi

echo
echo "🎉 VS Code Integration Test Passed!"
echo
echo "Next steps:"
echo "  1. Install extension: code --install-extension extensions/projecttemplate-assistant/projecttemplate-assistant-0.1.0.vsix"
echo "  2. Copy .vscode/settings.json.template to .vscode/settings.json and customize"
echo "  3. Test commands: Cmd+Shift+P → 'ProjectTemplate'"
echo "  4. Test validation: Cmd+Shift+V"
echo
echo "For pilot users, see: docs/claude-validation/PILOT-USER-GUIDE.md"