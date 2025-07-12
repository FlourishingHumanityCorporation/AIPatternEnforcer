# Integration Tests Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Test Scenarios](#test-scenarios)
4. [Command Line Interface](#command-line-interface)
5. [Output and Results](#output-and-results)
6. [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
7. [Integration with Development Workflow](#integration-with-development-workflow)
8. [Development and Contributing](#development-and-contributing)

## Overview

Comprehensive integration test suite for ProjectTemplate workflows that validates project creation and template
customization functionality independently.

**Tool Type**: Test Script  
**Language**: JavaScript (Node.js)  
**Dependencies**: `fs`, `path`, `child_process`  
**Location**: `scripts/integration-tests.js`

## Quick Start

```bash
# Run full integration test suite
node scripts/integration-tests.js

# Or via npm script (if configured)
npm run test:integration
```

## Test Scenarios

### 1. Project Creation Workflow Test
**Purpose**: Validates that new projects can be created successfully from the template  
**What it tests**:
- Copies essential template files to new project directory
- Creates customized package.json with project-specific settings
- Installs dependencies successfully
- Starts development server (npm run dev) without errors

### 2. React Template Customization Test  
**Purpose**: Validates React-specific template customization  
**What it tests**:
- Customizes template for React framework
- Creates `vite.config.ts` configuration
- Adds React dependencies to package.json
- Sets up dev script correctly

### 3. Next.js Template Customization Test
**Purpose**: Validates Next.js-specific template customization  
**What it tests**:
- Customizes template for Next.js framework
- Creates `next.config.js` configuration
- Creates `app/layout.tsx` structure
- Adds Next.js dependencies to package.json

### 4. Express Template Customization Test
**Purpose**: Validates Express.js backend template customization  
**What it tests**:
- Customizes template for Express framework
- Creates `src/server.ts` entry point
- Creates `src/routes/index.ts` routing structure
- Adds Express dependencies to package.json

## Command Line Interface

### Basic Syntax
```bash
node scripts/integration-tests.js
```

**Note**: This script takes no command line arguments and runs all tests automatically.

### Test Execution Process
1. **Project Creation Test**: Creates temporary project, installs dependencies, tests dev server startup
2. **Framework Tests**: Tests each framework customization (React, Next.js, Express) independently
3. **Cleanup**: Removes all temporary test directories automatically
4. **Results**: Reports pass/fail status for each test scenario

## Output and Results

### Successful Execution
```text
🧪 Running ProjectTemplate integration tests...

📦 Testing project creation workflow...
  ✅ Project creation test passed

📦 Testing react template customization...
  ✅ React customization test passed

📦 Testing nextjs template customization...
  ✅ Next.js customization test passed

📦 Testing express template customization...
  ✅ Express customization test passed

📊 Integration Test Results:
  Project Creation: ✅ PASS
  React Customization: ✅ PASS
  Next.js Customization: ✅ PASS
  Express Customization: ✅ PASS

🎉 All integration tests passed!

ProjectTemplate is ready for users:
  1. ✅ Project creation workflow works
  2. ✅ Template customization works for all frameworks
  3. ✅ New projects can run npm run dev successfully
```

### Failed Test Example
```text
📦 Testing react template customization...
  ❌ React customization test failed - missing files or config

📊 Integration Test Results:
  Project Creation: ✅ PASS
  React Customization: ❌ FAIL
  Next.js Customization: ✅ PASS
  Express Customization: ✅ PASS

💥 Some integration tests failed
```

### Exit Codes
- `0`: All tests passed successfully
- `1`: One or more tests failed

## Error Handling and Troubleshooting

### Common Issues

#### Project Creation Test Fails
**Symptoms**: Dev server doesn't start or dependency installation fails  
**Potential Causes**:
- Missing or corrupted template files
- Network issues during npm install
- Port conflicts for dev server

**Solutions**:
```bash
# Check template structure
ls -la src/ public/ config/

# Test dependency installation manually
cd test-project-directory && npm install

# Check for port conflicts
lsof -i :3000
```

#### Framework Customization Test Fails
**Symptoms**: Expected files not created or dependencies missing  
**Potential Causes**:
- template-customizer.js script issues
- Missing template files for specific framework
- Configuration file generation problems

**Solutions**:
```bash
# Test customization manually
node tools/generators/template-customizer.js --framework react

# Check template files exist
ls -la templates/frameworks/react/
```

#### Permission Errors
**Symptoms**: EACCES or EPERM errors during file operations  
**Solutions**:
```bash
# Fix directory permissions
chmod 755 scripts/
chmod 644 scripts/integration-tests.js

# Ensure write access to parent directory
ls -la ../
```

## Integration with Development Workflow

### NPM Scripts Integration
Add to `package.json`:
```json
{
  "scripts": {
    "test:integration": "node scripts/integration-tests.js",
    "test:integration:clean": "rm -rf integration-test-* test-project-*"
  }
}
```

### Pre-release Testing
```bash
# Run before releases to ensure template works
npm run test:integration

# Clean up any leftover test directories
npm run test:integration:clean
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Run Integration Tests
  run: |
    node scripts/integration-tests.js
    
- name: Clean up test artifacts
  if: always()
  run: |
    rm -rf integration-test-* test-project-*
```

## Development and Contributing

### Test Structure
Each test follows this pattern:
1. **Setup**: Create temporary project directory
2. **Execute**: Run the workflow being tested
3. **Validate**: Check that expected files/behavior exist
4. **Cleanup**: Remove temporary directories

### Adding New Framework Tests
To add a new framework test:

1. **Add to results object**:
```javascript
const results = {
  // ... existing tests
  newFrameworkCustomization: false
};
```

2. **Create test function**:
```javascript
async function testTemplateCustomization(framework) {
  // Add your framework-specific validation logic
  if (framework === 'your-framework') {
    // Check for framework-specific files and configs
    if (fs.existsSync(path.join(testPath, 'expected-file.config.js'))) {
      results.newFrameworkCustomization = true;
    }
  }
}
```

3. **Add to main execution**:
```javascript
async function main() {
  // ... existing tests
  await testTemplateCustomization('your-framework');
}
```

### Testing Guidelines
- Each test should be completely independent
- Always clean up temporary files, even on failure
- Use unique directory names with timestamps to avoid conflicts
- Test real workflows that users will experience
- Validate both file creation and functional behavior

## Related Tools and Documentation

- **test-project-creation.js**: Simpler project creation test script
- **template-customizer.js**: The actual customization tool being tested
- **create-project.js**: Project creation implementation
- **Project Setup Guide**: docs/guides/setup/project-setup.md

---

**Last Updated**: 2025-07-12  
**Script Version**: Current  
**Maintainer**: ProjectTemplate Team  
**Support**: See CLAUDE.md for development guidelines