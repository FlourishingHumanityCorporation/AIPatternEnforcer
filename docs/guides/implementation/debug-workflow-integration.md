# Debug Workflow Integration Guide

**Bridge the gap between AI assistance and runtime debugging with integrated workflows.**

## Overview

This guide implements debugging workflows that work seamlessly with AI tools, providing runtime context and systematic
debugging patterns. Setup time: 15-20 minutes.

## Table of Contents

1. [Quick Setup](#quick-setup)
2. [Runtime Context Capture](#runtime-context-capture)
3. [AI-Enhanced Debugging](#ai-enhanced-debugging)
4. [Test-Debug Integration](#test-debug-integration)
5. [Arrow-Chain Workflow](#arrow-chain-workflow)
6. [Troubleshooting](#troubleshooting)

## Quick Setup

```bash
# 1. Install debug utilities
npm run setup:debug-tools

# 2. Configure debug snapshot
npm run debug:config

# 3. Set up AI debug context
cp ai/config/debug-context.rules .cursorrules.append

# 4. Verify setup
npm run debug:test
```

## Runtime Context Capture

### Problem: AI Can't See Runtime State

**Solution**: Capture and serialize runtime state for AI analysis.

```javascript
// tools/debug/runtime-capture.js
const fs = require('fs');
const path = require('path');
const util = require('util');

class RuntimeCapture {
  constructor() {
    this.captures = [];
    this.outputDir = path.join(process.cwd(), '.debug-snapshots');
    fs.mkdirSync(this.outputDir, { recursive: true });
  }

  capture(label, data, options = {}) {
    const timestamp = new Date().toISOString();
    const capture = {
      label,
      timestamp,
      data: this.serialize(data),
      stack: new Error().stack,
      ...options
    };

    this.captures.push(capture);
    
    if (options.immediate) {
      this.save(label);
    }

    return capture;
  }

  serialize(data) {
    try {
      // Handle circular references and functions
      return JSON.stringify(data, (key, value) => {
        if (typeof value === 'function') {
          return `[Function: ${value.name || 'anonymous'}]`;
        }
        if (value instanceof Error) {
          return {
            _type: 'Error',
            message: value.message,
            stack: value.stack
          };
        }
        return value;
      }, 2);
    } catch (error) {
      // Fallback to util.inspect for complex objects
      return util.inspect(data, { 
        depth: 5, 
        colors: false,
        maxArrayLength: 100 
      });
    }
  }

  save(label = 'debug') {
    const filename = `${label}-${Date.now()}.json`;
    const filepath = path.join(this.outputDir, filename);
    
    fs.writeFileSync(filepath, JSON.stringify({
      session: {
        startTime: this.captures[0]?.timestamp,
        endTime: new Date().toISOString(),
        totalCaptures: this.captures.length
      },
      captures: this.captures
    }, null, 2));

    console.log(`Debug snapshot saved: ${filepath}`);
    return filepath;
  }

  generateAIContext() {
    return {
      summary: `Debug session with ${this.captures.length} captures`,
      timeline: this.captures.map(c => ({
        time: c.timestamp,
        label: c.label,
        hasError: c.data.includes('Error')
      })),
      lastCapture: this.captures[this.captures.length - 1]
    };
  }
}

// Global instance
global.debugCapture = new RuntimeCapture();

// Convenience function
global.debug = (label, data) => {
  return global.debugCapture.capture(label, data, { immediate: true });
};

module.exports = RuntimeCapture;
```

### Integration with Error Boundaries

```typescript
// src/components/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class DebugErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    // Capture error for AI debugging
    if (typeof window !== 'undefined' && window.debug) {
      window.debug('ErrorBoundary', {
        error: {
          message: error.message,
          stack: error.stack,
          componentStack: error.componentStack
        },
        timestamp: new Date().toISOString()
      });
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Send to debug snapshot
    fetch('/api/debug/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'react-error',
        error: {
          message: error.message,
          stack: error.stack
        },
        errorInfo,
        url: window.location.href,
        userAgent: navigator.userAgent
      })
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-boundary">
          <h2>Debug Information Captured</h2>
          <p>Error details saved to: .debug-snapshots/</p>
          <pre>{this.state.error?.message}</pre>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## AI-Enhanced Debugging

### Debug Command Integration

```bash
# scripts/ai-debug.sh
#!/bin/bash

# Capture current state and generate AI context
echo "🔍 Capturing debug snapshot..."
npm run debug:snapshot

# Get the latest snapshot
SNAPSHOT=$(ls -t .debug-snapshots/*.json | head -1)

# Generate AI-friendly summary
echo "📊 Generating AI context..."
node -e "
const fs = require('fs');
const snapshot = JSON.parse(fs.readFileSync('$SNAPSHOT'));

console.log('\\n=== DEBUG CONTEXT FOR AI ===\\n');
console.log('Error Summary:');
snapshot.captures
  .filter(c => c.data.includes('Error'))
  .forEach(c => {
    console.log(\`- \${c.label} at \${c.timestamp}\`);
  });

console.log('\\nLast 5 Events:');
snapshot.captures.slice(-5).forEach(c => {
  console.log(\`- \${c.label}: \${c.timestamp}\`);
});

console.log('\\nRecommended prompts:');
console.log('1. \"Debug the error in ' + snapshot.captures.find(c => c.data.includes('Error'))?.label + '\"');
console.log('2. \"Analyze the state progression from ' + snapshot.captures[0].label + ' to error\"');
console.log('3. \"Identify the root cause using Arrow-Chain analysis\"');
"

# Open in AI tool with context
echo "
💡 To debug with AI:
1. Copy the debug context above
2. Include: $SNAPSHOT
3. Use Arrow-Chain methodology
"
```

### AI Debug Prompts

```markdown
# ai/prompts/debug-templates.md

## Debug Analysis Template

Given this debug snapshot: [paste snapshot]

Please analyze using Arrow-Chain methodology:

1. **Symptom Identification**
   - What is the observable error/issue?
   - When does it occur?

2. **Trace Analysis**  
   - Follow the execution path in the snapshot
   - Identify state changes

3. **Arrow Chain**
   ```
   Initial State → Transformation 1 → State 2 → ... → Error State
   ```

4. **Root Cause Hypothesis**
   - What is the most likely root cause?
   - What evidence supports this?

5. **Fix Recommendation**
   - Specific code changes needed
   - How to prevent recurrence
```

## Test-Debug Integration

### Debugging Test Failures

```javascript
// tools/debug/test-debugger.js
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

class TestDebugger {
  async debugFailedTest(testPath, testName) {
    console.log('🧪 Running test with debug capture...');
    
    // Set up debug environment
    process.env.DEBUG_CAPTURE = 'true';
    process.env.DEBUG_TEST = testName;
    
    // Run test with debugging
    const testProcess = spawn('npm', ['test', '--', testPath], {
      env: { ...process.env },
      stdio: 'pipe'
    });

    let output = '';
    let errorOutput = '';

    testProcess.stdout.on('data', (data) => {
      output += data.toString();
      process.stdout.write(data);
    });

    testProcess.stderr.on('data', (data) => {
      errorOutput += data.toString();
      process.stderr.write(data);
    });

    return new Promise((resolve) => {
      testProcess.on('close', (code) => {
        if (code !== 0) {
          // Save debug info
          const debugInfo = {
            testPath,
            testName,
            exitCode: code,
            output,
            errorOutput,
            timestamp: new Date().toISOString()
          };

          const debugPath = path.join('.debug-snapshots', `test-${Date.now()}.json`);
          fs.writeFileSync(debugPath, JSON.stringify(debugInfo, null, 2));

          console.log(`\n📁 Test debug info saved: ${debugPath}`);
          console.log('🤖 Use this with AI: npm run ai:debug-test ' + debugPath);
        }
        resolve(code);
      });
    });
  }
}

// CLI interface
if (require.main === module) {
  const [testPath, testName] = process.argv.slice(2);
  if (!testPath) {
    console.error('Usage: node test-debugger.js <test-path> [test-name]');
    process.exit(1);
  }

  const debugger = new TestDebugger();
  debugger.debugFailedTest(testPath, testName);
}
```

### Test Snapshot Integration

```typescript
// src/test-utils/debug-helpers.ts
import { RuntimeCapture } from '@/tools/debug/runtime-capture';

export const debugSnapshot = (label: string, data: any) => {
  if (process.env.DEBUG_CAPTURE === 'true') {
    const capture = new RuntimeCapture();
    capture.capture(label, data, { 
      testName: expect.getState().currentTestName,
      immediate: true 
    });
  }
};

export const withDebugContext = (testFn: Function) => {
  return async (...args: any[]) => {
    const capture = new RuntimeCapture();
    
    try {
      capture.capture('test-start', { args });
      const result = await testFn(...args);
      capture.capture('test-complete', { result });
      return result;
    } catch (error) {
      capture.capture('test-error', { error });
      capture.save('test-failure');
      throw error;
    }
  };
};

// Usage in tests
describe('UserProfile', () => {
  it('should update user data', withDebugContext(async () => {
    debugSnapshot('initial-state', { user });
    
    const result = await updateUser(userId, newData);
    debugSnapshot('after-update', { result });
    
    expect(result.name).toBe(newData.name);
  }));
});
```

## Arrow-Chain Workflow

### Systematic Debugging Process

```javascript
// tools/debug/arrow-chain.js
class ArrowChainDebugger {
  constructor() {
    this.chain = [];
  }

  addLink(label, state, transformation = null) {
    this.chain.push({
      label,
      state: this.captureState(state),
      transformation,
      timestamp: new Date().toISOString()
    });
  }

  captureState(state) {
    return {
      type: typeof state,
      value: JSON.parse(JSON.stringify(state)),
      keys: typeof state === 'object' ? Object.keys(state) : null
    };
  }

  analyze() {
    const analysis = {
      chain: this.chain.map((link, i) => ({
        step: i + 1,
        label: link.label,
        transformation: link.transformation,
        stateChange: i > 0 ? this.diffStates(this.chain[i-1].state, link.state) : null
      })),
      issues: this.findIssues(),
      recommendation: this.generateRecommendation()
    };

    return analysis;
  }

  findIssues() {
    const issues = [];
    
    this.chain.forEach((link, i) => {
      // Check for null/undefined
      if (link.state.value === null || link.state.value === undefined) {
        issues.push({
          step: i + 1,
          type: 'null-state',
          message: `State became ${link.state.value} at step ${i + 1}`
        });
      }
      
      // Check for type changes
      if (i > 0 && link.state.type !== this.chain[i-1].state.type) {
        issues.push({
          step: i + 1,
          type: 'type-change',
          message: `Type changed from ${this.chain[i-1].state.type} to ${link.state.type}`
        });
      }
    });
    
    return issues;
  }

  generateReport() {
    const analysis = this.analyze();
    
    return `
# Arrow-Chain Debug Report

## Execution Flow
${analysis.chain.map(step => 
  `${step.step}. ${step.label}${step.transformation ? ` → ${step.transformation}` : ''}`
).join('\n')}

## State Changes
${analysis.chain.map(step => 
  step.stateChange ? `Step ${step.step}: ${JSON.stringify(step.stateChange)}` : ''
).filter(Boolean).join('\n')}

## Issues Found
${analysis.issues.map(issue => 
  `- Step ${issue.step}: ${issue.message} (${issue.type})`
).join('\n') || 'No issues detected'}

## AI Debug Prompt
\`\`\`
Analyze this execution chain and identify the root cause:
${JSON.stringify(this.chain, null, 2)}
\`\`\`
    `;
  }
}

// Export for global use
module.exports = ArrowChainDebugger;
global.ArrowChain = ArrowChainDebugger;
```

## Troubleshooting

### Common Issues

**Issue**: Debug snapshots too large  
**Solution**: Configure size limits

```javascript
// .debug-config.js
module.exports = {
  maxSnapshotSize: 10 * 1024 * 1024, // 10MB
  maxArrayLength: 1000,
  maxDepth: 5,
  excludePatterns: [
    'node_modules',
    'coverage',
    '.git'
  ]
};
```

**Issue**: Sensitive data in snapshots  
**Solution**: Add sanitization

```javascript
// tools/debug/sanitizer.js
const patterns = [
  { regex: /password["']?\s*:\s*["'][^"']+["']/gi, replace: 'password: "[REDACTED]"' },
  { regex: /api[_-]?key["']?\s*:\s*["'][^"']+["']/gi, replace: 'apiKey: "[REDACTED]"' },
  { regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replace: '[EMAIL]' }
];

function sanitize(data) {
  let sanitized = JSON.stringify(data);
  patterns.forEach(({ regex, replace }) => {
    sanitized = sanitized.replace(regex, replace);
  });
  return JSON.parse(sanitized);
}
```

## Verification

```bash
# Test debug capture
npm run debug:test

# Verify AI integration
npm run ai:debug-test ./src/components/Example.test.tsx

# Check arrow-chain analysis
npm run debug:arrow-chain
```

Expected output:
```text
✅ Debug capture: Working
✅ Test integration: Configured
✅ AI context generation: Functional
✅ Arrow-chain analysis: Ready
```

## Next Steps

1. Add custom debug points: `global.debug('checkpoint', state)`
2. Configure IDE integration: See `.vscode/debug-integration.json`
3. Set up team debug sharing: `npm run debug:share`

---

**Remember**: Good debugging context helps AI provide better solutions. Always capture state before and after
transformations.