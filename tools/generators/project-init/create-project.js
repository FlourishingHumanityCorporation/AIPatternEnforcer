#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const inquirer = require('inquirer');
const chalk = require('chalk');

async function createProject() {
  console.log(chalk.blue.bold('\n🚀 Create New Project from ProjectTemplate\n'));

  // Get project details
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      validate: (input) => {
        if (!input.trim()) return 'Project name is required';
        if (!/^[a-z0-9-]+$/.test(input)) {
          return 'Project name should only contain lowercase letters, numbers, and hyphens';
        }
        return true;
      },
    },
    {
      type: 'input',
      name: 'projectPath',
      message: 'Where to create the project:',
      default: (answers) => `./${answers.projectName}`,
    },
    {
      type: 'input',
      name: 'description',
      message: 'Project description:',
      default: 'A new project based on ProjectTemplate',
    },
    {
      type: 'confirm',
      name: 'useGit',
      message: 'Initialize git repository?',
      default: true,
    },
    {
      type: 'confirm',
      name: 'installDeps',
      message: 'Install dependencies now?',
      default: true,
    },
  ]);

  const { projectName, projectPath, description, useGit, installDeps } = answers;
  const targetDir = path.resolve(projectPath);
  const templateDir = path.resolve(__dirname, '../../..');

  // Check if target directory exists
  if (fs.existsSync(targetDir)) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `Directory ${targetDir} already exists. Overwrite?`,
        default: false,
      },
    ]);

    if (!overwrite) {
      console.log(chalk.yellow('✖ Operation cancelled'));
      process.exit(0);
    }

    console.log(chalk.yellow(`Removing existing directory...`));
    fs.rmSync(targetDir, { recursive: true, force: true });
  }

  console.log(chalk.blue(`\n📁 Creating project at ${targetDir}...\n`));

  // Create target directory
  fs.mkdirSync(targetDir, { recursive: true });

  // Files and directories to copy
  const itemsToCopy = [
    'src',
    'public',
    'config',
    'scripts',
    'tools',
    'templates',
    'ai',
    'docs',
    'tests',
    '.eslintrc.json',
    '.prettierrc',
    'tsconfig.json',
    'vite.config.ts',
    'index.html',
    '.gitignore',
    'README.md',
    'CLAUDE.md',
    'QUICK-START.md',
    'DOCS_INDEX.md',
  ];

  // Copy files and directories
  itemsToCopy.forEach((item) => {
    const sourcePath = path.join(templateDir, item);
    const targetPath = path.join(targetDir, item);

    if (fs.existsSync(sourcePath)) {
      console.log(chalk.gray(`  Copying ${item}...`));
      copyRecursive(sourcePath, targetPath);
    }
  });

  // Create customized package.json
  const templatePackageJson = JSON.parse(
    fs.readFileSync(path.join(templateDir, 'package.json'), 'utf8')
  );

  const newPackageJson = {
    ...templatePackageJson,
    name: projectName,
    version: '0.1.0',
    description: description,
    private: true,
  };

  // Remove template-specific scripts
  delete newPackageJson.scripts['create-project'];
  delete newPackageJson.scripts['cleanup:template'];

  // Update Vite scripts to use root-level config
  if (newPackageJson.scripts['dev']) {
    newPackageJson.scripts['dev'] = newPackageJson.scripts['dev'].replace('--config config/vite.config.ts', '');
  }
  if (newPackageJson.scripts['build']) {
    newPackageJson.scripts['build'] = newPackageJson.scripts['build'].replace('--config config/vite.config.ts', '');
  }
  if (newPackageJson.scripts['preview']) {
    newPackageJson.scripts['preview'] = newPackageJson.scripts['preview'].replace('--config config/vite.config.ts', '');
  }

  fs.writeFileSync(
    path.join(targetDir, 'package.json'),
    JSON.stringify(newPackageJson, null, 2)
  );

  // Update README
  const readmeContent = `# ${projectName}

${description}

This project was created from [ProjectTemplate](https://github.com/your-org/project-template).

## Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
\`\`\`

## Available Scripts

- \`npm run dev\` - Start development server
- \`npm test\` - Run tests
- \`npm run build\` - Build for production
- \`npm run g:c ComponentName\` - Generate a new component
- \`npm run check:all\` - Run all enforcement checks

## Documentation

- [Quick Start Guide](QUICK-START.md)
- [AI Assistant Setup](docs/guides/ai-development/ai-assistant-setup.md)
- [Complete Documentation](DOCS_INDEX.md)
`;

  fs.writeFileSync(path.join(targetDir, 'README.md'), readmeContent);

  // Initialize git repository
  if (useGit) {
    console.log(chalk.blue('\n📦 Initializing git repository...'));
    execSync('git init', { cwd: targetDir, stdio: 'inherit' });
    
    // Create initial commit
    execSync('git add .', { cwd: targetDir, stdio: 'inherit' });
    execSync('git commit -m "Initial commit from ProjectTemplate"', {
      cwd: targetDir,
      stdio: 'inherit',
    });
  }

  // Install dependencies
  if (installDeps) {
    console.log(chalk.blue('\n📦 Installing dependencies...'));
    execSync('npm install', { cwd: targetDir, stdio: 'inherit' });
  }

  console.log(chalk.green.bold(`\n✅ Project created successfully!\n`));
  console.log(chalk.white('Next steps:'));
  console.log(chalk.gray(`  cd ${projectPath}`));
  if (!installDeps) {
    console.log(chalk.gray('  npm install'));
  }
  console.log(chalk.gray('  npm run dev'));
  console.log(chalk.gray('\nHappy coding! 🎉\n'));
}

function copyRecursive(source, target) {
  const stats = fs.statSync(source);

  if (stats.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    const files = fs.readdirSync(source);

    files.forEach((file) => {
      // Skip node_modules, dist, coverage, and other build artifacts
      if (
        file === 'node_modules' ||
        file === 'dist' ||
        file === 'coverage' ||
        file === '.git' ||
        file === '.DS_Store'
      ) {
        return;
      }

      copyRecursive(path.join(source, file), path.join(target, file));
    });
  } else {
    fs.copyFileSync(source, target);
  }
}

// Handle errors gracefully
process.on('unhandledRejection', (err) => {
  console.error(chalk.red('\n❌ Error:'), err.message);
  process.exit(1);
});

// Run the script
createProject().catch((err) => {
  console.error(chalk.red('\n❌ Error:'), err.message);
  process.exit(1);
});