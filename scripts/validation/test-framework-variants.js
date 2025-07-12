#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const chalk = require('chalk');

const FRAMEWORKS = ['react', 'nextjs', 'express'];

async function testFrameworkVariant(framework) {
  console.log(chalk.blue.bold(`\n🧪 Testing ${framework} variant...\n`));
  
  const testProjectName = `test-${framework}-${Date.now()}`;
  const testProjectPath = path.resolve('../', testProjectName);
  
  // Clean up any existing test project
  if (fs.existsSync(testProjectPath)) {
    fs.rmSync(testProjectPath, { recursive: true, force: true });
  }
  
  try {
    // Step 1: Create base project structure
    console.log(chalk.blue('📁 Creating project structure...'));
    
    const templateDir = path.resolve(__dirname, '../..');
    fs.mkdirSync(testProjectPath, { recursive: true });
    
    // Copy essential files
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
    ];
    
    itemsToCopy.forEach((item) => {
      const sourcePath = path.join(templateDir, item);
      const targetPath = path.join(testProjectPath, item);
      
      if (fs.existsSync(sourcePath)) {
        copyRecursive(sourcePath, targetPath);
      }
    });
    
    // Copy package.json
    const packageJson = JSON.parse(
      fs.readFileSync(path.join(templateDir, 'package.json'), 'utf8')
    );
    
    // Clean up template-specific scripts
    delete packageJson.scripts['create-project'];
    delete packageJson.scripts['cleanup:template'];
    
    fs.writeFileSync(
      path.join(testProjectPath, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );
    
    console.log(chalk.green('✓ Base structure created'));
    
    // Step 2: Initialize git (for husky)
    execSync('git init', { cwd: testProjectPath });
    
    // Step 3: Install base dependencies first (including inquirer)
    console.log(chalk.blue('\n📦 Installing base dependencies...'));
    execSync('npm install', { cwd: testProjectPath, stdio: 'inherit' });
    console.log(chalk.green('✓ Base dependencies installed'));
    
    // Step 4: Apply framework customization
    console.log(chalk.blue(`\n🎨 Applying ${framework} customization...`));
    
    // Copy template-customizer.js to test project
    const customizerSource = path.join(templateDir, 'tools/generators/template-customizer.js');
    const customizerTarget = path.join(testProjectPath, 'tools/generators/template-customizer.js');
    fs.mkdirSync(path.dirname(customizerTarget), { recursive: true });
    fs.copyFileSync(customizerSource, customizerTarget);
    
    execSync(`node tools/generators/template-customizer.js --framework ${framework}`, {
      cwd: testProjectPath,
      stdio: 'inherit'
    });
    
    console.log(chalk.green(`✓ ${framework} customization applied`));
    
    // Step 5: Install framework-specific dependencies
    console.log(chalk.blue('\n📦 Installing framework dependencies...'));
    execSync('npm install', { cwd: testProjectPath, stdio: 'inherit' });
    console.log(chalk.green('✓ All dependencies installed'));
    
    // Step 6: Test framework-specific dev server
    console.log(chalk.blue(`\n🚀 Testing ${framework} dev server...`));
    
    const devProcess = spawn('npm', ['run', 'dev'], {
      cwd: testProjectPath,
      stdio: 'pipe',
      env: { ...process.env, PORT: '3001' } // Use different port to avoid conflicts
    });
    
    let devStarted = false;
    let timeout;
    
    devProcess.stdout.on('data', (data) => {
      const output = data.toString();
      
      // Framework-specific success indicators
      if (
        (framework === 'react' && (output.includes('ready in') || output.includes('Local:'))) ||
        (framework === 'nextjs' && output.includes('Ready in')) ||
        (framework === 'express' && output.includes('Server running'))
      ) {
        devStarted = true;
        console.log(chalk.green(`\n✓ ${framework} dev server started successfully`));
        devProcess.kill();
        clearTimeout(timeout);
      }
    });
    
    devProcess.stderr.on('data', (data) => {
      const error = data.toString();
      // Ignore Next.js warnings about experimental features
      if (!error.includes('experimental') && !error.includes('warn')) {
        console.error(chalk.red(error));
      }
    });
    
    timeout = setTimeout(() => {
      if (!devStarted) {
        console.error(chalk.red(`\n✗ ${framework} dev server failed to start within 30 seconds`));
        devProcess.kill();
        return false;
      }
    }, 30000);
    
    return new Promise((resolve) => {
      devProcess.on('close', () => {
        clearTimeout(timeout);
        
        // Clean up
        console.log(chalk.blue('\n🧹 Cleaning up...'));
        process.chdir(__dirname);
        fs.rmSync(testProjectPath, { recursive: true, force: true });
        
        resolve(devStarted);
      });
    });
    
  } catch (error) {
    console.error(chalk.red(`\n❌ ${framework} test failed:`), error.message);
    
    // Clean up on failure
    if (fs.existsSync(testProjectPath)) {
      process.chdir(__dirname);
      fs.rmSync(testProjectPath, { recursive: true, force: true });
    }
    
    return false;
  }
}

function copyRecursive(source, target) {
  const stats = fs.statSync(source);
  
  if (stats.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    const files = fs.readdirSync(source);
    
    files.forEach((file) => {
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

async function runAllTests() {
  console.log(chalk.blue.bold('\n🚀 Testing All Framework Variants\n'));
  
  const results = {};
  
  for (const framework of FRAMEWORKS) {
    results[framework] = await testFrameworkVariant(framework);
  }
  
  // Show summary
  console.log(chalk.blue.bold('\n📊 Test Results Summary\n'));
  
  let allPassed = true;
  
  for (const [framework, passed] of Object.entries(results)) {
    if (passed) {
      console.log(chalk.green(`  ✓ ${framework}: PASSED`));
    } else {
      console.log(chalk.red(`  ✗ ${framework}: FAILED`));
      allPassed = false;
    }
  }
  
  if (allPassed) {
    console.log(chalk.green.bold('\n✅ All framework variants validated successfully!\n'));
    process.exit(0);
  } else {
    console.log(chalk.red.bold('\n❌ Some framework variants failed validation\n'));
    process.exit(1);
  }
}

// Check for specific framework argument
const frameworkArg = process.argv[2];

if (frameworkArg && FRAMEWORKS.includes(frameworkArg)) {
  // Test specific framework
  testFrameworkVariant(frameworkArg).then((success) => {
    if (success) {
      console.log(chalk.green.bold(`\n✅ ${frameworkArg} variant validated successfully!\n`));
      process.exit(0);
    } else {
      console.log(chalk.red.bold(`\n❌ ${frameworkArg} variant failed validation\n`));
      process.exit(1);
    }
  });
} else {
  // Test all frameworks
  runAllTests();
}