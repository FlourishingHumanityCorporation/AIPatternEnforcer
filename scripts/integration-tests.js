#!/usr/bin/env node

/**
 * Integration tests for ProjectTemplate workflows
 * Tests project creation and template customization independently
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🧪 Running ProjectTemplate integration tests...\n');

const results = {
  projectCreation: false,
  reactCustomization: false,
  nextjsCustomization: false,
  expressCustomization: false
};

// Test 1: Project Creation Workflow
async function testProjectCreation() {
  console.log('📦 Testing project creation workflow...');
  
  const testProjectName = 'integration-test-project-' + Date.now();
  const testProjectPath = path.resolve(__dirname, '..', testProjectName);
  
  try {
    // Create test project using our existing test script logic
    const templateDir = path.resolve(__dirname, '..');
    fs.mkdirSync(testProjectPath, { recursive: true });

    // Copy essential files
    const itemsToCopy = [
      'src', 'public', 'config', 'scripts', 'tools', 'templates',
      'ai', 'docs', 'tests', '.eslintrc.json', '.prettierrc',
      'tsconfig.json', 'vite.config.ts', '.gitignore'
    ];

    itemsToCopy.forEach((item) => {
      const sourcePath = path.join(templateDir, item);
      const targetPath = path.join(testProjectPath, item);
      if (fs.existsSync(sourcePath)) {
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
      description: 'Integration test project',
      private: true,
    };

    // Remove template-specific scripts
    delete newPackageJson.scripts['create-project'];
    delete newPackageJson.scripts['cleanup:template'];
    delete newPackageJson.scripts['prepare']; // Remove husky for testing

    // Update Vite scripts to use root-level config
    ['dev', 'build', 'preview'].forEach(script => {
      if (newPackageJson.scripts[script]) {
        newPackageJson.scripts[script] = newPackageJson.scripts[script].replace('--config config/vite.config.ts', '');
      }
    });

    fs.writeFileSync(
      path.join(testProjectPath, 'package.json'),
      JSON.stringify(newPackageJson, null, 2)
    );

    // Install dependencies
    execSync('npm install', { cwd: testProjectPath, stdio: 'pipe' });

    // Test dev server startup
    const devOutput = execSync('timeout 10s npm run dev || true', { 
      cwd: testProjectPath, 
      stdio: 'pipe',
      encoding: 'utf8'
    });

    if (devOutput.includes('Local:')) {
      console.log('  ✅ Project creation test passed');
      results.projectCreation = true;
    } else {
      console.log('  ❌ Project creation test failed - dev server did not start');
    }

  } catch (error) {
    console.log(`  ❌ Project creation test failed: ${error.message}`);
  } finally {
    // Cleanup
    if (fs.existsSync(testProjectPath)) {
      fs.rmSync(testProjectPath, { recursive: true, force: true });
    }
  }
}

// Test 2: Template Customization (each framework independently)
async function testTemplateCustomization(framework) {
  console.log(`📦 Testing ${framework} template customization...`);
  
  const testDir = `integration-test-${framework}-${Date.now()}`;
  const testPath = path.resolve(__dirname, '..', testDir);
  
  try {
    // Create fresh project directory
    fs.mkdirSync(testPath, { recursive: true });
    
    // Copy minimal base files needed for customization
    const templateDir = path.resolve(__dirname, '..');
    const baseFiles = ['tools', 'package.json', 'src', 'public'];
    
    baseFiles.forEach((item) => {
      const sourcePath = path.join(templateDir, item);
      const targetPath = path.join(testPath, item);
      if (fs.existsSync(sourcePath)) {
        copyRecursive(sourcePath, targetPath);
      }
    });

    // Create minimal package.json for testing
    const basePackageJson = {
      name: `test-${framework}`,
      version: '0.1.0',
      scripts: {},
      dependencies: {},
      devDependencies: {}
    };
    
    fs.writeFileSync(
      path.join(testPath, 'package.json'),
      JSON.stringify(basePackageJson, null, 2)
    );

    // Run template customization
    execSync(`node tools/generators/template-customizer.js --framework ${framework}`, { 
      cwd: testPath, 
      stdio: 'pipe' 
    });

    // Verify files were created
    const packageJson = JSON.parse(fs.readFileSync(path.join(testPath, 'package.json'), 'utf8'));
    
    if (framework === 'react') {
      if (fs.existsSync(path.join(testPath, 'vite.config.ts')) && 
          packageJson.dependencies.react &&
          packageJson.scripts.dev === 'vite') {
        console.log('  ✅ React customization test passed');
        results.reactCustomization = true;
      } else {
        console.log('  ❌ React customization test failed - missing files or config');
      }
    } else if (framework === 'nextjs') {
      if (fs.existsSync(path.join(testPath, 'next.config.js')) && 
          fs.existsSync(path.join(testPath, 'app/layout.tsx')) &&
          packageJson.dependencies.next) {
        console.log('  ✅ Next.js customization test passed');
        results.nextjsCustomization = true;
      } else {
        console.log('  ❌ Next.js customization test failed - missing files or config');
      }
    } else if (framework === 'express') {
      if (fs.existsSync(path.join(testPath, 'src/server.ts')) && 
          fs.existsSync(path.join(testPath, 'src/routes/index.ts')) &&
          packageJson.dependencies.express) {
        console.log('  ✅ Express customization test passed');
        results.expressCustomization = true;
      } else {
        console.log('  ❌ Express customization test failed - missing files or config');
      }
    }

  } catch (error) {
    console.log(`  ❌ ${framework} customization test failed: ${error.message}`);
  } finally {
    // Cleanup
    if (fs.existsSync(testPath)) {
      fs.rmSync(testPath, { recursive: true, force: true });
    }
  }
}

function copyRecursive(source, target) {
  const stats = fs.statSync(source);

  if (stats.isDirectory()) {
    fs.mkdirSync(target, { recursive: true });
    const files = fs.readdirSync(source);

    files.forEach((file) => {
      if (file === 'node_modules' || file === 'dist' || 
          file === 'coverage' || file === '.git' || file === '.DS_Store') {
        return;
      }
      copyRecursive(path.join(source, file), path.join(target, file));
    });
  } else {
    fs.copyFileSync(source, target);
  }
}

async function main() {
  // Run all tests
  await testProjectCreation();
  await testTemplateCustomization('react');
  await testTemplateCustomization('nextjs'); 
  await testTemplateCustomization('express');
  
  // Report results
  console.log('\n📊 Integration Test Results:');
  console.log(`  Project Creation: ${results.projectCreation ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  React Customization: ${results.reactCustomization ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Next.js Customization: ${results.nextjsCustomization ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`  Express Customization: ${results.expressCustomization ? '✅ PASS' : '❌ FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result);
  
  if (allPassed) {
    console.log('\n🎉 All integration tests passed!');
    console.log('\nProjectTemplate is ready for users:');
    console.log('  1. ✅ Project creation workflow works');
    console.log('  2. ✅ Template customization works for all frameworks');
    console.log('  3. ✅ New projects can run npm run dev successfully');
    process.exit(0);
  } else {
    console.log('\n💥 Some integration tests failed');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Integration test runner failed:', error);
  process.exit(1);
});