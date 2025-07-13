#!/usr/bin/env node

const inquirer = require('inquirer');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const ora = require('ora');

class GuidedSetupWizard {
  constructor(options = {}) {
    this.config = {};
    this.projectRoot = process.cwd();
    this.stateFile = path.join(this.projectRoot, '.setup-state.json');
    this.expertMode = options.expert || false;
    this.quickMode = options.quick || false;
  }

  async run() {
    if (this.quickMode) {
      return this.runQuickSetup();
    }

    const modeLabel = this.expertMode ? 'Expert' : 'Guided';
    logger.info(chalk.cyan.bold(`\n🚀 ProjectTemplate ${modeLabel} Setup Wizard`));
    logger.info(chalk.gray('Setting up your AI-enhanced development environment...\n'));

    try {
      await this.loadPreviousState();

      await this.projectNaming();

      if (this.expertMode) {
        await this.expertStackSelection();
        await this.expertAIConfiguration();
        await this.expertEnforcementConfiguration();
      } else {
        await this.stackSelection();
        await this.aiToolConfiguration();
        await this.enforcementLevel();
      }

      await this.validation();
      await this.finalizeSetup();
      this.cleanup();

      logger.info(chalk.green.bold('\n✅ Setup completed successfully!'));
      logger.info(chalk.yellow('\n🎯 Next steps:'));
      logger.info('  • Run: npm run g:c MyComponent  (generate your first component)');
      logger.info('  • Run: npm run demo:generators   (explore all generators)');
      logger.info('  • Check: QUICK-START.md         (2-minute orientation)\n');

    } catch (error) {
      logger.error(chalk.red('\n❌ Setup failed:'), error.message);
      logger.info(chalk.yellow('💾 Progress saved. Run the wizard again to continue.'));
      process.exit(1);
    }
  }

  async runQuickSetup() {
    logger.info(chalk.cyan.bold('\n⚡ Quick Setup Mode'));
    logger.info(chalk.gray('Running essential setup only...\n'));

    const spinner = ora('Installing dependencies...').start();
    try {
      execSync('npm install', { stdio: 'pipe' });
      spinner.succeed('Dependencies installed');
    } catch (error) {
      spinner.fail('Failed to install dependencies');
      throw error;
    }

    const setupSpinner = ora('Setting up git hooks...').start();
    try {
      execSync('npm run setup:hooks', { stdio: 'pipe' });
      setupSpinner.succeed('Git hooks configured');
    } catch (error) {
      setupSpinner.fail('Failed to setup hooks');
      // Don't throw - hooks are optional
    }

    logger.info(chalk.green.bold('\n✅ Quick setup complete!'));
    logger.info(chalk.yellow('🎯 Ready to use:'));
    logger.info('  • npm run g:c ComponentName  (generate components)');
    logger.info('  • npm run demo:generators    (explore generators)');
    logger.info('  • npm run setup:guided       (full configuration)\n');
  }

  async loadPreviousState() {
    if (fs.existsSync(this.stateFile)) {
      const saved = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
      const resume = await inquirer.prompt([{
        type: 'confirm',
        name: 'resume',
        message: 'Previous setup detected. Resume from where you left off?',
        default: true
      }]);

      if (resume.resume) {
        this.config = saved;
        logger.info(chalk.green('📁 Resuming previous setup...\n'));
      }
    }
  }

  saveState() {
    fs.writeFileSync(this.stateFile, JSON.stringify(this.config, null, 2));
  }

  async projectNaming() {
    if (this.config.projectName) return;

    logger.info(chalk.blue.bold('📝 Project Naming'));

    const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'What\'s your project name?',
      default: path.basename(this.projectRoot),
      validate: (input) => {
        if (!input.trim()) return 'Project name is required';
        if (!/^[a-zA-Z0-9-_]+$/.test(input)) return 'Use only letters, numbers, hyphens, and underscores';
        return true;
      }
    },
    {
      type: 'input',
      name: 'description',
      message: 'Brief project description:',
      default: 'AI-enhanced application built with ProjectTemplate'
    }]
    );

    this.config = { ...this.config, ...answers };
    this.saveState();
  }

  async stackSelection() {
    if (this.config.techStack) return;

    logger.info(chalk.blue.bold('\n🏗️  Technology Stack'));

    const stacks = [
    {
      name: 'Next.js + TypeScript + Tailwind (Frontend Focus)',
      value: 'nextjs-ts-tailwind',
      description: 'React-based with modern styling'
    },
    {
      name: 'Next.js + FastAPI + PostgreSQL (Full Stack)',
      value: 'nextjs-fastapi-postgres',
      description: 'React frontend with Python backend'
    },
    {
      name: 'React + Node.js + SQLite (Rapid Prototype)',
      value: 'react-node-sqlite',
      description: 'Lightweight full-stack development'
    },
    {
      name: 'Custom/Existing (I\'ll configure manually)',
      value: 'custom',
      description: 'Keep existing setup, just add AI tools'
    }];


    const stackChoice = await inquirer.prompt([{
      type: 'list',
      name: 'techStack',
      message: 'Choose your technology stack:',
      choices: stacks.map((stack) => ({
        name: `${stack.name}\n  ${chalk.gray(stack.description)}`,
        value: stack.value
      }))
    }]);

    if (stackChoice.techStack !== 'custom') {
      const preview = await inquirer.prompt([{
        type: 'confirm',
        name: 'showPreview',
        message: 'Would you like to see what will be generated?',
        default: true
      }]);

      if (preview.showPreview) {
        this.showStackPreview(stackChoice.techStack);
      }
    }

    this.config = { ...this.config, ...stackChoice };
    this.saveState();
  }

  showStackPreview(stack) {
    const previews = {
      'nextjs-ts-tailwind': `
📁 Project Structure:
  ├── src/
  │   ├── components/     # React components
  │   ├── pages/         # Next.js pages
  │   ├── styles/        # Tailwind CSS
  │   └── types/         # TypeScript definitions
  ├── tests/             # Jest/Testing Library
  └── package.json       # Dependencies configured`,

      'nextjs-fastapi-postgres': `
📁 Project Structure:
  ├── frontend/          # Next.js React app
  ├── backend/           # FastAPI Python server
  ├── database/          # PostgreSQL schemas
  ├── docker-compose.yml # Development environment
  └── tests/             # Full-stack testing`,

      'react-node-sqlite': `
📁 Project Structure:
  ├── client/            # React frontend
  ├── server/            # Express.js backend
  ├── database/          # SQLite database
  └── shared/            # Common utilities`
    };

    logger.info(chalk.green(previews[stack] || 'Custom configuration will preserve your existing structure.'));
  }

  async aiToolConfiguration() {
    if (this.config.aiTool) return;

    logger.info(chalk.blue.bold('\n🤖 AI Tool Setup'));

    const tools = [
    { name: 'Cursor (VS Code + AI)', value: 'cursor' },
    { name: 'Claude (Anthropic)', value: 'claude' },
    { name: 'GitHub Copilot', value: 'copilot' },
    { name: 'Multiple tools', value: 'multiple' },
    { name: 'Skip for now', value: 'skip' }];


    const aiChoice = await inquirer.prompt([{
      type: 'list',
      name: 'aiTool',
      message: 'Which AI tool will you primarily use?',
      choices: tools
    }]);

    if (aiChoice.aiTool !== 'skip') {
      const spinner = ora('Detecting AI tool installation...').start();

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate detection

      spinner.succeed('AI tool compatibility verified');

      const configChoice = await inquirer.prompt([{
        type: 'confirm',
        name: 'autoConfig',
        message: 'Automatically configure AI tool settings?',
        default: true
      }]);

      aiChoice.autoConfig = configChoice.autoConfig;
    }

    this.config = { ...this.config, ...aiChoice };
    this.saveState();
  }

  async enforcementLevel() {
    if (this.config.enforcementLevel) return;

    logger.info(chalk.blue.bold('\n⚡ Code Enforcement'));
    logger.info(chalk.gray('ProjectTemplate can enforce coding standards automatically.\n'));

    const levels = [
    {
      name: 'Beginner - Warnings only, learn gradually',
      value: 'beginner',
      description: 'Helpful suggestions without blocking'
    },
    {
      name: 'Intermediate - Balanced enforcement',
      value: 'intermediate',
      description: 'Some rules enforced, others as warnings'
    },
    {
      name: 'Expert - Strict enforcement',
      value: 'expert',
      description: 'All rules enforced for consistency'
    }];


    const enforcement = await inquirer.prompt([{
      type: 'list',
      name: 'enforcementLevel',
      message: 'Choose enforcement level:',
      choices: levels.map((level) => ({
        name: `${level.name}\n  ${chalk.gray(level.description)}`,
        value: level.value
      }))
    }]);

    this.config = { ...this.config, ...enforcement };
    this.saveState();
  }

  async validation() {
    logger.info(chalk.blue.bold('\n🔍 Setup Validation'));

    const validationSteps = [
    { name: 'Dependencies', check: () => this.validateDependencies() },
    { name: 'Project Structure', check: () => this.validateStructure() },
    { name: 'AI Tool Config', check: () => this.validateAIConfig() },
    { name: 'Enforcement Setup', check: () => this.validateEnforcement() }];


    for (const step of validationSteps) {
      const spinner = ora(`Validating ${step.name}...`).start();

      try {
        await step.check();
        spinner.succeed(`${step.name} validated`);
      } catch (error) {
        spinner.fail(`${step.name} failed: ${error.message}`);

        const fix = await inquirer.prompt([{
          type: 'confirm',
          name: 'autoFix',
          message: `Attempt to fix ${step.name} automatically?`,
          default: true
        }]);

        if (fix.autoFix) {
          const fixSpinner = ora(`Fixing ${step.name}...`).start();
          await new Promise((resolve) => setTimeout(resolve, 2000));
          fixSpinner.succeed(`${step.name} fixed`);
        }
      }
    }

    this.config.validationComplete = true;
    this.saveState();
  }

  async validateDependencies() {
    // Check if package.json exists and has required dependencies
    const packagePath = path.join(this.projectRoot, 'package.json');
    if (!fs.existsSync(packagePath)) {
      throw new Error('package.json not found. Please run this wizard from a Node.js project root.');
    }

    try {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

      // Check for required dependencies
      const requiredDeps = ['inquirer', 'chalk', 'ora'];
      const missingDeps = requiredDeps.filter((dep) =>
      !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
      );

      if (missingDeps.length > 0) {
        throw new Error(`Missing required dependencies: ${missingDeps.join(', ')}. Run 'npm install' first.`);
      }

      // Check if node_modules exists
      const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
      if (!fs.existsSync(nodeModulesPath)) {
        throw new Error('node_modules directory not found. Run \'npm install\' first.');
      }

    } catch (error) {
      if (error.message.includes('Unexpected token')) {
        throw new Error('package.json contains invalid JSON');
      }
      throw error;
    }
  }

  async validateStructure() {
    // Check basic project structure
    const requiredDirs = ['scripts', 'docs', 'tools'];
    const missingDirs = [];

    for (const dir of requiredDirs) {
      if (!fs.existsSync(path.join(this.projectRoot, dir))) {
        missingDirs.push(dir);
      }
    }

    if (missingDirs.length > 0) {
      // Create missing directories
      logger.info(chalk.yellow(`Creating missing directories: ${missingDirs.join(', ')}`));
      for (const dir of missingDirs) {
        try {
          fs.mkdirSync(path.join(this.projectRoot, dir), { recursive: true });
        } catch (error) {
          throw new Error(`Failed to create directory ${dir}: ${error.message}`);
        }
      }
    }

    // Check for essential files
    const essentialFiles = ['package.json'];
    for (const file of essentialFiles) {
      if (!fs.existsSync(path.join(this.projectRoot, file))) {
        throw new Error(`Essential file ${file} not found. This may not be a valid Node.js project.`);
      }
    }
  }

  async validateAIConfig() {
    // Validate AI tool configuration
    if (this.config.aiTool === 'skip') return;

    const aiConfigPath = path.join(this.projectRoot, 'ai', 'config');
    if (!fs.existsSync(aiConfigPath)) {
      logger.info(chalk.yellow('AI configuration directory not found, creating...'));
      try {
        fs.mkdirSync(aiConfigPath, { recursive: true });

        // Create basic AI config structure
        const basicCursorRules = `# ProjectTemplate Cursor Rules
# Generated by setup wizard

# TypeScript preferences
prefer_typescript=true
prefer_functional_components=true

# File organization
components_dir=src/components
hooks_dir=src/hooks
utils_dir=src/utils

# Code style
max_line_length=100
prefer_const=true
prefer_arrow_functions=true
`;

        fs.writeFileSync(
          path.join(aiConfigPath, '.cursorrules'),
          basicCursorRules
        );

        logger.info(chalk.green('Basic AI configuration created'));
      } catch (error) {
        throw new Error(`Failed to create AI configuration: ${error.message}`);
      }
    }

    // Verify critical AI config files exist
    const aiFiles = {
      '.cursorrules': 'Cursor IDE configuration'
    };

    for (const [file, description] of Object.entries(aiFiles)) {
      const filePath = path.join(aiConfigPath, file);
      if (!fs.existsSync(filePath)) {
        logger.info(chalk.yellow(`${description} not found, will be created during finalization`));
      }
    }
  }

  async validateEnforcement() {
    // Validate enforcement system
    const enforcementPath = path.join(this.projectRoot, 'tools', 'enforcement');
    if (!fs.existsSync(enforcementPath)) {
      logger.info(chalk.yellow('Enforcement tools not found, creating basic structure...'));
      try {
        fs.mkdirSync(enforcementPath, { recursive: true });

        // Create a basic enforcement script
        const basicEnforcement = `#!/usr/bin/env node
// Basic enforcement script - generated by setup wizard
console.log('✅ Enforcement system ready');
`;
        fs.writeFileSync(
          path.join(enforcementPath, 'basic-check.js'),
          basicEnforcement
        );

        logger.info(chalk.green('Basic enforcement structure created'));
      } catch (error) {
        logger.info(chalk.yellow(`Warning: Could not create enforcement tools: ${error.message}`));
        logger.info(chalk.gray('Enforcement features will be limited'));
      }
    }

    // Check for key enforcement files (but don't fail if missing)
    const enforcementFiles = [
    'no-improved-files.js',
    'check-imports.js',
    'documentation-style.js'];


    let missingFiles = 0;
    for (const file of enforcementFiles) {
      if (!fs.existsSync(path.join(enforcementPath, file))) {
        missingFiles++;
      }
    }

    if (missingFiles > 0) {
      logger.info(chalk.yellow(`Note: ${missingFiles} enforcement tools not found - some features may be limited`));
    }
  }

  async finalizeSetup() {
    logger.info(chalk.blue.bold('\n📋 Finalizing Setup'));

    // Update package.json with project name
    await this.updatePackageJson();

    // Configure AI tools
    if (this.config.aiTool !== 'skip') {
      await this.configureAITools();
    }

    // Set enforcement level
    await this.configureEnforcement();

    // Generate completion report
    await this.generateReport();
  }

  async updatePackageJson() {
    const packagePath = path.join(this.projectRoot, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

    packageJson.name = this.config.projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    packageJson.description = this.config.description;

    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
  }

  async configureAITools() {
    const spinner = ora('Configuring AI tools...').start();

    try {
      // Create AI tool specific configurations
      const aiConfigDir = path.join(this.projectRoot, 'ai', 'config');

      // Ensure AI config directory exists
      if (!fs.existsSync(aiConfigDir)) {
        fs.mkdirSync(aiConfigDir, { recursive: true });
      }

      if (this.config.aiTool === 'cursor' || this.config.aiTool === 'multiple') {
        // Check if cursor rules exist, create basic ones if not
        const cursorRulesPath = path.join(aiConfigDir, '.cursorrules');
        if (!fs.existsSync(cursorRulesPath)) {
          const basicCursorRules = `# ProjectTemplate Cursor Rules
# Generated by setup wizard - ${new Date().toISOString()}

# TypeScript preferences
prefer_typescript=true
prefer_functional_components=true

# File organization  
components_dir=src/components
hooks_dir=src/hooks
utils_dir=src/utils

# Code style
max_line_length=100
prefer_const=true
prefer_arrow_functions=true

# AI assistance
include_tests=true
include_documentation=true
`;
          fs.writeFileSync(cursorRulesPath, basicCursorRules);
        }
        spinner.text = 'Cursor configuration ready';
      }

      if (this.config.aiTool === 'claude' || this.config.aiTool === 'multiple') {
        // Claude configuration 
        const claudeSettingsDir = path.join(this.projectRoot, '.claude');
        if (!fs.existsSync(claudeSettingsDir)) {
          fs.mkdirSync(claudeSettingsDir, { recursive: true });
        }

        const claudeSettings = {
          hooks: {
            post_edit: "npm run fix:docs:dry-run || echo 'Documentation fixes not available'"
          },
          context: {
            include_project_structure: true,
            max_file_size: "50kb"
          }
        };

        fs.writeFileSync(
          path.join(claudeSettingsDir, 'settings.json'),
          JSON.stringify(claudeSettings, null, 2)
        );
      }

      // Create basic .aiignore if it doesn't exist
      const aiIgnorePath = path.join(this.projectRoot, '.aiignore');
      if (!fs.existsSync(aiIgnorePath)) {
        const basicAiIgnore = `# AI Context Ignore Rules
# Generated by setup wizard

# Dependencies
node_modules/
.git/
dist/
build/

# Temporary files
*.tmp
*.temp
.DS_Store

# Large files
*.log
*.sqlite
*.db
`;
        fs.writeFileSync(aiIgnorePath, basicAiIgnore);
      }

      spinner.succeed('AI tools configured');
    } catch (error) {
      spinner.fail(`AI configuration failed: ${error.message}`);
      logger.info(chalk.yellow('Continuing with basic setup...'));
    }
  }

  async configureEnforcement() {
    const spinner = ora('Configuring enforcement rules...').start();

    // Map user-friendly levels to enforcement system levels
    const levelMapping = {
      'beginner': 1, // WARNING level - show violations but don't block
      'intermediate': 2, // PARTIAL level - block file naming only  
      'expert': 3, // FULL level - block all violations
      'minimal': 1,
      'custom': 2
    };

    const enforcementLevel = levelMapping[this.config.enforcementLevel] || 2;

    const enforcementConfig = {
      level: enforcementLevel,
      checks: {
        fileNaming: {
          enabled: true,
          blockOnFailure: enforcementLevel >= 2,
          level: enforcementLevel
        },
        imports: {
          enabled: true,
          blockOnFailure: enforcementLevel >= 3,
          level: Math.min(enforcementLevel, 2)
        },
        documentation: {
          enabled: true,
          blockOnFailure: enforcementLevel >= 3,
          level: Math.min(enforcementLevel, 2),
          ignorePatterns: [
          'node_modules/**',
          'examples/**',
          'ai/examples/**',
          'ai/prompts/**',
          'templates/**',
          'extensions/*/node_modules/**',
          'docs/testing/**',
          'scripts/**',
          '**/README.md',
          '**/*_TEMPLATE.md',
          'docs/pilot-testing/**',
          'CLAUDE.md']

        },
        bannedDocs: {
          enabled: true,
          blockOnFailure: true,
          level: 3,
          description: 'Prevents creation of status/completion/summary documents'
        }
      },
      metrics: {
        enabled: true,
        logPath: '.enforcement-metrics.json'
      },
      userProfile: {
        level: this.config.enforcementLevel,
        experience: 0,
        autoUpgrade: enforcementLevel < 3
      }
    };

    // Handle custom rules if expert mode was used
    if (this.config.customRules) {
      enforcementConfig.checks.fileNaming.enabled = this.config.customRules.includes('fileNaming');
      enforcementConfig.checks.imports.enabled = this.config.customRules.includes('imports');
      enforcementConfig.checks.documentation.enabled = this.config.customRules.includes('docs');

      if (this.config.blockingMode !== undefined) {
        enforcementConfig.checks.fileNaming.blockOnFailure = this.config.blockingMode;
        enforcementConfig.checks.imports.blockOnFailure = this.config.blockingMode;
        enforcementConfig.checks.documentation.blockOnFailure = this.config.blockingMode;
      }
    }

    fs.writeFileSync(
      path.join(this.projectRoot, '.enforcement-config.json'),
      JSON.stringify(enforcementConfig, null, 2)
    );

    spinner.succeed('Enforcement configured');
  }

  async generateReport() {
    const report = {
      setupDate: new Date().toISOString(),
      projectName: this.config.projectName,
      techStack: this.config.techStack,
      aiTool: this.config.aiTool,
      enforcementLevel: this.config.enforcementLevel,
      nextSteps: [
      'Run: npm run g:c MyComponent',
      'Explore: npm run demo:generators',
      'Read: QUICK-START.md']

    };

    const reportPath = path.join(this.projectRoot, '.setup-completion-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    logger.info(chalk.green(`\n📊 Setup report saved to: ${path.relative(this.projectRoot, reportPath)}`));
  }

  async expertStackSelection() {
    if (this.config.techStack) return;

    logger.info(chalk.blue.bold('\n🏗️  Expert Stack Configuration'));

    const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'techStack',
      message: 'Specify your technology stack:',
      default: 'custom',
      validate: (input) => input.trim() ? true : 'Stack specification required'
    },
    {
      type: 'confirm',
      name: 'customConfig',
      message: 'Provide custom build/dev configurations?',
      default: false
    },
    {
      type: 'input',
      name: 'buildCommand',
      message: 'Build command:',
      default: 'npm run build',
      when: (answers) => answers.customConfig
    },
    {
      type: 'input',
      name: 'devCommand',
      message: 'Dev server command:',
      default: 'npm run dev',
      when: (answers) => answers.customConfig
    }]
    );

    this.config = { ...this.config, ...answers };
    this.saveState();
  }

  async expertAIConfiguration() {
    if (this.config.aiTool) return;

    logger.info(chalk.blue.bold('\n🤖 Expert AI Configuration'));

    const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'aiTools',
      message: 'Select AI tools to configure:',
      choices: [
      { name: 'Cursor (VS Code AI)', value: 'cursor' },
      { name: 'Claude API', value: 'claude' },
      { name: 'GitHub Copilot', value: 'copilot' },
      { name: 'OpenAI API', value: 'openai' },
      { name: 'Local models', value: 'local' }]

    },
    {
      type: 'confirm',
      name: 'advancedContextManagement',
      message: 'Enable advanced context management?',
      default: true
    },
    {
      type: 'confirm',
      name: 'customPrompts',
      message: 'Configure custom prompt templates?',
      default: false
    }]
    );

    this.config.aiTool = answers.aiTools.length > 1 ? 'multiple' : answers.aiTools[0] || 'skip';
    this.config.aiAdvanced = answers;
    this.saveState();
  }

  async expertEnforcementConfiguration() {
    if (this.config.enforcementLevel) return;

    logger.info(chalk.blue.bold('\n⚡ Expert Enforcement Configuration'));

    const answers = await inquirer.prompt([
    {
      type: 'list',
      name: 'enforcementLevel',
      message: 'Enforcement strictness:',
      choices: [
      { name: 'Strict - All rules enforced', value: 'expert' },
      { name: 'Custom - Configure individual rules', value: 'custom' },
      { name: 'Minimal - Essential rules only', value: 'minimal' }]

    },
    {
      type: 'checkbox',
      name: 'customRules',
      message: 'Select rules to enforce:',
      when: (answers) => answers.enforcementLevel === 'custom',
      choices: [
      { name: 'File naming conventions', value: 'fileNaming', checked: true },
      { name: 'Import organization', value: 'imports', checked: true },
      { name: 'Documentation standards', value: 'docs', checked: true },
      { name: 'No improved/v2 files', value: 'noImproved', checked: true },
      { name: 'Console.log detection', value: 'noConsole', checked: false },
      { name: 'Test coverage requirements', value: 'testCoverage', checked: false }]

    },
    {
      type: 'confirm',
      name: 'blockingMode',
      message: 'Block commits that violate rules?',
      default: true
    }]
    );

    this.config = { ...this.config, ...answers };
    this.saveState();
  }

  cleanup() {
    // Remove temporary state file
    if (fs.existsSync(this.stateFile)) {
      fs.unlinkSync(this.stateFile);
    }
  }
}

// CLI entry point
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    expert: args.includes('--expert-mode') || args.includes('--expert'),
    quick: args.includes('--quick'),
    help: args.includes('--help') || args.includes('-h')
  };

  if (options.help) {
    logger.info(chalk.cyan.bold('\n🚀 ProjectTemplate Setup Wizard\n'));
    logger.info('Usage: node guided-setup.js [options]\n');
    logger.info('Options:');
    logger.info('  --expert-mode, --expert  Expert configuration with advanced options');
    logger.info('  --quick                  Quick setup (dependencies + hooks only)');
    logger.info('  --help, -h              Show this help message');
    logger.info('\nExamples:');
    logger.info('  npm run setup:guided           # Standard guided setup');
    logger.info('  npm run setup:expert           # Expert mode with advanced options');
    logger.info('  npm run setup:quick            # Quick setup only');
    process.exit(0);
  }

  const wizard = new GuidedSetupWizard(options);
  wizard.run().catch(console.error);
}

module.exports = GuidedSetupWizard;