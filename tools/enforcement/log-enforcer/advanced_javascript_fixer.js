#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');
const glob = require('glob');

/**
 * Advanced JavaScript/TypeScript auto-fixer for logging violations
 * Handles complex refactoring scenarios with TypeScript awareness
 */
class AdvancedJavaScriptLogFixer {
  constructor(options = {}) {
    this.options = {
      preferredLogger: options.preferredLogger || 'winston',
      loggerVariableName: options.loggerVariableName || 'logger',
      useModuleBasedNaming: options.useModuleBasedNaming || true,
      enableTypeScriptTransforms: options.enableTypeScriptTransforms || true,
      enableCrossFileAnalysis: options.enableCrossFileAnalysis || false,
      projectRoot: options.projectRoot || process.cwd(),
      ...options
    };
    
    this.consoleToLoggerMap = {
      log: 'info',
      error: 'error', 
      warn: 'warn',
      info: 'info',
      debug: 'debug',
      trace: 'debug'
    };
    
    // Cross-file context
    this.projectContext = {
      loggerInstances: new Map(),
      sharedLoggers: new Map(),
      moduleNames: new Map()
    };
  }

  /**
   * Analyze project structure for logger patterns
   */
  async analyzeProjectStructure() {
    if (!this.options.enableCrossFileAnalysis) return;

    const files = glob.sync('**/*.{js,ts,jsx,tsx}', {
      cwd: this.options.projectRoot,
      ignore: ['**/node_modules/**', '**/dist/**', '**/build/**']
    });

    for (const file of files.slice(0, 50)) { // Limit analysis for performance
      try {
        const filepath = path.join(this.options.projectRoot, file);
        const content = fs.readFileSync(filepath, 'utf8');
        const ast = this.parseCode(content, filepath);
        
        this.extractLoggerPatterns(ast, filepath);
        this.extractModuleInfo(ast, filepath);
      } catch (error) {
        // Skip files that can't be parsed
      }
    }
  }

  /**
   * Extract existing logger patterns from AST
   */
  extractLoggerPatterns(ast, filepath) {
    traverse(ast, {
      VariableDeclarator: (path) => {
        const { node } = path;
        
        if (this.isLoggerDeclaration(node)) {
          const loggerName = node.id.name;
          this.projectContext.loggerInstances.set(filepath, {
            name: loggerName,
            type: this.getLoggerType(node),
            scope: this.getLoggerScope(path)
          });
        }
      },
      
      ImportDeclaration: (path) => {
        const { node } = path;
        if (this.isLoggingImport(node)) {
          this.projectContext.sharedLoggers.set(node.source.value, {
            importPath: node.source.value,
            specifiers: node.specifiers.map(spec => spec.local.name)
          });
        }
      }
    });
  }

  /**
   * Extract module information for intelligent naming
   */
  extractModuleInfo(ast, filepath) {
    const relativePath = path.relative(this.options.projectRoot, filepath);
    const moduleName = this.generateModuleName(relativePath);
    
    this.projectContext.moduleNames.set(filepath, {
      moduleName,
      relativePath,
      directory: path.dirname(relativePath),
      filename: path.basename(filepath, path.extname(filepath))
    });
  }

  /**
   * Generate intelligent module-based logger name
   */
  generateModuleName(relativePath) {
    const parts = relativePath.split(path.sep);
    const filename = path.basename(relativePath, path.extname(relativePath));
    
    // Remove common prefixes/suffixes
    const cleanParts = parts
      .filter(part => !['src', 'lib', 'components', 'utils', 'services'].includes(part))
      .map(part => part.replace(/[-_]/g, ''));
    
    // Create camelCase name
    if (cleanParts.length > 1) {
      return cleanParts.map((part, index) => 
        index === 0 ? part.toLowerCase() : 
        part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
      ).join('');
    }
    
    return filename.replace(/[-_]/g, '').toLowerCase();
  }

  /**
   * Enhanced parser with TypeScript support
   */
  parseCode(content, filepath) {
    const ext = path.extname(filepath);
    const isTypeScript = ['.ts', '.tsx'].includes(ext);
    const isJSX = ['.jsx', '.tsx'].includes(ext);
    
    const plugins = [
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
      'objectRestSpread',
      'topLevelAwait'
    ];

    if (isTypeScript) {
      plugins.push('typescript');
    }
    
    if (isJSX || isTypeScript) {
      plugins.push('jsx');
    }

    return parser.parse(content, {
      sourceType: 'module',
      plugins,
      errorRecovery: true
    });
  }

  /**
   * Advanced logger import generation with TypeScript support
   */
  generateAdvancedLoggerImport(filepath) {
    const isTypeScript = path.extname(filepath).includes('.ts');
    
    if (isTypeScript && this.options.enableTypeScriptTransforms) {
      return this.generateTypeScriptLoggerImport();
    }
    
    return this.generateJavaScriptLoggerImport();
  }

  /**
   * Generate TypeScript-aware logger import
   */
  generateTypeScriptLoggerImport() {
    switch (this.options.preferredLogger) {
      case 'winston':
        return [
          // Import statement
          t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier('winston'))],
            t.stringLiteral('winston')
          ),
          // Type import (if needed)
          t.importDeclaration(
            [t.importSpecifier(t.identifier('Logger'), t.identifier('Logger'))],
            t.stringLiteral('winston')
          )
        ];
      
      case 'pino':
        return [
          t.importDeclaration(
            [t.importDefaultSpecifier(t.identifier('pino'))],
            t.stringLiteral('pino')
          )
        ];
      
      default:
        return this.generateJavaScriptLoggerImport();
    }
  }

  /**
   * Generate JavaScript logger import
   */
  generateJavaScriptLoggerImport() {
    switch (this.options.preferredLogger) {
      case 'winston':
        return t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier('winston'),
            t.callExpression(t.identifier('require'), [t.stringLiteral('winston')])
          )
        ]);
      
      case 'pino':
        return t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier('pino'),
            t.callExpression(t.identifier('require'), [t.stringLiteral('pino')])
          )
        ]);
      
      default:
        return this.generateJavaScriptLoggerImport();
    }
  }

  /**
   * Generate context-aware logger instance
   */
  generateContextualLoggerInstance(filepath) {
    const moduleInfo = this.projectContext.moduleNames.get(filepath);
    const loggerName = this.options.useModuleBasedNaming && moduleInfo 
      ? `${moduleInfo.moduleName}Logger` 
      : this.options.loggerVariableName;

    const isTypeScript = path.extname(filepath).includes('.ts');
    
    if (isTypeScript && this.options.enableTypeScriptTransforms) {
      return this.generateTypedLoggerInstance(loggerName, moduleInfo);
    }
    
    return this.generateStandardLoggerInstance(loggerName, moduleInfo);
  }

  /**
   * Generate TypeScript logger instance with types
   */
  generateTypedLoggerInstance(loggerName, moduleInfo) {
    const loggerConfig = this.generateLoggerConfig(moduleInfo);
    
    return t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(loggerName),
        t.callExpression(
          t.memberExpression(t.identifier('winston'), t.identifier('createLogger')),
          [loggerConfig]
        )
      )
    ]);
  }

  /**
   * Generate standard logger instance
   */
  generateStandardLoggerInstance(loggerName, moduleInfo) {
    const loggerConfig = this.generateLoggerConfig(moduleInfo);
    
    return t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(loggerName),
        t.callExpression(
          t.memberExpression(t.identifier('winston'), t.identifier('createLogger')),
          [loggerConfig]
        )
      )
    ]);
  }

  /**
   * Generate intelligent logger configuration
   */
  generateLoggerConfig(moduleInfo) {
    const defaultMeta = moduleInfo ? {
      module: moduleInfo.moduleName,
      file: moduleInfo.filename
    } : {};

    return t.objectExpression([
      t.objectProperty(
        t.identifier('level'),
        t.stringLiteral('info')
      ),
      t.objectProperty(
        t.identifier('format'),
        t.callExpression(
          t.memberExpression(
            t.memberExpression(t.identifier('winston'), t.identifier('format')),
            t.identifier('combine')
          ),
          [
            t.callExpression(
              t.memberExpression(
                t.memberExpression(t.identifier('winston'), t.identifier('format')),
                t.identifier('timestamp')
              ),
              []
            ),
            t.callExpression(
              t.memberExpression(
                t.memberExpression(t.identifier('winston'), t.identifier('format')),
                t.identifier('errors')
              ),
              [t.objectExpression([
                t.objectProperty(t.identifier('stack'), t.booleanLiteral(true))
              ])]
            ),
            t.callExpression(
              t.memberExpression(
                t.memberExpression(t.identifier('winston'), t.identifier('format')),
                t.identifier('json')
              ),
              []
            )
          ]
        )
      ),
      t.objectProperty(
        t.identifier('defaultMeta'),
        t.objectExpression(
          Object.entries(defaultMeta).map(([key, value]) =>
            t.objectProperty(t.identifier(key), t.stringLiteral(value))
          )
        )
      ),
      t.objectProperty(
        t.identifier('transports'),
        t.arrayExpression([
          t.newExpression(
            t.memberExpression(
              t.memberExpression(t.identifier('winston'), t.identifier('transports')),
              t.identifier('Console')
            ),
            []
          )
        ])
      )
    ]);
  }

  /**
   * Advanced file fixing with context awareness
   */
  async fixFile(filepath, options = {}) {
    await this.analyzeProjectStructure();
    
    try {
      const content = fs.readFileSync(filepath, 'utf8');
      const ast = this.parseCode(content, filepath);
      const changes = [];
      
      // Check existing logger patterns
      const existingLogger = this.findExistingLogger(ast);
      const loggerVariableName = existingLogger?.name || 
        (this.options.useModuleBasedNaming ? 
          this.generateModuleName(path.relative(this.options.projectRoot, filepath)) + 'Logger' :
          this.options.loggerVariableName);

      let needsLoggerImport = false;
      let needsLoggerInstance = false;
      let hasLoggerImport = !!existingLogger?.hasImport;
      let hasLoggerInstance = !!existingLogger?.hasInstance;

      // First pass: analyze requirements
      traverse(ast, {
        CallExpression: (path) => {
          const { node } = path;
          
          if (this.isConsoleCall(node)) {
            if (!hasLoggerImport) needsLoggerImport = true;
            if (!hasLoggerInstance) needsLoggerInstance = true;
          }
        }
      });

      // Second pass: perform transformations
      if (needsLoggerImport || needsLoggerInstance) {
        this.addLoggerInfrastructure(ast, filepath, {
          needsImport: needsLoggerImport,
          needsInstance: needsLoggerInstance,
          loggerName: loggerVariableName
        });
      }

      // Third pass: transform console calls
      traverse(ast, {
        CallExpression: (path) => {
          const { node } = path;
          
          if (this.isConsoleCall(node)) {
            const consoleMethod = node.callee.property.name;
            const loggerMethod = this.consoleToLoggerMap[consoleMethod] || 'info';
            
            // Enhanced transformation with context
            const newCall = this.createLoggerCall(loggerVariableName, loggerMethod, node.arguments);
            path.replaceWith(newCall);
            
            changes.push({
              line: node.loc?.start?.line || 0,
              column: node.loc?.start?.column || 0,
              old: `console.${consoleMethod}`,
              new: `${loggerVariableName}.${loggerMethod}`,
              type: 'console_replacement'
            });
          }
        }
      });

      // Generate the fixed code
      const result = generate(ast, {
        retainLines: true,
        comments: true
      });

      if (!options.dryRun && changes.length > 0) {
        fs.writeFileSync(filepath, result.code);
      }

      return {
        success: true,
        changes,
        filepath,
        modified: changes.length > 0
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        filepath,
        changes: []
      };
    }
  }

  /**
   * Add logger infrastructure (imports and instances)
   */
  addLoggerInfrastructure(ast, filepath, requirements) {
    if (!ast.body || !Array.isArray(ast.body)) {
      throw new Error('Invalid AST structure: body is not an array');
    }

    if (requirements.needsImport) {
      const imports = this.generateAdvancedLoggerImport(filepath);
      const importNodes = Array.isArray(imports) ? imports : [imports];
      
      // Insert imports at the top
      ast.body.unshift(...importNodes);
    }

    if (requirements.needsInstance) {
      const loggerInstance = this.generateContextualLoggerInstance(filepath);
      
      // Find the best place to insert the logger instance
      const insertIndex = this.findLoggerInsertionPoint(ast);
      ast.body.splice(insertIndex, 0, loggerInstance);
    }
  }

  /**
   * Find the best insertion point for logger instance
   */
  findLoggerInsertionPoint(ast) {
    let insertIndex = 0;
    
    // Skip imports and 'use strict'
    for (let i = 0; i < ast.body.length; i++) {
      const node = ast.body[i];
      
      if (node.type === 'ImportDeclaration' || 
          (node.type === 'ExpressionStatement' && 
           node.expression.type === 'StringLiteral' && 
           node.expression.value === 'use strict')) {
        insertIndex = i + 1;
      } else {
        break;
      }
    }
    
    return insertIndex;
  }

  /**
   * Create enhanced logger call with context
   */
  createLoggerCall(loggerName, method, args) {
    return t.callExpression(
      t.memberExpression(
        t.identifier(loggerName),
        t.identifier(method)
      ),
      args
    );
  }

  /**
   * Helper methods
   */
  isConsoleCall(node) {
    return node.callee?.type === 'MemberExpression' &&
           node.callee.object?.type === 'Identifier' &&
           node.callee.object.name === 'console' &&
           node.callee.property?.type === 'Identifier';
  }

  isLoggerDeclaration(node) {
    return node.init?.type === 'CallExpression' &&
           (this.isWinstonCreateLogger(node.init) ||
            this.isPinoLogger(node.init) ||
            this.isBunyanLogger(node.init));
  }

  isWinstonCreateLogger(node) {
    return node.callee?.type === 'MemberExpression' &&
           node.callee.object?.name === 'winston' &&
           node.callee.property?.name === 'createLogger';
  }

  isPinoLogger(node) {
    return node.callee?.type === 'Identifier' &&
           node.callee.name === 'pino';
  }

  isBunyanLogger(node) {
    return node.callee?.type === 'MemberExpression' &&
           node.callee.object?.name === 'bunyan' &&
           node.callee.property?.name === 'createLogger';
  }

  isLoggingImport(node) {
    const loggingLibs = ['winston', 'pino', 'bunyan', 'log4js'];
    return loggingLibs.some(lib => node.source.value.includes(lib));
  }

  getLoggerType(node) {
    if (this.isWinstonCreateLogger(node.init)) return 'winston';
    if (this.isPinoLogger(node.init)) return 'pino';
    if (this.isBunyanLogger(node.init)) return 'bunyan';
    return 'unknown';
  }

  getLoggerScope(path) {
    return path.scope.path.type === 'Program' ? 'module' : 'local';
  }

  findExistingLogger(ast) {
    let existingLogger = null;
    
    traverse(ast, {
      VariableDeclarator: (path) => {
        if (this.isLoggerDeclaration(path.node)) {
          existingLogger = {
            name: path.node.id.name,
            type: this.getLoggerType(path.node),
            hasInstance: true,
            hasImport: true // Assume import exists if instance exists
          };
        }
      }
    });
    
    return existingLogger;
  }

  /**
   * Fix multiple files with shared context
   */
  async fixFiles(filepaths, options = {}) {
    await this.analyzeProjectStructure();
    
    const results = {
      success: true,
      files: [],
      stats: {
        totalFiles: filepaths.length,
        modifiedFiles: 0,
        totalChanges: 0
      }
    };

    for (const filepath of filepaths) {
      const result = await this.fixFile(filepath, options);
      results.files.push(result);
      
      if (result.modified) {
        results.stats.modifiedFiles++;
        results.stats.totalChanges += result.changes.length;
      }
      
      if (!result.success) {
        results.success = false;
      }
    }

    return results;
  }
}

module.exports = AdvancedJavaScriptLogFixer;