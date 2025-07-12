#!/usr/bin/env node

const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const testCode = `
function test() {
  console.log("test");
}
`;

try {
  console.log('Parsing code...');
  const ast = parser.parse(testCode, {
    sourceType: 'module',
    plugins: ['jsx']
  });
  
  console.log('AST parsed successfully');
  
  let consoleCount = 0;
  
  traverse(ast, {
    CallExpression(path) {
      const { node } = path;
      console.log('Found call expression:', node.callee.type);
      
      if (node.callee.type === 'MemberExpression') {
        console.log('  Member expression:', node.callee.object.name, '.', node.callee.property.name);
        
        if (node.callee.object.name === 'console') {
          consoleCount++;
          console.log('  Found console call!');
        }
      }
    }
  });
  
  console.log('Total console calls found:', consoleCount);
  
} catch (error) {
  console.error('Error:', error.message);
}