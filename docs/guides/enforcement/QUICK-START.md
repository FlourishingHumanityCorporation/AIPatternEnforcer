# Enforcement Quick Start

Quick examples showing how ProjectTemplate enforcement helps reduce development friction.

## Table of Contents

1. [How Enforcement Helps](#how-enforcement-helps)
  2. [Problem: Duplicated Files Cause Confusion](#problem-duplicated-files-cause-confusion)
  3. [Problem: Files in Wrong Locations](#problem-files-in-wrong-locations)
  4. [Problem: Status Documentation Creates Noise](#problem-status-documentation-creates-noise)
5. [Quick Test](#quick-test)
6. [Why These Rules Exist](#why-these-rules-exist)
7. [Getting Help](#getting-help)
8. [Making It Work For You](#making-it-work-for-you)

## How Enforcement Helps

### Problem: Duplicated Files Cause Confusion

❌ **Without enforcement:**
```text
src/UserService.js
src/UserService_improved.js
src/UserService_v2.js
src/UserService_final.js
```

✅ **With enforcement:**
```text
src/UserService.js  (always edit the original)
```

**Try it:** Create a file with `_improved` in the name and see the helpful guidance.

### Problem: Files in Wrong Locations

❌ **Without enforcement:**
```text
project-root/
├── my-component.js
├── debug-notes.md
├── temp-script.py
└── package.json
```

✅ **With enforcement:**
```text
project-root/
├── src/my-component.js
├── docs/debug-notes.md
├── scripts/temp-script.py
└── package.json
```

**Try it:** Create a file in the root directory to see proper placement suggestions.

### Problem: Status Documentation Creates Noise

❌ **Without enforcement:**
```text
docs/
├── IMPLEMENTATION_COMPLETE.md
├── TASK_FINISHED.md
├── FINAL_REPORT.md
└── api-guide.md
```

✅ **With enforcement:**
```text
docs/
├── api-guide.md
├── deployment-guide.md
└── architecture-overview.md
```

**Try it:** Create a file ending in `_COMPLETE.md` to see timeless documentation guidance.

## Quick Test

Try these commands to see enforcement in action:

```bash
# This will be blocked with helpful guidance
echo "test" > test_improved.js

# This will guide you to proper location
echo "# Notes" > debug.md

# This will show you the enforcement rules
npm run check:all
```

## Why These Rules Exist

Each rule reduces specific friction:

- **No duplicate files** → Clearer codebase navigation
- **Proper file organization** → Faster file discovery  
- **Timeless documentation** → Always relevant guides
- **Consistent imports** → Reduced debugging time

## Getting Help

- **See all rules:** `docs/guides/enforcement/README.md`
- **Fix violations:** `npm run doc:create`
- **Check status:** `npm run check:all`
- **Emergency override:** Contact project maintainer

## Making It Work For You

The system learns from your patterns. If a rule consistently blocks valid work:

1. Check if there's a better approach suggested
2. Look for similar existing code patterns  
3. Ask: "Does this reduce or increase future friction?"
4. Document edge cases for future improvement