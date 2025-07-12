#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

/**
 * JavaScript/TypeScript AST-based detector for logging violations
 */
class JavaScriptLogDetector {
  constructor(options = {}) {
    this.consoleMembers = ['log', 'error', 'warn', 'info', 'debug', 'trace'];
    this.allowedPatterns = options.allowedPatterns || [];
    this.testFilePatterns = options.testFilePatterns || [
      '**/*.test.js',
      '**/*.test.ts',
      '**/*.test.jsx',
      '**/*.test.tsx',
      '**/*.spec.js',
      '**/*.spec.ts',
      '**/tests/**/*.js',
      '**/tests/**/*.ts',
      '**/__tests__/**/*.js',
      '**/__tests__/**/*.ts'
    ];
    this.cliFilePatterns = options.cliFilePatterns || [
      '**/cli.js',
      '**/cli.ts',
      '**/cli/**/*.js',
      '**/cli/**/*.ts',
      '**/scripts/**/*.js',
      '**/scripts/**/*.ts',
      '**/bin/**/*.js',
      '**/bin/**/*.ts'
    ];
    this.violations = [];
    this.cache = new Map();
  }

  /**
   * Check if file should be excluded based on patterns
   */
  shouldExcludeFile(filepath) {
    const normalizedPath = filepath.replace(/\\/g, '/');
    
    // Check if it's a test file
    for (const pattern of this.testFilePatterns) {
      if (this.matchesPattern(normalizedPath, pattern)) {
        return { exclude: true, reason: 'test_file' };
      }
    }
    
    // Check if it's a CLI file
    for (const pattern of this.cliFilePatterns) {
      if (this.matchesPattern(normalizedPath, pattern)) {
        return { exclude: true, reason: 'cli_file' };
      }
    }
    
    return { exclude: false };
  }

  /**
   * Simple glob pattern matching
   */
  matchesPattern(filepath, pattern) {
    // Convert glob to regex
    const regex = pattern
      .replace(/\*\*/g, '.*')
      .replace(/\*/g, '[^/]*')
      .replace(/\?/g, '.');
    
    return new RegExp(regex).test(filepath);
  }

  /**
   * Get parser options based on file extension
   */
  getParserOptions(filepath) {
    const ext = path.extname(filepath);
    const isTypeScript = ['.ts', '.tsx'].includes(ext);
    const isJSX = ['.jsx', '.tsx'].includes(ext);
    
    return {
      sourceType: 'module',
      plugins: [
        'jsx',
        'typescript',
        'decorators-legacy',
        'classProperties',
        'classPrivateProperties',
        'classPrivateMethods',
        'dynamicImport',
        'nullishCoalescingOperator',
        'optionalChaining',
        'exportDefaultFrom',
        'exportNamespaceFrom',
        'asyncGenerators',
        'objectRestSpread'
      ].filter(plugin => {
        // Only include TypeScript plugin for TS files
        if (plugin === 'typescript') return isTypeScript;
        // Only include JSX for JSX/TSX files
        if (plugin === 'jsx') return isJSX || isTypeScript;
        return true;
      })
    };
  }

  /**
   * Analyze a JavaScript/TypeScript file for logging violations
   */
  async analyzeFile(filepath) {
    // Check cache first
    const stats = fs.statSync(filepath);
    const cacheKey = `${filepath}:${stats.mtime.getTime()}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Check if file should be excluded
    const exclusion = this.shouldExcludeFile(filepath);
    if (exclusion.exclude) {
      const result = {
        filepath,
        excluded: true,
        exclusionReason: exclusion.reason,
        violations: []
      };
      this.cache.set(cacheKey, result);
      return result;
    }
    
    try {
      const content = fs.readFileSync(filepath, 'utf8');
      const parserOptions = this.getParserOptions(filepath);
      const ast = parser.parse(content, parserOptions);
      
      const violations = [];
      const loggerImports = new Set();
      const loggerInstances = new Set();
      const consoleMembers = this.consoleMembers;
      const self = this;
      
      traverse(ast, {
        // Detect console.* calls and CommonJS requires
        CallExpression(path) {
          const { node } = path;
          
          // Check for console.log, console.error, etc.
          if (
            node.callee.type === 'MemberExpression' &&
            node.callee.object.type === 'Identifier' &&
            node.callee.object.name === 'console' &&
            node.callee.property.type === 'Identifier' &&
            consoleMembers.includes(node.callee.property.name)
          ) {
            // Check if within a disable comment
            const line = node.loc.start.line;
            const previousLine = line - 1;
            const lines = content.split('\n');
            
            if (previousLine >= 0 && lines[previousLine].includes('log-enforcer-disable-next-line')) {
              return;
            }
            
            violations.push({
              line: node.loc.start.line,
              column: node.loc.start.column,
              type: 'console_usage',
              method: node.callee.property.name,
              message: `Use proper logging instead of console.${node.callee.property.name}()`,
              filepath
            });
          }
          
          // Detect CommonJS requires
          if (
            node.callee.type === 'Identifier' &&
            node.callee.name === 'require' &&
            node.arguments.length > 0 &&
            node.arguments[0].type === 'StringLiteral'
          ) {
            const source = node.arguments[0].value;
            const loggingLibraries = ['winston', 'pino', 'bunyan', 'log4js', 'loglevel'];
            
            if (loggingLibraries.some(lib => source.includes(lib))) {
              loggerImports.add(source);
            }
          }
        },
        
        // Detect logger imports
        ImportDeclaration(path) {
          const { node } = path;
          const source = node.source.value;
          
          // Common logging libraries
          const loggingLibraries = ['winston', 'pino', 'bunyan', 'log4js', 'loglevel'];
          
          if (loggingLibraries.some(lib => source.includes(lib))) {
            loggerImports.add(source);
          }
        },
        
        // Detect logger instances
        VariableDeclarator(path) {
          const { node } = path;
          
          // Check for logger creation patterns
          if (
            node.init &&
            node.init.type === 'CallExpression' &&
            node.init.callee.type === 'MemberExpression'
          ) {
            const callee = node.init.callee;
            
            // winston.createLogger(), pino(), etc.
            const loggerCreationPatterns = [
              { object: 'winston', method: 'createLogger' },
              { object: 'bunyan', method: 'createLogger' },
              { object: 'log4js', method: 'getLogger' }
            ];
            
            for (const pattern of loggerCreationPatterns) {
              if (
                callee.object.type === 'Identifier' &&
                callee.object.name === pattern.object &&
                callee.property.type === 'Identifier' &&
                callee.property.name === pattern.method
              ) {
                if (node.id && node.id.type === 'Identifier') {
                  loggerInstances.add(node.id.name);
                }
              }
            }
          }
          
          // Check for direct logger creation (e.g., const logger = pino())
          if (
            node.init &&
            node.init.type === 'CallExpression' &&
            node.init.callee.type === 'Identifier' &&
            ['pino', 'bunyan'].includes(node.init.callee.name)
          ) {
            if (node.id && node.id.type === 'Identifier') {
              loggerInstances.add(node.id.name);
            }
          }
        }
      });
      
      const result = {
        filepath,
        excluded: false,
        violations,
        hasLoggerImport: loggerImports.size > 0,
        loggerImports: Array.from(loggerImports),
        hasLoggerInstance: loggerInstances.size > 0,
        loggerNames: Array.from(loggerInstances)
      };
      
      this.cache.set(cacheKey, result);
      return result;
      
    } catch (error) {
      const result = {
        filepath,
        excluded: false,
        error: error.message,
        violations: []
      };
      this.cache.set(cacheKey, result);
      return result;
    }
  }

  /**
   * Analyze multiple JavaScript/TypeScript files
   */
  async analyzeFiles(filepaths) {
    const results = await Promise.all(
      filepaths.map(filepath => this.analyzeFile(filepath))
    );
    
    return {
      files: results,
      summary: this.generateSummary(results)
    };
  }

  /**
   * Generate analysis summary
   */
  generateSummary(results) {
    const totalFiles = results.length;
    const excludedFiles = results.filter(r => r.excluded).length;
    const analyzedFiles = totalFiles - excludedFiles;
    const filesWithViolations = results.filter(r => !r.excluded && r.violations.length > 0).length;
    const totalViolations = results.reduce((sum, r) => sum + r.violations.length, 0);
    
    // Count violations by type
    const violationsByType = {};
    results.forEach(r => {
      r.violations.forEach(v => {
        const key = `console.${v.method}`;
        violationsByType[key] = (violationsByType[key] || 0) + 1;
      });
    });
    
    return {
      totalFiles,
      excludedFiles,
      analyzedFiles,
      filesWithViolations,
      totalViolations,
      violationsByType,
      exclusionReasons: this.countExclusionReasons(results)
    };
  }

  /**
   * Count exclusion reasons
   */
  countExclusionReasons(results) {
    const reasons = {};
    results.filter(r => r.excluded).forEach(r => {
      reasons[r.exclusionReason] = (reasons[r.exclusionReason] || 0) + 1;
    });
    return reasons;
  }
}

module.exports = JavaScriptLogDetector;