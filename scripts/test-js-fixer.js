#!/usr/bin/env node

const JavaScriptLogFixer = require('../tools/enforcement/log-enforcer/javascript_fixer');
const fs = require('fs');
const path = require('path');

// Create a test file with console violations
const testCode = `
function processData(data) {
  console.log("Processing data:", data);
  
  if (!data) {
    console.error("No data provided");
    return null;
  }
  
  console.warn("This is a warning");
  return data.processed;
}

module.exports = processData;
`;

const testFile = path.join(__dirname, 'test-console-fix.js');
fs.writeFileSync(testFile, testCode);

async function test() {
  const fixer = new JavaScriptLogFixer();
  
  console.log('Original code:');
  console.log(testCode);
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('Testing JavaScript fixer (dry run)...');
  const result = await fixer.fixFile(testFile, { dryRun: true });
  
  console.log('Fix result:', JSON.stringify(result.changes, null, 2));
  
  if (result.success) {
    console.log('\nFixed code:');
    console.log(result.fixedContent);
  } else {
    console.log('Error:', result.error);
  }
  
  // Cleanup
  fs.unlinkSync(testFile);
}

test().catch(console.error);