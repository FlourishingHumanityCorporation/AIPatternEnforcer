#!/usr/bin/env node

/**
 * Test script for template customization workflow
 * Tests each framework variant to ensure they create working apps
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const frameworks = ['react', 'nextjs', 'express'];

console.log('🧪 Testing template customization workflows...\n');

async function testFramework(framework) {
  console.log(`📦 Testing ${framework} framework...`);
  
  const testDir = `test-${framework}-${Date.now()}`;
  const testPath = path.resolve(__dirname, '..', testDir);
  
  try {
    // Create test project
    fs.mkdirSync(testPath, { recursive: true });
    
    // Copy base template files
    const baseFiles = [
      'src',
      'public', 
      'tools',
      'package.json',
      'tsconfig.json',
      '.eslintrc.json',
      '.prettierrc',
      '.gitignore'
    ];
    
    const templateDir = path.resolve(__dirname, '..');
    
    baseFiles.forEach((item) => {
      const sourcePath = path.join(templateDir, item);
      const targetPath = path.join(testPath, item);
      
      if (fs.existsSync(sourcePath)) {
        copyRecursive(sourcePath, targetPath);
      }
    });
    
    // Run template customization
    console.log(`  Customizing template for ${framework}...`);
    execSync(`npm run template:${framework}`, { 
      cwd: testPath, 
      stdio: 'pipe' 
    });
    
    // Install dependencies
    console.log(`  Installing dependencies...`);
    execSync('npm install', { 
      cwd: testPath, 
      stdio: 'pipe' 
    });
    
    // Test build process
    console.log(`  Testing build...`);
    if (framework === 'express') {
      execSync('npm run build', { 
        cwd: testPath, 
        stdio: 'pipe' 
      });
    } else {
      // For React and Next.js, test dev server startup
      const child = execSync('timeout 10s npm run dev || true', { 
        cwd: testPath, 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      // Check if server started successfully
      if (framework === 'react' && !child.includes('Local:')) {
        throw new Error('Vite dev server failed to start');
      }
      if (framework === 'nextjs' && !child.includes('Ready in')) {
        throw new Error('Next.js dev server failed to start');
      }
    }
    
    console.log(`  ✅ ${framework} framework test passed\n`);
    return true;
    
  } catch (error) {
    console.log(`  ❌ ${framework} framework test failed: ${error.message}\n`);
    return false;
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

async function main() {
  const results = {};
  
  for (const framework of frameworks) {
    results[framework] = await testFramework(framework);
  }
  
  console.log('📊 Test Results:');
  let allPassed = true;
  
  for (const [framework, passed] of Object.entries(results)) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`  ${framework}: ${status}`);
    if (!passed) allPassed = false;
  }
  
  if (allPassed) {
    console.log('\n🎉 All template customization tests passed!');
    process.exit(0);
  } else {
    console.log('\n💥 Some template customization tests failed');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Test runner failed:', error);
  process.exit(1);
});