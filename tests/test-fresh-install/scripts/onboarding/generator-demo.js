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
          '✅ JSDoc documentation'
        ],
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
          '✅ Unit and integration tests'
        ],
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
          '✅ Documentation and examples'
        ],
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
          '✅ Memoization patterns'
        ],
        example: {
          input: 'useUserData',
          output: 'src/hooks/\n' +
                  '├── useUserData.ts          # Custom hook\n' +
                  '├── useUserData.test.ts     # Hook tests\n' +
                  '└── index.ts                # Export'
        }
      }
    ];
  }

  async run() {
    console.log(chalk.cyan.bold('\n🚀 ProjectTemplate Generator Showcase'));
    console.log(chalk.gray('Discover how generators boost your productivity...\n'));

    while (true) {
      const action = await this.showMainMenu();
      
      if (action === 'exit') {
        console.log(chalk.green('\n✨ Happy coding! Run any generator with:'));
        console.log(chalk.yellow('  npm run g:c ComponentName'));
        console.log(chalk.gray('  (Replace g:c with g:api, g:feature, or g:hook as needed)\n'));
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
      { name: '❌ Exit', value: 'exit' }
    ];

    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'What would you like to explore?',
      choices
    }]);

    return action;
  }

  showOverview() {
    console.log(chalk.blue.bold('\n📋 Generator Overview\n'));
    
    this.generators.forEach((gen, index) => {
      console.log(chalk.green(`${index + 1}. ${gen.name}`));
      console.log(chalk.gray(`   Command: ${gen.command}`));
      console.log(chalk.gray(`   Saves: ${gen.timeSaved} per component`));
      console.log(chalk.gray(`   ${gen.description}\n`));
    });

    console.log(chalk.yellow('💡 Pro Tip: All generators include comprehensive tests and documentation!'));
    console.log(chalk.cyan('\nPress Enter to continue...'));
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
    
    console.log(chalk.blue.bold(`\n🔍 ${generator.name} Deep Dive\n`));
    
    console.log(chalk.green('📝 Description:'));
    console.log(`   ${generator.description}\n`);
    
    console.log(chalk.green('⚡ Command:'));
    console.log(chalk.yellow(`   ${generator.command}\n`));
    
    console.log(chalk.green('⏱️  Time Saved:'));
    console.log(`   ${generator.timeSaved} per use\n`);
    
    console.log(chalk.green('✨ What Gets Generated:'));
    generator.features.forEach(feature => {
      console.log(`   ${feature}`);
    });
    
    console.log(chalk.green('\n📁 Example Output Structure:'));
    console.log(chalk.gray(`Input: ${generator.example.input}`));
    console.log(generator.example.output);
    
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
    console.log(chalk.blue.bold('\n📄 Generated Code Preview\n'));
    
    if (generator.name === 'Component Generator (Enhanced)') {
      console.log(chalk.green('// UserProfile.tsx'));
      console.log(chalk.gray('import * as React from \'react\';'));
      console.log(chalk.gray('import styles from \'./UserProfile.module.css\';'));
      console.log(chalk.gray(''));
      console.log(chalk.gray('interface UserProfileProps {'));
      console.log(chalk.gray('  user: { name: string; email: string; avatar?: string; };'));
      console.log(chalk.gray('  onEdit?: () => void;'));
      console.log(chalk.gray('}'));
      console.log(chalk.gray(''));
      console.log(chalk.gray('export const UserProfile: React.FC<UserProfileProps> = ({ user, onEdit }) => {'));
      console.log(chalk.gray('  return ('));
      console.log(chalk.gray('    <div className={styles.container} role="region">'));
      console.log(chalk.gray('      <h2>{user.name}</h2>'));
      console.log(chalk.gray('      <p>{user.email}</p>'));
      console.log(chalk.gray('      {onEdit && <button onClick={onEdit}>Edit</button>}'));
      console.log(chalk.gray('    </div>'));
      console.log(chalk.gray('  );'));
      console.log(chalk.gray('};'));
      
    } else if (generator.name === 'API Generator') {
      console.log(chalk.green('// routes.ts'));
      console.log(chalk.gray('import express from \'express\';'));
      console.log(chalk.gray('import { UserController } from \'./controllers\';'));
      console.log(chalk.gray(''));
      console.log(chalk.gray('const router = express.Router();'));
      console.log(chalk.gray('router.get(\'/users\', UserController.getUsers);'));
      console.log(chalk.gray('router.post(\'/users\', validateUser, UserController.createUser);'));
      console.log(chalk.gray('export { router as userRoutes };'));
      
    } else if (generator.name === 'Hook Generator') {
      console.log(chalk.green('// useUserData.ts'));
      console.log(chalk.gray('import { useState, useEffect } from \'react\';'));
      console.log(chalk.gray(''));
      console.log(chalk.gray('export const useUserData = (userId: string) => {'));
      console.log(chalk.gray('  const [user, setUser] = useState(null);'));
      console.log(chalk.gray('  const [loading, setLoading] = useState(false);'));
      console.log(chalk.gray('  // ... rest of hook implementation'));
      console.log(chalk.gray('  return { user, loading, error };'));
      console.log(chalk.gray('};'));
      
    } else {
      console.log(chalk.yellow('Code preview available after running the generator.'));
    }
  }

  showProductivityImpact() {
    console.log(chalk.blue.bold('\n📊 Productivity Impact Analysis\n'));
    
    const metrics = [
      { task: 'Create React Component', manual: '15-20 min', generated: '30 sec', savings: '95%' },
      { task: 'Write Component Tests', manual: '10-15 min', generated: 'Included', savings: '100%' },
      { task: 'Setup Storybook', manual: '5-10 min', generated: 'Included', savings: '100%' },
      { task: 'Add TypeScript Types', manual: '5 min', generated: 'Included', savings: '100%' },
      { task: 'Create API Endpoint', manual: '25-30 min', generated: '1 min', savings: '97%' },
      { task: 'Write API Tests', manual: '15-20 min', generated: 'Included', savings: '100%' },
      { task: 'Setup Validation', manual: '10 min', generated: 'Included', savings: '100%' }
    ];

    console.log(chalk.green('⏱️  Time Comparison:\n'));
    console.log(chalk.gray('Task'.padEnd(25) + 'Manual'.padEnd(15) + 'Generated'.padEnd(15) + 'Savings'));
    console.log(chalk.gray('─'.repeat(70)));
    
    metrics.forEach(metric => {
      console.log(
        metric.task.padEnd(25) + 
        metric.manual.padEnd(15) + 
        metric.generated.padEnd(15) + 
        chalk.green(metric.savings)
      );
    });

    console.log(chalk.yellow('\n💡 Weekly Impact (10 components):'));
    console.log('   Manual: ~5-8 hours');
    console.log('   Generated: ~15 minutes');
    console.log(chalk.green('   Time saved: 4.75-7.75 hours per week!\n'));

    console.log(chalk.blue('📈 Quality Benefits:'));
    console.log('   ✅ Consistent code patterns');
    console.log('   ✅ Built-in best practices');
    console.log('   ✅ Comprehensive test coverage');
    console.log('   ✅ Accessibility compliance');
    console.log('   ✅ Documentation included');
  }

  async runLiveDemo() {
    console.log(chalk.blue.bold('\n🎮 Live Generator Demo\n'));
    console.log(chalk.yellow('This will create example files in a /demo directory'));
    
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
        { name: 'Show files only (no creation)', value: 'preview' }
      ]
    }]);

    if (demoType === 'preview') {
      this.showFilePreview();
    } else {
      console.log(chalk.green('\n🔧 To run actual demo:\n'));
      
      if (demoType === 'component') {
        console.log(chalk.yellow('  npm run g:c DemoButton'));
      } else if (demoType === 'hook') {
        console.log(chalk.yellow('  npm run g:hook useDemoData'));
      }
      
      console.log(chalk.gray('\nThis will create actual files you can explore and modify.'));
    }
  }

  showFilePreview() {
    console.log(chalk.blue.bold('\n📁 Generated File Structure Preview\n'));
    
    console.log(chalk.green('Component Generator Output:'));
    console.log(chalk.gray('src/components/DemoButton/\n' +
      '├── DemoButton.tsx           # React component\n' +
      '├── DemoButton.test.tsx      # Jest tests\n' +
      '├── DemoButton.stories.tsx   # Storybook\n' +
      '├── DemoButton.module.css    # Styles\n' +
      '└── index.ts                 # Exports'));

    console.log(chalk.green('\nHook Generator Output:'));
    console.log(chalk.gray('src/hooks/\n' +
      '├── useDemoData.ts          # Custom hook\n' +
      '├── useDemoData.test.ts     # Hook tests\n' +
      '└── index.ts                # Export'));

    console.log(chalk.yellow('\n✨ All files include:'));
    console.log('   • TypeScript definitions');
    console.log('   • Comprehensive tests');
    console.log('   • JSDoc documentation');
    console.log('   • Best practice patterns');
  }
}

// CLI entry point
if (require.main === module) {
  const demo = new GeneratorDemo();
  demo.run().catch(console.error);
}

module.exports = GeneratorDemo;