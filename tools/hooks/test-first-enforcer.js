#!/usr/bin/env node

/**
 * Claude Code Hook: Test-First Development Enforcer
 * 
 * Ensures that tests are written for new code components.
 * Addresses friction point 4.2 "Missing Test Coverage" from FRICTION-MAPPING.md.
 * 
 * Checks:
 * - Test files exist for new components
 * - Test coverage for new functions
 * - Integration tests for API routes
 * - Component tests for React components
 * 
 * Usage: Called by Claude Code after Write/Edit/MultiEdit operations
 * Returns: { status: 'ok' | 'blocked', message?: string }
 */

const fs = require('fs');
const path = require('path');

// File extensions that require tests
const TESTABLE_EXTENSIONS = new Set(['.js', '.ts', '.jsx', '.tsx', '.mjs']);

// Test patterns to look for
const TEST_PATTERNS = [
  /\.test\.(js|ts|jsx|tsx)$/,
  /\.spec\.(js|ts|jsx|tsx)$/,
  /__tests__\/.*\.(js|ts|jsx|tsx)$/
];

function findTestFile(filePath) {
  const dir = path.dirname(filePath);
  const basename = path.basename(filePath, path.extname(filePath));
  const ext = path.extname(filePath);
  
  // Common test file patterns
  const testPatterns = [
    path.join(dir, `${basename}.test${ext}`),
    path.join(dir, `${basename}.spec${ext}`),
    path.join(dir, '__tests__', `${basename}.test${ext}`),
    path.join(dir, '__tests__', `${basename}.spec${ext}`),
    path.join(dir, '..', '__tests__', `${basename}.test${ext}`),
    path.join(dir, '..', '__tests__', `${basename}.spec${ext}`)
  ];
  
  return testPatterns.find(testPath => fs.existsSync(testPath));
}

function analyzeTestRequirements(content, filePath) {
  const requirements = [];
  
  // Check for React components
  if (content.includes('export function') || content.includes('export default function') || 
      (content.includes('const') && content.includes('=> {')) || content.includes('React.Component')) {
    requirements.push({
      type: 'component',
      message: 'Component requires unit tests',
      suggestion: 'Create test file with render tests and prop validation'
    });
  }
  
  // Check for API routes (Next.js style)
  if (filePath.includes('/api/') && content.includes('export default')) {
    requirements.push({
      type: 'api',
      message: 'API route requires integration tests',
      suggestion: 'Create test file with request/response testing'
    });
  }
  
  // Check for utility functions
  if (content.includes('export function') || content.includes('export const')) {
    const functionCount = (content.match(/export (function|const)/g) || []).length;
    if (functionCount > 0) {
      requirements.push({
        type: 'utility',
        message: `${functionCount} exported function(s) require tests`,
        suggestion: 'Test all function inputs, outputs, and edge cases'
      });
    }
  }
  
  // Check for hooks (React)
  if ((content.includes('useState') || content.includes('useEffect') || content.includes('useCallback') || content.includes('useMemo')) && 
      content.includes('export')) {
    requirements.push({
      type: 'hook',
      message: 'Custom React hook requires tests',
      suggestion: 'Test hook behavior with React Testing Library hooks'
    });
  }
  
  return requirements;
}

function checkFile() {
  try {
    // Claude Code hooks receive JSON via stdin, not args
    let stdinData = '';
    
    // For command line testing, accept args
    if (process.argv.length > 2) {
      stdinData = process.argv[2];
    } else {
      // Read from stdin (real Claude Code execution)
      const fs = require('fs');
      try {
        stdinData = fs.readFileSync(0, 'utf8'); // Read from stdin
      } catch (e) {
        // Failed to read stdin, allow operation
        console.log(JSON.stringify({ status: 'ok' }));
        return;
      }
    }
    
    // Parse Claude Code hook input
    const input = JSON.parse(stdinData || '{}');
    
    // Extract file path from tool_input (Claude Code format)
    const filePath = input.tool_input?.file_path || input.file_path || '';
    const content = input.tool_input?.content || input.content || '';
    
    // Skip if no file path
    if (!filePath) {
      console.log(JSON.stringify({ status: 'ok' }));
      return;
    }
    
    // Skip non-testable files
    const ext = path.extname(filePath);
    if (!TESTABLE_EXTENSIONS.has(ext)) {
      console.log(JSON.stringify({ status: 'ok' }));
      return;
    }
    
    // Skip test files themselves
    if (TEST_PATTERNS.some(pattern => pattern.test(filePath))) {
      console.log(JSON.stringify({ status: 'ok' }));
      return;
    }
    
    // Skip certain directories that shouldn't require tests
    const skipDirs = ['/node_modules/', '/dist/', '/build/', '/.next/', '/coverage/', '/docs/', '/tools/', '/scripts/', '/config/'];
    if (skipDirs.some(dir => filePath.includes(dir))) {
      console.log(JSON.stringify({ status: 'ok' }));
      return;
    }
    
    // Skip configuration files
    const configFiles = ['.config.', 'tsconfig.', 'jest.config.', 'next.config.', 'tailwind.config.', 'postcss.config.'];
    if (configFiles.some(config => path.basename(filePath).includes(config))) {
      console.log(JSON.stringify({ status: 'ok' }));
      return;
    }
    
    // Skip if it's not a Write operation (for edits, assume tests might already exist)
    if (input.tool_name !== 'Write') {
      console.log(JSON.stringify({ status: 'ok' }));
      return;
    }
    
    // Get content from tool_input
    let fileContent = content;
    
    // If no content provided, try to read from file
    if (!fileContent && fs.existsSync(filePath)) {
      fileContent = fs.readFileSync(filePath, 'utf8');
    }
    
    // Skip if no content available
    if (!fileContent) {
      console.log(JSON.stringify({ status: 'ok' }));
      return;
    }
    
    // Analyze what tests are needed
    const requirements = analyzeTestRequirements(fileContent, filePath);
    
    // If no tests required, allow
    if (requirements.length === 0) {
      console.log(JSON.stringify({ status: 'ok' }));
      return;
    }
    
    // Check if test file exists
    const existingTestFile = findTestFile(filePath);
    
    if (existingTestFile) {
      // Test file exists, allow with note
      console.log(JSON.stringify({
        status: 'ok',
        message: `✅ Test file found: ${path.basename(existingTestFile)}`
      }));
      return;
    }
    
    // No test file found, suggest creation
    const testFileName = path.basename(filePath, path.extname(filePath)) + '.test' + path.extname(filePath);
    // For components, suggest co-located tests; for others, suggest __tests__ directory
    const isComponent = filePath.includes('/components/') || requirements.some(r => r.type === 'component');
    const testFilePath = isComponent 
      ? path.join(path.dirname(filePath), testFileName)
      : path.join(path.dirname(filePath), '__tests__', testFileName);
    
    let message = `🧪 Test coverage required for new components\n\n`;
    message += `❌ Missing test file for: ${path.basename(filePath)}\n\n`;
    message += `✅ Create test file: ${path.relative(process.cwd(), testFilePath)}\n\n`;
    message += `📋 Required test coverage:\n`;
    
    requirements.forEach(req => {
      message += `• ${req.message}\n`;
      if (req.suggestion) {
        message += `  💡 ${req.suggestion}\n`;
      }
    });
    
    message += `\n🚀 Quick start: npm run g:c ComponentName (includes tests)\n`;
    message += `📖 See docs/guides/testing/comprehensive-testing-guide.md for patterns`;
    
    console.log(JSON.stringify({
      status: 'blocked',
      message
    }));
    
  } catch (error) {
    // Always allow operation if hook fails - fail open
    console.log(JSON.stringify({ 
      status: 'ok',
      debug: `Test enforcer error: ${error.message}` 
    }));
  }
}

// Handle command line execution
if (require.main === module) {
  checkFile();
}

// Helper function for tests
function shouldRequireTests(filePath) {
  const ext = path.extname(filePath);
  if (!TESTABLE_EXTENSIONS.has(ext)) return false;
  
  // Skip test files themselves
  if (TEST_PATTERNS.some(pattern => pattern.test(filePath))) return false;
  
  // Skip certain directories
  const skipDirs = ['/node_modules/', '/dist/', '/build/', '/.next/', '/coverage/', '/docs/', '/tools/', '/scripts/', '/config/'];
  if (skipDirs.some(dir => filePath.includes(dir))) return false;
  
  // Require tests for components, utilities, hooks
  return filePath.includes('/components/') || 
         filePath.includes('/lib/') || 
         filePath.includes('/hooks/') || 
         filePath.includes('/utils/');
}

module.exports = { 
  checkFile, 
  findTestFile, 
  analyzeTestRequirements,
  TEST_PATTERNS,
  TESTABLE_PATTERNS: TEST_PATTERNS,  // Alias for tests
  TESTABLE_EXTENSIONS,
  shouldRequireTests
};