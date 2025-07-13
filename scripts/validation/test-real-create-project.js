#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const chalk = require('chalk');

const testProjectName = 'test-real-create-' + Date.now();
const testProjectPath = path.resolve('../', testProjectName);

logger.info(chalk.blue.bold('\n🧪 Testing Real npm run create-project Command\n'));
logger.info(chalk.gray(`This tests the actual user workflow with the interactive create-project script.`));
logger.info(chalk.gray(`Test project: ${testProjectPath}\n`));

// Clean up any existing test project
if (fs.existsSync(testProjectPath)) {
  fs.rmSync(testProjectPath, { recursive: true, force: true });
}

async function testRealCreateProject() {
  return new Promise((resolve, reject) => {
    logger.info(chalk.blue('▶ Running: npm run create-project'));

    const createProcess = spawn('npm', ['run', 'create-project'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: process.cwd()
    });

    let step = 0;
    const answers = [
    testProjectName, // Project name
    `../${testProjectName}`, // Project path  
    'Test project for validation', // Description
    'y', // Initialize git
    'y' // Install dependencies
    ];

    createProcess.stdout.on('data', (data) => {
      const output = data.toString();
      logger.info(chalk.gray(output));

      // Auto-answer prompts
      if (output.includes('Project name:') && step === 0) {
        createProcess.stdin.write(answers[0] + '\n');
        step++;
      } else if (output.includes('Where to create the project:') && step === 1) {
        createProcess.stdin.write(answers[1] + '\n');
        step++;
      } else if (output.includes('Project description:') && step === 2) {
        createProcess.stdin.write(answers[2] + '\n');
        step++;
      } else if (output.includes('Initialize git repository?') && step === 3) {
        createProcess.stdin.write(answers[3] + '\n');
        step++;
      } else if (output.includes('Install dependencies now?') && step === 4) {
        createProcess.stdin.write(answers[4] + '\n');
        step++;
      }

      // Check for success
      if (output.includes('✅ Project created successfully!')) {
        logger.info(chalk.green('\n✓ npm run create-project completed successfully'));
        setTimeout(() => {
          validateCreatedProject().then(resolve).catch(reject);
        }, 1000);
      }
    });

    createProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (!error.includes('warn') && !error.includes('deprecated')) {
        logger.error(chalk.red(error));
      }
    });

    createProcess.on('close', (code) => {
      if (code !== 0 && code !== null) {
        reject(new Error(`create-project exited with code ${code}`));
      }
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      createProcess.kill();
      reject(new Error('create-project timed out after 5 minutes'));
    }, 300000);
  });
}

async function validateCreatedProject() {
  logger.info(chalk.blue('\n🔍 Validating created project...'));

  if (!fs.existsSync(testProjectPath)) {
    throw new Error('Project directory was not created');
  }

  // Check essential files exist
  const requiredFiles = [
  'package.json',
  'src/main.tsx',
  'src/App.tsx',
  'vite.config.ts',
  'README.md'];


  for (const file of requiredFiles) {
    const filePath = path.join(testProjectPath, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Required file missing: ${file}`);
    }
  }

  logger.info(chalk.green('✓ All required files present'));

  // Check package.json
  const packageJson = JSON.parse(fs.readFileSync(path.join(testProjectPath, 'package.json'), 'utf8'));
  if (packageJson.name !== testProjectName) {
    throw new Error(`Package name incorrect: expected ${testProjectName}, got ${packageJson.name}`);
  }

  logger.info(chalk.green('✓ Package.json correctly configured'));

  // Test npm run dev
  logger.info(chalk.blue('\n🚀 Testing npm run dev in created project...'));

  return new Promise((resolve, reject) => {
    const devProcess = spawn('npm', ['run', 'dev'], {
      cwd: testProjectPath,
      stdio: 'pipe'
    });

    let devStarted = false;
    let timeout;

    devProcess.stdout.on('data', (data) => {
      const output = data.toString();
      logger.info(chalk.gray(output));

      if (output.includes('ready in') || output.includes('Local:')) {
        devStarted = true;
        logger.info(chalk.green('\n✓ Dev server started successfully in created project'));
        devProcess.kill();
        clearTimeout(timeout);
      }
    });

    devProcess.stderr.on('data', (data) => {
      const error = data.toString();
      if (!error.includes('warn') && !error.includes('experimental')) {
        logger.error(chalk.red(error));
      }
    });

    timeout = setTimeout(() => {
      if (!devStarted) {
        devProcess.kill();
        reject(new Error('Dev server failed to start in created project within 60 seconds'));
      }
    }, 60000);

    devProcess.on('close', (code) => {
      clearTimeout(timeout);
      if (devStarted || code === null) {
        logger.info(chalk.green.bold('\n✅ Real create-project workflow validated successfully!\n'));
        logger.info(chalk.white('Summary:'));
        logger.info(chalk.green('  ✓ npm run create-project works interactively'));
        logger.info(chalk.green('  ✓ Project created with correct structure'));
        logger.info(chalk.green('  ✓ Dependencies installed successfully'));
        logger.info(chalk.green('  ✓ Dev server runs in created project'));

        // Cleanup
        logger.info(chalk.blue('\n🧹 Cleaning up test project...'));
        process.chdir(__dirname);
        fs.rmSync(testProjectPath, { recursive: true, force: true });
        logger.info(chalk.gray('Test project removed'));

        resolve(true);
      } else {
        reject(new Error(`Dev process exited with code ${code}`));
      }
    });
  });
}

// Run the test
testRealCreateProject().catch((err) => {
  logger.error(chalk.red('\n❌ Real create-project test failed:'), err.message);

  // Clean up on failure
  if (fs.existsSync(testProjectPath)) {
    process.chdir(__dirname);
    fs.rmSync(testProjectPath, { recursive: true, force: true });
  }

  process.exit(1);
});