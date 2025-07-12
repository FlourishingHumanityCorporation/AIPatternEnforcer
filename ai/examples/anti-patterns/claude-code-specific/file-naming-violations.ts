// ❌ ANTI-PATTERN: File Naming Violations
// This file demonstrates common file naming mistakes that Claude Code instances make

// SEVERITY: CRITICAL - These violations break project structure and cause confusion

// ❌ BAD: Creating improved/enhanced/versioned files
// NEVER do this:
/*
auth_improved.ts          // Violates CLAUDE.md core rule
component_enhanced.tsx    // Creates confusion and duplication
user_service_v2.js       // Breaks version control workflow
login_better.tsx         // Implies original is inferior
data_fixed.js           // Should edit original instead
utils_new.ts            // Ambiguous naming
helper_copy.ts          // Creates maintenance burden
*/

// ❌ BAD: Root directory file creation
// NEVER create files in root unless explicitly allowed:
/*
analysis.md              // Should go in docs/reports/
summary.txt             // Should go in docs/reports/
temp.js                 // Should go in appropriate subdirectory
notes.md               // Should go in docs/ or delete after use
backup.json            // Should use proper backup systems
*/

// ❌ BAD: Non-descriptive naming patterns
// NEVER use these patterns:
/*
thing.ts               // Too vague
stuff.js              // Meaningless
temp123.tsx           // Temporary naming that becomes permanent
utils2.ts             // Numbered variants
component.tsx         // Generic naming
file.js               // No semantic meaning
*/

// ❌ BAD: Inconsistent casing and conventions
// NEVER mix conventions:
/*
userService.ts + user_controller.js  // Mixed camelCase and snake_case
ComponentName.tsx + component-test.ts // Mixed PascalCase and kebab-case
API_Handler.js + apiTypes.ts         // Mixed UPPER_SNAKE_CASE and camelCase
*/

// ✅ CORRECT APPROACH: Edit existing files
// Instead of creating new files, ALWAYS edit the original:

// If you need to improve auth.ts:
// ✅ DO: Edit auth.ts directly
// ❌ DON'T: Create auth_improved.ts

// If you need to fix user-service.js:
// ✅ DO: Edit user-service.js directly  
// ❌ DON'T: Create user-service-fixed.js

// If you need to update component.tsx:
// ✅ DO: Edit component.tsx directly
// ❌ DON'T: Create component_v2.tsx

// ✅ CORRECT APPROACH: Proper file organization
// Always use appropriate subdirectories:

// Reports and analysis:
// ✅ docs/reports/performance-analysis.md
// ✅ docs/reports/security-audit.md

// Plans and proposals:
// ✅ docs/plans/migration-plan.md
// ✅ docs/plans/architecture-proposal.md

// Source code:
// ✅ src/components/UserProfile.tsx
// ✅ src/services/user-service.ts
// ✅ src/utils/date-helpers.ts

// Tests:
// ✅ tests/unit/auth.test.ts
// ✅ tests/integration/api.test.ts

// Scripts:
// ✅ scripts/dev/deploy.sh
// ✅ scripts/testing/setup.sh

// WHY THESE RULES EXIST:
// 1. Prevents code duplication and confusion
// 2. Maintains clean version control history
// 3. Ensures consistent project structure
// 4. Facilitates team collaboration
// 5. Reduces maintenance overhead
// 6. Improves code discoverability

// HOW TO REMEMBER:
// - One file, one purpose, one location
// - Edit, don't duplicate
// - Use descriptive, consistent naming
// - Follow project directory structure
// - When in doubt, check CLAUDE.md