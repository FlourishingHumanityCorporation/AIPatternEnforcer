# Test Template Customization Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Installation and Setup](#installation-and-setup)
4. [Test Framework Coverage](#test-framework-coverage)
5. [Testing Process](#testing-process)
6. [Usage Examples](#usage-examples)
7. [Output and Results](#output-and-results)
8. [Integration with Development Workflow](#integration-with-development-workflow)
9. [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
10. [API and Programmatic Usage](#api-and-programmatic-usage)
11. [Development and Contributing](#development-contributing)

## Overview

Comprehensive test suite that validates template customization functionality across all supported frameworks (React,
Next.js, Express). Ensures each framework variant creates working applications with proper configuration.

**Tool Type**: Framework Testing Script  
**Language**: JavaScript (Node.js)  
**Dependencies**: `fs`, `path`, `child_process`  
**Location**: `scripts/test-template-customization.js`

## Quick Start

```bash
# Run complete framework customization tests
node scripts/test-template-customization.js

# Tests all frameworks: React, Next.js, Express
# Validates project creation, customization, and dev server startup
```

## Installation and Setup

### Prerequisites
- Node.js 18+ required
- ProjectTemplate base installation
- Template customizer tool working
- npm/yarn for dependency management
- Network access for package installation

### Installation
Tool is included with ProjectTemplate:
```bash
npm install  # All dependencies included
```

### Framework Requirements
- **React**: Vite, React 19, TypeScript support
- **Next.js**: Next.js 14, App Router, server components
- **Express**: TypeScript, middleware setup, API structure

## Test Framework Coverage

### Supported Frameworks
```javascript
const frameworks = ['react', 'nextjs', 'express'];
```

### Framework-Specific Testing

#### React Framework Test
**What it validates**:
- Template customization with `npm run template:react`
- Vite development server startup
- Component structure creation
- TypeScript configuration
- Dev server output includes "Local:" indicating successful Vite startup

#### Next.js Framework Test
**What it validates**:
- Template customization with `npm run template:nextjs`
- Next.js development server startup
- App Router structure creation
- Server-side rendering setup
- Dev server output includes "Ready in" indicating successful Next.js startup

#### Express Framework Test
**What it validates**:
- Template customization with `npm run template:express`
- TypeScript compilation with `npm run build`
- Server structure creation
- API endpoint setup
- Build process completion without errors

## Testing Process

### Test Lifecycle for Each Framework

#### Phase 1: Environment Setup
1. **Create test directory** with timestamp for uniqueness
2. **Copy base template files** (src, public, tools, configs)
3. **Set up minimal project structure** for customization

#### Phase 2: Template Customization
1. **Run framework-specific customization**:
   - `npm run template:react` for React
   - `npm run template:nextjs` for Next.js
   - `npm run template:express` for Express
2. **Validate customization output**
3. **Check for framework-specific files**

#### Phase 3: Dependency Installation
1. **Install npm dependencies** (`npm install`)
2. **Handle network timeouts** and retry logic
3. **Validate package installation**

#### Phase 4: Functionality Testing
1. **React/Next.js**: Test development server startup
2. **Express**: Test TypeScript build process
3. **Validate expected output patterns**
4. **Check for error indicators**

#### Phase 5: Cleanup
1. **Remove test directories** automatically
2. **Clean up temporary files**
3. **Report test results**

### File Copying Strategy
```javascript
const baseFiles = [
  'src',        // Source code
  'public',     // Static assets
  'tools',      // Development tools
  'package.json', // Dependencies
  'tsconfig.json', // TypeScript config
  '.eslintrc.json', // Linting rules
  '.prettierrc',   // Code formatting
  '.gitignore'     // Git ignore rules
];
```

## Usage Examples

### Example 1: Complete Test Run
```bash
node scripts/test-template-customization.js

# Output:
🧪 Testing template customization workflows...

📦 Testing react framework...
  Customizing template for react...
  Installing dependencies...
  Testing build...
  ✅ react framework test passed

📦 Testing nextjs framework...
  Customizing template for nextjs...
  Installing dependencies...
  Testing build...
  ✅ nextjs framework test passed

📦 Testing express framework...
  Customizing template for express...
  Installing dependencies...
  Testing build...
  ✅ express framework test passed

📊 Test Results:
  react: ✅ PASS
  nextjs: ✅ PASS
  express: ✅ PASS

🎉 All template customization tests passed!
```

### Example 2: Test Failure Scenario
```bash
node scripts/test-template-customization.js

# Output with failure:
📦 Testing react framework...
  Customizing template for react...
  Installing dependencies...
  Testing build...
  ❌ react framework test failed: Vite dev server failed to start

📦 Testing nextjs framework...
  ✅ nextjs framework test passed

📦 Testing express framework...
  ✅ express framework test passed

📊 Test Results:
  react: ❌ FAIL
  nextjs: ✅ PASS
  express: ✅ PASS

💥 Some template customization tests failed
# Exit code: 1
```

### Example 3: Individual Framework Test (Modified Script)
```bash
# To test only React (modify script temporarily):
const frameworks = ['react'];  # Test only React
node scripts/test-template-customization.js
```

## Output and Results

### Successful Test Execution
```text
🧪 Testing template customization workflows...

📦 Testing react framework...
  Customizing template for react...
  Installing dependencies...
  Testing build...
  ✅ react framework test passed

📦 Testing nextjs framework...
  Customizing template for nextjs...
  Installing dependencies...
  Testing build...
  ✅ nextjs framework test passed

📦 Testing express framework...
  Customizing template for express...
  Installing dependencies...
  Testing build...
  ✅ express framework test passed

📊 Test Results:
  react: ✅ PASS
  nextjs: ✅ PASS
  express: ✅ PASS

🎉 All template customization tests passed!
```

### Test Validation Criteria

#### React Framework Success Criteria
- Template customization completes without errors
- Dependencies install successfully
- Vite dev server starts within 10 seconds
- Server output contains "Local:" text
- No critical errors in startup logs

#### Next.js Framework Success Criteria
- Template customization completes without errors
- Dependencies install successfully
- Next.js dev server starts within 10 seconds
- Server output contains "Ready in" text
- App Router structure created correctly

#### Express Framework Success Criteria
- Template customization completes without errors
- Dependencies install successfully
- TypeScript build (`npm run build`) completes successfully
- No compilation errors in build output
- Server files created in correct structure

### Exit Codes
- `0`: All framework tests passed
- `1`: One or more framework tests failed

## Integration with Development Workflow

### NPM Scripts Integration
Add to `package.json`:
```json
{
  "scripts": {
    "test:template-customization": "node scripts/test-template-customization.js",
    "test:frameworks": "node scripts/test-template-customization.js",
    "test:all": "npm run test && npm run test:template-customization"
  }
}
```

### CI/CD Integration
```yaml
# GitHub Actions workflow
- name: Test Template Customization
  run: |
    node scripts/test-template-customization.js
    
- name: Validate Framework Support
  run: |
    npm run test:template-customization
```

### Pre-Release Testing
```bash
# Before releasing new template version
npm run test:template-customization

# Ensure all frameworks work with current changes
# Validate that users can create working projects
```

### Development Workflow
```bash
# After modifying template-customizer.js
npm run test:template-customization

# After updating framework configurations
node scripts/test-template-customization.js

# Verify no regressions introduced
```

## Error Handling and Troubleshooting

### Common Issues

#### Template Customization Fails
```text
❌ react framework test failed: Command failed: npm run template:react
```
**Causes**: Missing template-customizer script, invalid framework config  
**Solutions**:
```bash
# Check template customizer exists
ls tools/generators/template-customizer.js

# Verify npm scripts
grep "template:" package.json

# Test customizer manually
node tools/generators/template-customizer.js --framework react
```

#### Dependency Installation Fails
```text
❌ nextjs framework test failed: Command failed: npm install
```
**Causes**: Network issues, package conflicts, insufficient disk space  
**Solutions**:
```bash
# Check npm configuration
npm config list

# Clear npm cache
npm cache clean --force

# Check disk space
df -h

# Test manual installation
cd test-directory && npm install
```

#### Dev Server Startup Fails
```text
❌ Vite dev server failed to start
```
**Causes**: Port conflicts, configuration errors, missing dependencies  
**Solutions**:
```bash
# Check for port conflicts
lsof -i :3000
lsof -i :5173

# Test manual dev server
cd test-directory && npm run dev

# Check error logs
npm run dev 2>&1 | tee dev-server.log
```

### Debug Mode
Add debug logging by modifying the script:
```javascript
// Add before template customization
console.log('Debug: Test directory:', testPath);
console.log('Debug: Template directory:', templateDir);

// Add verbose npm output
execSync(`npm run template:${framework}`, { 
  cwd: testPath, 
  stdio: 'inherit'  // Change from 'pipe' to see output
});
```

### Framework-Specific Debugging

#### React Issues
```bash
# Check Vite configuration
cat test-directory/vite.config.ts

# Verify React dependencies
cat test-directory/package.json | grep react

# Test Vite manually
cd test-directory && npx vite --version
```

#### Next.js Issues
```bash
# Check Next.js configuration
cat test-directory/next.config.js

# Verify Next.js dependencies
cat test-directory/package.json | grep next

# Test Next.js manually
cd test-directory && npx next --version
```

#### Express Issues
```bash
# Check TypeScript configuration
cat test-directory/tsconfig.json

# Verify Express dependencies
cat test-directory/package.json | grep express

# Test TypeScript compilation
cd test-directory && npx tsc --noEmit
```

## API and Programmatic Usage

### Node.js Integration
```javascript
const { spawn } = require('child_process');

// Run template customization tests programmatically
function runTemplateTests() {
  return new Promise((resolve, reject) => {
    const child = spawn('node', ['scripts/test-template-customization.js'], {
      stdio: 'pipe'
    });

    let output = '';
    child.stdout.on('data', (data) => {
      output += data.toString();
    });

    child.on('close', (code) => {
      const results = parseTestResults(output);
      code === 0 ? resolve(results) : reject(new Error(`Tests failed with code ${code}`));
    });
  });
}

function parseTestResults(output) {
  const frameworks = ['react', 'nextjs', 'express'];
  const results = {};
  
  frameworks.forEach(framework => {
    const passed = output.includes(`${framework}: ✅ PASS`);
    results[framework] = passed;
  });
  
  return results;
}

// Usage
const results = await runTemplateTests();
console.log('Framework test results:', results);
```

### Custom Framework Testing
```javascript
// Test specific framework
async function testFramework(framework) {
  // Implementation similar to main script
  // But for single framework
  const testDir = `test-${framework}-${Date.now()}`;
  // ... test logic
}

// Test custom framework list
const customFrameworks = ['react', 'vue'];  // Add Vue when supported
for (const framework of customFrameworks) {
  const result = await testFramework(framework);
  console.log(`${framework}: ${result ? 'PASS' : 'FAIL'}`);
}
```

### Integration Testing
```javascript
// Test template customization as part of larger test suite
const testSuite = [
  () => runUnitTests(),
  () => runIntegrationTests(),
  () => runTemplateTests(),  // This script
  () => runE2ETests()
];

for (const test of testSuite) {
  console.log('Running test...');
  await test();
  console.log('Test completed');
}
```

## Development and Contributing

### Project Structure
```text
scripts/test-template-customization.js
├── Framework list configuration
├── testFramework() function per framework
├── copyRecursive() utility function
├── main() orchestration function
└── Error handling and cleanup
```

### Adding New Framework Support
1. **Add framework to list**:
```javascript
const frameworks = ['react', 'nextjs', 'express', 'vue'];  // Add Vue
```

2. **Add framework-specific test logic**:
```javascript
// In testFramework function
if (framework === 'vue') {
  // Vue-specific testing logic
  const child = execSync('timeout 10s npm run dev || true', { 
    cwd: testPath, 
    stdio: 'pipe',
    encoding: 'utf8'
  });
  
  if (!child.includes('Local:')) {  // Vue with Vite
    throw new Error('Vue dev server failed to start');
  }
}
```

3. **Add framework customization script**:
```json
{
  "scripts": {
    "template:vue": "node tools/generators/template-customizer.js --framework vue"
  }
}
```

### Testing Guidelines
- Each framework test should be completely independent
- Always clean up test directories, even on failure
- Use unique directory names to avoid conflicts
- Test both success and failure scenarios
- Validate actual functionality, not just file existence

### Performance Considerations
- Tests run sequentially to avoid resource conflicts
- Cleanup is automatic to prevent disk space issues
- Timeouts prevent hanging tests
- Use pipe stdio for faster execution

## Related Tools and Documentation

- **template-customizer.js**: Framework customization tool being tested
- **integration-tests.js**: Broader integration testing suite
- **test-project-creation.js**: Project creation testing
- **Template Customizer Guide**: docs/tools/template-customizer.md
- **Framework Setup Guide**: docs/guides/setup/framework-setup.md

---

**Last Updated**: 2025-07-12  
**Tool Version**: Current  
**Maintainer**: ProjectTemplate Team  
**Support**: See CLAUDE.md for development guidelines