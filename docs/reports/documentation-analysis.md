# Documentation Analysis Report

**Generated**: 2025-07-12T05:25:13.889Z

## Summary

- **Total Files Analyzed**: 75
- **Files Needing Documentation**: 37
- **Documentation Debt**: 37 files
- **New Files**: 6
- **Modified Files**: 31

## Immediate Actions Required

### 6 new files lack documentation
**Priority**: HIGH
**Description**: New files should include documentation explaining their purpose and usage
**Action**: Add documentation for new files
**Files**:
- scripts/debug-js-detector.js
- scripts/debug-js-fixer-simple.js
- scripts/debug-js-fixer.js
- scripts/test-create-project.js
- scripts/test-js-fixer.js
- tools/enforcement/log-enforcer/javascript_fixer.js

### High documentation debt detected
**Priority**: MEDIUM
**Description**: 37 files need documentation updates
**Action**: Plan documentation sprint to reduce debt

### Consider enabling documentation enforcement
**Priority**: MEDIUM
**Description**: High number of undocumented changes suggests need for automated enforcement
**Action**: Implement pre-commit documentation checks

## Detailed Analysis

### Files Requiring Documentation

#### src/components/TestCapability/TestCapability.tsx
- **Status**: M
- **Priority**: high
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **component**: docs/components/testcapability.md - Component documentation with usage examples

#### src/App.tsx
- **Status**: M
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/sample-feature/components/SampleFeatureView.tsx
- **Status**: M
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/test-feature/api/index.ts
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/test-feature/api/test-feature.api.ts
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/test-feature/index.ts
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/test-feature/types/index.ts
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/test-feature/types/test-feature.types.ts
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/test-feature2/api/index.ts
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/test-feature2/api/test-feature2.api.ts
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/test-feature2/index.ts
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/test-feature2/types/index.ts
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/test-feature2/types/test-feature2.types.ts
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/test-feature3/api/index.ts
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/test-feature3/api/test-feature3.api.ts
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/test-feature3/components/TestFeature3View.tsx
- **Status**: MD
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/test-feature3/components/index.ts
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/test-feature3/hooks/index.ts
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/test-feature3/hooks/useTestFeature3.ts
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/test-feature3/index.ts
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/test-feature3/store/index.ts
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/test-feature3/store/test-feature3.store.tsx
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/test-feature3/types/index.ts
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/features/test-feature3/types/test-feature3.types.ts
- **Status**: D
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### src/main.tsx
- **Status**: M
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **general**: docs/ - General documentation location

#### scripts/debug-js-detector.js
- **Status**: ??
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/debug-js-fixer-simple.js
- **Status**: ??
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/debug-js-fixer.js
- **Status**: ??
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/test-create-project.js
- **Status**: ??
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### scripts/test-js-fixer.js
- **Status**: ??
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **script**: docs/scripts/README.md - Script documentation in scripts section

#### tools/enforcement/log-enforcer/javascript_fixer.js
- **Status**: ??
- **Priority**: medium
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/javascript_fixer.md - Tool usage and configuration documentation

#### tools/claude-validation/validate-claude.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/validate-claude.md - Tool usage and configuration documentation

#### tools/enforcement/log-enforcer.js
- **Status**: AM
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/log-enforcer.md - Tool usage and configuration documentation

#### tools/enforcement/log-enforcer/javascript_detector.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/javascript_detector.md - Tool usage and configuration documentation

#### tools/generators/component-generator.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/component-generator.md - Tool usage and configuration documentation

#### tools/generators/feature-generator.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/feature-generator.md - Tool usage and configuration documentation

#### tools/generators/template-customizer.js
- **Status**: M
- **Priority**: low
- **Reason**: File type requires documentation
- **Suggested Documentation**:
  - **tool**: docs/tools/template-customizer.md - Tool usage and configuration documentation

### Files Requiring Manual Review

- **src/features/test-feature3/components/TestFeature3.module.css** (D) - File type requires manual review for documentation needs
- **templates/component/Component.tsx.hbs** (M) - File type requires manual review for documentation needs
- **tests/enforcement/test-log-enforcer.js** (A) - File type requires manual review for documentation needs
- **tools/claude-validation/.analytics/usage-stats.json** (MM) - File type requires manual review for documentation needs
- **tools/enforcement/.log-enforcer.json** (A) - File type requires manual review for documentation needs
- **tools/metrics/claude-onboarding-certificate.txt** (M) - File type requires manual review for documentation needs
- **tools/metrics/claude-onboarding-state.json** (M) - File type requires manual review for documentation needs
- **tools/metrics/claude-onboarding-validation.json** (M) - File type requires manual review for documentation needs
- **tools/metrics/documentation-history.json** (MM) - File type requires manual review for documentation needs
- **tools/metrics/documentation-metrics.json** (MM) - File type requires manual review for documentation needs
- **tools/metrics/pattern-quiz-results.json** (M) - File type requires manual review for documentation needs
- **tools/metrics/test-resume-state.json** (D) - File type requires manual review for documentation needs
- **src/features/pilot-ready/** (??) - File type requires manual review for documentation needs
- **src/features/test-compliance/** (??) - File type requires manual review for documentation needs
