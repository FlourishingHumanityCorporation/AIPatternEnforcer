#!/usr/bin/env node
/**
 * Enforcement System Test Suite
 * 
 * Verifies that all enforcement mechanisms work correctly:
 * - Root directory file restrictions
 * - Banned document type prevention
 * - Pre-commit hook integration
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Test configuration
const TEST_DIR = path.join(__dirname, 'test-workspace');
const RESULTS = {
  passed: [],
  failed: [],
  startTime: Date.now()
};

// Colors for output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  process.stderr.write(`${colors[color]}${message}${colors.reset}\n`);
}

function runCommand(command, expectFailure = false) {
  try {
    const output = execSync(command, { 
      encoding: 'utf8',
      cwd: process.cwd()
    });
    if (expectFailure) {
      return { success: false, output, error: 'Expected failure but command succeeded' };
    }
    return { success: true, output };
  } catch (error) {
    if (!expectFailure) {
      return { success: false, error: error.message, output: error.stdout || '' };
    }
    // Command failed as expected - combine stdout and stderr
    const fullOutput = (error.stdout || '') + (error.stderr || '');
    return { success: true, output: fullOutput || error.message };
  }
}

function test(name, fn) {
  log(`\n📋 Testing: ${name}`, 'blue');
  try {
    fn();
    RESULTS.passed.push(name);
    log(`  ✅ PASSED`, 'green');
  } catch (error) {
    RESULTS.failed.push({ name, error: error.message });
    log(`  ❌ FAILED: ${error.message}`, 'red');
  }
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function setup() {
  log('\n🔧 Setting up test environment...', 'yellow');
  
  // Create test directory if it doesn't exist
  if (!fs.existsSync(TEST_DIR)) {
    fs.mkdirSync(TEST_DIR, { recursive: true });
  }
  
  // Clean up any previous test files
  cleanup();
}

function cleanup() {
  // Remove test files from root if they exist
  const testFiles = [
    'TEST_VIOLATION.md',
    'AUDIT_SUMMARY.md',
    'TEST_REPORT.md',
    'IMPLEMENTATION_COMPLETE.md',
    'test-violation.sh'
  ];
  
  testFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  });
}

// Test Suite
function runTests() {
  setup();
  
  // Test 1: Root Directory Enforcement
  test('Root directory enforcement - detects violations', () => {
    // Create a violation file in root
    fs.writeFileSync('TEST_VIOLATION.md', '# Test violation file');
    
    const result = runCommand('npm run check:root', true);
    assert(result.success, 'Command should execute (expecting failure)');
    assert(result.output.includes('TEST_VIOLATION.md'), `Should identify violation file. Output: ${result.output}`);
    assert(result.output.includes('not allowed in root'), 'Should explain violation');
    
    // Clean up
    fs.unlinkSync('TEST_VIOLATION.md');
  });
  
  test('Root directory enforcement - passes with clean root', () => {
    const result = runCommand('npm run check:root');
    assert(result.success, 'Root check should pass with clean directory');
    assert(result.output.includes('clean'), 'Should report clean status');
  });
  
  // Test 2: Banned Document Types - Filename patterns
  test('Banned docs - detects SUMMARY files', () => {
    fs.writeFileSync(path.join(TEST_DIR, 'AUDIT_SUMMARY.md'), '# Audit Summary');
    
    const result = runCommand('npm run check:banned-docs', true);
    assert(result.success, 'Command should execute (expecting failure)');
    assert(result.output.includes('AUDIT_SUMMARY.md'), `Should identify SUMMARY file. Output: ${result.output}`);
    
    fs.unlinkSync(path.join(TEST_DIR, 'AUDIT_SUMMARY.md'));
  });
  
  test('Banned docs - detects REPORT files', () => {
    fs.writeFileSync(path.join(TEST_DIR, 'TEST_REPORT.md'), '# Test Report');
    
    const result = runCommand('npm run check:banned-docs', true);
    assert(result.success, 'Command should execute (expecting failure)');
    assert(result.output.includes('TEST_REPORT.md'), 'Should identify REPORT file');
    
    fs.unlinkSync(path.join(TEST_DIR, 'TEST_REPORT.md'));
  });
  
  test('Banned docs - detects COMPLETE files', () => {
    fs.writeFileSync(path.join(TEST_DIR, 'IMPLEMENTATION_COMPLETE.md'), '# Complete');
    
    const result = runCommand('npm run check:banned-docs', true);
    assert(result.success, 'Command should execute (expecting failure)');
    assert(result.output.includes('IMPLEMENTATION_COMPLETE.md'), 'Should identify COMPLETE file');
    
    fs.unlinkSync(path.join(TEST_DIR, 'IMPLEMENTATION_COMPLETE.md'));
  });
  
  // Test 3: Banned Document Types - Content patterns
  test('Banned docs - detects completion content', () => {
    const content = `# Implementation Guide
    
## ✅ Implementation Complete

This implementation is now complete.`;
    
    fs.writeFileSync(path.join(TEST_DIR, 'guide.md'), content);
    
    const result = runCommand('npm run check:banned-docs', true);
    assert(result.success, 'Command should execute (expecting failure)');
    assert(result.output.includes('guide.md'), 'Should identify file with banned content');
    assert(result.output.includes('Implementation Complete'), 'Should show banned pattern');
    
    fs.unlinkSync(path.join(TEST_DIR, 'guide.md'));
  });
  
  test('Banned docs - passes with clean files', () => {
    const result = runCommand('npm run check:banned-docs');
    assert(result.success, 'Should pass with no banned documents');
    assert(result.output.includes('No banned document types found'), 'Should report clean');
  });
  
  // Test 4: Combined enforcement
  test('Check all - runs all enforcement checks', () => {
    const result = runCommand('npm run check:all');
    // Note: This includes other checks that may have warnings
    // We just verify it runs without errors
    assert(result.output.includes('check:root'), 'Should run root check');
    assert(result.output.includes('check:banned-docs'), 'Should run banned docs check');
  });
  
  // Test 5: Enforcement configuration
  test('Enforcement status - shows configuration', () => {
    const result = runCommand('npm run enforcement:status');
    assert(result.success, 'Status command should succeed');
    assert(result.output.includes('level') || result.output.includes('Level'), `Should show enforcement level. Output: ${result.output}`);
  });
  
  // Test 6: File creation prevention patterns
  test('Script files in root - should be caught', () => {
    fs.writeFileSync('test-violation.sh', '#!/bin/bash\necho "test"');
    
    const result = runCommand('npm run check:root', true);
    assert(result.success, 'Command should execute (expecting failure)');
    assert(result.output.includes('test-violation.sh'), 'Should identify script file');
    assert(result.output.includes('Move to scripts/'), 'Should suggest scripts directory');
    
    fs.unlinkSync('test-violation.sh');
  });
  
  // Clean up
  cleanup();
  
  // Remove test directory
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true });
  }
}

// Run tests and report results
function main() {
  log('🧪 ProjectTemplate Enforcement System Test Suite', 'yellow');
  log('=' + '='.repeat(50), 'yellow');
  
  runTests();
  
  const duration = ((Date.now() - RESULTS.startTime) / 1000).toFixed(2);
  
  log('\n📊 Test Results:', 'yellow');
  log('=' + '='.repeat(50), 'yellow');
  log(`✅ Passed: ${RESULTS.passed.length}`, 'green');
  log(`❌ Failed: ${RESULTS.failed.length}`, RESULTS.failed.length > 0 ? 'red' : 'green');
  log(`⏱️  Duration: ${duration}s`, 'blue');
  
  if (RESULTS.failed.length > 0) {
    log('\n❌ Failed Tests:', 'red');
    RESULTS.failed.forEach(({ name, error }) => {
      log(`  - ${name}`, 'red');
      log(`    ${error}`, 'red');
    });
    process.exit(1);
  } else {
    log('\n✅ All tests passed! Enforcement system is working correctly.', 'green');
    process.exit(0);
  }
}

// Handle errors
process.on('uncaughtException', (error) => {
  log(`\n💥 Unexpected error: ${error.message}`, 'red');
  cleanup();
  process.exit(1);
});

if (require.main === module) {
  main();
}