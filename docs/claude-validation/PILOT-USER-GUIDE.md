# Claude Validation Pilot User Guide

**Welcome to the ProjectTemplate Claude Code Validation pilot program!**

You're one of the first 5 developers testing this system. Your feedback will directly shape its evolution.

## Table of Contents

1. [🎯 Pilot Goals](#-pilot-goals)
2. [⚡ Highly Quick Setup (3 minutes)](#-highly-quick-setup-3-minutes)
  3. [Step 1: Install](#step-1-install)
  4. [Step 2: Test](#step-2-test)
  5. [Step 3: Configure for pilot](#step-3-configure-for-pilot)
6. [📋 Daily Workflow](#-daily-workflow)
  7. [Your New Routine](#your-new-routine)
  8. [What to Track](#what-to-track)
9. [🎓 Learning the Patterns](#-learning-the-patterns)
  10. [Week Schedule](#week-schedule)
11. [🔍 What to Test](#-what-to-test)
  12. [Scenarios to Try](#scenarios-to-try)
  13. [Real Development Tasks](#real-development-tasks)
14. [📊 Feedback Collection](#-feedback-collection)
  15. [Daily Micro-Survey (2 minutes)](#daily-micro-survey-2-minutes)
  16. [Weekly Deep Dive (15 minutes)](#weekly-deep-dive-15-minutes)
17. [🛠️ Pilot-Specific Tools](#-pilot-specific-tools)
  18. [Enhanced Dashboard](#enhanced-dashboard)
  19. [Quick Commands](#quick-commands)
  20. [Troubleshooting](#troubleshooting)
21. [📈 Success Metrics](#-success-metrics)
  22. [What Success Looks Like](#what-success-looks-like)
23. [🎯 Week 1 Targets](#-week-1-targets)
24. [📞 Pilot Support](#-pilot-support)
  25. [Getting Help](#getting-help)
  26. [What We're Monitoring](#what-were-monitoring)
27. [🔄 Feedback Loop](#-feedback-loop)
  28. [How Your Input Shapes the System](#how-your-input-shapes-the-system)
  29. [Expected Outcomes](#expected-outcomes)
30. [Quick Start Checklist](#quick-start-checklist)

## 🎯 Pilot Goals

**What we're testing:**
- Does it actually improve Claude Code consistency?
- Is the daily workflow smooth enough to adopt?
- Which patterns provide value vs. create friction?
- What configuration works optimal for real development?

**Your commitment:**
- **1 week of daily usage** (Nov 18-25, 2024)
- **2-minute daily feedback** via quick survey
- **End-of-week interview** (15 minutes)

## ⚡ Highly Quick Setup (3 minutes)

### Step 1: Install
```bash
cd /path/to/your/projecttemplate
bash scripts/setup-claude-validation.sh
```

### Step 2: Test
```bash
# Test with a simple response
echo "Use React.useState for state management" | npm run claude:validate - --simple
# Should show: ✅ PASSED
```

### Step 3: Configure for pilot
```bash
# Start with relaxed settings to reduce noise
npm run claude:config set-severity WARNING
npm run claude:config disable promptImprovement  # We'll enable this later
```

## 📋 Daily Workflow

### Your New Routine

**When you get a Claude Code response:**

1. **Copy to clipboard** (⌘+C the response)
2. **Validate immediately**:
   ```bash
   pbpaste | npm run claude:validate - --complex
   ```
3. **Note the result** (PASSED/FAILED + score)
4. **If failed**: Review violations and decide if you need to adjust your prompt

### What to Track

**Keep a simple log** (we'll provide a template):
- Date/time
- Request type (component creation, bug fix, refactoring, etc.)
- Validation result (PASS/FAIL + score)
- Did you adjust your prompt based on feedback? (Y/N)
- Friction level (1-5: 1=smooth, 5=annoying)

## 🎓 Learning the Patterns

### Week Schedule

**Day 1-2: Learn the basics**
- Focus on `noImprovedFiles` (never create auth_v2.js)
- Try different response types (complex vs simple)

**Day 3-4: Add generator awareness**
```bash
npm run claude:config enable generatorUsage
```
- Test component creation requests
- See if Claude recommends `npm run g:c`

**Day 5-6: Enable prompt improvement**
```bash
npm run claude:config enable promptImprovement
```
- Try complex implementation requests
- Practice starting with "**Improved Prompt**:"

**Day 7: Full validation**
```bash
npm run claude:config set-severity CRITICAL
```
- Experience the full system
- Evaluate overall value vs. friction

## 🔍 What to Test

### Scenarios to Try

**Component Creation:**
```text
❌ Bad prompt: "Create a login form"
✅ Good prompt: "**Improved Prompt**: Create a React login form component with email/password validation, error handling,
and API integration. Use TypeScript and follow ProjectTemplate patterns."
```

**Bug Fixes:**
```text
❌ Bad response: "I'll create auth_improved.js with the fix..."
✅ Good response: "Let me edit the existing auth.js file to fix the issue..."
```

**Refactoring:**
```text
❌ Bad: "Here's a better version: component_v2.tsx"
✅ Good: "Let me refactor the existing component.tsx..."
```

### Real Development Tasks

Test with your actual work:
- Feature implementations
- Bug fixes
- Code reviews
- Architecture decisions
- Quick questions

## 📊 Feedback Collection

### Daily Micro-Survey (2 minutes)

**Quick questions we'll ask:**
1. How many validations did you run today?
2. How many failed initially?
3. Did you adjust any prompts based on feedback?
4. Friction level today (1-5)?
5. One thing that worked well?
6. One thing that was annoying?

### Weekly Deep Dive (15 minutes)

**Topics we'll explore:**
- Which patterns felt valuable vs. noisy?
- How did it change your prompting behavior?
- What configuration worked optimal for you?
- What additional patterns would be helpful?
- Would you recommend this to your team?

## 🛠️ Pilot-Specific Tools

### Enhanced Dashboard
```bash
npm run claude:dashboard
```
**New pilot features:**
- Real-time compliance tracking
- Pattern effectiveness scores
- Your personal compliance trends

### Quick Commands
```bash
# Check your compliance rate
npm run claude:stats

# See current configuration
npm run claude:config:status

# Test the system is working
npm run claude:test
```

### Troubleshooting

**If validation seems wrong:**
```bash
# Check configuration
npm run claude:config list

# Test with known good/bad examples
npm run claude:test

# Get help
npm run claude:validate --help
```

**Common issues:**
- **Too many false positives**: `npm run claude:config set-severity INFO`
- **Missing real issues**: `npm run claude:config set-severity CRITICAL`
- **Validation too slow**: Check if response is extremely long

## 📈 Success Metrics

### What Success Looks Like

**Personal metrics:**
- Your Claude responses become more consistent
- You naturally start following patterns
- Validation becomes part of your routine
- You catch issues before they become problems

**Team metrics:**
- Reduced "Claude created duplicate files" incidents
- More consistent coding patterns across sessions
- Faster onboarding of new AI development practices

## 🎯 Week 1 Targets

**By end of pilot week:**
- [ ] 20+ validations completed
- [ ] 80%+ compliance rate achieved
- [ ] <10 seconds average validation time
- [ ] <3 friction points identified and documented
- [ ] Personal workflow established

## 📞 Pilot Support

### Getting Help

**Immediate issues:**
- Check troubleshooting in main README
- Run diagnostic: `bash scripts/test-claude-validation-setup.sh`

**Questions or feedback:**
- Daily: Use the micro-survey
- Urgent: [Contact method TBD]
- Ideas: [Feedback collection system TBD]

### What We're Monitoring

**System metrics:**
- Validation frequency per user
- Pattern violation rates
- Performance timing
- Configuration preferences

**User experience:**
- Setup friction points
- Daily workflow pain points
- False positive/negative rates
- Behavior change indicators

## 🔄 Feedback Loop

### How Your Input Shapes the System

**Week 1**: Your feedback → Configuration adjustments
**Week 2**: Usage patterns → New pattern development
**Week 3**: Performance data → Optimization priorities
**Week 4**: Success metrics → Production rollout plan

### Expected Outcomes

**For you:**
- More consistent Claude Code behavior
- Faster development with fewer rework cycles
- Better understanding of ProjectTemplate patterns

**For the system:**
- Validated real-world effectiveness
- Optimized default configuration
- Identified next feature priorities
- Production readiness confirmation

---

**Welcome to the pilot! Your usage and feedback will directly improve this system for the entire ProjectTemplate
community.**

## Quick Start Checklist

- [ ] Run setup script
- [ ] Test with sample validation
- [ ] Configure pilot settings
- [ ] Bookmark this guide
- [ ] Complete first validation
- [ ] Note initial impressions

**Ready? Let's validate some Claude Code! 🚀**