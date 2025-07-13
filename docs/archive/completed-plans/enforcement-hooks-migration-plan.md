# Plan: Lazy-Coder Enforcement Hooks for AI Pattern Prevention

**Simple migration plan to stop AI from creating bloated messes in your solo projects.**

## Table of Contents

1. [Overview](#overview)
2. [Goals](#goals)
3. [Implementation Timeline](#implementation-timeline)
4. [Current Status](#current-status)
5. [Phase Breakdown](#phase-breakdown)
6. [Hook Examples for Next.js Stack](#hook-examples-for-nextjs-stack)
7. [Testing (But Keep It Simple)](#testing-but-keep-it-simple)
8. [Success Metrics](#success-metrics)

## Overview

### The Problem (Why You Care)
You're a lazy coder using Claude/Cursor. The AI keeps:
- Creating `Button_improved.tsx` instead of fixing the original
- Using `console.log` everywhere instead of proper logging
- Making 39 different enforcement tools that nobody understands
- Generating 237,198 documentation violations per day (seriously!)

### The Solution (What We're Doing)
Use Claude Code hooks to automatically prevent AI stupidity:
- Block bad file names in real-time
- Auto-fix console.logs as they're created
- Enforce Next.js App Router patterns
- Keep everything simple for solo developers

### What This Is NOT
- NO team features
- NO enterprise complexity
- NO DevOps pipelines
- NO monitoring dashboards
- Just simple hooks that work

## Goals

### What Success Looks Like for a Lazy Coder
1. **AI stops creating `_improved` files** - Edit the original, dammit!
2. **Console.logs get auto-fixed** - No manual cleanup needed
3. **Next.js patterns enforced** - Components go in `/app`, not random places
4. **Works automatically** - No thinking required

### Simple Success Metrics
- Can copy this project and start coding immediately
- AI mistakes get fixed automatically
- No more bloated project structure
- Zero configuration after initial setup

## Implementation Timeline

### Realistic Timeline for a Lazy Solo Dev

**Week 1: Copy & Paste Setup** (2 hours max)
- [ ] Copy 5 essential hooks from examples
- [ ] Add to `.claude/settings.json`
- [ ] Test with Claude Code
- [ ] Drink coffee ☕

**Week 2: Fix What Annoys You** (When motivated)
- [ ] Add hooks for your specific pain points
- [ ] Delete the 39 tools you don't understand
- [ ] Test on a real project
- [ ] Take a nap

**Week 3+: Forget About It**
- [ ] It just works automatically
- [ ] AI stops making stupid mistakes
- [ ] You can focus on actual features

## Current Status

### What's Already Working
- [x] Basic hooks that block `_improved` files
- [x] Some logging enforcement (needs work)
- [x] Too many complex tools nobody uses

### What Needs Fixing (The Important Stuff)
- [ ] Delete 30+ unnecessary enforcement tools
- [ ] Add Next.js App Router specific hooks
- [ ] Make console.log fixing actually work
- [ ] Add Prisma schema validation
- [ ] Add Tailwind class checking

## Phase Breakdown

### Phase 1: Just Make It Work (Week 1)

**The 5 Essential Hooks Every Lazy Coder Needs:**

1. **Stop `_improved` Files**
```bash
# Add to .claude/settings.json
{
  "PreToolUse": [{
    "matcher": "Write",
    "hooks": [{
      "type": "command",
      "command": "node -e \"if (/_improved|_v2|_enhanced/.test(process.env.CLAUDE_TOOL_INPUT)) {console.error('Stop creating new files! Edit the original!'); process.exit(2)}\""
    }]
  }]
}
```

2. **Fix Console.logs Automatically**
```bash
{
  "PostToolUse": [{
    "matcher": "Write|Edit",
    "hooks": [{
      "type": "command", 
      "command": "node tools/hooks/fix-console-log.js"
    }]
  }]
}
```

3. **Enforce Next.js App Router Structure**
```bash
{
  "PreToolUse": [{
    "matcher": "Write",
    "hooks": [{
      "type": "command",
      "command": "node tools/hooks/nextjs-structure.js"
    }]
  }]
}
```

4. **Block Root Directory Mess**
```bash
{
  "PreToolUse": [{
    "matcher": "Write",
    "hooks": [{
      "type": "command",
      "command": "node -e \"if (!/^(app|components|lib|prisma|public)/.test(process.env.CLAUDE_FILE_PATH)) {console.error('Put files in proper directories!'); process.exit(2)}\""
    }]
  }]
}
```

5. **Prisma Schema Validation**
```bash
{
  "PostToolUse": [{
    "matcher": "Edit",
    "hooks": [{
      "type": "command",
      "command": "if [[ $CLAUDE_FILE_PATH == *schema.prisma ]]; then npx prisma validate; fi"
    }]
  }]
}
```

### Phase 2: Delete the Bloat (Week 2)

**What to Delete (You Don't Need These):**
- [ ] 30+ complex enforcement tools
- [ ] Intelligent documentation assistant (237K violations!)
- [ ] Complex caching systems
- [ ] Cross-file validation nonsense
- [ ] Anything with "enterprise" in the name

**What to Keep (The Good Stuff):**
- [ ] Simple file naming checks
- [ ] Basic console.log fixer
- [ ] Next.js structure validation
- [ ] That's it!



## Hook Examples for Next.js Stack

### Next.js App Router Component Hook
```javascript
// tools/hooks/nextjs-structure.js
const input = JSON.parse(process.argv[2] || process.stdin.read());
const path = input.tool_input.file_path;

// Components must go in app/ or components/
if (path.endsWith('.tsx') && !path.match(/^(app|components)\//)) {
  console.error('🚫 Next.js components belong in app/ or components/');
  console.error('💡 Move to: app/components/' + path.split('/').pop());
  process.exit(2);
}

// Server components can't have 'use client'
if (path.startsWith('app/') && !path.includes('components/')) {
  // This is a server component by default
  const content = input.tool_input.content || '';
  if (content.includes('use client')) {
    console.error('🚫 Server components should not have "use client"');
    console.error('💡 Move to app/components/ for client components');
    process.exit(2);
  }
}
```

### Tailwind Class Validator Hook
```javascript
// tools/hooks/tailwind-check.js
const validClasses = ['flex', 'grid', 'p-4', 'm-2', 'text-sm']; // Add more
const content = input.tool_input.content;
const classMatch = content.match(/className="([^"]*)"/g);

if (classMatch) {
  classMatch.forEach(match => {
    const classes = match.replace('className="', '').replace('"', '').split(' ');
    classes.forEach(cls => {
      if (!validClasses.includes(cls) && !cls.match(/^(w|h|p|m|text)-/)) {
        console.warn(`⚠️  Unknown Tailwind class: ${cls}`);
      }
    });
  });
}
```

### Zustand Store Pattern Hook
```javascript
// Ensure Zustand stores follow pattern
if (path.includes('store') && path.endsWith('.ts')) {
  if (!content.includes('create(')) {
    console.error('🚫 Store files must use Zustand create()');
    process.exit(2);
  }
}
```

## Testing (But Keep It Simple)

### The Only Test That Matters
```bash
# Try to create a bad file
claude "create Button_improved.tsx"
# Should fail with error

# Try to use console.log
claude "add console.log to Button.tsx"
# Should auto-fix to logger

# That's it. If these work, you're good.
```

## Success Metrics

### How You Know It's Working
- [ ] AI stops creating `_improved` files
- [ ] Console.logs disappear automatically
- [ ] Files go in the right directories
- [ ] You can actually focus on building features
- [ ] No more 237,000 daily violations

### What Success Looks Like
Before: "Why are there 47 versions of Button.tsx?"
After: "Oh nice, the AI just fixed that automatically"

## Robust Yet Simple Implementation

### What Makes This Robust (Not Just Simple)

**Error Handling That Works**
```javascript
// Good: Handles edge cases without complexity
const input = JSON.parse(process.argv[2] || process.stdin.read() || '{}');
if (!input.tool_input?.file_path) {
  console.error('No file path provided');
  process.exit(1);
}

// Bad: Too simple, will break
const path = JSON.parse(process.argv[2]).tool_input.file_path; // Crashes
```

**Future-Proof Patterns**
- Use JSON for hook communication (extensible)
- Exit codes follow standards (0=success, 2=block)
- Clear error messages that help fix issues
- Hooks are composable (can add more later)

**Avoiding Future Problems**
1. **File path normalization** - Handle both `/` and `\`
2. **Content encoding** - UTF-8 handling built in
3. **Large file protection** - Skip files >1MB
4. **Timeout protection** - 3 second max per hook

### Complete .claude/settings.json Example
```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "node tools/hooks/no-improved-files.js",
            "timeout": 3
          },
          {
            "type": "command", 
            "command": "node tools/hooks/nextjs-structure.js",
            "timeout": 3
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Write|Edit|MultiEdit",
        "hooks": [
          {
            "type": "command",
            "command": "node tools/hooks/fix-console-log.js",
            "timeout": 3
          },
          {
            "type": "command",
            "command": "npx prettier --write $CLAUDE_FILE_PATH 2>/dev/null || true",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

### Migration Checklist (The Real One)

**Week 1: Core Setup**
- [ ] Copy this .claude/settings.json
- [ ] Create tools/hooks/ directory
- [ ] Add 3 essential hooks (no-improved, console-log, nextjs)
- [ ] Test with real Claude Code session
- [ ] Delete 30+ unused enforcement tools

**Week 2: Customize for Your Stack**
- [ ] Add Prisma validation if using Prisma
- [ ] Add Tailwind checking if using Tailwind
- [ ] Add Zustand patterns if using Zustand
- [ ] Fine-tune error messages

**Week 3: Maintain Simplicity**
- [ ] Resist urge to add complexity
- [ ] Delete any hook >50 lines
- [ ] Keep total hooks under 10
- [ ] Document only what breaks

### When You're Done

Your project will:
- Auto-prevent AI mistakes without thinking
- Work with copy/paste to new projects
- Stay under 500 lines total hook code
- Actually help instead of annoy

Current violations: **237,983/day**
After migration: **<100/day** (only real issues)

---

**Note**: This plan follows KISS principle while being robust enough to not break later. For lazy solo developers building AI-powered local apps. No teams, no enterprise, just practical enforcement that works.

