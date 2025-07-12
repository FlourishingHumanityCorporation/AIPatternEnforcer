#!/usr/bin/env node

const JavaScriptLogDetector = require('../tools/enforcement/log-enforcer/javascript_detector');
const fs = require('fs');
const path = require('path');

// Create a simple test file
const testCode = `
function test() {
  console.log("This should be detected");
  console.error("This too");
}
`;

const testFile = path.join(__dirname, 'test-console.js');
fs.writeFileSync(testFile, testCode);

async function test() {
  const detector = new JavaScriptLogDetector();
  
  console.log('Testing JavaScript detector...');
  const result = await detector.analyzeFile(testFile);
  
  console.log('Result:', JSON.stringify(result, null, 2));
  
  // Cleanup
  fs.unlinkSync(testFile);
}

test().catch(console.error);