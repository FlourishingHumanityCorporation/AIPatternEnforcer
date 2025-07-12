#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

// Create a simple test file
const testCode = `
function test() {
  console.log("test");
}
`;

const testFile = path.join(__dirname, 'simple-test.js');
fs.writeFileSync(testFile, testCode);

console.log('Testing each step...');

try {
  // Step 1: Read file
  console.log('1. Reading file...');
  const content = fs.readFileSync(testFile, 'utf8');
  console.log('   ✅ File read successfully');
  
  // Step 2: Parse AST
  console.log('2. Parsing AST...');
  const parserOptions = {
    sourceType: 'module',
    plugins: ['jsx']
  };
  const ast = parser.parse(content, parserOptions);
  console.log('   ✅ AST parsed successfully');
  
  // Step 3: Traverse and detect console calls
  console.log('3. Traversing AST...');
  const changes = [];
  
  traverse(ast, {
    CallExpression(path) {
      const { node } = path;
      
      if (
        node.callee.type === 'MemberExpression' &&
        node.callee.object.type === 'Identifier' &&
        node.callee.object.name === 'console' &&
        node.callee.property.type === 'Identifier'
      ) {
        console.log(`   Found console.${node.callee.property.name} at line ${node.loc.start.line}`);
        
        changes.push({
          line: node.loc.start.line,
          column: node.loc.start.column,
          old: `console.${node.callee.property.name}`,
          new: `logger.info`,
          type: 'console_to_logger'
        });
      }
    }
  });
  
  console.log('   ✅ Traversal completed');
  console.log('   Found changes:', changes.length);
  console.log('   Changes:', JSON.stringify(changes, null, 2));
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.error('Stack:', error.stack);
} finally {
  // Cleanup
  if (fs.existsSync(testFile)) {
    fs.unlinkSync(testFile);
  }
}