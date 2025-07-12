# 🚨 PROJECT Name INSTRUCTIONS 🚨

This file contains MANDATORY instructions for AI assistants working on ProjectName.
Read this ENTIRE file before making ANY changes to the codebase.

---

## Table of Contents

1. [📋 TABLE OF CONTENTS](#-table-of-contents)
2. [🛑 CRITICAL RULES](#-critical-rules)
3. [NEVER DO THESE (WILL BREAK THE PROJECT): ☐ Must all remain unchecked before
commit](#never-do-these-will-break-the-project-must-all-remain-unchecked-before-commit)
  4. [ALWAYS DO THESE: ☐ All boxes must be ticked](#always-do-these-all-boxes-must-be-ticked)
5. [📁 PROJECT OVERVIEW](#-project-overview)
  6. [Core Features:](#core-features)
7. [🏗️ TECHNICAL ARCHITECTURE](#-technical-architecture)
  8. [File Organization](#file-organization)
  9. [Key Technologies:](#key-technologies)
  10. [Port Allocation :](#port-allocation-)
  11. [Database Architecture:](#database-architecture)
  12. [Database Configuration:](#database-configuration)
13. [Technical Stack Decision Resources (Local Development
Optimized):](#technical-stack-decision-resources-local-development-optimized)
  14. [Development Documentation (New):](#development-documentation-new)
  15. [⚖️ ARCHITECTURAL DECISION FRAMEWORK](#-architectural-decision-framework)
16. [🚀 QUICK START COMMANDS](#-quick-start-commands)
17. [🧪 TESTING REQUIREMENTS](#-testing-requirements)
  18. [MANDATORY Before ANY Commit:](#mandatory-before-any-commit)
  19. [What Tests Check:](#what-tests-check)
20. [📚 DOCUMENTATION STANDARDS](#-documentation-standards)
  21. [Documentation Structure](#documentation-structure)
  22. [Writing Rules:](#writing-rules)
  23. [Documentation Cleanup Rule:](#documentation-cleanup-rule)
  24. [Root Cause Prevention:](#root-cause-prevention)
  25. [Key Documents:](#key-documents)
26. [📐 ARROW-CHAIN ROOT-CAUSE ANALYSIS](#-arrow-chain-root-cause-analysis)
  27. [Framework Overview](#framework-overview)
  28. [S-T-A-H-V-P Methodology](#s-t-a-h-v-p-methodology)
  29. [ProjectName-Specific RCA Examples](#projectname-specific-rca-examples)
    30. [Example 1: OCR Text Missing](#example-1-ocr-text-missing)
  31. [Implementation Checklist](#implementation-checklist)
  32. [Common Checkpoints](#common-checkpoints)
  33. [Root Cause Documentation Template](#root-cause-documentation-template)
34. [Root Cause Analysis](#root-cause-analysis)
35. [🎯 MANDATORY PROMPT IMPROVEMENT PROTOCOL](#-mandatory-prompt-improvement-protocol)
  36. [REQUIRED Response Format:](#required-response-format)
  37. [CRAFT Framework (MUST USE):](#craft-framework-must-use)
  38. [Prompt Enhancement Rules (MANDATORY):](#prompt-enhancement-rules-mandatory)
  39. [Example Transformation:](#example-transformation)
  40. [ENFORCEMENT CHECKLIST:](#enforcement-checklist)
41. [💡 LESSONS LEARNED](#-lessons-learned)
  42. [Module Organization](#module-organization)
  43. [Common Mistakes to Avoid](#common-mistakes-to-avoid)
  44. [🚨 CONFIGURATION - NO CONFUSION RULE](#-configuration---no-confusion-rule)
45. [⚠️ COMMON ISSUES](#-common-issues)
46. [🌐 BROWSER AUDIT WORKFLOW](#-browser-audit-workflow)
  47. [Required Command Chain (Non-Blocking):](#required-command-chain-non-blocking)
  48. [Troubleshooting Common Issues:](#troubleshooting-common-issues)
  49. [Screenshot Analysis Process:](#screenshot-analysis-process)
  50. [Critical Command Patterns:](#critical-command-patterns)

## 📋 TABLE OF CONTENTS

1. [🛑 Critical Rules](#-critical-rules)
2. [📁 Project Overview](#-project-overview)
3. [🏗️ Technical Architecture](#-technical-architecture)
4. [🚀 Quick Start Commands](#-quick-start-commands)
5. [🧪 Testing Requirements](#-testing-requirements)
6. [📚 Documentation Standards](#-documentation-standards)
7. [📐 Arrow-Chain Root-Cause Analysis](#-arrow-chain-root-cause-analysis)
8. [💡 Lessons Learned](#-lessons-learned)
9. [⚠️ Common Issues](#-common-issues)
10. [🌐 Browser Audit Workflow](#-browser-audit-workflow)

---

## 🛑 CRITICAL RULES

### NEVER DO THESE (WILL BREAK THE PROJECT): ☐ Must all remain unchecked before commit

1. **NEVER create `*_improved.py`, `*_enhanced.py`, `*_v2.py`** - ALWAYS edit the original file
2. **NEVER create files in root directory** - Use proper subdirectories
3. **NEVER use bare except clauses** - Always specify exception types
4. **NEVER use `sys.path.append()`** - Use proper package imports
5. **NEVER use `print()` in production** - Use `logging.getLogger(__name__)`
6. **NEVER create announcement-style docs** - No "We're excited to announce!"
7. **NEVER implement poor workarounds** - Fix the root causes of issues. Use Arrow-Chain RCA methodology (see [Root
Cause Analysis](#-arrow-chain-root-cause-analysis))

### ALWAYS DO THESE: ☐ All boxes must be ticked

1. **ALWAYS check existing code first**: Don't create duplicate functionality
2. **ALWAYS use specific imports**: `from module import SpecificClass`
3. **ALWAYS update CLAUDE.md**: Document significant changes here
4. **ALWAYS follow file organization**: See [File Organization](#file-organization)
5. **ALWAYS delete completion docs immediately**: Never create status/summary/complete files
6. **ALWAYS use measured, technical language**: Avoid superlatives like "complete", "flawless", "optimal","functional",
"robust" in technical contexts
7. **ALWAYS use Arrow-Chain RCA for debugging**: Follow S-T-A-H-V-P methodology for all bug fixes

---

## 📁 PROJECT OVERVIEW

This template now includes comprehensive technical documentation to accelerate development:

- **Technical Stack Decisions**: Backend runtime, API patterns, database selection matrices optimized for local development
- **Development Standards**: API design, data modeling, security practices, and performance optimization guides
- **Testing & Quality**: Comprehensive testing patterns with AI-assisted test generation
- **Local-First Focus**: All documentation prioritizes developer experience and rapid iteration

See the Technical Stack Decision Resources and Development Documentation sections for detailed guidance.

### Core Features:

---

## 🏗️ TECHNICAL ARCHITECTURE

### File Organization

```

```

### Key Technologies:

- **Backend**:
- **Frontend**:
- **Database**:

### Port Allocation :

### Database Architecture:

### Database Configuration:

### Technical Stack Decision Resources (Local Development Optimized):

- **Local Dev Stack Guide**: See `docs/newproject_decisions/local-development-stack-guide.md` for complete local-first development recommendations
- **Backend Runtime**: See `docs/newproject_decisions/decision-matrix-backend-runtime.md` for Node.js vs Python vs Go vs Rust (updated for local dev priorities)
- **API Architecture**: See `docs/newproject_decisions/decision-matrix-api-architecture.md` for REST vs GraphQL vs gRPC vs tRPC patterns
- **Database Selection**: See `docs/newproject_decisions/decision-matrix-database.md` for PostgreSQL vs SQLite vs NoSQL options
- **Frontend Framework**: See `docs/newproject_decisions/decision-matrix-frontend.md` for React vs Vue vs Angular vs Svelte
- **Full Gap Analysis**: See `docs/newproject_decisions/TECHNICAL_STACK_GAPS_ANALYSIS.md` for comprehensive technical decision documentation needs (local focus)

### Development Documentation (New):

- **Testing Guide**: See `docs/guides/testing/comprehensive-testing-guide.md` for unit, integration, and E2E testing patterns
- **API Standards**: See `docs/architecture/patterns/api-design-standards.md` for RESTful design, error handling, and pagination
- **Data Modeling**: See `docs/architecture/patterns/data-modeling-guide.md` for schema design, relationships, and migrations
- **Security Practices**: See `docs/guides/security/security-optimal-practices.md` for authentication, authorization, and input validation
- **Performance Guide**: See `docs/guides/performance/optimization-playbook.md` for frontend and backend optimization techniques
- **Documentation Roadmap**: See `docs/DOCUMENTATION_ROADMAP.md` for complete list of planned documentation

---

### ⚖️ ARCHITECTURAL DECISION FRAMEWORK

**When to Use :**

**When Custom Implementation is Justified:**

**Documentation Required for Custom Implementation:**

---

## 🚀 QUICK START COMMANDS

---

## 🧪 TESTING REQUIREMENTS

### MANDATORY Before ANY Commit:

### What Tests Check:

---

## 📚 DOCUMENTATION STANDARDS

### Documentation Structure

```text
docs/


```

### Writing Rules:

- ❌ NO: "We're excited to announce..."
- ❌ NO: "Successfully implemented!"
- ❌ NO: "As of December 2024..."
- ❌ NO: Code blocks > 20 lines
- ❌ NO: Completion/status announcements ("FIXED", "COMPLETE")
- ❌ NO: Process documentation (cleanup notes, migration guides)
- ❌ NO: Superlatives in technical contexts ("complete", "functional", "robust")
- ✅ YES: Professional, timeless language
- ✅ YES: Link to source files
- ✅ YES: Measured, descriptive language ("functional", "working", "operational")
- ✅ YES: Matter-of-fact summaries focused on next steps (not overconfident progress claims)

### Documentation Cleanup Rule:

**DELETE, don't archive!** Remove irrelevant docs completely:

- Status announcements ("Everything Fixed", "Complete")
- Process documentation (migration guides, refactoring notes)
- Outdated planning documents
- Duplicate content

### Root Cause Prevention:

**Why completion docs get created and how to prevent:**

- ❌ **Symptom**: Creating "COMPLETE.md", "FINAL.md", "SUMMARY.md" files
- ✅ **Root Cause**: Lack of process enforcement and automated checks
- ✅ **Prevention**: Never create status/completion documents
- ✅ **Alternative**: Update existing docs or use git commit messages for status

### Key Documents:

- **CLAUDE.md**: AI assistant instructions (this file)
- **README.md**: Project setup and overview
- **docs/**: All documentation

---

## 📐 ARROW-CHAIN ROOT-CAUSE ANALYSIS

**MANDATORY for all bug fixes and debugging in ProjectName**

### Framework Overview

The Arrow-Chain RCA methodology ensures systematic problem-solving by tracing data flow from symptoms to root causes:

```text
symptom₀
     ↓ (observation / log / metric)
checkpoint₁
     ↓ (data transformation, API, queue, …)
checkpoint₂
     ↓
⋯
checkpointₙ
     ↓ (fault)
root-cause
```

### S-T-A-H-V-P Methodology

**Mnemonic**: Symptom → Trace → Arrow chain → Hypothesis → Validate → Patch

| Phase              | What to do                                                       | Typical artifacts
|
| ------------------ | ---------------------------------------------------------------- |
---------------------------------- |
| 1. **S**ymptom     | List every visible defect (UI glitch, wrong value, crash)        | Bug ticket, screenshot, user
log   |
| 2. **T**race       | Walk downstream (where consumed?) and upstream (where produced?) | Source map, call graph, API
logs   |
| 3. **A**rrow chain | Write one line per hop: A → B → C until first divergence         | ASCII diagram in PR/comment
|
| 4. **H**ypothesis  | Articulate what should have happened vs. what did happen         | One-sentence root-cause
statement  |
| 5. **V**alidate    | Reproduce with controlled test; confirm fix resolves symptom     | Unit/integration test, log
snippet |
| 6. **P**atch       | Implement fix, add regression tests, update docs/monitoring      | PR diff, CI job, updated docs
|

### ProjectName-Specific RCA Examples

#### Example 1: OCR Text Missing

**Symptom**: Task cards show "No content" despite screenshots containing visible text

**Arrow Chain**:

```text
Screenshot captured with text
     ↓ (saved to disk)
screenshot-service.ts writes to attached_assets/
     ↓ (Pensieve scan)
Pensieve OCR plugin processes image
     ↓ (metadata_entries table)
OCR text = null in database        ← root cause: Tesseract timeout
     ↓ (API query)
simple-task-service.ts returns empty
     ↓
UI shows "No content"
```

**Fix**: Increase OCR timeout in `pensieve-master/memos/plugins/ocr/config.yaml`, add retry logic

### Implementation Checklist

When debugging ANY issue:

- [ ] Document the visible symptom(s) with screenshots/logs
- [ ] Trace data flow through the system (use grep/search tools)
- [ ] Draw arrow chain showing each transformation point
- [ ] Identify the FIRST point where data diverges from expected
- [ ] Form hypothesis about root cause (not just proximate cause)
- [ ] Create minimal test case that reproduces the issue
- [ ] Implement fix at the root cause level
- [ ] Add regression test to prevent recurrence
- [ ] Update documentation if needed

### Common Checkpoints

1. **Screenshot Pipeline**:
   - `screenshot-service.ts` → `attached_assets/` → Pensieve scan → `entities` table

### Root Cause Documentation Template

When fixing bugs, document in PR/commit message:

```markdown
## Root Cause Analysis

**Symptom**: [What user sees]
**Root Cause**: [First divergence point]
**Arrow Chain**:
```

[step by step data flow]

```text
**Fix**: [What was changed and why]
**Test**: [How to verify fix works]
```

---

## 🎯 MANDATORY PROMPT IMPROVEMENT PROTOCOL

**🚨 CRITICAL: Claude MUST ALWAYS start responses by improving the user prompt using CRAFT framework. This is
NON-NEGOTIABLE. 🚨**

### REQUIRED Response Format:

```text
**Improved Prompt**: [Enhanced version using CRAFT framework]

**Implementation Plan**:
1. [Specific step]
2. [Specific step]
3. [Specific step]

[Then proceed with actual work]
```

### CRAFT Framework (MUST USE):

- **C**ontext & Constraints: Add missing technical context, deadlines, audience
- **R**ole & Audience: Define perspective ("You are a RoleName...")
- **A**sk: Break compound tasks into numbered steps, request step-by-step reasoning
- **F**ormat: Specify output format (Markdown, JSON, code blocks, bullet lists)
- **T**one & Temperature: Set voice (technical, concise) and length constraints

### Prompt Enhancement Rules (MANDATORY):

1. **Anchor in clarity**: Transform vague requests ("fix this") into specific goals ("Fix TypeScript compilation errors
in server/index.ts")
2. **Structure for reasoning**: Break multi-step tasks into numbered steps with explicit reasoning requests
3. **Add examples**: Include input/output patterns when helpful for complex formatting
4. **Specify constraints**: Add technical context (file paths, dependencies, coding standards)
5. **Define success criteria**: What constitutes completion of the task

### Example Transformation:

```text
❌ User: "Fix the database connection"
✅ Improved: "You are a TypeScript developer working on ProjectName. Fix PostgreSQL connection errors in server/db.ts by:
1. Analyzing current connection code and error logs
2. Checking DATABASE_URL environment variable configuration
3. Testing connection with proper error handling
4. Ensuring compatibility with Drizzle ORM schema
Output: Code changes in diff format + explanation of fixes"
```

### ENFORCEMENT CHECKLIST:

- [ ] Every response starts with "**Improved Prompt**:"
- [ ] CRAFT framework applied to user request
- [ ] Project-specific context added
- [ ] Multi-step tasks broken down with TodoWrite
- [ ] Success criteria defined
- [ ] Technical constraints specified

**VIOLATION CONSEQUENCES**: Any response that doesn't start with prompt improvement will be considered non-compliant
with project standards.

---

## 💡 LESSONS LEARNED

### Module Organization

- Check existing structure before creating files
- Use proper imports: `from project.module import Class`
- Consolidate related functionality
- Update all references when moving files

### Common Mistakes to Avoid

1. Creating duplicate functionality (check first!)
2. Putting scripts in root (use scripts/)
3. Forgetting to update imports after moving files
4. Not testing commands in documentation
5. Creating "improved" versions instead of editing

### 🚨 CONFIGURATION - NO CONFUSION RULE

---

## ⚠️ COMMON ISSUES

---

## 🌐 BROWSER AUDIT WORKFLOW

**When requested to "run frontend in browser and audit with screenshot":**

### Required Command Chain (Non-Blocking):

1. **Start Backend Server (Non-Blocking)**:

```bash
# Start backend in background to avoid blocking

sleep 3  # Allow server startup time
```

2. **Start Frontend Server (Non-Blocking)**:

```bash
# Start  frontend in background FROM PROJECT ROOT

sleep 2  # Allow Vite startup time

# IMPORTANT: Never use 'cd client && npx vite' - this breaks path resolution!
```

3. **Verify Services Running**:

```bash
# Check backend (should return server info)
curl -s | echo "Backend not ready"

# Check frontend (should return HTML)
curl -s | head -1 || echo "Frontend not ready"
```

4. **Open Browser and Capture**:

```bash
# Open in new Chrome tab (non-blocking)
osascript -e 'tell application "Google Chrome" to open location ""'

# Wait for page load, then capture
sleep 3
screencapture -x /tmp/ProjectName_audit.png
```

### Troubleshooting Common Issues:

**Port Conflicts:**

````bash
# Kill existing processes

### Screenshot Analysis Process:

1. **Capture Application Screenshot**: Use non-blocking screenshot commands
2. **Visual Audit Checklist**:
   - ✅ UI components render correctly
   - ✅ Data loads from API (no loading states stuck)
   - ✅ Navigation works between tabs
   - ✅ Task cards display properly
   - ✅ Time tracking controls functional
   - ✅ Stats display real data
   - ✅ Responsive design on different screen sizes

3. **Document Findings**: Record specific issues with file references (e.g.,
`client/src/components/dashboard/task-board.tsx:45`)

### Critical Command Patterns:

**✅ CORRECT - Non-Blocking Background Processes:**
```bash
command > /dev/null 2>&1 &    # Run in background
sleep N                       # Allow startup time
````

**❌ WRONG - Blocking Commands:**

```bash
npm run dev                   # Blocks terminal indefinitely
npx vite                      # Blocks until killed
```

**✅ CORRECT - Process Management:**

```bash
# Start with cleanup
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
npm run dev > /dev/null 2>&1 &
```

---

END OF INSTRUCTIONS - Now you can work on ProjectName!
