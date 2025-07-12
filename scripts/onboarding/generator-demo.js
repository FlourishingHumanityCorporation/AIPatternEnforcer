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
          output: `src/components/UserProfile/
├── UserProfile.tsx          # Component with TypeScript
├── UserProfile.test.tsx     # Jest + Testing Library tests  
├── UserProfile.stories.tsx  # Storybook documentation
├── UserProfile.module.css   # Scoped CSS styles
└── index.ts                 # Clean exports`
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
          output: `src/api/users/
├── routes.ts               # Express routes
├── controllers.ts          # Business logic
├── validation.ts           # Joi/Zod schemas
├── tests/                  # API tests
└── docs.yaml              # OpenAPI spec`
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
          output: `src/features/UserDashboard/
├── components/             # Feature components
├── hooks/                  # Custom hooks
├── services/              # API integration
├── types/                 # TypeScript definitions
└── tests/                 # Feature tests`
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
          output: `src/hooks/
├── useUserData.ts          # Custom hook
├── useUserData.test.ts     # Hook tests
└── index.ts                # Export`
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

    const previews = {
      'Component Generator (Enhanced)': `
${chalk.green('// UserProfile.tsx')}
${chalk.gray(`import * as React from 'react';
import styles from './UserProfile.module.css';

interface UserProfileProps {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  onEdit?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ 
  user, 
  onEdit 
}) => {
  return (
    <div className={styles.container} role="region" aria-label="User profile">
      <img 
        src={user.avatar || '/default-avatar.png'} 
        alt={\`\${user.name}'s profile picture\`}
        className={styles.avatar}
      />
      <h2 className={styles.name}>{user.name}</h2>
      <p className={styles.email}>{user.email}</p>
      {onEdit && (
        <button onClick={onEdit} className={styles.editButton}>
          Edit Profile
        </button>
      )}
    </div>
  );
};`)}

${chalk.green('// UserProfile.test.tsx')}
${chalk.gray(`import { render, screen, fireEvent } from '@testing-library/react';
import { UserProfile } from './UserProfile';

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com'
};

test('renders user information correctly', () => {
  render(<UserProfile user={mockUser} />);
  
  expect(screen.getByText('John Doe')).toBeInTheDocument();
  expect(screen.getByText('john@example.com')).toBeInTheDocument();
});

test('calls onEdit when edit button is clicked', () => {
  const mockEdit = jest.fn();
  render(<UserProfile user={mockUser} onEdit={mockEdit} />);
  
  fireEvent.click(screen.getByText('Edit Profile'));
  expect(mockEdit).toHaveBeenCalledTimes(1);
});`)}`,

      'API Generator': `
${chalk.green('// routes.ts')}
${chalk.gray(`import express from 'express';
import { UserController } from './controllers';
import { validateUser } from './validation';

const router = express.Router();

router.get('/users', UserController.getUsers);
router.get('/users/:id', UserController.getUserById);
router.post('/users', validateUser, UserController.createUser);
router.put('/users/:id', validateUser, UserController.updateUser);
router.delete('/users/:id', UserController.deleteUser);

export { router as userRoutes };`)}

${chalk.green('// validation.ts')}
${chalk.gray(`import Joi from 'joi';

export const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  age: Joi.number().min(0).max(120).optional()
});

export const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};`)}`,

      'Feature Generator': `
${chalk.green('// hooks/useUserDashboard.ts')}
${chalk.gray(`import { useState, useEffect } from 'react';
import { userService } from '../services';

export const useUserDashboard = (userId: string) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await userService.getUser(userId);
        setUser(userData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  return { user, loading, error };
};`)}`,

      'Hook Generator': `
${chalk.green('// useUserData.ts')}
${chalk.gray(`import { useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

/**
 * Custom hook for managing user data
 * @param userId - The ID of the user to fetch
 * @returns Object containing user data, loading state, and refresh function
 */
export const useUserData = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(\`/api/users/\${userId}\`);
      if (!response.ok) throw new Error('Failed to fetch user');
      
      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refresh: fetchUser };
};`)}
    };

    console.log(previews[generator.name] || 'Code preview not available for this generator.');
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
    console.log(`   Manual: ~5-8 hours`);
    console.log(`   Generated: ~15 minutes`);
    console.log(chalk.green(`   Time saved: 4.75-7.75 hours per week!\n`));

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
      console.log(chalk.green(`\n🔧 To run actual demo:\n`));
      
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
    console.log(chalk.gray(`src/components/DemoButton/
├── DemoButton.tsx           # React component
├── DemoButton.test.tsx      # Jest tests  
├── DemoButton.stories.tsx   # Storybook
├── DemoButton.module.css    # Styles
└── index.ts                 # Exports`));

    console.log(chalk.green('\nHook Generator Output:'));
    console.log(chalk.gray(`src/hooks/
├── useDemoData.ts          # Custom hook
├── useDemoData.test.ts     # Hook tests
└── index.ts                # Export`));

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