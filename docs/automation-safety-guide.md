# 🛡️ Automation Safety Guide

## Overview

This guide helps prevent and manage runaway Claude Code automation that can cause data loss through rapid git operations.

## What Happened

**Root Cause**: Multiple Claude Code processes running simultaneously in the same project directory caused a runaway automation loop that executed rapid git reset commands, resulting in data loss.

**Evidence**:
- Multiple Claude processes with 800+ minute runtimes
- Git reflog showing rapid-fire `git reset HEAD` operations within seconds
- Pattern repeated on multiple dates (July 12th and 14th)

## 🚨 Immediate Safety Measures Implemented

### 1. Git Operation Rate Limiting
- **Hook**: `.claude/hooks/prevent-runaway-git.js`
- **Limit**: Max 5 dangerous git operations per minute
- **Blocks**: `git reset`, `git rebase`, `git checkout`, `git clean`
- **Status**: ✅ Active and tested

### 2. Process Monitoring (Non-Destructive)
- **Script**: `tools/monitoring/claude-process-monitor.sh`  
- **Function**: Detects multiple Claude processes without killing them
- **Usage**: `./tools/monitoring/claude-process-monitor.sh`

### 3. Git Commit Protection
- **Hook**: `.git/hooks/pre-commit`
- **Limit**: Max 10 git operations per minute
- **Function**: Prevents runaway commit automation

### 4. Protected Git Reset Wrapper
- **Script**: `tools/git-protection/git-reset-guard.sh`
- **Limit**: Max 3 resets per minute
- **Usage**: Use instead of direct `git reset`

## 🔍 Daily Monitoring Commands

```bash
# Check for multiple Claude processes
./tools/monitoring/claude-process-monitor.sh

# Monitor git operation history
cat /tmp/claude_git_operations.json

# Check git activity
git reflog --oneline -10
```

## ⚠️ Warning Signs

Watch for these indicators of runaway automation:

1. **Multiple Claude Processes**
   ```bash
   ps aux | grep claude | wc -l
   # If > 2, investigate
   ```

2. **Rapid Git Operations**
   ```bash
   git reflog --date=iso -10
   # Look for operations within seconds of each other
   ```

3. **High CPU Claude Processes**
   ```bash
   ps aux | grep claude | grep -E "[0-9]{2,}\.[0-9]"
   # Look for processes with >10% CPU for extended periods
   ```

## 🛠️ Safe Management

### If You Detect Multiple Processes:

1. **DON'T**: Kill processes immediately (you might kill your active session)
2. **DO**: Identify which sessions you're actively using
3. **DO**: Gracefully close unused Claude Code sessions
4. **DO**: Run the monitoring script to assess the situation

### If Automation Is Blocked:

The system will show:
```
🚨 RUNAWAY GIT AUTOMATION DETECTED!
Too many dangerous git operations (5) in the last minute.
```

**If this is legitimate work**:
```bash
rm /tmp/claude_git_operations.json
# Then retry your command
```

**If this is unexpected**:
1. Run `./tools/monitoring/claude-process-monitor.sh`
2. Check for runaway processes
3. Investigate what's causing the rapid operations

## 🔧 System Configuration

All protection systems are configured in:
- `.claude/settings.json` - Claude Code hooks
- `.git/hooks/pre-commit` - Git commit protection  
- `tools/git-protection/` - Git operation wrappers
- `tools/monitoring/` - Process monitoring

## 🚑 Emergency Recovery

If you suspect data loss:

1. **Check reflog**: `git reflog --oneline -20`
2. **Look for lost commits**: `git log --oneline --all --graph -20`
3. **Recovery**: `git cherry-pick <lost-commit-hash>`
4. **Monitor**: Run monitoring script immediately

## 📊 System Status

Run this command to verify all protections are active:

```bash
# Check hook is registered
grep -A 10 "prevent-runaway-git" .claude/settings.json

# Test protection works
node .claude/hooks/prevent-runaway-git.js '{"command": "git reset HEAD"}'

# Check processes
./tools/monitoring/claude-process-monitor.sh
```

## 🎯 Prevention Best Practices

1. **Single Session**: Try to use only one Claude Code session per project
2. **Regular Monitoring**: Run process monitor daily during active development
3. **Graceful Exits**: Close Claude sessions properly instead of killing terminals
4. **Git Awareness**: Be conscious of git operations during AI interactions
5. **Backup Strategy**: Regular commits and branches for safety

## 📞 Support

If you encounter issues with these safety measures:

1. Check the monitoring logs in `/tmp/claude_git_operations.json`
2. Review recent git reflog for patterns
3. Run the process monitor for current status
4. All safety measures can be temporarily disabled if needed (though not recommended)

Remember: These measures prevented future data loss. The original issue was runaway automation, not a security breach.