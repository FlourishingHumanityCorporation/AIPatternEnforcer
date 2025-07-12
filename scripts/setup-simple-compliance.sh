#!/bin/bash
# Simple compliance setup for local web apps - 5 minute solution

echo "🚀 Setting up simple Claude Code compliance for local web apps..."

# 1. Create .husky directory if it doesn't exist
if [ ! -d ".husky" ]; then
    echo "📁 Creating .husky directory..."
    mkdir -p .husky
fi

# 2. Create pre-commit hook
echo "🔨 Creating pre-commit hook to prevent _improved files..."
cat > .husky/pre-commit << 'EOF'
#!/bin/bash
# Prevent committing files with _improved, _enhanced, or _v2 naming

IMPROVED_FILES=$(git diff --cached --name-only | grep -E "_improved\.|_enhanced\.|_v2\.")
if [ -n "$IMPROVED_FILES" ]; then
    echo "❌ Found files with bad naming patterns:"
    echo "$IMPROVED_FILES"
    echo ""
    echo "💡 Edit the original files instead of creating new versions!"
    echo "   For example: edit 'Login.jsx' instead of creating 'Login_improved.jsx'"
    exit 1
fi

echo "✅ File naming check passed"
EOF

chmod +x .husky/pre-commit

# 3. Create VS Code snippets
echo "📝 Creating VS Code snippets..."
mkdir -p .vscode

cat > .vscode/claude-helpers.code-snippets << 'EOF'
{
  "New Component Reminder": {
    "prefix": "newcomp",
    "body": [
      "// 🎯 Use the component generator:",
      "// npm run g:c ${1:ComponentName}",
      "// (Don't create components manually)"
    ],
    "description": "Reminder to use component generator"
  },
  "Claude Code Prompt": {
    "prefix": "claude",
    "body": [
      "// When asking Claude Code:",
      "// 1. Request prompt improvement for complex tasks",
      "// 2. Say 'edit the original file' not 'create improved version'",
      "// 3. Ask to use 'npm run g:c' for new components",
      "// 4. Request TodoWrite for multi-step tasks"
    ],
    "description": "Claude Code best practices"
  }
}
EOF

# 4. Create simple checklist
echo "📋 Creating Claude Code checklist..."
cat > CLAUDE_CODE_CHECKLIST.md << 'EOF'
# Claude Code Checklist for Local Web Apps

## Before Each Session
- [ ] Be specific: "Edit Login.jsx" not "improve the login"
- [ ] Mention: "Use npm run g:c for new components"
- [ ] Request: "Start with improved prompt" for complex tasks

## Common Prompts
- ❌ "Make this better" 
- ✅ "Edit ProfileCard.jsx to add loading state"

- ❌ "Create a new user profile component"
- ✅ "Use npm run g:c UserProfile to create a profile component"

- ❌ "Fix the API"
- ✅ "Debug why /api/users returns 404 in server.js"

## If Claude Creates _improved Files
1. Don't use the improved file
2. Copy useful changes to original
3. Delete the _improved file
4. Be more specific next time
EOF

echo ""
echo "✅ Simple compliance setup complete!"
echo ""
echo "What we added:"
echo "  • Pre-commit hook: Blocks _improved files"
echo "  • VS Code snippets: Type 'newcomp' or 'claude' for reminders"
echo "  • Checklist: CLAUDE_CODE_CHECKLIST.md"
echo ""
echo "That's it! No databases, no monitoring, no complexity."
echo "Just practical tools for local web app development."