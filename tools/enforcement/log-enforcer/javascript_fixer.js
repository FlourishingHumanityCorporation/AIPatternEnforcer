#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

/**
 * JavaScript/TypeScript auto-fixer for logging violations
 */
class JavaScriptLogFixer {
  constructor(options = {}) {
    this.options = {
      preferredLogger: options.preferredLogger || 'winston',
      loggerVariableName: options.loggerVariableName || 'logger',
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
        if (plugin === 'typescript') return isTypeScript;
        if (plugin === 'jsx') return isJSX || isTypeScript;
        return true;
      })
    };
  }

  /**
   * Generate logger import statement based on preferred logger
   */
  generateLoggerImport() {
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
      
      case 'bunyan':
        return t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier('bunyan'),
            t.callExpression(t.identifier('require'), [t.stringLiteral('bunyan')])
          )
        ]);
      
      default:
        return t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier('winston'),
            t.callExpression(t.identifier('require'), [t.stringLiteral('winston')])
          )
        ]);
    }
  }

  /**
   * Generate logger instance creation
   */
  generateLoggerInstance() {
    const loggerVar = this.options.loggerVariableName;
    
    switch (this.options.preferredLogger) {
      case 'winston':
        return t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier(loggerVar),
            t.callExpression(
              t.memberExpression(t.identifier('winston'), t.identifier('createLogger')),
              [
                t.objectExpression([
                  t.objectProperty(
                    t.identifier('level'),
                    t.stringLiteral('info')
                  ),
                  t.objectProperty(
                    t.identifier('format'),
                    t.memberExpression(
                      t.memberExpression(t.identifier('winston'), t.identifier('format')),
                      t.identifier('json')
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
                ])
              ]
            )
          )
        ]);
      
      case 'pino':
        return t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier(loggerVar),
            t.callExpression(t.identifier('pino'), [])
          )
        ]);
      
      case 'bunyan':
        return t.variableDeclaration('const', [
          t.variableDeclarator(
            t.identifier(loggerVar),
            t.callExpression(
              t.memberExpression(t.identifier('bunyan'), t.identifier('createLogger')),
              [
                t.objectExpression([
                  t.objectProperty(
                    t.identifier('name'),
                    t.stringLiteral('app')
                  )
                ])
              ]
            )
          )
        ]);
      
      default:
        return this.generateLoggerInstance();
    }
  }

  /**
   * Fix violations in a JavaScript/TypeScript file
   */
  async fixFile(filepath, options = {}) {
    const dryRun = options.dryRun || false;
    
    try {
      const content = fs.readFileSync(filepath, 'utf8');
      const parserOptions = this.getParserOptions(filepath);
      const ast = parser.parse(content, parserOptions);
      
      const changes = [];
      let hasLoggerImport = false;
      let hasLoggerInstance = false;
      let needsLoggerImport = false;
      let needsLoggerInstance = false;
      const self = this;
      const consoleToLoggerMap = this.consoleToLoggerMap;
      const loggerVariableName = this.options.loggerVariableName;
      
      // First pass: detect existing logger setup and console violations
      traverse(ast, {
        ImportDeclaration(path) {
          const source = path.node.source.value;
          const loggingLibraries = ['winston', 'pino', 'bunyan', 'log4js', 'loglevel'];
          
          if (loggingLibraries.some(lib => source.includes(lib))) {
            hasLoggerImport = true;
          }
        },
        
        CallExpression(path) {
          const { node } = path;
          
          // Check for require statements
          if (
            node.callee.type === 'Identifier' &&
            node.callee.name === 'require' &&
            node.arguments && node.arguments.length > 0 &&
            node.arguments[0].type === 'StringLiteral'
          ) {
            const source = node.arguments[0].value;
            const loggingLibraries = ['winston', 'pino', 'bunyan', 'log4js', 'loglevel'];
            
            if (loggingLibraries.some(lib => source.includes(lib))) {
              hasLoggerImport = true;
            }
          }
          
          // Check for console usage
          if (
            node.callee.type === 'MemberExpression' &&
            node.callee.object.type === 'Identifier' &&
            node.callee.object.name === 'console' &&
            node.callee.property.type === 'Identifier'
          ) {
            needsLoggerImport = true;
            needsLoggerInstance = true;
          }
        },
        
        VariableDeclarator(path) {
          const { node } = path;
          
          // Check for logger instance creation
          if (
            node.init &&
            node.init.type === 'CallExpression' &&
            node.init.callee.type === 'MemberExpression'
          ) {
            const callee = node.init.callee;
            
            if (
              (callee.object.name === 'winston' && callee.property.name === 'createLogger') ||
              (callee.object.name === 'bunyan' && callee.property.name === 'createLogger') ||
              (callee.object.name === 'log4js' && callee.property.name === 'getLogger')
            ) {
              hasLoggerInstance = true;
            }
          }
          
          // Check for direct logger creation (pino)
          if (
            node.init &&
            node.init.type === 'CallExpression' &&
            node.init.callee.type === 'Identifier' &&
            ['pino', 'bunyan'].includes(node.init.callee.name)
          ) {
            hasLoggerInstance = true;
          }
        }
      });
      
      // Second pass: transform console calls
      if (needsLoggerImport || needsLoggerInstance) {
        traverse(ast, {
          CallExpression(path) {
            const { node } = path;
            
            // Transform console.* calls
            if (
              node.callee.type === 'MemberExpression' &&
              node.callee.object.type === 'Identifier' &&
              node.callee.object.name === 'console' &&
              node.callee.property.type === 'Identifier'
            ) {
              const consoleMethod = node.callee.property.name;
              const loggerMethod = consoleToLoggerMap[consoleMethod] || 'info';
              
              // Replace with logger call
              const newCall = t.callExpression(
                t.memberExpression(
                  t.identifier(loggerVariableName),
                  t.identifier(loggerMethod)
                ),
                node.arguments
              );
              
              path.replaceWith(newCall);
              
              changes.push({
                line: node.loc.start.line,
                column: node.loc.start.column,
                old: `console.${consoleMethod}`,
                new: `${loggerVariableName}.${loggerMethod}`,
                type: 'console_to_logger'
              });
            }
          }
        });
      }
      
      // Add missing imports and logger instance
      if (needsLoggerImport && !hasLoggerImport) {
        // Find insertion point for import
        let insertIndex = 0;
        for (let i = 0; ast.body && i < ast.body.length; i++) {
          if (t.isImportDeclaration(ast.body[i]) || 
              (t.isVariableDeclaration(ast.body[i]) && 
               ast.body[i].declarations.some(d => 
                 d.init && t.isCallExpression(d.init) && 
                 t.isIdentifier(d.init.callee) && 
                 d.init.callee.name === 'require'))) {
            insertIndex = i + 1;
          } else {
            break;
          }
        }
        
        if (ast.body) {
          ast.body.splice(insertIndex, 0, self.generateLoggerImport());
        }
        changes.push({
          type: 'import_added',
          library: self.options.preferredLogger
        });
      }
      
      if (needsLoggerInstance && !hasLoggerInstance) {
        // Find insertion point for logger instance
        let insertIndex = 0;
        for (let i = 0; ast.body && i < ast.body.length; i++) {
          if (t.isImportDeclaration(ast.body[i]) || 
              (t.isVariableDeclaration(ast.body[i]) && 
               ast.body[i].declarations.some(d => 
                 d.init && t.isCallExpression(d.init) && 
                 t.isIdentifier(d.init.callee) && 
                 d.init.callee.name === 'require'))) {
            insertIndex = i + 1;
          } else {
            break;
          }
        }
        
        if (ast.body) {
          ast.body.splice(insertIndex, 0, self.generateLoggerInstance());
        }
        changes.push({
          type: 'logger_instance_added',
          variableName: loggerVariableName
        });
      }
      
      // Generate new code
      const output = generate(ast, {
        retainLines: true,
        compact: false
      });
      
      const result = {
        success: true,
        changes: changes || [],
        originalContent: content,
        fixedContent: output.code,
        filepath
      };
      
      // Write back to file if not dry run
      if (!dryRun && result.changes.length > 0) {
        fs.writeFileSync(filepath, output.code);
      }
      
      return result;
      
    } catch (error) {
      return {
        success: false,
        error: error.message,
        changes: [],
        originalContent: '',
        fixedContent: '',
        filepath
      };
    }
  }

  /**
   * Fix violations in multiple JavaScript/TypeScript files
   */
  async fixFiles(filepaths, options = {}) {
    const results = await Promise.all(
      filepaths.map(filepath => this.fixFile(filepath, options))
    );
    
    return {
      files: results,
      summary: this.generateFixSummary(results)
    };
  }

  /**
   * Generate fix summary
   */
  generateFixSummary(results) {
    const totalFiles = results.length;
    const successfulFixes = results.filter(r => r.success).length;
    const failedFixes = results.filter(r => !r.success).length;
    const totalChanges = results.reduce((sum, r) => sum + (r.changes?.length || 0), 0);
    
    const changesByType = {};
    results.forEach(r => {
      if (r.changes) {
        r.changes.forEach(change => {
          changesByType[change.type] = (changesByType[change.type] || 0) + 1;
        });
      }
    });
    
    return {
      totalFiles,
      successfulFixes,
      failedFixes,
      totalChanges,
      changesByType
    };
  }
}

module.exports = JavaScriptLogFixer;