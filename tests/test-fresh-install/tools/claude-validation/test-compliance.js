#!/usr/bin/env node

/**
 * Test compliance validator with real examples
 */

const ComplianceValidator = require('./compliance-validator');
const fs = require('fs');
const path = require('path');

const validator = new ComplianceValidator();

// Test cases based on real Claude Code patterns
const testCases = [
  {
    name: 'Good: Complex request with prompt improvement',
    context: { isComplexRequest: true },
    response: `**Improved Prompt**: Create a React component for user authentication that includes login form validation, error handling, and uses the project's established patterns for API calls and state management.

I'll help you create a comprehensive user authentication component. Let me break this down into steps:

1. Create the login form component
2. Add validation logic
3. Implement error handling
4. Integrate with your API patterns

Let's start by using the component generator:
\`\`\`bash
npm run g:c LoginForm
\`\`\``,
    expectedPass: true
  },
  {
    name: 'Bad: Creating improved file version',
    context: { isComplexRequest: true },
    response: `I'll create an improved version of your login component with better error handling.

Create a new file \`Login_improved.jsx\`:
\`\`\`jsx
import * as React from 'react';
// ... component code
\`\`\``,
    expectedPass: false
  },
  {
    name: 'Good: Simple query with concise response',
    context: { isSimpleQuery: true },
    response: `The error occurs because the API endpoint expects a JSON payload. 

Add \`Content-Type: 'application/json'\` to your fetch headers.`,
    expectedPass: true
  },
  {
    name: 'Good: Multi-step task using TodoWrite',
    context: { isComplexRequest: true },
    response: `**Improved Prompt**: Implement a complete user dashboard with profile section, activity feed, and settings panel, ensuring proper component structure and state management.

I'll implement this dashboard using TodoWrite to track our progress:

Let me create a todo list for this implementation:
- [ ] Create dashboard layout component
- [ ] Implement profile section
- [ ] Build activity feed with pagination
- [ ] Add settings panel
- [ ] Integrate state management
- [ ] Add loading and error states

Starting with the dashboard layout...`,
    expectedPass: true
  },
  {
    name: 'Bad: Complex request without prompt improvement',
    context: { isComplexRequest: true },
    response: `I'll help you build a user dashboard. Here's how we'll structure it:

First, let's create the main dashboard component:
\`\`\`jsx
import * as React from 'react';
\`\`\``,
    expectedPass: false
  },
  {
    name: 'Good: Recommends editing original file',
    context: { isComplexRequest: false },
    response: `To fix the validation issue, let's edit the original LoginForm.jsx file:

\`\`\`javascript
// In LoginForm.jsx, update the validation function:
const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
\`\`\``,
    expectedPass: true
  }
];

// Run tests
process.stderr.write('🧪 Running ProjectTemplate Compliance Tests\n\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = validator.validate(testCase.response, testCase.context);
  const testPassed = result.passed === testCase.expectedPass;
  
  if (testPassed) {
    process.stderr.write(`✅ Test ${index + 1}: ${testCase.name}\n`);
    passed++;
  } else {
    process.stderr.write(`❌ Test ${index + 1}: ${testCase.name}\n`);
    process.stderr.write(`   Expected: ${testCase.expectedPass ? 'PASS' : 'FAIL'}, Got: ${result.passed ? 'PASS' : 'FAIL'}\n`);
    process.stderr.write(`   Score: ${result.score}%\n`);
    if (result.violations.length > 0) {
      process.stderr.write(`   Violations: ${result.violations.map(v => v.rule).join(', ')}\n`);
    }
    failed++;
  }
});

process.stderr.write(`\n📊 Test Results: ${passed}/${testCases.length} passed\n`);
process.stderr.write('\n📈 Overall Statistics:\n');
process.stdout.write(JSON.stringify(validator.getStats(), null, 2) + '\n');

// Save some test responses for manual testing
const testDir = path.join(__dirname, 'test-responses');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir, { recursive: true });
}

// Save a good example
fs.writeFileSync(
  path.join(testDir, 'good-response.txt'),
  testCases[0].response
);

// Save a bad example
fs.writeFileSync(
  path.join(testDir, 'bad-response.txt'),
  testCases[1].response
);

process.stderr.write(`\n💾 Test responses saved to ${testDir}/\n`);
process.stderr.write('\nTry validating manually:\n');
process.stderr.write('  node compliance-validator.js validate test-responses/good-response.txt --complex\n');
process.stderr.write('  node compliance-validator.js validate test-responses/bad-response.txt\n');