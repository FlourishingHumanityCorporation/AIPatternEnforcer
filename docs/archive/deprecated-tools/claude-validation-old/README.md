# Claude Code Validation System

**Ensures Claude Code follows ProjectTemplate rules consistently across development sessions.**

## Table of Contents

1. [🚀 Quick Start (5 minutes)](#-quick-start-5-minutes)
2. [📋 What It Validates](#-what-it-validates)
3. [🔧 Configuration](#-configuration)
4. [💡 Common Workflows](#-common-workflows)
5. [📊 Dashboard](#-dashboard)
6. [🎯 Examples](#-examples)
7. [🛠️ Configuration File](#-configuration-file)
8. [🔍 Troubleshooting](#-troubleshooting)
9. [📚 Advanced Usage](#-advanced-usage)

## 🚀 Quick Start (5 minutes)

### 1. Setup

```bash
# Run the automated setup
bash scripts/setup-claude-validation.sh

# Verify installation
npm run claude:config:status
```

### 2. Basic Usage

```bash
# Copy Claude response to clipboard, then validate
pbpaste | npm run claude:validate - --complex

# Or validate a saved response file
npm run claude:validate response.txt --complex
```

### 3. Check Results

- ✅ **PASSED**: Claude followed all rules
- ❌ **FAILED**: Review violations and adjust your prompt

## 📋 What It Validates

### Critical Rules (Must Pass)
- **Prompt Improvement**: Complex requests start with `**Improved Prompt**:`
- **No Improved Files**: Never create `auth_improved.js` or `component_v2.tsx`

### Warning Rules (Should Pass)
- **Generator Usage** (`generatorUsage`): Recommends `npm run g:c ComponentName` for new components
- **TodoWrite Usage** (`todoWriteUsage`): Uses TodoWrite tool for multi-step tasks

### Info Rules (Nice to Have)
- **Original File Editing** (`originalFileEditing`): Mentions editing existing files instead of creating new versions
- **Concise Responses** (`conciseResponse`): Simple queries get brief answers (<4 lines)

## 🔧 Configuration

### Check Current Settings
```bash
npm run claude:config:status
```

### Modify Validation Rules
```bash
# Disable a pattern during development
npm run claude:config disable promptImprovement

# Change severity level
npm run claude:config set-severity CRITICAL

# Re-enable pattern
npm run claude:config enable promptImprovement
```

### Severity Levels
- **CRITICAL**: Validation fails if violated
- **WARNING**: Shows warnings but continues
- **INFO**: Shows informational messages only
- **DISABLED**: Completely disabled

## 💡 Common Workflows

### Daily Development
```bash
# 1. Make request to Claude Code
# 2. Copy response to clipboard
# 3. Validate
pbpaste | npm run claude:validate - --complex

# 4. If failed, adjust prompt and try again
```

### Team Setup
```bash
# Check team compliance rates
npm run claude:stats

# Set consistent configuration
npm run claude:config set-severity WARNING
npm run claude:config enable generatorUsage
```

### Debugging Issues
```bash
# Run test suite to verify system works
npm run claude:test

# View detailed patterns
npm run claude:config list

# Open visual dashboard
npm run claude:dashboard
```

## 📊 Dashboard

Open the visual dashboard to see:
- Current compliance rate
- Top violation patterns
- Interactive validation testing
- Configuration status

```bash
npm run claude:dashboard
```

## 🎯 Examples

### Good Complex Response
```text
**Improved Prompt**: Create a React login component with form validation and API integration.

I'll create a secure login component. Let me use TodoWrite to track our implementation:

- [ ] Generate component with npm run g:c LoginForm
- [ ] Add form validation
- [ ] Integrate with API

Let me edit the original LoginForm.tsx file to add the functionality...
```

### ❌ Bad Complex Response
```text
I'll create an improved version of your login component.

Let me create login_improved.js with better validation...
```

### Good Simple Response
```text
Use the useState hook for local component state:

const [count, setCount] = useState(0);
```

## 🛠️ Configuration File

Edit `tools/claude-validation/.claude-validation-config.json` to customize:

```json
{
  "patterns": {
    "promptImprovement": {
      "enabled": true,
      "severity": "CRITICAL"
    },
    "noImprovedFiles": {
      "enabled": true,
      "severity": "CRITICAL"
    },
    "generatorUsage": {
      "enabled": true,
      "severity": "WARNING"
    }
  },
  "severityLevels": {
    "global": "WARNING"
  }
}
```

## 🔍 Troubleshooting

### "No validation results"
- Check that you're in the ProjectTemplate root directory
- Verify setup with `npm run claude:config:status`

### "Command not found"
- Run setup: `bash scripts/setup-claude-validation.sh`
- Check npm scripts: `npm run claude:config help`

### "Pattern not working"
- Test individual patterns: `npm run claude:test`
- Check configuration: `npm run claude:config list`

### "False positives"
- Adjust severity: `npm run claude:config set-severity INFO`
- Disable problematic pattern: `npm run claude:config disable [pattern]`

## 📚 Advanced Usage

### Automation Scripts
```bash
# Silent validation for CI/CD
if npm run claude:validate response.txt --quiet; then
  echo "Claude response follows all rules"
else
  echo "Rule violations detected"
fi
```

### Statistics Tracking
```bash
# View compliance trends
npm run claude:stats

# Stats are stored in tools/claude-validation/.compliance-stats.json

# Validate documentation accuracy
npm run claude:validate:docs
```

## 🎓 Optimal Practices

### For Complex Requests
1. Always start with `**Improved Prompt**:`
2. Be specific about requirements
3. Mention using generators when appropriate
4. Use TodoWrite for multi-step tasks

### For Simple Queries
1. Use `--simple` flag for basic questions
2. Expect concise responses (<4 lines)
3. Don't require prompt improvement

### For Team Consistency
1. Set shared configuration
2. Run validation before committing
3. Review compliance rates weekly
4. Adjust patterns based on team needs

---

**Goal**: Consistent Claude Code behavior following ProjectTemplate rules  
**Setup Time**: 5 minutes  
**Daily Overhead**: ~10 seconds per validation