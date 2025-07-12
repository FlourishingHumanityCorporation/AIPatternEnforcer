#!/usr/bin/env node

const chalk = require('chalk');
const fs = require('fs');

console.log(chalk.cyan.bold('\n🎯 ProjectTemplate Component Generator Demo\n'));

console.log(chalk.blue('Available Generators:\n'));

console.log(chalk.green('1. Enhanced Component Generator'));
console.log(chalk.gray('   Command: npm run g:c ComponentName'));
console.log(chalk.gray('   Creates: TypeScript component with tests, stories, and styles\n'));

console.log(chalk.green('2. Basic Component Generator'));
console.log(chalk.gray('   Command: npm run g:component ComponentName'));
console.log(chalk.gray('   Creates: Simple component with basic structure\n'));

console.log(chalk.yellow('🔧 Generator Features:'));
console.log('✅ TypeScript component files');
console.log('✅ Comprehensive test suites');
console.log('✅ Storybook stories');
console.log('✅ CSS modules');
console.log('✅ Export/import setup');

console.log(chalk.cyan('\n📁 Generated File Structure:'));
console.log('src/components/ComponentName/');
console.log('├── ComponentName.tsx        # Main component');
console.log('├── ComponentName.test.tsx   # Test suite');
console.log('├── ComponentName.stories.tsx # Storybook stories');
console.log('├── ComponentName.module.css # Styled CSS');
console.log('└── index.ts                # Export barrel');

console.log(chalk.magenta('\n🚀 Quick Start:'));
console.log('1. Run: npm run g:c YourComponentName');
console.log('2. Answer the interactive prompts');
console.log('3. Find your component in src/components/');
console.log('4. Run tests: npm test');

console.log(chalk.blue('\n🎮 Try it now:'));
console.log(chalk.yellow('npm run g:c DemoComponent'));

// Check if generators are working
const generatorsWorking = fs.existsSync('tools/generators/enhanced-component-generator.js');
if (!generatorsWorking) {
  console.log(chalk.red('\n⚠️  Warning: Generator files not found. Run npm install first.'));
}

// Show current project structure
if (fs.existsSync('src/components')) {
  const components = fs.readdirSync('src/components', { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  if (components.length > 0) {
    console.log(chalk.green('\n📂 Existing Components:'));
    components.forEach(comp => console.log(`   • ${comp}`));
  }
} else {
  console.log(chalk.gray('\n📂 No components directory yet - first component will create it'));
}

console.log(chalk.gray('\n💡 Tip: Use --help flag for more options'));
console.log(chalk.gray('📖 More info: docs/guides/generators/\n'));