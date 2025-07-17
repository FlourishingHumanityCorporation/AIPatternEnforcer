#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const inquirer = require('inquirer');

/**
 * Create AI App CLI Tool (MIGRATION-STRATEGY.md Phase 3.1)
 * 
 * Implements the standalone CLI for <2 minute project creation per CLAUDE.md goals.
 * Creates new AI projects from AIPatternEnforcer starter templates with:
 * - Project scaffolding from starters/
 * - Hooks enabled by default for protection
 * - Dependencies installed automatically
 * - First component generated
 * 
 * Achieves the core mission: "enable lazy coders to start AI projects in <2 minutes"
 */
class CreateAiApp {
  constructor() {
    this.cwd = process.cwd();
    this.templateDir = path.join(__dirname, '..', 'starters');
  }

  async create() {
    console.log(chalk.blue.bold('\n🤖 Create AI App'));
    console.log(chalk.gray('AIPatternEnforcer starter project generator\n'));

    try {
      // Step 1: Get project configuration
      const config = await this.getProjectConfig();
      
      // Step 2: Validate project name
      await this.validateProjectName(config.projectName);
      
      // Step 3: Copy starter template
      console.log(chalk.blue('📦 Creating project from template...'));
      await this.copyStarter(config);
      
      // Step 4: Setup environment
      console.log(chalk.blue('⚙️  Setting up environment...'));
      await this.setupEnvironment(config);
      
      // Step 5: Install dependencies
      console.log(chalk.blue('📥 Installing dependencies...'));
      await this.installDependencies(config.projectName);
      
      // Step 6: Generate first component
      console.log(chalk.blue('🎨 Generating welcome component...'));
      await this.generateFirstComponent(config.projectName);
      
      // Step 7: Success message
      this.showSuccessMessage(config);
      
    } catch (error) {
      console.error(chalk.red('\n💥 Failed to create project!'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  }

  async getProjectConfig() {
    const starters = this.getAvailableStarters();
    
    const answers = await inquirer.prompt([
      {
        name: 'projectName',
        message: 'Project name:',
        default: 'my-ai-app',
        validate: input => {
          if (!input.trim()) return 'Project name is required';
          if (!/^[a-z0-9-_]+$/i.test(input)) return 'Use letters, numbers, hyphens, and underscores only';
          return true;
        }
      },
      {
        name: 'starter',
        type: 'list',
        message: 'Choose a starter template:',
        choices: starters.map(starter => ({
          name: this.getStarterDescription(starter),
          value: starter
        })),
        default: 'minimal-ai-app'
      },
      {
        name: 'enableHooks',
        type: 'confirm',
        message: 'Enable real-time protection? (recommended)',
        default: true
      }
    ]);

    return answers;
  }

  getAvailableStarters() {
    if (!fs.existsSync(this.templateDir)) {
      throw new Error('Starter templates not found. Run this from AIPatternEnforcer root.');
    }
    
    return fs.readdirSync(this.templateDir)
      .filter(item => {
        const itemPath = path.join(this.templateDir, item);
        return fs.statSync(itemPath).isDirectory();
      });
  }

  getStarterDescription(starter) {
    const descriptions = {
      'minimal-ai-app': 'Minimal AI App (recommended for most projects)',
      'ai-chat-interface': 'AI Chat Interface (chat-focused applications)', 
      'ai-document-processor': 'AI Document Processor (OCR and document AI)'
    };
    return descriptions[starter] || `${starter} (custom starter)`;
  }

  async validateProjectName(projectName) {
    const targetPath = path.join(this.cwd, projectName);
    if (fs.existsSync(targetPath)) {
      throw new Error(`Directory '${projectName}' already exists`);
    }
  }

  async copyStarter(config) {
    const sourcePath = path.join(this.templateDir, config.starter);
    const targetPath = path.join(this.cwd, config.projectName);
    
    if (!fs.existsSync(sourcePath)) {
      throw new Error(`Starter template '${config.starter}' not found`);
    }
    
    execSync(`cp -r "${sourcePath}" "${targetPath}"`, { encoding: 'utf8' });
    console.log(chalk.green(`  ✓ Copied ${config.starter} template`));
  }

  async setupEnvironment(config) {
    const projectPath = path.join(this.cwd, config.projectName);
    const envPath = path.join(projectPath, '.env');
    
    // Create .env with hooks configuration per CLAUDE.md requirements
    const envContent = config.enableHooks 
      ? 'HOOKS_DISABLED=false\nHOOK_VERBOSE=false\n\n# Add your AI API keys here\nOPENAI_API_KEY=your-key-here\nANTHROPIC_API_KEY=your-key-here\n'
      : 'HOOKS_DISABLED=true\n\n# Add your AI API keys here\nOPENAI_API_KEY=your-key-here\nANTHROPIC_API_KEY=your-key-here\n';
    
    fs.writeFileSync(envPath, envContent);
    console.log(chalk.green(`  ✓ Environment configured (hooks: ${config.enableHooks ? 'enabled' : 'disabled'})`));
  }

  async installDependencies(projectName) {
    const projectPath = path.join(this.cwd, projectName);
    process.chdir(projectPath);
    
    try {
      execSync('npm install', { stdio: 'pipe' });
      console.log(chalk.green('  ✓ Dependencies installed'));
    } catch (error) {
      console.log(chalk.yellow('  ⚠️  Dependencies install failed, run manually: npm install'));
    }
  }

  async generateFirstComponent(projectName) {
    try {
      execSync('npm run g:c WelcomeCard', { stdio: 'pipe' });
      console.log(chalk.green('  ✓ Generated WelcomeCard component'));
    } catch (error) {
      console.log(chalk.yellow('  ⚠️  Component generation skipped, run manually: npm run g:c ComponentName'));
    }
  }

  showSuccessMessage(config) {
    console.log(chalk.green.bold('\n🎉 Success! Created ' + config.projectName));
    console.log(chalk.cyan('\n🚀 Get started:'));
    console.log(chalk.white(`  cd ${config.projectName}`));
    console.log(chalk.white('  npm run dev'));
    console.log(chalk.cyan('\n📚 Learn more:'));
    console.log(chalk.white('  npm run g:c ComponentName  # Generate components'));
    console.log(chalk.white('  npm test                   # Run tests'));
    console.log(chalk.white('  npm run check:all          # Validate code'));
    console.log(chalk.gray('\n🛡️  Real-time protection ' + (config.enableHooks ? 'ENABLED' : 'DISABLED')));
    console.log(chalk.gray('   Edit .env to change hook settings'));
    console.log(chalk.blue.bold('\nHappy coding! 🚀\n'));
  }
}

// Run create-ai-app if called directly
if (require.main === module) {
  const creator = new CreateAiApp();
  creator.create();
}

module.exports = { CreateAiApp };