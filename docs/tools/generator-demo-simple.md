# Generator Demo Simple Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Purpose and Functionality](#purpose-and-functionality)
  4. [Primary Functions](#primary-functions)
  5. [Demo Output Structure](#demo-output-structure)
6. [Command Line Interface](#command-line-interface)
  7. [Basic Syntax](#basic-syntax)
  8. [No Options Required](#no-options-required)
9. [Output Example](#output-example)
10. [Features Demonstrated](#features-demonstrated)
  11. [1. Generator Types](#1-generator-types)
  12. [2. Generated Artifacts](#2-generated-artifacts)
  13. [3. Workflow Integration](#3-workflow-integration)
14. [Integration with Onboarding](#integration-with-onboarding)
  15. [Part of Onboarding Flow](#part-of-onboarding-flow)
  16. [Related Onboarding Tools](#related-onboarding-tools)
17. [Error Handling](#error-handling)
  18. [Generator Not Found Warning](#generator-not-found-warning)
  19. [Component Directory Check](#component-directory-check)
20. [Customization and Extension](#customization-and-extension)
  21. [Adding New Generators](#adding-new-generators)
  22. [Modifying Output Colors](#modifying-output-colors)
23. [Optimal Practices for Demo Scripts](#optimal-practices-for-demo-scripts)
  24. [1. Visual Hierarchy](#1-visual-hierarchy)
  25. [2. Information Architecture](#2-information-architecture)
  26. [3. User Guidance](#3-user-guidance)
27. [Performance Considerations](#performance-considerations)
  28. [Execution Characteristics](#execution-characteristics)
  29. [Optimization](#optimization)
30. [Maintenance and Updates](#maintenance-and-updates)
  31. [When to Update](#when-to-update)
  32. [Update Checklist](#update-checklist)
33. [Related Documentation](#related-documentation)

## Overview

An interactive demonstration script that showcases the ProjectTemplate's code generation capabilities. This script
provides a visual, user-friendly introduction to available generators, their features, and usage patterns for developers
new to the project.

**Tool Type**: CLI Demo/Tutorial  
**Language**: JavaScript/Node.js  
**Dependencies**: chalk (for colored output), fs

## Quick Start

```bash
# Run the demo
node scripts/onboarding/generator-demo-simple.js

# Or via npm script (if configured)
npm run demo:generators
```

## Purpose and Functionality

### Primary Functions
1. **Generator Overview**: Lists all available code generators
2. **Feature Showcase**: Highlights generator capabilities
3. **File Structure Preview**: Shows what files will be created
4. **Quick Start Guide**: Provides copy-paste commands
5. **Health Check**: Verifies generator installation

### Demo Output Structure
The script provides a colorful, structured output:
- Available generators with descriptions
- Command syntax for each generator
- Generated file structure visualization
- Feature checklist
- Interactive usage examples

## Command Line Interface

### Basic Syntax
```bash
node scripts/onboarding/generator-demo-simple.js
```

### No Options Required
This is a demo script with no command-line options. It provides a static, informative display.

## Output Example

```text
🎯 ProjectTemplate Component Generator Demo

Available Generators:

1. Enhanced Component Generator
   Command: npm run g:c ComponentName
   Creates: TypeScript component with tests, stories, and styles

2. Basic Component Generator
   Command: npm run g:component ComponentName
   Creates: Simple component with basic structure

🔧 Generator Features:
✅ TypeScript component files
✅ Comprehensive test suites
✅ Storybook stories
✅ CSS modules
✅ Export/import setup

📁 Generated File Structure:
src/components/ComponentName/
├── ComponentName.tsx        # Main component
├── ComponentName.test.tsx   # Test suite
├── ComponentName.stories.tsx # Storybook stories
├── ComponentName.module.css # Styled CSS
└── index.ts                # Export barrel

🚀 Quick Start:
1. Run: npm run g:c YourComponentName
2. Answer the interactive prompts
3. Find your component in src/components/
4. Run tests: npm test

🎮 Try it now:
npm run g:c DemoComponent

📦 Existing Components:
- Button
- Card
- Header
(3 components found)
```

## Features Demonstrated

### 1. Generator Types
- **Enhanced Component Generator**: Full-featured component generation with all supporting files
- **Basic Component Generator**: Simplified version for quick prototypes

### 2. Generated Artifacts
- TypeScript component implementation
- Comprehensive test suite with coverage
- Storybook stories for visual testing
- CSS modules for scoped styling
- Barrel exports for clean imports

### 3. Workflow Integration
- NPM script shortcuts
- Test execution commands
- Directory structure conventions
- Optimal practices reinforcement

## Integration with Onboarding

### Part of Onboarding Flow
This demo script is typically used during:
1. Initial developer onboarding
2. Generator feature introduction
3. Code generation training
4. Optimal practices demonstration

### Related Onboarding Tools
- `generator-demo.js`: More comprehensive generator demonstration
- `guided-setup.js`: Interactive project setup wizard
- `claude-code-self-onboarding.sh`: AI assistant onboarding

## Error Handling

### Generator Not Found Warning
```javascript
if (!fs.existsSync('tools/generators/enhanced-component-generator.js')) {
  console.log(chalk.red('\n⚠️  Warning: Generator files not found. Run npm install first.'));
}
```

### Component Directory Check
The script checks for existing components and displays:
- Current component count
- List of existing components
- Confirmation that setup is complete

## Customization and Extension

### Adding New Generators
To add a new generator to the demo:

```javascript
console.log(chalk.green('3. Feature Generator'));
console.log(chalk.gray('   Command: npm run g:feature FeatureName'));
console.log(chalk.gray('   Creates: Complete feature module with routing\n'));
```

### Modifying Output Colors
Uses chalk for terminal styling:
- `chalk.cyan.bold()`: Headers
- `chalk.green()`: Generator names
- `chalk.gray()`: Descriptions
- `chalk.yellow()`: Commands
- `chalk.red()`: Warnings

## Optimal Practices for Demo Scripts

### 1. Visual Hierarchy
- Use colors to distinguish information types
- Employ icons/emojis for visual scanning
- Maintain consistent formatting

### 2. Information Architecture
- Start with overview
- Progress to specifics
- End with actionable commands

### 3. User Guidance
- Provide copy-paste commands
- Show expected outcomes
- Include troubleshooting hints

## Performance Considerations

### Execution Characteristics
- **Runtime**: <50ms
- **Memory**: Minimal (<10MB)
- **Dependencies**: Only chalk for colors

### Optimization
- Synchronous execution for simplicity
- Minimal file system checks
- No network requests

## Maintenance and Updates

### When to Update
1. New generators added to project
2. Generator commands change
3. File structure modifications
4. Feature additions/removals

### Update Checklist
- [ ] Verify all commands still work
- [ ] Update file structure examples
- [ ] Test with fresh installation
- [ ] Ensure colors display correctly

## Related Documentation

- **Enhanced Component Generator**: `docs/tools/enhanced-component-generator.md`
- **Component Guidelines**: `docs/standards/component-standards.md`
- **Generator Architecture**: `docs/architecture/generator-system.md`
- **Onboarding Guide**: `docs/onboarding/developer-onboarding.md`

---

**Last Updated**: 2025-07-12  
**Script Version**: 1.0.0  
**Maintainer**: ProjectTemplate Team  
**Purpose**: Developer onboarding and generator demonstration