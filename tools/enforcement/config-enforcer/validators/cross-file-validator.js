#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const { BaseValidator } = require('../index');

/**
 * Cross-File Configuration Validator
 * Validates consistency and relationships between different configuration files
 */
class CrossFileValidator extends BaseValidator {
  constructor(config) {
    super(config);
    this.fileType = 'cross-file';
    this.projectRoot = process.cwd();
  }

  getFileType() {
    return this.fileType;
  }

  /**
   * Validate cross-file consistency
   * This validator operates on the entire project, not individual files
   */
  async validate(filePath = null) {
    const violations = [];
    const fixes = [];

    try {
      // Get all relevant config files
      const configFiles = this.getConfigFiles();
      
      // Validate package.json and tsconfig.json consistency
      if (this.config.validateScriptConsistency) {
        await this.validateScriptConsistency(configFiles, violations, fixes);
      }

      // Validate import paths against tsconfig paths
      if (this.config.validateImportPaths) {
        await this.validateImportPaths(configFiles, violations, fixes);
      }

      // Validate environment variable consistency
      await this.validateEnvironmentConsistency(configFiles, violations, fixes);

      const hasErrors = violations.some(v => v.severity === 'error');
      const hasWarnings = violations.some(v => v.severity === 'warning');

      return {
        isValid: !hasErrors,
        violations,
        fixes
      };
    } catch (error) {
      return {
        isValid: false,
        violations: [{
          type: 'cross_file_error',
          message: `Cross-file validation error: ${error.message}`,
          severity: 'error'
        }],
        fixes: []
      };
    }
  }

  /**
   * Get all configuration files in the project
   */
  getConfigFiles() {
    const files = {};
    
    // Package.json
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        files.packageJson = {
          path: packageJsonPath,
          content: JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
        };
      } catch (error) {
        // Skip invalid JSON files - they'll be caught by json-validator
      }
    }

    // TypeScript config
    const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');
    if (fs.existsSync(tsconfigPath)) {
      try {
        files.tsconfig = {
          path: tsconfigPath,
          content: JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'))
        };
      } catch (error) {
        // Skip invalid JSON files
      }
    }

    // Environment files
    const envExamplePath = path.join(this.projectRoot, '.env.example');
    if (fs.existsSync(envExamplePath)) {
      files.envExample = {
        path: envExamplePath,
        content: fs.readFileSync(envExamplePath, 'utf8')
      };
    }

    // Vite config
    const viteConfigPath = path.join(this.projectRoot, 'vite.config.js');
    const viteConfigTsPath = path.join(this.projectRoot, 'vite.config.ts');
    if (fs.existsSync(viteConfigPath)) {
      files.viteConfig = {
        path: viteConfigPath,
        content: fs.readFileSync(viteConfigPath, 'utf8')
      };
    } else if (fs.existsSync(viteConfigTsPath)) {
      files.viteConfig = {
        path: viteConfigTsPath,
        content: fs.readFileSync(viteConfigTsPath, 'utf8')
      };
    }

    return files;
  }

  /**
   * Validate consistency between package.json scripts and available config files
   */
  async validateScriptConsistency(configFiles, violations, fixes) {
    if (!configFiles.packageJson) return;

    const packageJson = configFiles.packageJson.content;
    const scripts = packageJson.scripts || {};

    // Check if TypeScript scripts exist but no tsconfig.json
    const hasTypeCheckScript = scripts['type-check'] || scripts['typecheck'] || scripts['tsc'];
    if (hasTypeCheckScript && !configFiles.tsconfig) {
      violations.push({
        type: 'missing_tsconfig',
        message: 'package.json contains TypeScript scripts but tsconfig.json is missing',
        severity: 'error',
        file: configFiles.packageJson.path
      });

      fixes.push({
        type: 'create_tsconfig',
        description: 'Create basic tsconfig.json file',
        action: 'create_file',
        filePath: path.join(this.projectRoot, 'tsconfig.json'),
        content: this.generateBasicTsConfig()
      });
    }

    // Check if vite dev script exists but no vite config
    const hasViteScript = scripts.dev && scripts.dev.includes('vite');
    if (hasViteScript && !configFiles.viteConfig) {
      violations.push({
        type: 'missing_vite_config',
        message: 'package.json contains Vite scripts but vite.config.js/ts is missing',
        severity: 'warning',
        file: configFiles.packageJson.path
      });

      fixes.push({
        type: 'create_vite_config',
        description: 'Create basic vite.config.js file',
        action: 'create_file',
        filePath: path.join(this.projectRoot, 'vite.config.js'),
        content: this.generateBasicViteConfig()
      });
    }

    // Check for missing essential scripts
    const essentialScripts = ['test', 'lint', 'dev'];
    essentialScripts.forEach(scriptName => {
      if (!scripts[scriptName]) {
        violations.push({
          type: 'missing_script',
          message: `Missing essential script: ${scriptName}`,
          severity: 'warning',
          file: configFiles.packageJson.path
        });

        fixes.push({
          type: 'add_script',
          description: `Add ${scriptName} script to package.json`,
          action: 'modify_json',
          filePath: configFiles.packageJson.path,
          jsonPath: `scripts.${scriptName}`,
          value: this.generateDefaultScript(scriptName)
        });
      }
    });
  }

  /**
   * Validate import paths against tsconfig paths configuration
   */
  async validateImportPaths(configFiles, violations, fixes) {
    if (!configFiles.tsconfig || !configFiles.packageJson) return;

    const tsconfig = configFiles.tsconfig.content;
    const paths = tsconfig.compilerOptions?.paths || {};

    // Find TypeScript/JavaScript files to check
    const sourceFiles = glob.sync('src/**/*.{ts,tsx,js,jsx}', {
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });

    for (const sourceFile of sourceFiles.slice(0, 10)) { // Limit to first 10 files for performance
      try {
        const content = fs.readFileSync(sourceFile, 'utf8');
        
        // Check for imports that could use tsconfig paths
        const importRegex = /import\s+.*\s+from\s+['"`]([^'"`]+)['"`]/g;
        let match;
        
        while ((match = importRegex.exec(content)) !== null) {
          const importPath = match[1];
          
          // Check if this is a relative import that could be made absolute
          if (importPath.startsWith('../') && importPath.includes('/')) {
            const suggestedPath = this.suggestAbsolutePath(importPath, sourceFile, paths);
            if (suggestedPath) {
              violations.push({
                type: 'relative_import',
                message: `Consider using absolute import: ${importPath} → ${suggestedPath}`,
                severity: 'info',
                file: sourceFile,
                line: this.getLineNumber(content, match.index)
              });
            }
          }
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }
  }

  /**
   * Validate environment variable consistency
   */
  async validateEnvironmentConsistency(configFiles, violations, fixes) {
    if (!configFiles.envExample) return;

    // Find environment variable usage in source code
    const sourceFiles = glob.sync('{src,scripts,tools}/**/*.{ts,tsx,js,jsx}', {
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });

    const usedEnvVars = new Set();
    const envExampleVars = new Set();

    // Parse .env.example
    const envExampleContent = configFiles.envExample.content;
    const envLines = envExampleContent.split('\n');
    envLines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const varName = trimmed.split('=')[0].trim();
        envExampleVars.add(varName);
      }
    });

    // Find process.env usage in source files
    for (const sourceFile of sourceFiles.slice(0, 20)) { // Limit for performance
      try {
        const content = fs.readFileSync(sourceFile, 'utf8');
        const envRegex = /process\.env\.([A-Z_][A-Z0-9_]*)/g;
        let match;
        
        while ((match = envRegex.exec(content)) !== null) {
          usedEnvVars.add(match[1]);
        }
      } catch (error) {
        // Skip files that can't be read
      }
    }

    // Check for undocumented environment variables
    for (const envVar of usedEnvVars) {
      if (!envExampleVars.has(envVar)) {
        violations.push({
          type: 'undocumented_env_var',
          message: `Environment variable ${envVar} is used but not documented in .env.example`,
          severity: 'warning',
          file: configFiles.envExample.path
        });

        fixes.push({
          type: 'add_env_var',
          description: `Add ${envVar} to .env.example`,
          action: 'append_to_file',
          filePath: configFiles.envExample.path,
          content: `\n# Add description for ${envVar}\n${envVar}=\n`
        });
      }
    }
  }

  /**
   * Apply fixes for cross-file issues
   */
  async applyFixes(filePath, fixes, dryRun = false) {
    const results = {
      success: true,
      changes: [],
      errors: []
    };

    for (const fix of fixes) {
      try {
        if (dryRun) {
          results.changes.push({
            type: fix.type,
            description: fix.description,
            filePath: fix.filePath,
            preview: true
          });
          continue;
        }

        switch (fix.action) {
          case 'create_file':
            if (!fs.existsSync(fix.filePath)) {
              fs.writeFileSync(fix.filePath, fix.content, 'utf8');
              results.changes.push({
                type: fix.type,
                description: fix.description,
                filePath: fix.filePath,
                action: 'created'
              });
            }
            break;

          case 'modify_json':
            if (fs.existsSync(fix.filePath)) {
              const content = JSON.parse(fs.readFileSync(fix.filePath, 'utf8'));
              this.setNestedProperty(content, fix.jsonPath, fix.value);
              fs.writeFileSync(fix.filePath, JSON.stringify(content, null, 2) + '\n', 'utf8');
              results.changes.push({
                type: fix.type,
                description: fix.description,
                filePath: fix.filePath,
                action: 'modified'
              });
            }
            break;

          case 'append_to_file':
            if (fs.existsSync(fix.filePath)) {
              fs.appendFileSync(fix.filePath, fix.content, 'utf8');
              results.changes.push({
                type: fix.type,
                description: fix.description,
                filePath: fix.filePath,
                action: 'appended'
              });
            }
            break;
        }
      } catch (error) {
        results.errors.push(`Failed to apply fix ${fix.type}: ${error.message}`);
        results.success = false;
      }
    }

    return results;
  }

  // Helper methods

  generateBasicTsConfig() {
    return JSON.stringify({
      compilerOptions: {
        target: "ES2020",
        useDefineForClassFields: true,
        lib: ["ES2020", "DOM", "DOM.Iterable"],
        module: "ESNext",
        skipLibCheck: true,
        moduleResolution: "bundler",
        allowImportingTsExtensions: true,
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx: "react-jsx",
        strict: true,
        noUnusedLocals: true,
        noUnusedParameters: true,
        noFallthroughCasesInSwitch: true,
        baseUrl: ".",
        paths: {
          "@/*": ["src/*"]
        }
      },
      include: ["src"]
    }, null, 2) + '\n';
  }

  generateBasicViteConfig() {
    return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
`;
  }

  generateDefaultScript(scriptName) {
    switch (scriptName) {
      case 'test':
        return 'vitest';
      case 'lint':
        return 'eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0';
      case 'dev':
        return 'vite';
      default:
        return `echo "Add ${scriptName} command here"`;
    }
  }

  suggestAbsolutePath(importPath, sourceFile, paths) {
    // Simple heuristic: if import goes up multiple levels, suggest @/ prefix
    if (importPath.startsWith('../../') && paths['@/*']) {
      return importPath.replace(/^\.\.\/\.\.\//, '@/');
    }
    return null;
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
  }
}

module.exports = CrossFileValidator;