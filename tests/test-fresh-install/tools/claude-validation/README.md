# ProjectTemplate Behavioral Compliance Tools

## Table of Contents

1. [Quick Start](#quick-start)
2. [What's Included](#whats-included)
  3. [🛠️ Core Tools](#-core-tools)
  4. [📊 Key Patterns Checked](#-key-patterns-checked)
  5. [🎯 Commands](#-commands)
  6. [📈 Usage Examples](#-usage-examples)
  7. [🔧 Customization](#-customization)
8. [Integration with Development Workflow](#integration-with-development-workflow)
9. [Troubleshooting](#troubleshooting)
10. [Philosophy](#philosophy)

## Quick Start

1. **Setup** (2 minutes):
   ```bash
   npm run compliance:setup
   ```

2. **Test a Claude Code response**:
   ```bash
   # From file
   npm run claude:validate response.txt -- --complex
   
   # From clipboard (Mac)
   pbpaste | npm run claude:validate - -- --complex
   ```

3. **View dashboard**:
   ```bash
   npm run claude:dashboard
   ```

## What's Included

### 🛠️ Core Tools

1. **Git Pre-commit Hook** (`/.husky/pre-commit`)
   - Blocks files with `_improved`, `_enhanced`, `_v2` patterns
   - Warns about console.log usage
   - Checks root directory compliance

2. **Compliance Validator** (`compliance-validator.js`)
   - Validates Claude Code responses against CLAUDE.md rules
   - Tracks statistics over time
   - Provides detailed feedback

3. **Web Dashboard** (`dashboard.html`)
   - Visual compliance tracking
   - Test responses interactively
   - View compliance trends

4. **VS Code Snippets** (`/.vscode/claude-compliance.code-snippets`)
   - Type `newcomp` for component generator reminder
   - Type `claude` for proper request template
   - Type `debugrca` for RCA template

### 📊 Key Patterns Checked

| Pattern | Description | Severity |
|---------|-------------|----------|
| Prompt Improvement | Complex requests should start with `**Improved Prompt**:` | Critical |
| No Improved Files | Never create `*_improved.*` or similar files | Critical |
| Generator Usage | Recommend `npm run g:c` for components | Warning |
| TodoWrite Usage | Use todo lists for multi-step tasks | Warning |
| Edit Original | Mention editing existing files | Info |

### 🎯 Commands

```bash
# Validate a response
npm run compliance:validate <file> [--complex|--simple]

# Run test suite
npm run compliance:test

# View statistics
npm run compliance:stats

# Open dashboard
npm run compliance:dashboard

# Setup/update tools
npm run compliance:setup
```

### 📈 Usage Examples

**Good Response (Complex Request)**:
```markdown
**Improved Prompt**: Create a user authentication component with form validation and API integration following project
patterns.

I'll help you build this authentication component. Let me use TodoWrite to track our progress:

- [ ] Generate component structure
- [ ] Add form validation
- [ ] Integrate with API

Let's start with the component generator:
\`\`\`bash
npm run g:c AuthForm
\`\`\`

Now let's edit the original AuthForm.jsx file...
```

**Bad Response**:
```markdown
I'll create an improved version of your login component.

Create Login_improved.jsx:
\`\`\`jsx
// New improved component
\`\`\`
```

### 🔧 Customization

Edit patterns in `compliance-validator.js` to add/modify rules:

```javascript
this.patterns = {
  yourNewPattern: {
    pattern: /your-regex/,
    description: 'What this checks',
    severity: 'critical|warning|info'
  }
}
```

## Integration with Development Workflow

1. **Pre-commit**: Automatically prevents bad file names
2. **During development**: Use VS Code snippets for reminders
3. **After Claude helps**: Validate responses with CLI
4. **Team review**: Check dashboard for trends

## Troubleshooting

**"Command not found"**:
```bash
# Make scripts executable
chmod +x tools/behavioral-compliance/*.js
```

**Dashboard won't open**:
```bash
# Open manually in browser
open tools/behavioral-compliance/dashboard.html
```

**Stats not saving**:
- Check write permissions in tools/behavioral-compliance/
- Stats are stored in `.compliance-stats.json`

## Philosophy

This is intentionally simple. For local web apps, we need:
- ✅ Basic validation to catch common issues
- ✅ Quick feedback on Claude Code responses  
- ✅ Simple tracking of compliance over time

We don't need:
- ❌ Real-time enforcement middleware
- ❌ Database-backed analytics
- ❌ Complex monitoring systems

Keep it simple. These tools solve 90% of the problems with 10% of the complexity.