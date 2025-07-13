# Technical Debt Cleanup Plan - Complete System Overhaul

## 🚨 CRITICAL ISSUE DISCOVERED

The current system is in a **BROKEN STATE** due to incomplete migration:

- `claude-hook-validator.js` imports from `_deprecated/` directory
- Multiple config files reference deleted tools  
- Circular dependencies between new and old systems
- Dead scripts and directories consuming resources

## Immediate Cleanup Required

### Phase 1: Fix Broken Legacy Hook (CRITICAL)

**Problem**: `claude-hook-validator.js` will crash because it imports deleted files
**Solution**: Replace with minimal working version or disable completely

```javascript
// Current broken imports:
const { findBannedDocuments } = require('./_deprecated/banned-document-types.js');
const { validateTemplate } = require('./_deprecated/template-validator.js');
const rootFileEnforcement = require('./_deprecated/root-file-enforcement.js');
```

**Action**: Replace `claude-hook-validator.js` with simple stub or remove entirely

### Phase 2: Delete Dead Configuration Files

**Files to Remove**:
- `.enforcement-config.json` (old system config)
- `.config-enforcer-cache/` (entire directory)
- `tools/enforcement/_deprecated/` (entire directory)  
- Multiple `.user-metrics.json` files

### Phase 3: Clean Package.json Completely

**Remove All References**:
- Enforcement scripts that no longer work
- Metrics scripts pointing to deleted files
- Dead generator references
- Unused dependency scripts

### Phase 4: Simplify Claude Settings

**Current** (complex hybrid):
```json
{
  "hooks": {
    "PreToolUse": [
      {"command": "node tools/hooks/prevent-improved-files.js"},
      {"command": "node tools/enforcement/claude-hook-validator.js"}, // BROKEN
      {"command": "node tools/hooks/block-root-mess.js"}
    ]
  }
}
```

**Target** (simple working):
```json
{
  "hooks": {
    "PreToolUse": [
      {"command": "node tools/hooks/prevent-improved-files.js"},
      {"command": "node tools/hooks/block-root-mess.js"}
    ],
    "PostToolUse": [
      {"command": "node tools/hooks/fix-console-logs.js"}
    ]
  }
}
```

## Detailed Cleanup Tasks

### 1. Immediately Fix Broken Hook
- [ ] Disable or replace `claude-hook-validator.js`
- [ ] Test Claude Code still works
- [ ] Remove broken imports

### 2. Delete Configuration Debt
- [ ] Remove `.enforcement-config.json`
- [ ] Delete `.config-enforcer-cache/` directory
- [ ] Clean up metric collection files
- [ ] Remove enforcement status tracking

### 3. Clean Scripts and Dependencies
- [ ] Remove 20+ dead package.json scripts
- [ ] Delete unused enforcement directories
- [ ] Clean up git hooks references
- [ ] Remove dead dependency references

### 4. Verify System Integrity
- [ ] Test all 5 new hooks work independently
- [ ] Verify Claude Code integration works
- [ ] Test package.json scripts that remain
- [ ] Ensure no broken imports exist

### 5. Final Documentation Update
- [ ] Update documentation to reflect simple reality
- [ ] Remove references to deleted systems
- [ ] Create simple troubleshooting guide
- [ ] Document final architecture

## Expected Results

**Before Cleanup** (current broken state):
- Hybrid system with broken imports
- 50+ dead scripts in package.json
- Multiple config systems fighting
- Deprecated tools taking up space
- System will crash on certain operations

**After Cleanup** (target clean state):
- 5 simple hooks only
- 10-15 essential package.json scripts
- Single `.claude/settings.json` config
- No technical debt or dead code
- System works reliably

## Risk Assessment

**High Risk Items**:
- Removing `claude-hook-validator.js` might break current workflows
- Some deprecated tools might still be actively used
- Configuration changes could break existing git hooks

**Mitigation**:
- Test each change incrementally
- Keep backups of all deleted files
- Verify no operations break after each step

## Success Criteria

✅ **System passes these tests**:
1. Claude Code operations work without errors
2. All package.json scripts execute successfully
3. No broken imports or missing file errors
4. Git commit process works normally
5. All 5 new hooks function correctly

The system should be **completely clean** with no technical debt remaining.