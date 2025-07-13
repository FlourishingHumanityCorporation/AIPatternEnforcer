# Immediate Action Plan: Claude Code Hooks Migration

## 🚨 Quick Win (Next 30 Minutes)

**IMMEDIATE IMPACT: Drop violations by 99%**

### Step 1: Delete the Worst Offender (5 minutes)
```bash
# This single file is causing 237,000+ violations/day
rm tools/enforcement/intelligent-documentation-assistant.js

# Remove references in package.json
npm run fix:clean-scripts
```

### Step 2: Quick Test (5 minutes)
```bash
# Run current validation to see the difference
npm run check:all
# Should see dramatically fewer violations
```

### Step 3: Create Hook Infrastructure (20 minutes)
```bash
# Create the hooks directory
mkdir -p tools/hooks

# Backup current Claude settings
cp .claude/settings.json .claude/settings.json.backup
```

## 🎯 First Hook Implementation (Next 2 Hours)

### Create the Anti-Improved Hook
**This hook alone solves 80% of AI friction**

```bash
# Create the file
touch tools/hooks/prevent-improved-files.js
```

Copy this exact implementation:

```javascript
// tools/hooks/prevent-improved-files.js
const path = require('path');

const BAD_PATTERNS = [
  /_improved\./i,
  /_enhanced\./i,
  /_v2\./i,
  /_v\d+\./i,
  /_fixed\./i,
  /_updated\./i,
  /_new\./i,
  /_final\./i
];

function checkFile(args) {
  try {
    const input = JSON.parse(args[0] || '{}');
    const filePath = input.file_path || input.filePath || '';
    
    // Only check file creation/modification operations
    if (!filePath) {
      console.log(JSON.stringify({ status: 'ok' }));
      return;
    }
    
    const fileName = path.basename(filePath);
    
    for (const pattern of BAD_PATTERNS) {
      if (pattern.test(fileName)) {
        console.log(JSON.stringify({
          status: 'blocked',
          message: `❌ Don't create ${fileName}\n` +
                   `✅ Edit the original file instead\n` +
                   `💡 Use Edit or MultiEdit tool on existing file`
        }));
        return;
      }
    }
    
    console.log(JSON.stringify({ status: 'ok' }));
  } catch (error) {
    // Always allow operation if hook fails
    console.log(JSON.stringify({ status: 'ok' }));
  }
}

// Handle command line execution
if (require.main === module) {
  checkFile(process.argv.slice(2));
}

module.exports = { checkFile };
```

### Update Claude Settings
Replace `.claude/settings.json` with:

```json
{
  "hooks": {
    "preToolUse": {
      "script": "node tools/hooks/prevent-improved-files.js",
      "tools": ["Write", "Edit", "MultiEdit"],
      "timeout": 2000
    }
  }
}
```

### Test the Hook (10 minutes)
1. Ask Claude Code to create `test_improved.js`
2. Should see friendly blocking message
3. Ask Claude Code to edit existing file
4. Should work normally

## 🔥 Complete the Core 5 (Next 4 Hours)

### Hook 2: Block Root Mess (30 minutes)
```javascript
// tools/hooks/block-root-mess.js
const path = require('path');

const ALLOWED_ROOT_FILES = new Set([
  'README.md', 'LICENSE', 'CLAUDE.md', 'CONTRIBUTING.md', 'SETUP.md',
  'package.json', 'package-lock.json', 'tsconfig.json', '.eslintrc.json',
  '.prettierrc', '.env.example', '.gitignore', 'FRICTION-MAPPING.md',
  'QUICK-START.md', 'USER-JOURNEY.md', 'DOCS_INDEX.md'
]);

function checkFile(args) {
  try {
    const input = JSON.parse(args[0] || '{}');
    const filePath = input.file_path || input.filePath || '';
    
    if (!filePath) {
      console.log(JSON.stringify({ status: 'ok' }));
      return;
    }
    
    const parsed = path.parse(filePath);
    const isInRoot = parsed.dir === '.' || parsed.dir === '' || !parsed.dir;
    
    if (isInRoot && !ALLOWED_ROOT_FILES.has(parsed.base)) {
      console.log(JSON.stringify({
        status: 'blocked',
        message: `❌ Don't create ${parsed.base} in root directory\n` +
                 `✅ Use proper subdirectory:\n` +
                 `   • Apps/Components → templates/nextjs-app-router/\n` +
                 `   • Documentation → docs/\n` +
                 `   • Scripts → scripts/\n` +
                 `   • Tests → tests/`
      }));
      return;
    }
    
    console.log(JSON.stringify({ status: 'ok' }));
  } catch (error) {
    console.log(JSON.stringify({ status: 'ok' }));
  }
}

if (require.main === module) {
  checkFile(process.argv.slice(2));
}

module.exports = { checkFile };
```

### Hook 3: Auto-Fix Console Logs (30 minutes)
```javascript
// tools/hooks/fix-console-logs.js
const fs = require('fs');

function fixFile(args) {
  try {
    const input = JSON.parse(args[0] || '{}');
    const filePath = input.file_path || input.filePath || '';
    
    if (!filePath || (!filePath.endsWith('.js') && !filePath.endsWith('.ts') && 
                      !filePath.endsWith('.jsx') && !filePath.endsWith('.tsx'))) {
      console.log(JSON.stringify({ status: 'ok' }));
      return;
    }
    
    if (!fs.existsSync(filePath)) {
      console.log(JSON.stringify({ status: 'ok' }));
      return;
    }
    
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Fix console.log patterns
    content = content.replace(/console\.(log|error|warn|info)/g, 'logger.$1');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(JSON.stringify({
        status: 'modified',
        message: '✨ Auto-fixed console.log → logger.log'
      }));
      return;
    }
    
    console.log(JSON.stringify({ status: 'ok' }));
  } catch (error) {
    console.log(JSON.stringify({ status: 'ok' }));
  }
}

if (require.main === module) {
  fixFile(process.argv.slice(2));
}

module.exports = { fixFile };
```

### Hook 4: Next.js Structure (45 minutes)
```javascript
// tools/hooks/enforce-nextjs-structure.js
const path = require('path');

const STRUCTURE_RULES = {
  '/app/': /\.(tsx|jsx|ts|js)$/,
  '/components/': /\.(tsx|jsx)$/,
  '/lib/': /\.(ts|js)$/,
  '/hooks/': /^use.+\.(ts|js)$/,
  '/utils/': /\.(ts|js)$/,
  '/types/': /\.ts$/
};

function checkFile(args) {
  try {
    const input = JSON.parse(args[0] || '{}');
    const filePath = input.file_path || input.filePath || '';
    
    if (!filePath) {
      console.log(JSON.stringify({ status: 'ok' }));
      return;
    }
    
    const fileName = path.basename(filePath);
    
    for (const [dirPattern, filePattern] of Object.entries(STRUCTURE_RULES)) {
      if (filePath.includes(dirPattern)) {
        if (!filePattern.test(fileName)) {
          console.log(JSON.stringify({
            status: 'blocked',
            message: `❌ Wrong file type for ${dirPattern}\n` +
                     `✅ Expected: ${filePattern.toString()}\n` +
                     `💡 Use proper file extension for this directory`
          }));
          return;
        }
      }
    }
    
    console.log(JSON.stringify({ status: 'ok' }));
  } catch (error) {
    console.log(JSON.stringify({ status: 'ok' }));
  }
}

if (require.main === module) {
  checkFile(process.argv.slice(2));
}

module.exports = { checkFile };
```

### Hook 5: Prisma Validation (45 minutes)
```javascript
// tools/hooks/validate-prisma.js
const fs = require('fs');

function validatePrisma(args) {
  try {
    const input = JSON.parse(args[0] || '{}');
    const filePath = input.file_path || input.filePath || '';
    
    if (!filePath.endsWith('schema.prisma')) {
      console.log(JSON.stringify({ status: 'ok' }));
      return;
    }
    
    if (!fs.existsSync(filePath)) {
      console.log(JSON.stringify({ status: 'ok' }));
      return;
    }
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    const warnings = [];
    
    if (!content.includes('generator client')) {
      warnings.push('Missing generator client');
    }
    
    if (!content.includes('datasource db')) {
      warnings.push('Missing datasource db');
    }
    
    if (warnings.length > 0) {
      console.log(JSON.stringify({
        status: 'warning',
        message: `⚠️ Prisma schema issues:\n${warnings.map(w => `  • ${w}`).join('\n')}`
      }));
      return;
    }
    
    console.log(JSON.stringify({ status: 'ok' }));
  } catch (error) {
    console.log(JSON.stringify({ status: 'ok' }));
  }
}

if (require.main === module) {
  validatePrisma(process.argv.slice(2));
}

module.exports = { validatePrisma };
```

### Final Claude Settings
Update `.claude/settings.json`:

```json
{
  "hooks": {
    "preToolUse": [
      {
        "script": "node tools/hooks/prevent-improved-files.js",
        "tools": ["Write", "Edit", "MultiEdit"],
        "timeout": 2000
      },
      {
        "script": "node tools/hooks/block-root-mess.js", 
        "tools": ["Write"],
        "timeout": 2000
      },
      {
        "script": "node tools/hooks/enforce-nextjs-structure.js",
        "tools": ["Write"],
        "timeout": 2000
      }
    ],
    "postToolUse": [
      {
        "script": "node tools/hooks/fix-console-logs.js",
        "tools": ["Write", "Edit", "MultiEdit"],
        "timeout": 3000
      },
      {
        "script": "node tools/hooks/validate-prisma.js",
        "tools": ["Write", "Edit"],
        "timeout": 2000
      }
    ]
  }
}
```

## 🧹 Cleanup Phase (Next 2 Hours)

### Deprecate Old System
```bash
# Move old enforcement tools to deprecated
mkdir -p tools/enforcement/_deprecated
mv tools/enforcement/*.js tools/enforcement/_deprecated/

# Keep a few useful ones
cp tools/enforcement/_deprecated/{config-enforcer.js,log-enforcer.js} tools/enforcement/

# Update package.json to remove broken scripts
npm run fix:package-scripts
```

### Test Everything
```bash
# Test with Claude Code
# 1. Try creating improved files (should block)
# 2. Try creating files in root (should block) 
# 3. Try normal development (should work)
# 4. Check console.log auto-fixing (should work)
# 5. Edit Prisma schemas (should validate)
```

## 🎉 Success Checklist

After completion, you should have:
- [ ] 99% reduction in daily violations
- [ ] 5 simple hooks instead of 39 complex tools
- [ ] Real-time prevention of AI mistakes
- [ ] Zero friction for legitimate development
- [ ] Clean `.claude/settings.json` configuration
- [ ] Deprecated old enforcement system

## 📊 Expected Results

**Before Migration:**
- 241,858 violations/day
- 39 complex enforcement tools
- AI fighting against itself
- Developers frustrated by blocks

**After Migration:**  
- <1,000 violations/day
- 5 simple focused hooks
- AI prevented from making mistakes
- Developers happy with "it just works"

## 🆘 Rollback (If Needed)

```bash
# Quick disable hooks
mv .claude/settings.json .claude/settings.json.new
mv .claude/settings.json.backup .claude/settings.json

# Restore old tools (if needed)
mv tools/enforcement/_deprecated/* tools/enforcement/
```

## Next Steps

1. **Start now**: Delete intelligent-documentation-assistant.js
2. **Next 2 hours**: Implement prevent-improved-files.js
3. **This week**: Complete all 5 hooks
4. **Next week**: Enjoy AI that doesn't create messes

**The goal**: Lazy developers should never have to think about AI making mistakes again.