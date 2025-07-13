#!/usr/bin/env node

const chalk = require('chalk');
const fs = require('fs');

logger.info(chalk.cyan.bold('\n🎯 ProjectTemplate Component Generator Demo\n'));

logger.info(chalk.blue('Available Generators:\n'));

logger.info(chalk.green('1. Enhanced Component Generator'));
logger.info(chalk.gray('   Command: npm run g:c ComponentName'));
logger.info(chalk.gray('   Creates: TypeScript component with tests, stories, and styles\n'));

logger.info(chalk.green('2. Basic Component Generator'));
logger.info(chalk.gray('   Command: npm run g:component ComponentName'));
logger.info(chalk.gray('   Creates: Simple component with basic structure\n'));

logger.info(chalk.yellow('🔧 Generator Features:'));
logger.info('✅ TypeScript component files');
logger.info('✅ Comprehensive test suites');
logger.info('✅ Storybook stories');
logger.info('✅ CSS modules');
logger.info('✅ Export/import setup');

logger.info(chalk.cyan('\n📁 Generated File Structure:'));
logger.info('src/components/ComponentName/');
logger.info('├── ComponentName.tsx        # Main component');
logger.info('├── ComponentName.test.tsx   # Test suite');
logger.info('├── ComponentName.stories.tsx # Storybook stories');
logger.info('├── ComponentName.module.css # Styled CSS');
logger.info('└── index.ts                # Export barrel');

logger.info(chalk.magenta('\n🚀 Quick Start:'));
logger.info('1. Run: npm run g:c YourComponentName');
logger.info('2. Answer the interactive prompts');
logger.info('3. Find your component in src/components/');
logger.info('4. Run tests: npm test');

logger.info(chalk.blue('\n🎮 Try it now:'));
logger.info(chalk.yellow('npm run g:c DemoComponent'));

// Check if generators are working
const generatorsWorking = fs.existsSync('tools/generators/enhanced-component-generator.js');
if (!generatorsWorking) {
  logger.info(chalk.red('\n⚠️  Warning: Generator files not found. Run npm install first.'));
}

// Show current project structure
if (fs.existsSync('src/components')) {
  const components = fs.readdirSync('src/components', { withFileTypes: true }).
  filter((dirent) => dirent.isDirectory()).
  map((dirent) => dirent.name);

  if (components.length > 0) {
    logger.info(chalk.green('\n📂 Existing Components:'));
    components.forEach((comp) => logger.info(`   • ${comp}`));
  }
} else {
  logger.info(chalk.gray('\n📂 No components directory yet - first component will create it'));
}

logger.info(chalk.gray('\n💡 Tip: Use --help flag for more options'));
logger.info(chalk.gray('📖 More info: docs/guides/generators/\n'));