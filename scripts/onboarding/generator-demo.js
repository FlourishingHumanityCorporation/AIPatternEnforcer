#!/usr/bin/env node

const inquirer = require('inquirer');
const chalk = require('chalk');
const path = require('path');
const fs = require('fs');

class GeneratorDemo {
  constructor() {
    this.generators = [
    {
      name: 'Component Generator (Enhanced)',
      command: 'npm run g:c ComponentName',
      description: 'Creates complete React/Vue components with tests, stories, and styles',
      timeSaved: '15-20 minutes',
      features: [
      '✅ TypeScript component with props interface',
      '✅ Comprehensive test suite with RTL/Jest',
      '✅ Storybook stories with controls',
      '✅ CSS modules with responsive design',
      '✅ Accessibility attributes',
      '✅ JSDoc documentation'],

      example: {
        input: 'UserProfile',
        output: 'src/components/UserProfile/\n' +
        '├── UserProfile.tsx          # Component with TypeScript\n' +
        '├── UserProfile.test.tsx     # Jest + Testing Library tests\n' +
        '├── UserProfile.stories.tsx  # Storybook documentation\n' +
        '├── UserProfile.module.css   # Scoped CSS styles\n' +
        '└── index.ts                 # Clean exports'
      }
    },
    {
      name: 'API Generator',
      command: 'npm run g:api EndpointName',
      description: 'Generates REST API endpoints with validation and documentation',
      timeSaved: '25-30 minutes',
      features: [
      '✅ Express/FastAPI route handlers',
      '✅ Request/response validation schemas',
      '✅ OpenAPI/Swagger documentation',
      '✅ Error handling middleware',
      '✅ Database integration',
      '✅ Unit and integration tests'],

      example: {
        input: 'UserAPI',
        output: 'src/api/users/\n' +
        '├── routes.ts               # Express routes\n' +
        '├── controllers.ts          # Business logic\n' +
        '├── validation.ts           # Joi/Zod schemas\n' +
        '├── tests/                  # API tests\n' +
        '└── docs.yaml              # OpenAPI spec'
      }
    },
    {
      name: 'Feature Generator',
      command: 'npm run g:feature FeatureName',
      description: 'Creates complete feature modules with components, hooks, and tests',
      timeSaved: '45-60 minutes',
      features: [
      '✅ Feature directory structure',
      '✅ Custom React hooks',
      '✅ State management integration',
      '✅ Feature-specific components',
      '✅ Comprehensive test coverage',
      '✅ Documentation and examples'],

      example: {
        input: 'UserDashboard',
        output: 'src/features/UserDashboard/\n' +
        '├── components/             # Feature components\n' +
        '├── hooks/                  # Custom hooks\n' +
        '├── services/              # API integration\n' +
        '├── types/                 # TypeScript definitions\n' +
        '└── tests/                 # Feature tests'
      }
    },
    {
      name: 'Hook Generator',
      command: 'npm run g:hook HookName',
      description: 'Generates custom React hooks with TypeScript and tests',
      timeSaved: '10-15 minutes',
      features: [
      '✅ TypeScript custom hook',
      '✅ React Testing Library tests',
      '✅ JSDoc documentation',
      '✅ Usage examples',
      '✅ Error handling',
      '✅ Memoization patterns'],

      example: {
        input: 'useUserData',
        output: 'src/hooks/\n' +
        '├── useUserData.ts          # Custom hook\n' +
        '├── useUserData.test.ts     # Hook tests\n' +
        '└── index.ts                # Export'
      }
    }];

  }

  async run() {
    logger.info(chalk.cyan.bold('\n🚀 ProjectTemplate Generator Showcase'));
    logger.info(chalk.gray('Discover how generators boost your productivity...\n'));

    while (true) {
      const action = await this.showMainMenu();

      if (action === 'exit') {
        logger.info(chalk.green('\n✨ Happy coding! Run any generator with:'));
        logger.info(chalk.yellow('  npm run g:c ComponentName'));
        logger.info(chalk.gray('  (Replace g:c with g:api, g:feature, or g:hook as needed)\n'));
        break;
      } else if (action === 'overview') {
        this.showOverview();
      } else if (action === 'demo') {
        await this.showGeneratorDemo();
      } else if (action === 'productivity') {
        this.showProductivityImpact();
      } else if (action === 'live-demo') {
        await this.runLiveDemo();
      }
    }
  }

  async showMainMenu() {
    const choices = [
    { name: '📋 Show All Generators Overview', value: 'overview' },
    { name: '🔍 Explore Specific Generator', value: 'demo' },
    { name: '📊 Productivity Impact Analysis', value: 'productivity' },
    { name: '🎮 Run Live Demo', value: 'live-demo' },
    { name: '❌ Exit', value: 'exit' }];


    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'What would you like to explore?',
      choices
    }]);

    return action;
  }

  showOverview() {
    logger.info(chalk.blue.bold('\n📋 Generator Overview\n'));

    this.generators.forEach((gen, index) => {
      logger.info(chalk.green(`${index + 1}. ${gen.name}`));
      logger.info(chalk.gray(`   Command: ${gen.command}`));
      logger.info(chalk.gray(`   Saves: ${gen.timeSaved} per component`));
      logger.info(chalk.gray(`   ${gen.description}\n`));
    });

    logger.info(chalk.yellow('💡 Pro Tip: All generators include comprehensive tests and documentation!'));
    logger.info(chalk.cyan('\nPress Enter to continue...'));
    require('readline').createInterface({ input: process.stdin }).question('', () => {});
  }

  async showGeneratorDemo() {
    const { selectedGen } = await inquirer.prompt([{
      type: 'list',
      name: 'selectedGen',
      message: 'Which generator would you like to explore?',
      choices: this.generators.map((gen, index) => ({
        name: `${gen.name} - ${gen.description}`,
        value: index
      }))
    }]);

    const generator = this.generators[selectedGen];

    logger.info(chalk.blue.bold(`\n🔍 ${generator.name} Deep Dive\n`));

    logger.info(chalk.green('📝 Description:'));
    logger.info(`   ${generator.description}\n`);

    logger.info(chalk.green('⚡ Command:'));
    logger.info(chalk.yellow(`   ${generator.command}\n`));

    logger.info(chalk.green('⏱️  Time Saved:'));
    logger.info(`   ${generator.timeSaved} per use\n`);

    logger.info(chalk.green('✨ What Gets Generated:'));
    generator.features.forEach((feature) => {
      logger.info(`   ${feature}`);
    });

    logger.info(chalk.green('\n📁 Example Output Structure:'));
    logger.info(chalk.gray(`Input: ${generator.example.input}`));
    logger.info(generator.example.output);

    const { showMore } = await inquirer.prompt([{
      type: 'confirm',
      name: 'showMore',
      message: 'Would you like to see a code preview?',
      default: true
    }]);

    if (showMore) {
      this.showCodePreview(generator);
    }
  }

  showCodePreview(generator) {
    logger.info(chalk.blue.bold('\n📄 Generated Code Preview\n'));

    if (generator.name === 'Component Generator (Enhanced)') {
      logger.info(chalk.green('// UserProfile.tsx'));
      logger.info(chalk.gray('import * as React from \'react\';'));
      logger.info(chalk.gray('import styles from \'./UserProfile.module.css\';'));
      logger.info(chalk.gray(''));
      logger.info(chalk.gray('interface UserProfileProps {'));
      logger.info(chalk.gray('  user: { name: string; email: string; avatar?: string; };'));
      logger.info(chalk.gray('  onEdit?: () => void;'));
      logger.info(chalk.gray('}'));
      logger.info(chalk.gray(''));
      logger.info(chalk.gray('export const UserProfile: React.FC<UserProfileProps> = ({ user, onEdit }) => {'));
      logger.info(chalk.gray('  return ('));
      logger.info(chalk.gray('    <div className={styles.container} role="region">'));
      logger.info(chalk.gray('      <h2>{user.name}</h2>'));
      logger.info(chalk.gray('      <p>{user.email}</p>'));
      logger.info(chalk.gray('      {onEdit && <button onClick={onEdit}>Edit</button>}'));
      logger.info(chalk.gray('    </div>'));
      logger.info(chalk.gray('  );'));
      logger.info(chalk.gray('};'));

    } else if (generator.name === 'API Generator') {
      logger.info(chalk.green('// routes.ts'));
      logger.info(chalk.gray('import express from \'express\';'));
      logger.info(chalk.gray('import { UserController } from \'./controllers\';'));
      logger.info(chalk.gray(''));
      logger.info(chalk.gray('const router = express.Router();'));
      logger.info(chalk.gray('router.get(\'/users\', UserController.getUsers);'));
      logger.info(chalk.gray('router.post(\'/users\', validateUser, UserController.createUser);'));
      logger.info(chalk.gray('export { router as userRoutes };'));

    } else if (generator.name === 'Hook Generator') {
      logger.info(chalk.green('// useUserData.ts'));
      logger.info(chalk.gray('import { useState, useEffect } from \'react\';'));
      logger.info(chalk.gray(''));
      logger.info(chalk.gray('export const useUserData = (userId: string) => {'));
      logger.info(chalk.gray('  const [user, setUser] = useState(null);'));
      logger.info(chalk.gray('  const [loading, setLoading] = useState(false);'));
      logger.info(chalk.gray('  // ... rest of hook implementation'));
      logger.info(chalk.gray('  return { user, loading, error };'));
      logger.info(chalk.gray('};'));

    } else {
      logger.info(chalk.yellow('Code preview available after running the generator.'));
    }
  }

  showProductivityImpact() {
    logger.info(chalk.blue.bold('\n📊 Productivity Impact Analysis\n'));

    const metrics = [
    { task: 'Create React Component', manual: '15-20 min', generated: '30 sec', savings: '95%' },
    { task: 'Write Component Tests', manual: '10-15 min', generated: 'Included', savings: '100%' },
    { task: 'Setup Storybook', manual: '5-10 min', generated: 'Included', savings: '100%' },
    { task: 'Add TypeScript Types', manual: '5 min', generated: 'Included', savings: '100%' },
    { task: 'Create API Endpoint', manual: '25-30 min', generated: '1 min', savings: '97%' },
    { task: 'Write API Tests', manual: '15-20 min', generated: 'Included', savings: '100%' },
    { task: 'Setup Validation', manual: '10 min', generated: 'Included', savings: '100%' }];


    logger.info(chalk.green('⏱️  Time Comparison:\n'));
    logger.info(chalk.gray('Task'.padEnd(25) + 'Manual'.padEnd(15) + 'Generated'.padEnd(15) + 'Savings'));
    logger.info(chalk.gray('─'.repeat(70)));

    metrics.forEach((metric) => {
      logger.info(
        metric.task.padEnd(25) +
        metric.manual.padEnd(15) +
        metric.generated.padEnd(15) +
        chalk.green(metric.savings));

    });

    logger.info(chalk.yellow('\n💡 Weekly Impact (10 components):'));
    logger.info('   Manual: ~5-8 hours');
    logger.info('   Generated: ~15 minutes');
    logger.info(chalk.green('   Time saved: 4.75-7.75 hours per week!\n'));

    logger.info(chalk.blue('📈 Quality Benefits:'));
    logger.info('   ✅ Consistent code patterns');
    logger.info('   ✅ Built-in best practices');
    logger.info('   ✅ Comprehensive test coverage');
    logger.info('   ✅ Accessibility compliance');
    logger.info('   ✅ Documentation included');
  }

  async runLiveDemo() {
    logger.info(chalk.blue.bold('\n🎮 Live Generator Demo\n'));
    logger.info(chalk.yellow('This will create example files in a /demo directory'));

    const { proceed } = await inquirer.prompt([{
      type: 'confirm',
      name: 'proceed',
      message: 'Run live demo? (creates temporary files)',
      default: true
    }]);

    if (!proceed) return;

    const { demoType } = await inquirer.prompt([{
      type: 'list',
      name: 'demoType',
      message: 'Which generator demo?',
      choices: [
      { name: 'Component Generator - Create DemoButton', value: 'component' },
      { name: 'Hook Generator - Create useDemoData', value: 'hook' },
      { name: 'Show files only (no creation)', value: 'preview' }]

    }]);

    if (demoType === 'preview') {
      this.showFilePreview();
    } else {
      logger.info(chalk.green('\n🔧 To run actual demo:\n'));

      if (demoType === 'component') {
        logger.info(chalk.yellow('  npm run g:c DemoButton'));
      } else if (demoType === 'hook') {
        logger.info(chalk.yellow('  npm run g:hook useDemoData'));
      }

      logger.info(chalk.gray('\nThis will create actual files you can explore and modify.'));
    }
  }

  showFilePreview() {
    logger.info(chalk.blue.bold('\n📁 Generated File Structure Preview\n'));

    logger.info(chalk.green('Component Generator Output:'));
    logger.info(chalk.gray('src/components/DemoButton/\n' +
    '├── DemoButton.tsx           # React component\n' +
    '├── DemoButton.test.tsx      # Jest tests\n' +
    '├── DemoButton.stories.tsx   # Storybook\n' +
    '├── DemoButton.module.css    # Styles\n' +
    '└── index.ts                 # Exports'));

    logger.info(chalk.green('\nHook Generator Output:'));
    logger.info(chalk.gray('src/hooks/\n' +
    '├── useDemoData.ts          # Custom hook\n' +
    '├── useDemoData.test.ts     # Hook tests\n' +
    '└── index.ts                # Export'));

    logger.info(chalk.yellow('\n✨ All files include:'));
    logger.info('   • TypeScript definitions');
    logger.info('   • Comprehensive tests');
    logger.info('   • JSDoc documentation');
    logger.info('   • Best practice patterns');
  }
}

// CLI entry point
if (require.main === module) {
  const demo = new GeneratorDemo();
  demo.run().catch(console.error);
}

module.exports = GeneratorDemo;