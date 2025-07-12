#!/usr/bin/env node

/**
 * Configuration schema for log enforcer
 */
const configSchema = {
  type: 'object',
  properties: {
    enabled: {
      type: 'boolean',
      default: true,
      description: 'Enable or disable log enforcement'
    },
    
    languages: {
      type: 'object',
      properties: {
        python: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            severity: { 
              type: 'string', 
              enum: ['error', 'warning', 'info'],
              default: 'error'
            },
            autoFix: { type: 'boolean', default: true },
            excludePatterns: {
              type: 'array',
              items: { type: 'string' },
              default: []
            },
            testFilePatterns: {
              type: 'array',
              items: { type: 'string' },
              default: [
                '**/test_*.py',
                '**/*_test.py',
                '**/tests/**/*.py',
                '**/testing/**/*.py'
              ]
            },
            cliFilePatterns: {
              type: 'array',
              items: { type: 'string' },
              default: [
                '**/cli.py',
                '**/cli/**/*.py',
                '**/__main__.py',
                '**/scripts/**/*.py'
              ]
            }
          }
        },
        
        javascript: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            severity: { 
              type: 'string', 
              enum: ['error', 'warning', 'info'],
              default: 'error'
            },
            autoFix: { type: 'boolean', default: true },
            excludePatterns: {
              type: 'array',
              items: { type: 'string' },
              default: []
            },
            testFilePatterns: {
              type: 'array',
              items: { type: 'string' },
              default: [
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
              ]
            },
            cliFilePatterns: {
              type: 'array',
              items: { type: 'string' },
              default: [
                '**/cli.js',
                '**/cli.ts',
                '**/cli/**/*.js',
                '**/cli/**/*.ts',
                '**/scripts/**/*.js',
                '**/scripts/**/*.ts',
                '**/bin/**/*.js',
                '**/bin/**/*.ts'
              ]
            },
            preferredLogger: {
              type: 'string',
              enum: ['winston', 'pino', 'bunyan', 'log4js', 'console', 'custom'],
              default: 'winston',
              description: 'Preferred logging library for auto-fixes'
            },
            customLoggerImport: {
              type: 'string',
              description: 'Custom import statement for logger (when preferredLogger is "custom")'
            }
          }
        },
        
        typescript: {
          type: 'object',
          properties: {
            // Inherits from javascript settings
            extends: { type: 'string', default: 'javascript' }
          }
        }
      }
    },
    
    rules: {
      type: 'object',
      properties: {
        noPrintStatements: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            severity: { 
              type: 'string', 
              enum: ['error', 'warning', 'info'],
              default: 'error'
            },
            message: {
              type: 'string',
              default: 'Use logging.getLogger(__name__) instead of print()'
            }
          }
        },
        
        noConsoleUsage: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            severity: { 
              type: 'string', 
              enum: ['error', 'warning', 'info'],
              default: 'error'
            },
            message: {
              type: 'string',
              default: 'Use proper logging library instead of console'
            },
            allowedMethods: {
              type: 'array',
              items: { type: 'string' },
              default: [],
              description: 'Console methods that are allowed (e.g., ["time", "timeEnd"])'
            }
          }
        },
        
        requireLoggerInstance: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            severity: { 
              type: 'string', 
              enum: ['error', 'warning', 'info'],
              default: 'warning'
            },
            message: {
              type: 'string',
              default: 'File uses logging but has no logger instance'
            }
          }
        }
      }
    },
    
    performance: {
      type: 'object',
      properties: {
        enableCache: { type: 'boolean', default: true },
        cacheDirectory: { 
          type: 'string', 
          default: '.log-enforcer-cache' 
        },
        parallelism: { 
          type: 'number', 
          default: 4,
          minimum: 1,
          maximum: 16
        },
        incrementalMode: { 
          type: 'boolean', 
          default: true,
          description: 'Only check changed files'
        }
      }
    },
    
    reporting: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          enum: ['json', 'text', 'markdown', 'junit'],
          default: 'text'
        },
        outputFile: {
          type: 'string',
          description: 'File to write report to (optional)'
        },
        verbose: { type: 'boolean', default: false },
        showExcludedFiles: { type: 'boolean', default: false },
        groupByFile: { type: 'boolean', default: true }
      }
    },
    
    integration: {
      type: 'object',
      properties: {
        git: {
          type: 'object',
          properties: {
            preCommitHook: { type: 'boolean', default: true },
            prComments: { type: 'boolean', default: true },
            blockOnViolations: { type: 'boolean', default: true }
          }
        },
        
        vscode: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            showInProblems: { type: 'boolean', default: true },
            showQuickFixes: { type: 'boolean', default: true }
          }
        }
      }
    }
  },
  
  additionalProperties: false
};

/**
 * Default configuration
 */
const defaultConfig = {
  enabled: true,
  languages: {
    python: {
      enabled: true,
      severity: 'error',
      autoFix: true
    },
    javascript: {
      enabled: true,
      severity: 'error',
      autoFix: true,
      preferredLogger: 'winston'
    },
    typescript: {
      extends: 'javascript'
    }
  },
  rules: {
    noPrintStatements: {
      enabled: true,
      severity: 'error'
    },
    noConsoleUsage: {
      enabled: true,
      severity: 'error',
      allowedMethods: []
    },
    requireLoggerInstance: {
      enabled: true,
      severity: 'warning'
    }
  },
  performance: {
    enableCache: true,
    parallelism: 4,
    incrementalMode: true
  },
  reporting: {
    format: 'text',
    verbose: false,
    groupByFile: true
  },
  integration: {
    git: {
      preCommitHook: true,
      prComments: true,
      blockOnViolations: true
    },
    vscode: {
      enabled: true,
      showInProblems: true,
      showQuickFixes: true
    }
  }
};

/**
 * Load and validate configuration
 */
function loadConfig(configPath) {
  const fs = require('fs');
  const path = require('path');
  
  // Look for config file
  const configFiles = [
    configPath,
    '.log-enforcer.json',
    '.log-enforcer.js',
    'log-enforcer.config.js',
    path.join('.enforcement', 'log-enforcer.json')
  ].filter(Boolean);
  
  for (const file of configFiles) {
    if (fs.existsSync(file)) {
      try {
        const config = file.endsWith('.js') 
          ? require(path.resolve(file))
          : JSON.parse(fs.readFileSync(file, 'utf8'));
          
        return mergeWithDefaults(config, defaultConfig);
      } catch (error) {
        console.error(`Error loading config from ${file}:`, error.message);
      }
    }
  }
  
  return defaultConfig;
}

/**
 * Merge user config with defaults
 */
function mergeWithDefaults(userConfig, defaults) {
  const merged = { ...defaults };
  
  for (const key in userConfig) {
    if (typeof userConfig[key] === 'object' && !Array.isArray(userConfig[key])) {
      merged[key] = mergeWithDefaults(userConfig[key], defaults[key] || {});
    } else {
      merged[key] = userConfig[key];
    }
  }
  
  return merged;
}

module.exports = {
  configSchema,
  defaultConfig,
  loadConfig
};