#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { ConfigEnforcer } = require('../../../tools/enforcement/config-enforcer/index');
const JsonValidator = require('../../../tools/enforcement/config-enforcer/validators/json-validator');
const EnvValidator = require('../../../tools/enforcement/config-enforcer/validators/env-validator');
const JsConfigValidator = require('../../../tools/enforcement/config-enforcer/validators/js-config-validator');

/**
 * Comprehensive test suite for Config Enforcer
 */

// Test data directory
const testDataDir = path.join(__dirname, '.test-files');

// Ensure test data directory exists
if (!fs.existsSync(testDataDir)) {
  fs.mkdirSync(testDataDir, { recursive: true });
}

/**
 * Test utilities
 */
function createTestFile(filename, content) {
  // Ensure test data directory exists
  if (!fs.existsSync(testDataDir)) {
    fs.mkdirSync(testDataDir, { recursive: true });
  }
  
  const filePath = path.join(testDataDir, filename);
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
}

function cleanupTestFiles() {
  if (fs.existsSync(testDataDir)) {
    fs.rmSync(testDataDir, { recursive: true, force: true });
  }
}

/**
 * Test ConfigEnforcer main class
 */
async function testConfigEnforcerCore() {
  console.log('Testing ConfigEnforcer core functionality...');

  // Test 1: Basic instantiation
  const enforcer = new ConfigEnforcer({
    config: {
      enabled: true,
      enforcementLevel: 'WARNING'
    }
  });

  assert(enforcer.config.enabled === true, 'Config should be enabled');
  assert(enforcer.config.enforcementLevel === 'WARNING', 'Enforcement level should be WARNING');

  // Test 2: Validator registration
  const jsonValidator = new JsonValidator(enforcer.config.fileTypes.json);
  enforcer.registerValidator('json', jsonValidator);
  
  assert(enforcer.validators.has('json'), 'JSON validator should be registered');

  console.log('✅ ConfigEnforcer core tests passed');
}

/**
 * Test JSON Validator
 */
async function testJsonValidator() {
  console.log('Testing JSON validator...');

  const config = {
    rules: {
      requireScripts: true,
      formatJson: true,
      validatePackageFields: true
    }
  };
  
  const validator = new JsonValidator(config);

  // Test 1: Valid package.json
  const validPackageJson = JSON.stringify({
    name: 'test-project',
    version: '1.0.0',
    description: 'Test project',
    scripts: {
      test: 'echo test',
      lint: 'echo lint'
    }
  }, null, 2);

  const validFile = createTestFile('package.json', validPackageJson);
  const validResult = await validator.validate(validFile);
  
  assert(validResult.isValid === true, 'Valid package.json should pass validation');

  // Test 2: Invalid package.json (missing required fields) - overwrite the test file
  const invalidPackageJson = JSON.stringify({
    name: 'test-project'
    // Missing version, description, scripts
  }, null, 2);

  fs.writeFileSync(validFile, invalidPackageJson, 'utf8'); // Overwrite the same file
  const invalidResult = await validator.validate(validFile);
  
  // The file is valid JSON but has validation violations for missing fields
  assert(invalidResult.violations.length > 0, 'Should have violations for missing fields');
  assert(invalidResult.fixes.length > 0, 'Should have fixes available');
  // Note: isValid might be true if only warnings, false if errors

  // Test 3: JSON formatting
  const unformattedJson = '{"name":"test","version":"1.0.0"}';
  const unformattedFile = createTestFile('unformatted.json', unformattedJson);
  const formatResult = await validator.validate(unformattedFile);
  
  assert(formatResult.violations.some(v => v.type === 'json_formatting'), 'Should detect formatting issues');

  console.log('✅ JSON validator tests passed');
}

/**
 * Test Environment Validator
 */
async function testEnvValidator() {
  console.log('Testing environment validator...');

  const config = {
    rules: {
      syncEnvExample: false,
      standardizeGitignore: true,
      fixLineEndings: true
    }
  };
  
  const validator = new EnvValidator(config);

  // Test 1: Valid .env.example
  const validEnvExample = `# Example environment variables
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
API_KEY=your_api_key_here
`;

  const envFile = createTestFile('.env.example', validEnvExample);
  const envResult = await validator.validate(envFile);
  
  assert(envResult.isValid === true, 'Valid .env.example should pass validation');

  // Test 2: .env.example with potential secrets
  const unsafeEnvExample = `NODE_ENV=development
API_KEY=sk_live_1234567890abcdef1234567890abcdef
SECRET_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
`;

  const unsafeFile = createTestFile('.env.example', unsafeEnvExample);
  const unsafeResult = await validator.validate(unsafeFile);
  
  // Should detect potential secrets regardless of overall validity
  assert(unsafeResult.violations.some(v => v.type === 'potential_secret'), 'Should detect potential secrets');

  // Test 3: Basic .gitignore
  const basicGitignore = `node_modules/
.env
dist/
*.log
`;

  const gitignoreFile = createTestFile('.gitignore', basicGitignore);
  const gitignoreResult = await validator.validate(gitignoreFile);
  
  // Should have some suggestions for additional patterns
  assert(gitignoreResult.violations.some(v => v.type === 'missing_project_patterns'), 'Should suggest ProjectTemplate patterns');

  console.log('✅ Environment validator tests passed');
}

/**
 * Test JavaScript Config Validator
 */
async function testJsConfigValidator() {
  console.log('Testing JavaScript config validator...');

  const config = {
    rules: {
      standardizeExports: false,
      validateStructure: true
    }
  };
  
  const validator = new JsConfigValidator(config);

  // Test 1: Valid Vite config
  const validViteConfig = `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist'
  },
  server: {
    port: 3000
  }
});
`;

  const viteFile = createTestFile('vite.config.js', validViteConfig);
  const viteResult = await validator.validate(viteFile);
  
  assert(viteResult.isValid === true, 'Valid Vite config should pass validation');

  // Test 2: Vite config without defineConfig - overwrite the same file
  const basicViteConfig = `import react from '@vitejs/plugin-react';

export default {
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
};
`;

  fs.writeFileSync(viteFile, basicViteConfig, 'utf8'); // Overwrite the same file
  const basicViteResult = await validator.validate(viteFile);
  
  assert(basicViteResult.violations.some(v => v.type === 'missing_define_config'), 'Should suggest defineConfig');

  // Test 3: Config with console.log
  const debugConfig = `console.log('Debug config loading');
export default {
  build: {
    outDir: 'dist'
  }
};
`;

  const debugFile = createTestFile('debug.config.js', debugConfig);
  const debugResult = await validator.validate(debugFile);
  
  assert(debugResult.violations.some(v => v.type === 'console_log_found'), 'Should detect console.log');
  assert(debugResult.fixes.some(f => f.type === 'remove_console_log'), 'Should offer to remove console.log');

  console.log('✅ JavaScript config validator tests passed');
}

/**
 * Test integration with full ConfigEnforcer
 */
async function testIntegration() {
  console.log('Testing full integration...');

  // Create test configuration files
  const testPackageJson = createTestFile('package.json', JSON.stringify({
    name: 'test-integration',
    version: '1.0.0'
    // Missing description and scripts - should trigger violations
  }, null, 2));

  const testEnvExample = createTestFile('.env.example', `NODE_ENV=development
# Missing other common variables
`);

  const testViteConfig = createTestFile('vite.config.js', `export default {
  build: { outDir: 'dist' }
};`);

  // Set up enforcer with test configuration
  const enforcer = new ConfigEnforcer({
    config: {
      enabled: true,
      enforcementLevel: 'WARNING',
      fileTypes: {
        json: {
          enabled: true,
          files: [path.join(testDataDir, 'package.json')],
          excludePatterns: [],
          rules: { requireScripts: true, formatJson: true, validatePackageFields: true }
        },
        environment: {
          enabled: true,
          files: [path.join(testDataDir, '.env.example')],
          excludePatterns: [],
          rules: { standardizeGitignore: true, fixLineEndings: true }
        },
        javascript: {
          enabled: true,
          files: [path.join(testDataDir, 'vite.config.js')],
          excludePatterns: [],
          rules: { standardizeExports: false, validateStructure: true }
        }
      }
    }
  });

  // Register validators
  enforcer.registerValidator('json', new JsonValidator(enforcer.config.fileTypes.json));
  enforcer.registerValidator('environment', new EnvValidator(enforcer.config.fileTypes.environment));
  enforcer.registerValidator('javascript', new JsConfigValidator(enforcer.config.fileTypes.javascript));

  // Run validation
  const result = await enforcer.validateAll();

  assert(result.success === false, 'Should find violations in test files');
  assert(result.violations.length > 0, 'Should have violations');
  assert(result.stats.filesAnalyzed > 0, 'Should analyze files');

  // Test auto-fix functionality
  const fixResult = await enforcer.applyFixes(true); // dry run
  assert(fixResult.success === true, 'Auto-fix should succeed');
  assert(fixResult.dryRun === true, 'Should be dry run');

  console.log('✅ Integration tests passed');
}

/**
 * Test error handling
 */
async function testErrorHandling() {
  console.log('Testing error handling...');

  const config = { rules: {} };
  const validator = new JsonValidator(config);

  // Test 1: Non-existent file
  const nonExistentFile = path.join(testDataDir, 'nonexistent.json');
  const result = await validator.validate(nonExistentFile);
  
  assert(result.isValid === false, 'Non-existent file should fail validation');
  assert(result.violations[0].type === 'file_missing', 'Should detect missing file');

  // Test 2: Invalid JSON
  const invalidJsonFile = createTestFile('invalid.json', '{ invalid json }');
  const invalidResult = await validator.validate(invalidJsonFile);
  
  assert(invalidResult.isValid === false, 'Invalid JSON should fail validation');
  assert(invalidResult.violations[0].type === 'json_parse_error', 'Should detect JSON parse error');

  console.log('✅ Error handling tests passed');
}

/**
 * Test performance and caching
 */
async function testPerformance() {
  console.log('Testing performance and caching...');

  // Create a test file
  const testFile = createTestFile('perf-test.json', JSON.stringify({
    name: 'performance-test',
    version: '1.0.0',
    description: 'Performance test'
  }, null, 2));

  const enforcer = new ConfigEnforcer();
  enforcer.registerValidator('json', new JsonValidator(enforcer.config.fileTypes.json));

  // First validation (no cache)
  const startTime1 = Date.now();
  await enforcer.validateFile({ path: testFile, type: 'json' });
  const time1 = Date.now() - startTime1;

  // Second validation (should use cache)
  const startTime2 = Date.now();
  const result2 = await enforcer.validateFile({ path: testFile, type: 'json' });
  const time2 = Date.now() - startTime2;

  assert(result2.fromCache === true, 'Second validation should use cache');
  assert(time2 <= time1, 'Cached validation should be faster or equal');

  console.log('✅ Performance tests passed');
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('🧪 Running Config Enforcer Test Suite\n');

  try {
    // Ensure clean state
    cleanupTestFiles();
    
    await testConfigEnforcerCore();
    await testJsonValidator();
    await testEnvValidator();
    await testJsConfigValidator();
    await testIntegration();
    await testErrorHandling();
    await testPerformance();

    console.log('\n🎉 All Config Enforcer tests passed!');
    return true;
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    return false;
  } finally {
    // Cleanup
    cleanupTestFiles();
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = {
  runAllTests,
  testConfigEnforcerCore,
  testJsonValidator,
  testEnvValidator,
  testJsConfigValidator,
  testIntegration,
  testErrorHandling,
  testPerformance
};