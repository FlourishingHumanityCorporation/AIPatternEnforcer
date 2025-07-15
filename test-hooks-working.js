// Test file to verify hooks system
console.log('Testing hooks system');

export function testFunction() {
  console.log('This should be auto-fixed by PostToolUse hooks');
  return 'hooks working';
}