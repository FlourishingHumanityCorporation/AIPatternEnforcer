───────────────────────────────────────────────────────────────────╮
│ AIPatternEnforcer Architecture Audit & Restructure Plan │
│ │
│ 🔍 Current State Analysis │
│ │
│ 📁 Critical Architecture Issues Found │
│ │
│ 1. 🚨 ROOT DIRECTORY VIOLATIONS │
│ - Application code in root: src/, components/, prisma/ belong in │
│ templates │
│ - Framework configs in root: postcss.config.js, jest.config.js │
│ are framework-specific │
│ - Build artifacts: coverage/, dist/ directories violate clean │
│ structure │
│ - Meta vs App confusion: Root tsconfig.json includes app-specific│
│ paths │
│ 2. 🔄 TEMPLATE STRUCTURE INCONSISTENCIES │
│ - Each template has different structures (ai-chat-interface vs │
│ nextjs-app-router) │
│ - Duplicate code across templates instead of shared components │
│ - Missing standardized template structure │
│ 3. 📚 DOCUMENTATION ARCHITECTURE SPRAWL │
│ - 180+ documentation files across multiple nested directories │
│ - Archive and deprecated content mixed with active docs │
│ - Inconsistent naming and organization patterns │
│ 4. 🛠️ TOOLS & SCRIPTS ORGANIZATION │
│ - 20+ hooks in tools/hooks/ with complex interdependencies │
│ - Scripts scattered across scripts/ with unclear purposes │
│ - Generator tools lack unified interface │
│ │
│ 🎯 Proposed New Architecture │
│ │
│ Phase 1: Root Directory Cleanup (Critical) │
│ │
│ root/ │
│ ├── 📋 META-PROJECT FILES (KEEP) │
│ │ ├── README.md, CLAUDE.md, DOCS_INDEX.md │
│ │ ├── package.json (meta-project tools only) │
│ │ ├── tsconfig.json (tools/scripts only) │
│ │ └── .claude/, .github/, .gitignore, .env.example │
│ ├── 📁 ORGANIZED DIRECTORIES │
│ │ ├── docs/ (streamlined documentation) │
│ │ ├── templates/ (standardized project templates) │
│ │ ├── tools/ (generators, hooks, utilities) │
│ │ └── scripts/ (automation scripts) │
│ └── 🗑️ REMOVE FROM ROOT │
│ ├── src/, components/, prisma/ → Move to templates/ │
│ ├── coverage/, dist/ → Add to .gitignore │
│ ├── postcss.config.js, jest.config.js → Template-specific │
│ └── examples/ → Integrate into templates/ │
│ │
│ Phase 2: Template Standardization │
│ │
│ templates/ │
│ ├── nextjs-app-router/ (PRIMARY TEMPLATE) │
│ │ ├── 📱 STANDARD STRUCTURE │
│ │ │ ├── app/, components/, lib/, prisma/ │
│ │ │ ├── package.json, tsconfig.json, tailwind.config.js │
│ │ │ └── COPY-AND-START.md │
│ │ ├── 🧪 AI CAPABILITIES │
│ │ │ ├── components/ai/ (chat, vision, document processing) │
│ │ │ ├── lib/ai/ (OpenAI, Anthropic integrations) │
│ │ │ └── api/ai/ (streaming, embeddings, models) │
│ │ └── 🛡️ ENFORCEMENT READY │
│ │ ├── lib/auth.ts (mockUser for local development) │
│ │ ├── lib/logger.ts (proper logging patterns) │
│ │ └── jest.config.js (test-first enforcement) │
│ ├── ai-chat-interface/ (SPECIALIZED) │
│ ├── ai-document-processor/ (SPECIALIZED) │
│ └── shared/ (COMMON COMPONENTS) │
│ ├── components/ui/ (shadcn/ui components) │
│ ├── lib/utils/ (shared utilities) │
│ └── hooks/ (reusable hooks) │
│ │
│ Phase 3: Documentation Restructure │
│ │
│ docs/ │
│ ├── 📖 CORE NAVIGATION │
│ │ ├── README.md (hub) │
│ │ ├── quick-reference.md │
│ │ └── setup-guide.md │
│ ├── 📋 GUIDES (ESSENTIAL ONLY) │
│ │ ├── claude-code-hooks/ (consolidated 9 files → 3 files) │
│ │ ├── ai-development/ (core AI integration patterns) │
│ │ └── templates/ (template usage & customization) │
│ ├── 🏗️ ARCHITECTURE │
│ │ ├── decisions/ (ADRs) │
│ │ ├── patterns/ (coding patterns) │
│ │ └── template-architecture.md │
│ └── 🗂️ REFERENCE │
│ ├── api/ (API documentation) │
│ └── troubleshooting/ (common issues) │
│ │
│ Phase 4: Tools Consolidation │
│ │
│ tools/ │
│ ├── 🎛️ GENERATORS (UNIFIED) │
│ │ ├── component-generator.js (primary) │
│ │ ├── ai-component-generator.js │
│ │ ├── project-init/ (create-project functionality) │
│ │ └── templates/ (handlebars templates) │
│ ├── 🛡️ HOOKS (OPTIMIZED) │
│ │ ├── core/ (essential 8 hooks) │
│ │ ├── ai/ (AI-specific 6 hooks) │
│ │ ├── quality/ (code quality 4 hooks) │
│ │ └── **tests**/ (hook tests) │
│ └── 🧰 UTILITIES │
│ ├── validation/ (template validation) │
│ ├── onboarding/ (setup wizards) │
│ └── testing/ (test frameworks) │
│ │
│ 📊 Impact Assessment │
│ │
│ ✅ Alignment with GOAL.md │
│ │
│ - Local AI Apps Focus: Templates optimized for OCR, VLM, LLM │
│ projects │
│ - Copy-Paste Ready: Standardized template structure │
│ - Friction Reduction: Streamlined documentation and tools │
│ - Enterprise Exclusions: Enforced through hooks and template design│
│ │
│ 🎯 Key Improvements │
│ │
│ 1. 90% Documentation Reduction: 180+ files → 30 essential files │
│ 2. Template Consistency: Standardized structure across all │
│ templates │
│ 3. Root Directory Compliance: Meta-project vs application │
│ separation │
│ 4. Hook Optimization: 24 hooks → 18 focused hooks with better │
│ organization │
│ 5. Generator Unification: Single interface for all code generation │
│ │
│ ⚠️ Migration Considerations │
│ │
│ - Breaking Changes: Root directory restructure affects existing │
│ workflows │
│ - Git History: Need to preserve file history during moves │
│ - Hook Dependencies: Some hooks may need updates after restructure │
│ - Template Users: Need migration guide for existing template users │
│ │
│ 🚀 Implementation Strategy │
│ │
│ Phase 1: Root Cleanup (HIGH PRIORITY) │
│ │
│ 1. Move application code to templates │
│ 2. Clean up build artifacts │
│ 3. Update tsconfig.json for meta-project focus │
│ 4. Update package.json scripts │
│ │
│ Phase 2: Template Standardization (MEDIUM PRIORITY) │
│ │
│ 1. Consolidate nextjs-app-router as primary template │
│ 2. Standardize AI integration patterns │
│ 3. Create shared component library │
│ 4. Update generators to use new structure │
│ │
│ Phase 3: Documentation Streamlining (MEDIUM PRIORITY) │
│ │
│ 1. Archive 150+ outdated docs │
│ 2. Consolidate essential guides │
│ 3. Create clear navigation structure │
│ 4. Update DOCS_INDEX.md │
│ │
│ Phase 4: Tools Optimization (LOW PRIORITY) │
│ │
│ 1. Reorganize hooks by category │
│ 2. Optimize hook performance │
│ 3. Consolidate generators │
│ 4. Update testing frameworks │
│ │
│ This restructure will transform AIPatternEnforcer from a sprawling │
│ meta-project into a focused, copy-pastable template system that │
│ truly solves AI development friction.
