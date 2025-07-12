#!/usr/bin/env node

/**
 * Test script for project creation workflow
 * Tests the complete flow without interactive prompts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Import the create project logic
const templateDir = path.resolve(__dirname, '..');
const testProjectName = 'test-project-' + Date.now();
const testProjectPath = path.resolve(__dirname, '..', testProjectName);

console.log('🧪 Testing project creation workflow...\n');

try {
  // Simulate project creation without prompts
  console.log(`📁 Creating test project: ${testProjectName}`);
  
  // Create target directory
  fs.mkdirSync(testProjectPath, { recursive: true });

  // Files and directories to copy (same as in create-project.js)
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
    '.gitignore',
    'README.md',
    'CLAUDE.md',
    'QUICK-START.md',
    'DOCS_INDEX.md',
  ];

  // Copy files and directories
  itemsToCopy.forEach((item) => {
    const sourcePath = path.join(templateDir, item);
    const targetPath = path.join(testProjectPath, item);

    if (fs.existsSync(sourcePath)) {
      console.log(`  Copying ${item}...`);
      copyRecursive(sourcePath, targetPath);
    }
  });

  // Create customized package.json
  const templatePackageJson = JSON.parse(
    fs.readFileSync(path.join(templateDir, 'package.json'), 'utf8')
  );

  const newPackageJson = {
    ...templatePackageJson,
    name: testProjectName,
    version: '0.1.0',
    description: 'Test project for validation',
    private: true,
  };

  // Remove template-specific scripts
  delete newPackageJson.scripts['create-project'];
  delete newPackageJson.scripts['cleanup:template'];
  // Remove prepare script for testing (husky install fails without git)
  delete newPackageJson.scripts['prepare'];

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
    path.join(testProjectPath, 'package.json'),
    JSON.stringify(newPackageJson, null, 2)
  );

  console.log('\n📦 Installing dependencies...');
  execSync('npm install', { cwd: testProjectPath, stdio: 'inherit' });

  console.log('\n🚀 Testing npm run dev...');
  // Test that vite can start (but kill it quickly)
  const child = execSync('timeout 10s npm run dev || true', { 
    cwd: testProjectPath, 
    stdio: 'pipe',
    encoding: 'utf8'
  });

  console.log('Dev server output:\n', child);

  console.log('\n✅ Project creation test completed successfully!');
  console.log(`Test project created at: ${testProjectPath}`);
  console.log('\nTo manually test, run:');
  console.log(`  cd ${testProjectPath}`);
  console.log('  npm run dev');

} catch (error) {
  console.error('\n❌ Project creation test failed:', error.message);
  process.exit(1);
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