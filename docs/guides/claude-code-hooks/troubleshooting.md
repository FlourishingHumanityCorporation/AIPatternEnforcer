# Claude Code Hooks Troubleshooting Guide

This guide helps resolve common issues with the Claude Code hooks system and provides debugging strategies for optimal hook performance.

## Table of Contents

- [Common Issues](#common-issues)
- [Debugging Tools](#debugging-tools)
- [Performance Issues](#performance-issues)
- [False Positives](#false-positives)
- [Configuration Problems](#configuration-problems)
- [Integration Issues](#integration-issues)

## Common Issues

### Hook Not Running

**Symptoms**:
- Expected validations not occurring
- No hook output in logs
- Operations proceeding without checks

**Diagnosis**:
```bash
# Check hook configuration
cat .claude/settings.json

# Verify hook files exist
ls -la tools/hooks/

# Test hook manually
echo '{"file_path": "test.js", "content": "test"}' | node tools/hooks/security-scan.js
```

**Solutions**:
1. **Missing Configuration**:
   ```json
   {
     "hooks": {
       "preToolUse": [
         "./tools/hooks/security-scan.js",
         "./tools/hooks/scope-limiter.js", 
         "./tools/hooks/context-validator.js"
       ],
       "postToolUse": [
         "./tools/hooks/api-validator.js",
         "./tools/hooks/performance-checker.js"
       ]
     }
   }
   ```

2. **File Permissions**:
   ```bash
   chmod +x tools/hooks/*.js
   ```

3. **Missing Dependencies**:
   ```bash
   npm install
   ```

### Hook Execution Errors

**Symptoms**:
- Hook crashes with error messages
- "Hook failed" messages in logs
- Operations failing unexpectedly

**Diagnosis**:
```bash
# Run hook with debug output
DEBUG=* node tools/hooks/security-scan.js '{"file_path": "test.js", "content": "test"}'

# Check for syntax errors
node -c tools/hooks/security-scan.js

# Validate JSON input format
echo '{"file_path": "test.js", "content": "test"}' | jq .
```

**Solutions**:
1. **Malformed JSON Input**:
   ```javascript
   // ❌ Invalid JSON
   { file_path: "test.js" }
   
   // ✅ Valid JSON  
   { "file_path": "test.js" }
   ```

2. **Missing Node.js Modules**:
   ```bash
   npm install fs path
   ```

3. **Hook Code Errors**:
   ```javascript
   // Add error handling to custom hooks
   try {
     // Hook logic
     console.log(JSON.stringify({ status: 'ok' }));
   } catch (error) {
     // Fail open - allow operation if hook fails
     console.log(JSON.stringify({ 
       status: 'ok',
       debug: `Hook error: ${error.message}` 
     }));
   }
   ```

### Slow Hook Performance

**Symptoms**:
- Claude Code operations taking >5 seconds
- Timeout errors during file operations
- Poor development experience

**Diagnosis**:
```bash
# Run performance benchmarks
npm test tools/hooks/__tests__/performance-benchmark.test.js

# Time individual hooks
time echo '{"file_path": "test.js", "content": "test"}' | node tools/hooks/security-scan.js

# Check for resource usage
top -p $(pgrep node)
```

**Solutions**:
1. **Optimize Hook Patterns**:
   ```javascript
   // ❌ Inefficient regex
   const slowPattern = /.*very.*complex.*pattern.*/gi;
   
   // ✅ Optimized pattern
   const fastPattern = /specific.*pattern/gi;
   ```

2. **Reduce File I/O**:
   ```javascript
   // ❌ Multiple file reads
   const file1 = fs.readFileSync('file1.txt');
   const file2 = fs.readFileSync('file2.txt');
   
   // ✅ Cache or batch reads
   const files = ['file1.txt', 'file2.txt'].map(f => 
     fs.existsSync(f) ? fs.readFileSync(f) : null
   );
   ```

3. **Disable Expensive Hooks**:
   ```json
   {
     "hooks": {
       "preToolUse": [
         // Comment out slow hooks temporarily
         // "./tools/hooks/context-validator.js"
       ]
     }
   }
   ```

## Debugging Tools

### Manual Hook Testing

**Basic Test**:
```bash
# Test hook with simple input
echo '{"file_path": "test.js", "content": "console.log(\"test\");"}' | node tools/hooks/security-scan.js
```

**Expected Output**:
```json
{"status": "ok"}
```

**Complex Test**:
```bash
# Test with security issue
echo '{"file_path": "vuln.js", "content": "document.innerHTML = userInput;"}' | node tools/hooks/security-scan.js
```

**Expected Output**:
```json
{
  "status": "blocked",
  "message": "🔒 Security issues detected in vuln.js:\n\n🔴 Critical Issues:\n1. ❌ XSS vulnerability: innerHTML with user data\n   ✅ Use textContent or sanitize with DOMPurify\n\n💡 Fix critical issues before proceeding."
}
```

### Debug Logging

**Enable Debug Mode**:
```bash
# Enable debug output for all hooks
DEBUG=claude-hooks node tools/hooks/security-scan.js

# Enable debug for specific hook
DEBUG=security-scan node tools/hooks/security-scan.js
```

**Add Debug Logging to Hooks**:
```javascript
// Add to hook file
const debug = require('debug')('security-scan');

function checkFile(args) {
  debug('Starting security scan', { args });
  
  try {
    const input = JSON.parse(args[0] || '{}');
    debug('Parsed input', { input });
    
    // Hook logic
    debug('Scan completed successfully');
    
  } catch (error) {
    debug('Hook error', { error: error.message });
  }
}
```

### Performance Profiling

**Time Hook Execution**:
```bash
# Time all hooks in chain
time npm test tools/hooks/__tests__/performance-benchmark.test.js

# Profile specific hook
node --prof tools/hooks/security-scan.js '{"file_path": "test.js", "content": "test"}'
node --prof-process isolate-*.log > profile.txt
```

**Memory Usage**:
```javascript
// Add to hook for memory monitoring
process.on('exit', () => {
  const usage = process.memoryUsage();
  console.error('Memory usage:', {
    rss: Math.round(usage.rss / 1024 / 1024) + 'MB',
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB'
  });
});
```

## Performance Issues

### Hook Chain Too Slow

**Target**: <500ms total execution time  
**Current**: >1000ms

**Diagnosis**:
```bash
# Run performance benchmark
npm test tools/hooks/__tests__/performance-benchmark.test.js

# Identify slow hooks
time node tools/hooks/security-scan.js '{"file_path": "test.js", "content": "test"}'
time node tools/hooks/context-validator.js '{"file_path": "test.js", "content": "test"}'
```

**Solutions**:
1. **Optimize Regex Patterns**:
   ```javascript
   // ❌ Catastrophic backtracking
   const badPattern = /(a+)+b/;
   
   // ✅ Efficient pattern
   const goodPattern = /a+b/;
   ```

2. **Cache File System Operations**:
   ```javascript
   // Cache package.json reading
   let packageCache = null;
   function getPackageJson() {
     if (!packageCache) {
       packageCache = JSON.parse(fs.readFileSync('package.json', 'utf8'));
     }
     return packageCache;
   }
   ```

3. **Reduce Pattern Count**:
   ```javascript
   // ❌ Too many patterns
   const patterns = [ /* 50+ patterns */ ];
   
   // ✅ Essential patterns only
   const criticalPatterns = [ /* 10 key patterns */ ];
   ```

### Memory Leaks

**Symptoms**:
- Hook memory usage growing over time
- System becoming unresponsive
- Out of memory errors

**Diagnosis**:
```bash
# Monitor memory during hook execution
node --inspect tools/hooks/security-scan.js
# Open chrome://inspect in browser
```

**Solutions**:
1. **Clear Regex Caches**:
   ```javascript
   // Clear regex lastIndex after use
   pattern.lastIndex = 0;
   ```

2. **Avoid Global Variables**:
   ```javascript
   // ❌ Global state
   let globalCache = {};
   
   // ✅ Local scope
   function processFile(content) {
     const localCache = {};
     // Process and clean up
   }
   ```

## False Positives

### Context Validator Too Strict

**Issue**: Legitimate operations being blocked due to insufficient context score.

**Diagnosis**:
```bash
# Test context scoring
echo '{"tool": "Write", "file_path": "test.js", "prompt": "minimal context", "content": "test"}' | node tools/hooks/context-validator.js
```

**Solutions**:
1. **Adjust Thresholds**:
   ```javascript
   // In context-validator.js
   const CONTEXT_REQUIREMENTS = {
     newFile: 12,    // Reduced from 15
     editFile: 8,    // Reduced from 10
     complex: 18     // Reduced from 20
   };
   ```

2. **Improve Context Detection**:
   ```javascript
   // Add more context pattern recognition
   const CONTEXT_PATTERNS = [
     /follows.*pattern.*@/gi,         // Architecture refs
     /integrate.*with.*@/gi,          // Integration context
     /using.*existing.*@/gi,          // Dependency context
     // Add project-specific patterns
   ];
   ```

### Security Scanner False Alarms

**Issue**: Secure code being flagged as vulnerable.

**Common False Positives**:
```javascript
// ❌ Falsely flagged as innerHTML vulnerability
element.innerHTML = sanitizedHTML; // Actually safe

// ❌ Falsely flagged as eval vulnerability  
const func = new Function('return 42'); // Safe constant
```

**Solutions**:
1. **Improve Pattern Specificity**:
   ```javascript
   // ❌ Too broad pattern
   /innerHTML.*=/gi
   
   // ✅ More specific pattern
   /innerHTML\s*=\s*[^'"`]*\+|innerHTML\s*=.*userInput/gi
   ```

2. **Add Allowlist Patterns**:
   ```javascript
   const SAFE_PATTERNS = [
     /innerHTML\s*=\s*sanitize\(/gi,
     /innerHTML\s*=\s*DOMPurify\.sanitize\(/gi
   ];
   ```

### Performance Checker Over-Optimization

**Issue**: Necessary complexity being flagged as performance issues.

**Solutions**:
1. **Context-Aware Detection**:
   ```javascript
   // Allow complexity in test files
   if (filePath.includes('.test.') || filePath.includes('__tests__')) {
     return { status: 'ok' };
   }
   ```

2. **Severity-Based Blocking**:
   ```javascript
   // Only block high severity issues
   const highSeverityIssues = issues.filter(i => i.severity === 'high');
   if (highSeverityIssues.length === 0) {
     return { status: 'ok' };
   }
   ```

## Configuration Problems

### Hooks Not Loading

**Check Configuration Path**:
```bash
# Verify .claude directory exists
ls -la .claude/

# Check settings.json syntax
cat .claude/settings.json | jq .

# Verify hook file paths
ls -la $(cat .claude/settings.json | jq -r '.hooks.preToolUse[]')
```

**Fix Common Issues**:
1. **Wrong Path Separators**:
   ```json
   // ❌ Windows paths on Unix
   ".\\tools\\hooks\\security-scan.js"
   
   // ✅ Relative paths  
   "./tools/hooks/security-scan.js"
   ```

2. **Missing Execute Permissions**:
   ```bash
   chmod +x tools/hooks/*.js
   ```

### Environment Variables

**Missing Environment Setup**:
```bash
# Check for required environment variables
echo $NODE_ENV
echo $DEBUG

# Set up development environment
export NODE_ENV=development
export DEBUG=claude-hooks
```

**Hook Environment Issues**:
```javascript
// Ensure hooks work in different environments
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Adjust behavior based on environment
if (isDevelopment) {
  // More verbose logging
  // Stricter validations
}
```

## Integration Issues

### IDE Integration Problems

**VS Code with Claude**:
1. **Check Extension Settings**:
   - Verify Claude extension is enabled
   - Check hook configuration in settings.json
   - Restart VS Code after hook changes

2. **Debug Extension Integration**:
   ```bash
   # Check extension logs
   # VS Code → Help → Toggle Developer Tools → Console
   ```

**Cursor IDE Issues**:
1. **Hook Configuration**:
   - Ensure .cursorrules file exists
   - Check hook integration settings
   - Verify file paths are correct

2. **Permission Issues**:
   ```bash
   # Fix hook permissions
   chmod +x tools/hooks/*.js
   chown $(whoami) tools/hooks/*.js
   ```

### CI/CD Integration

**GitHub Actions**:
```yaml
# .github/workflows/test-hooks.yml
name: Test Claude Hooks
on: [push, pull_request]

jobs:
  test-hooks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test tools/hooks/__tests__/
```

**Pre-commit Hooks**:
```bash
# .husky/pre-commit
#!/bin/sh
npm test tools/hooks/__tests__/ || exit 1
```

### API Integration

**Claude API Direct Usage**:
```javascript
// Test hooks with API responses
const response = await fetch('/api/claude', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    hooks: {
      preToolUse: ['./tools/hooks/security-scan.js']
    },
    operation: {
      tool: 'Write',
      file_path: 'test.js',
      content: 'test content'
    }
  })
});
```

## Getting Help

### Diagnostic Commands

**Full System Check**:
```bash
# Run comprehensive diagnostics
npm run hook:diagnose

# Check all hook tests
npm test tools/hooks/__tests__/

# Validate configuration
npm run hook:validate-config
```

**Generate Debug Report**:
```bash
# Create debug report for support
npm run hook:debug-report > debug-report.txt
```

### Support Resources

- **Documentation**: `docs/guides/claude-code-hooks/`
- **Examples**: `ai/examples/claude-code-hooks/`
- **Test Cases**: `tools/hooks/__tests__/`
- **Issue Tracker**: GitHub repository issues
- **Performance Monitor**: `npm run hook:benchmark`

### Creating Custom Hooks

**Template for New Hook**:
```javascript
#!/usr/bin/env node

/**
 * Custom Claude Code Hook Template
 */

function checkFile(args) {
  try {
    const input = JSON.parse(args[0] || '{}');
    const filePath = input.file_path || '';
    const content = input.content || '';
    
    // Your validation logic here
    
    // Return success
    console.log(JSON.stringify({ status: 'ok' }));
    
  } catch (error) {
    // Always fail open
    console.log(JSON.stringify({ 
      status: 'ok',
      debug: `Hook error: ${error.message}` 
    }));
  }
}

if (require.main === module) {
  checkFile(process.argv.slice(2));
}

module.exports = { checkFile };
```

**Testing Custom Hook**:
```bash
# Test your custom hook
echo '{"file_path": "test.js", "content": "test"}' | node tools/hooks/custom-hook.js

# Add to test suite
cp tools/hooks/__tests__/security-scan.test.js tools/hooks/__tests__/custom-hook.test.js
# Edit test file for your hook
```

Remember: Hooks should **fail open** - if a hook encounters an error, it should allow the operation to proceed rather than block development. This ensures that the hooks enhance the development experience without creating friction.