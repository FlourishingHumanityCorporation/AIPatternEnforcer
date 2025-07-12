# Test Project Creation Documentation

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Test Process](#test-process)
4. [Command Line Interface](#command-line-interface)
5. [Output and Results](#output-and-results)
6. [Error Handling and Troubleshooting](#error-handling-and-troubleshooting)
7. [Integration with Development Workflow](#integration-with-development-workflow)
8. [Development and Contributing](#development-and-contributing)

## Overview

Focused test script that validates the core project creation workflow without interactive prompts, ensuring the template can create functional projects programmatically.

**Tool Type**: Test Script  
**Language**: JavaScript (Node.js)  
**Dependencies**: `fs`, `path`, `child_process`  
**Location**: `scripts/test-project-creation.js`

## Quick Start

```bash
# Run project creation test
node scripts/test-project-creation.js

# Test will create and clean up temporary project automatically
```

## Test Process

### 1. Project Setup Phase
**Actions**:
- Creates temporary project directory with timestamp-based name
- Copies essential template files and directories:
  - `src/`, `public/`, `config/`, `scripts/`, `tools/`, `templates/`
  - `ai/`, `docs/`, `tests/`
  - Configuration files: `.eslintrc.json`, `.prettierrc`, `tsconfig.json`, `vite.config.ts`
  - Documentation: `README.md`, `CLAUDE.md`, `QUICK-START.md`, `DOCS_INDEX.md`

### 2. Package.json Customization
**Actions**:
- Reads template's package.json
- Creates project-specific version:
  - Sets unique project name with timestamp
  - Sets version to `0.1.0`
  - Adds test project description
  - Marks as `private: true`
- Removes template-specific scripts:
  - `create-project` (template creation script)
  - `cleanup:template` (template cleanup script)
  - `prepare` (husky git hooks, fails without git)
- Updates Vite configuration paths:
  - Removes `--config config/vite.config.ts` from dev/build/preview scripts
  - Allows Vite to use root-level config file

### 3. Dependency Installation
**Actions**:
- Runs `npm install` in the test project directory
- Installs all dependencies required for project to function
- Uses `stdio: 'inherit'` to show installation progress

### 4. Development Server Test
**Actions**:
- Attempts to start development server with `npm run dev`
- Uses `timeout 10s` to limit test duration
- Captures server output to validate successful startup
- Looks for "Local:" in output to confirm Vite started successfully

### 5. Cleanup
**Actions**:
- Automatically removes test project directory
- Runs regardless of test success/failure
- Ensures no temporary files are left behind

## Command Line Interface

### Basic Syntax
```bash
node scripts/test-project-creation.js
```

**Note**: This script takes no command line arguments and runs a single comprehensive test.

### Files Copied During Test
The script copies these essential items from the template:
```text
src/                    # Source code
public/                 # Static assets  
config/                 # Configuration files
scripts/                # Development scripts
tools/                  # Development tools
templates/              # Code generation templates
ai/                     # AI integration configs
docs/                   # Documentation
tests/                  # Test files
.eslintrc.json         # ESLint configuration
.prettierrc            # Prettier configuration
tsconfig.json          # TypeScript configuration
vite.config.ts         # Vite configuration
.gitignore             # Git ignore rules
README.md              # Project documentation
CLAUDE.md              # AI assistant instructions
QUICK-START.md         # Quick start guide
DOCS_INDEX.md          # Documentation index
```

## Output and Results

### Successful Test Execution
```text
🧪 Testing project creation workflow...

📁 Creating test project: test-project-1699123456789
  Copying src...
  Copying public...
  Copying config...
  Copying scripts...
  Copying tools...
  Copying templates...
  Copying ai...
  Copying docs...
  Copying tests...

📦 Installing dependencies...
[npm install output shown here]

🚀 Testing npm run dev...
Dev server output:
 VITE v4.4.5  ready in 543 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose

✅ Project creation test completed successfully!
Test project created at: /path/to/test-project-1699123456789

To manually test, run:
  cd /path/to/test-project-1699123456789
  npm run dev
```

### Failed Test Example
```text
🧪 Testing project creation workflow...

📁 Creating test project: test-project-1699123456789
  Copying src...
  Copying public...

❌ Project creation test failed: ENOENT: no such file or directory, open 'package.json'
```

### Exit Codes
- `0`: Test completed successfully
- `1`: Test failed due to error

## Error Handling and Troubleshooting

### Common Issues

#### Missing Template Files
**Symptoms**: "ENOENT: no such file or directory" errors during copying  
**Cause**: Template structure incomplete or script run from wrong directory  
**Solutions**:
```bash
# Verify you're in project root
pwd
ls -la src/ public/ package.json

# Check template structure
ls -la templates/
```

#### npm install Failures
**Symptoms**: Dependencies fail to install  
**Causes**: Network issues, registry problems, incompatible Node.js version  
**Solutions**:
```bash
# Check Node.js version
node --version
npm --version

# Clear npm cache
npm cache clean --force

# Try with different registry
npm install --registry https://registry.npmjs.org/
```

#### Development Server Startup Fails
**Symptoms**: Dev server doesn't start or crashes immediately  
**Causes**: Port conflicts, configuration errors, missing dependencies  
**Solutions**:
```bash
# Check for port conflicts
lsof -i :5173
lsof -i :3000

# Test Vite config manually
npx vite --config vite.config.ts

# Check for missing peer dependencies
npm ls
```

#### Permission Errors
**Symptoms**: EACCES errors during file operations  
**Solutions**:
```bash
# Fix script permissions
chmod +x scripts/test-project-creation.js

# Check directory permissions
ls -la scripts/

# Ensure write access to parent directory
touch test-file && rm test-file
```

### Debug Mode
For troubleshooting, modify the script temporarily:
```javascript
// Add this before execSync calls to see full output
{ stdio: 'inherit' }  // Instead of 'pipe'

// Comment out cleanup section to inspect test project
// if (fs.existsSync(testProjectPath)) {
//   fs.rmSync(testProjectPath, { recursive: true, force: true });
// }
```

## Integration with Development Workflow

### NPM Scripts Integration
Add to `package.json`:
```json
{
  "scripts": {
    "test:project-creation": "node scripts/test-project-creation.js",
    "test:creation:debug": "node scripts/test-project-creation.js && echo 'Project left for inspection'"
  }
}
```

### Pre-commit Testing
```bash
# Add to pre-commit hooks to ensure template integrity
npm run test:project-creation
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Test Project Creation
  run: node scripts/test-project-creation.js
  
- name: Cleanup Test Artifacts
  if: always()
  run: rm -rf test-project-*
```

### Development Workflow
```bash
# Test after making template changes
git add .
npm run test:project-creation

# Test before releasing new template version
npm run test:project-creation
npm run test:integration  # Run both together
```

## Development and Contributing

### Script Architecture
```javascript
// 1. Setup phase
fs.mkdirSync(testProjectPath, { recursive: true });

// 2. File copying with selective exclusion
itemsToCopy.forEach((item) => {
  copyRecursive(sourcePath, targetPath);
});

// 3. Package.json customization
const newPackageJson = {
  ...templatePackageJson,
  name: testProjectName,
  // ... customizations
};

// 4. Testing and validation
execSync('npm install', { cwd: testProjectPath });
execSync('timeout 10s npm run dev || true', { cwd: testProjectPath });

// 5. Cleanup
fs.rmSync(testProjectPath, { recursive: true, force: true });
```

### Modifying the Test

#### Adding New Files to Copy
```javascript
const itemsToCopy = [
  // ... existing items
  'new-directory',
  'new-config-file.json'
];
```

#### Changing Package.json Customization
```javascript
// Add new script removals
delete newPackageJson.scripts['your-template-script'];

// Add new script modifications
newPackageJson.scripts['your-script'] = 'modified-command';
```

#### Extending Validation Logic
```javascript
// Add after dev server test
console.log('\n🧪 Testing additional functionality...');
const buildOutput = execSync('npm run build', { 
  cwd: testProjectPath, 
  stdio: 'pipe',
  encoding: 'utf8'
});

if (buildOutput.includes('dist/index.html')) {
  console.log('  ✅ Build test passed');
} else {
  console.log('  ❌ Build test failed');
}
```

### Best Practices
- Always use unique project names with timestamps
- Copy only necessary files to speed up tests
- Remove template-specific scripts that won't work in test projects
- Test actual functionality (dev server), not just file existence
- Always clean up, even when tests fail
- Use timeouts to prevent hanging tests

## Related Tools and Documentation

- **integration-tests.js**: Comprehensive integration test suite
- **create-project.js**: Actual project creation implementation  
- **template-customizer.js**: Framework-specific customization tool
- **Project Creation Guide**: docs/guides/setup/creating-projects.md

---

**Last Updated**: 2025-07-12  
**Script Version**: Current  
**Maintainer**: ProjectTemplate Team  
**Support**: See CLAUDE.md for development guidelines