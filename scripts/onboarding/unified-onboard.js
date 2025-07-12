#!/usr/bin/env node

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const ora = require('ora');
const inquirer = require('inquirer');

class UnifiedOnboardingWizard {
  constructor() {
    this.projectRoot = process.cwd();
    this.startTime = Date.now();
    this.steps = [
      { name: 'Dependencies', command: 'npm install', essential: true },
      { name: 'Git hooks', command: 'npm run setup:hooks', essential: true },
      { name: 'AI context', command: 'npm run context', essential: false },
      { name: 'Enforcement', command: 'npm run check:config', essential: false }
    ];
  }

  async run() {
    console.log(chalk.cyan.bold('\n🚀 ProjectTemplate Unified Onboarding'));
    console.log(chalk.gray('Get to your first working component in <5 minutes\n'));

    try {
      // Step 1: Essential setup
      await this.runEssentialSetup();
      
      // Step 2: First component generation
      await this.generateFirstComponent();
      
      // Step 3: Validate everything works
      await this.validateSetup();
      
      // Step 4: Show success and next steps
      this.showSuccess();
      
    } catch (error) {
      console.error(chalk.red('\n❌ Onboarding failed:'), error.message);
      console.log(chalk.yellow('💡 Run `npm run onboard` again to retry'));
      process.exit(1);
    }
  }

  async runEssentialSetup() {
    console.log(chalk.blue('\n📦 Step 1/3: Essential Setup\n'));
    
    for (const step of this.steps) {
      const spinner = ora(`${step.name}...`).start();
      try {
        execSync(step.command, { stdio: 'pipe' });
        spinner.succeed(step.name);
      } catch (error) {
        if (step.essential) {
          spinner.fail(`${step.name} (required)`);
          throw error;
        } else {
          spinner.warn(`${step.name} (optional - skipped)`);
        }
      }
    }
  }

  async generateFirstComponent() {
    console.log(chalk.blue('\n🎨 Step 2/3: Generate Your First Component\n'));
    
    const { componentName } = await inquirer.prompt([{
      type: 'input',
      name: 'componentName',
      message: 'Component name (e.g., Button, UserCard):',
      default: 'ExampleButton',
      validate: (input) => {
        if (!input || !/^[A-Z][a-zA-Z0-9]*$/.test(input)) {
          return 'Component name must start with uppercase letter and contain only letters/numbers';
        }
        return true;
      }
    }]);

    console.log(chalk.gray(`\nGenerating ${componentName} with tests, stories, and styles...`));
    
    return new Promise((resolve, reject) => {
      const child = spawn('npm', ['run', 'g:c', componentName], {
        stdio: 'inherit',
        shell: true
      });

      child.on('close', (code) => {
        if (code === 0) {
          console.log(chalk.green(`\n✅ ${componentName} component generated successfully!`));
          this.generatedComponent = componentName;
          resolve();
        } else {
          reject(new Error('Component generation failed'));
        }
      });

      child.on('error', (error) => {
        reject(error);
      });
    });
  }

  async validateSetup() {
    console.log(chalk.blue('\n✓ Step 3/3: Validating Setup\n'));
    
    const validations = [
      { name: 'Tests', command: 'npm test -- --run', critical: true },
      { name: 'Linting', command: 'npm run lint', critical: false },
      { name: 'Type checking', command: 'npm run type-check', critical: false },
      { name: 'Enforcement rules', command: 'npm run check:all', critical: false }
    ];

    let allPassed = true;
    
    for (const validation of validations) {
      const spinner = ora(`${validation.name}...`).start();
      try {
        execSync(validation.command, { stdio: 'pipe' });
        spinner.succeed(validation.name);
      } catch (error) {
        if (validation.critical) {
          spinner.fail(`${validation.name} (critical)`);
          throw error;
        } else {
          spinner.warn(`${validation.name} (optional)`);
          allPassed = false;
        }
      }
    }

    if (!allPassed) {
      console.log(chalk.yellow('\n⚠️  Some validations failed, but your setup is functional'));
    }
  }

  showSuccess() {
    const elapsedTime = Math.round((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    
    console.log(chalk.green.bold(`\n🎉 Onboarding Complete! (${minutes}m ${seconds}s)`));
    console.log(chalk.gray('You now have a working component with tests!\n'));
    
    if (this.generatedComponent) {
      console.log(chalk.cyan('📁 Your component files:'));
      console.log(`  • src/components/${this.generatedComponent}/${this.generatedComponent}.tsx`);
      console.log(`  • src/components/${this.generatedComponent}/${this.generatedComponent}.test.tsx`);
      console.log(`  • src/components/${this.generatedComponent}/${this.generatedComponent}.stories.tsx`);
      console.log(`  • src/components/${this.generatedComponent}/${this.generatedComponent}.module.css\n`);
    }
    
    console.log(chalk.yellow('🚀 Next Steps:'));
    console.log('  1. Run: npm run dev              (start development server)');
    console.log('  2. Run: npm run g:c NewComponent (generate more components)');
    console.log('  3. Run: npm run demo:generators  (explore all generators)');
    console.log('  4. Read: CLAUDE.md               (AI assistant guidelines)\n');
    
    console.log(chalk.gray('💡 Tip: Use `npm run check:all` before commits to ensure quality'));
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {};

// Run the wizard
const wizard = new UnifiedOnboardingWizard(options);
wizard.run().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});