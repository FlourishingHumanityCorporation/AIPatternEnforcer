#!/usr/bin/env node

// Test script to verify create-project functionality
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing create-project functionality...');

const templateDir = path.resolve(__dirname, '..');
const targetDir = path.resolve(templateDir, 'test-output', 'validation-test');

// Items to copy (from create-project.js)
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
  '.gitignore',
  'README.md',
  'CLAUDE.md',
  'QUICK-START.md',
  'DOCS_INDEX.md',
];

// Create target directory
if (fs.existsSync(targetDir)) {
  fs.rmSync(targetDir, { recursive: true, force: true });
}
fs.mkdirSync(targetDir, { recursive: true });

console.log(`📁 Creating test project at ${targetDir}...`);

// Copy files
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
        file === '.DS_Store' ||
        file === 'test-output'
      ) {
        return;
      }
      copyRecursive(path.join(source, file), path.join(target, file));
    });
  } else {
    fs.copyFileSync(source, target);
  }
}

let copiedCount = 0;
itemsToCopy.forEach((item) => {
  const sourcePath = path.join(templateDir, item);
  const targetPath = path.join(targetDir, item);

  if (fs.existsSync(sourcePath)) {
    console.log(`  Copying ${item}...`);
    copyRecursive(sourcePath, targetPath);
    copiedCount++;
  } else {
    console.log(`  ⚠️  ${item} not found`);
  }
});

// Create test package.json
const templatePackageJson = JSON.parse(
  fs.readFileSync(path.join(templateDir, 'package.json'), 'utf8')
);

const newPackageJson = {
  ...templatePackageJson,
  name: 'validation-test',
  version: '0.1.0',
  description: 'Test project for validation',
  private: true,
};

delete newPackageJson.scripts['create-project'];
delete newPackageJson.scripts['cleanup:template'];

fs.writeFileSync(
  path.join(targetDir, 'package.json'),
  JSON.stringify(newPackageJson, null, 2)
);

console.log(`✅ Copied ${copiedCount} items`);
console.log(`✅ Created package.json`);
console.log('\n🧪 Test project created!');
console.log(`📁 Test project at: ${targetDir}`);