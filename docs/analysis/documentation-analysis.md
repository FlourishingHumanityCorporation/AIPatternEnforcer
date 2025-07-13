# Documentation Analysis Report

**Generated**: 2025-07-12T22:10:13.220Z

## Summary

- **Total Files Analyzed**: 297
- **Files Needing Documentation**: 82
- **Documentation Debt**: 82 files
- **New Files**: 13
- **Modified Files**: 69

## Immediate Actions Required

### 13 new files lack documentation
**Priority**: HIGH
**Description**: New files should include documentation explaining their purpose and usage
**Action**: Add documentation for new files
**Files**:
- jest.config.js
- next.config.js
- postcss.config.js
- scripts/intelligent-docs-check.js
- scripts/validation/final-state-assessment.js
- scripts/validation/test-real-create-project.js
- scripts/validation/unified-success-validator.js
- tailwind.config.js
- tools/enforcement/ai-aware-template-selector.js
- tools/enforcement/intelligent-documentation-assistant.js
- tools/enforcement/production-validation.js
- tools/enforcement/realtime-ai-prevention.js
- tools/enforcement/template-enforcer.js

### High documentation debt detected
**Priority**: MEDIUM
**Description**: 82 files need documentation updates
**Action**: Plan documentation sprint to reduce debt

### Consider enabling documentation enforcement
**Priority**: MEDIUM
**Description**: High number of undocumented changes suggests need for automated enforcement
**Action**: Implement pre-commit documentation checks

## Detailed Analysis

### Files Requiring Documentation

#### src/components/TestButton/TestButton.module.css.d.ts
- **Status**: D
- **Priority**: high
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **component**: docs/components/testbutton.md - Component documentation with usage examples

#### src/components/TestButton/TestButton.tsx
- **Status**: D
- **Priority**: high
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **component**: docs/components/testbutton.md - Component documentation with usage examples

#### src/components/TestButton/index.ts
- **Status**: D
- **Priority**: high
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **component**: docs/components/testbutton.md - Component documentation with usage examples

#### src/components/TestCapability/TestCapability.module.css.d.ts
- **Status**: D
- **Priority**: high
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **component**: docs/components/testcapability.md - Component documentation with usage examples

#### src/components/TestCapability/TestCapability.tsx
- **Status**: D
- **Priority**: high
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **component**: docs/components/testcapability.md - Component documentation with usage examples

#### src/components/TestCapability/index.ts
- **Status**: D
- **Priority**: high
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **component**: docs/components/testcapability.md - Component documentation with usage examples

#### src/App.tsx
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/main.tsx
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### scripts/intelligent-docs-check.js
- **Status**: ??
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/validation/final-state-assessment.js
- **Status**: ??
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/validation/test-real-create-project.js
- **Status**: ??
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/validation/unified-success-validator.js
- **Status**: ??
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### tools/enforcement/ai-aware-template-selector.js
- **Status**: ??
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/ai-aware-template-selector.md - Tool usage and configuration documentation

#### tools/enforcement/intelligent-documentation-assistant.js
- **Status**: ??
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/intelligent-documentation-assistant.md - Tool usage and configuration documentation

#### tools/enforcement/production-validation.js
- **Status**: ??
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/production-validation.md - Tool usage and configuration documentation

#### tools/enforcement/realtime-ai-prevention.js
- **Status**: ??
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/realtime-ai-prevention.md - Tool usage and configuration documentation

#### tools/enforcement/template-enforcer.js
- **Status**: ??
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/template-enforcer.md - Tool usage and configuration documentation

#### scripts/check-actual-coverage.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/dev/ai-context-parser.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/dev/context-loader.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/ensure-claude-scripts.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/integration-tests.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/onboarding/generator-demo-simple.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/onboarding/generator-demo.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/onboarding/guided-setup.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/onboarding/unified-onboard.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/onboarding/validate-claude-onboarding.sh
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/setup/validate-setup.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/test-project-creation.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/test-template-customization.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/validation/run-template-validation.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/validation/test-framework-variants.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/validation/test-project-creation.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### tools/claude-validation/analytics-tracker.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/analytics-tracker.md - Tool usage and configuration documentation

#### tools/claude-validation/batch-validate.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/batch-validate.md - Tool usage and configuration documentation

#### tools/claude-validation/config-manager.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/config-manager.md - Tool usage and configuration documentation
  - **config**: docs/configuration/ - Configuration documentation

#### tools/claude-validation/validate-claude.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/validate-claude.md - Tool usage and configuration documentation

#### tools/enforcement/banned-document-types.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/banned-document-types.md - Tool usage and configuration documentation

#### tools/enforcement/check-imports.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/check-imports.md - Tool usage and configuration documentation

#### tools/enforcement/claude-completion-validator.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/claude-completion-validator.md - Tool usage and configuration documentation

#### tools/enforcement/claude-hook-validator.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/claude-hook-validator.md - Tool usage and configuration documentation

#### tools/enforcement/claude-post-edit-formatter.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/claude-post-edit-formatter.md - Tool usage and configuration documentation

#### tools/enforcement/config-enforcer.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/config-enforcer.md - Tool usage and configuration documentation
  - **config**: docs/configuration/ - Configuration documentation

#### tools/enforcement/config-enforcer/config-schema.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/config-schema.md - Tool usage and configuration documentation
  - **config**: docs/configuration/ - Configuration documentation

#### tools/enforcement/config-enforcer/index.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/index.md - Tool usage and configuration documentation
  - **config**: docs/configuration/ - Configuration documentation

#### tools/enforcement/config-enforcer/validators/json-validator.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/json-validator.md - Tool usage and configuration documentation
  - **config**: docs/configuration/ - Configuration documentation

#### tools/enforcement/documentation-style.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/documentation-style.md - Tool usage and configuration documentation

#### tools/enforcement/documentation/change-analyzer.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/change-analyzer.md - Tool usage and configuration documentation

#### tools/enforcement/documentation/git-diff-analyzer.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/git-diff-analyzer.md - Tool usage and configuration documentation

#### tools/enforcement/documentation/metrics-tracker.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/metrics-tracker.md - Tool usage and configuration documentation

#### tools/enforcement/documentation/rule-engine.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/rule-engine.md - Tool usage and configuration documentation

#### tools/enforcement/enforcement-config.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/enforcement-config.md - Tool usage and configuration documentation
  - **config**: docs/configuration/ - Configuration documentation

#### tools/enforcement/fix-docs.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/fix-docs.md - Tool usage and configuration documentation

#### tools/enforcement/log-enforcer.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/log-enforcer.md - Tool usage and configuration documentation

#### tools/enforcement/log-enforcer/config-schema.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/config-schema.md - Tool usage and configuration documentation
  - **config**: docs/configuration/ - Configuration documentation

#### tools/enforcement/log-enforcer/index.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/index.md - Tool usage and configuration documentation

#### tools/enforcement/log-enforcer/python_fixer.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/python_fixer.md - Tool usage and configuration documentation

#### tools/enforcement/no-improved-files.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/no-improved-files.md - Tool usage and configuration documentation

#### tools/enforcement/real-validation.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/real-validation.md - Tool usage and configuration documentation

#### tools/enforcement/root-file-enforcement.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/root-file-enforcement.md - Tool usage and configuration documentation

#### tools/enforcement/template-validator.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/template-validator.md - Tool usage and configuration documentation

#### tools/generators/api-generator.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/api-generator.md - Tool usage and configuration documentation

#### tools/generators/component-generator.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/component-generator.md - Tool usage and configuration documentation

#### tools/generators/doc-compiler.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/doc-compiler.md - Tool usage and configuration documentation

#### tools/generators/enhanced-component-generator-old.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/enhanced-component-generator-old.md - Tool usage and configuration documentation

#### tools/generators/enhanced-component-generator.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/enhanced-component-generator.md - Tool usage and configuration documentation

#### tools/generators/feature-generator.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/feature-generator.md - Tool usage and configuration documentation

#### tools/generators/generator-wrapper.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/generator-wrapper.md - Tool usage and configuration documentation

#### tools/generators/hook-generator.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/hook-generator.md - Tool usage and configuration documentation

#### tools/generators/project-init/create-project.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/create-project.md - Tool usage and configuration documentation

#### tools/generators/stack-decision-wizard.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/stack-decision-wizard.md - Tool usage and configuration documentation

#### tools/generators/template-customizer.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/template-customizer.md - Tool usage and configuration documentation

#### tools/metrics/generator-analytics.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/generator-analytics.md - Tool usage and configuration documentation

#### tools/metrics/performance-benchmarks.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/performance-benchmarks.md - Tool usage and configuration documentation

#### tools/metrics/user-feedback-system.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/user-feedback-system.md - Tool usage and configuration documentation

#### tools/onboarding/capability-tracker.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/capability-tracker.md - Tool usage and configuration documentation

#### tools/onboarding/pattern-quiz.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/pattern-quiz.md - Tool usage and configuration documentation

#### tools/onboarding/real-capability-tracker.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/real-capability-tracker.md - Tool usage and configuration documentation

#### jest.config.js
- **Status**: ??
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **config**: docs/configuration/ - Configuration documentation

#### next.config.js
- **Status**: ??
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **config**: docs/configuration/ - Configuration documentation

#### postcss.config.js
- **Status**: ??
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **config**: docs/configuration/ - Configuration documentation

#### tailwind.config.js
- **Status**: ??
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **config**: docs/configuration/ - Configuration documentation

### Files Requiring Manual Review

- **ai/config/context-rules.json** (M) - File type requires manual review for documentation needs
- **ai/config/models.json** (M) - File type requires manual review for documentation needs
- **ai/examples/anti-patterns/claude-code-specific/code-generation-mistakes.tsx** (M) - File type requires manual review for documentation needs
- **ai/examples/anti-patterns/maintenance/hard-to-maintain-code.ts** (M) - File type requires manual review for documentation needs
- **ai/examples/anti-patterns/security/common-vulnerabilities.ts** (M) - File type requires manual review for documentation needs
- **ai/examples/good-patterns/authentication/auth-patterns.tsx** (M) - File type requires manual review for documentation needs
- **ai/examples/good-patterns/data-fetching/react-query-patterns.ts** (M) - File type requires manual review for documentation needs
- **ai/examples/good-patterns/error-handling/api-error-handling.ts** (M) - File type requires manual review for documentation needs
- **ai/examples/ui-patterns/data-display/data-table.tsx** (M) - File type requires manual review for documentation needs
- **ai/examples/ui-patterns/forms/multi-step-form.tsx** (M) - File type requires manual review for documentation needs
- **ai/examples/ui-patterns/overlays/modal-dialog.tsx** (M) - File type requires manual review for documentation needs
- **docs/standards/documentation-rules.json** (M) - File type requires manual review for documentation needs
- **examples/ai-nextjs-reference/app/api/ai/chat/route.ts** (M) - File type requires manual review for documentation needs
- **examples/ai-nextjs-reference/app/api/ai/chat/stream/route.ts** (M) - File type requires manual review for documentation needs
- **examples/ai-nextjs-reference/app/api/ai/embed/route.ts** (M) - File type requires manual review for documentation needs
- **examples/ai-nextjs-reference/app/api/ai/extract/route.ts** (M) - File type requires manual review for documentation needs
- **examples/ai-nextjs-reference/app/api/ai/models/route.ts** (M) - File type requires manual review for documentation needs
- **examples/ai-nextjs-reference/app/api/ai/vision/route.ts** (M) - File type requires manual review for documentation needs
- **examples/ai-nextjs-reference/components/ai/chat/chat-interface.tsx** (M) - File type requires manual review for documentation needs
- **examples/ai-nextjs-reference/components/chat/chat-interface.tsx** (M) - File type requires manual review for documentation needs
- **examples/ai-nextjs-reference/lib/ai/index.ts** (M) - File type requires manual review for documentation needs
- **examples/ai-nextjs-reference/lib/index.ts** (M) - File type requires manual review for documentation needs
- **examples/test-annotations.js** (M) - File type requires manual review for documentation needs
- **extensions/projecttemplate-assistant/src/claudeValidator.ts** (M) - File type requires manual review for documentation needs
- **extensions/projecttemplate-assistant/src/extension.ts** (M) - File type requires manual review for documentation needs
- **extensions/projecttemplate-assistant/src/logEnforcer.ts** (M) - File type requires manual review for documentation needs
- **extensions/projecttemplate-assistant/tsconfig.json** (M) - File type requires manual review for documentation needs
- **public/index.html** (M) - File type requires manual review for documentation needs
- **src/components/TestButton/TestButton.module.css** (D) - File type requires manual review for documentation needs
- **src/components/TestCapability/TestCapability.module.css** (D) - File type requires manual review for documentation needs
- **src/styles/app.css** (D) - File type requires manual review for documentation needs
- **src/styles/globals.css** (D) - File type requires manual review for documentation needs
- **src/styles/index.css** (D) - File type requires manual review for documentation needs
- **src/styles/tokens.css** (D) - File type requires manual review for documentation needs
- **templates/config/react-vite/template.json** (M) - File type requires manual review for documentation needs
- **templates/hooks/feature/structure.json** (M) - File type requires manual review for documentation needs
- **tests/enforcement/config-enforcer/test-config-enforcer.js** (M) - File type requires manual review for documentation needs
- **tests/enforcement/test-advanced-fixer.js** (M) - File type requires manual review for documentation needs
- **tests/enforcement/test-log-enforcer.js** (M) - File type requires manual review for documentation needs
- **tests/test-config.json** (D) - File type requires manual review for documentation needs
- **tests/test-fresh-install/scripts/ensure-claude-scripts.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/claude-validation/analytics-tracker.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/claude-validation/config-manager.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/claude-validation/validate-claude.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/enforcement/banned-document-types.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/enforcement/check-imports.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/enforcement/claude-completion-validator.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/enforcement/claude-hook-validator.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/enforcement/claude-post-edit-formatter.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/enforcement/documentation-style.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/enforcement/enforcement-config.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/enforcement/fix-docs.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/enforcement/no-improved-files.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/enforcement/root-file-enforcement.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/generators/api-generator.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/generators/component-generator.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/generators/doc-compiler.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/generators/enhanced-component-generator-old.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/generators/enhanced-component-generator.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/generators/feature-generator.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/generators/hook-generator.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/generators/stack-decision-wizard.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/metrics/performance-benchmarks.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/metrics/user-feedback-system.js** (M) - File type requires manual review for documentation needs
- **tests/test-fresh-install/tools/testing/claude-behavioral-testing-framework.js** (M) - File type requires manual review for documentation needs
- **tools/metrics/claude-onboarding-certificate.txt** (M) - File type requires manual review for documentation needs
- **tools/metrics/claude-onboarding-validation.json** (M) - File type requires manual review for documentation needs
- **tools/metrics/real-capability-metrics.json** (M) - File type requires manual review for documentation needs
- **tools/metrics/real-validation-report.json** (M) - File type requires manual review for documentation needs
- **tsconfig.json** (M) - File type requires manual review for documentation needs
- **app/** (??) - File type requires manual review for documentation needs
- **components/** (??) - File type requires manual review for documentation needs
- **docs/guides/documentation/** (??) - File type requires manual review for documentation needs
- **docs/maintenance/** (??) - File type requires manual review for documentation needs
- **examples/react-vite/** (??) - File type requires manual review for documentation needs
- **jest.setup.js** (??) - File type requires manual review for documentation needs
- **lib/** (??) - File type requires manual review for documentation needs
- **next-env.d.ts** (??) - File type requires manual review for documentation needs
- **package-vite-backup.json** (??) - File type requires manual review for documentation needs
- **prisma/** (??) - File type requires manual review for documentation needs
- **scripts/test-hook-input.json** (??) - File type requires manual review for documentation needs
- **templates/documentation/plan/** (??) - File type requires manual review for documentation needs
- **tools/metrics/production-validation-report.json** (??) - File type requires manual review for documentation needs
- **tools/templates/** (??) - File type requires manual review for documentation needs
