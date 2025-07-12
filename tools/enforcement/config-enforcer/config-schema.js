#!/usr/bin/env node

/**
 * Configuration schema for config enforcer
 * Follows existing log-enforcer patterns for consistency
 */

const configSchema = {
  type: 'object',
  properties: {
    enabled: {
      type: 'boolean',
      default: true,
      description: 'Enable or disable config enforcement'
    },
    
    enforcementLevel: {
      type: 'string',
      enum: ['SILENT', 'WARNING', 'PARTIAL', 'FULL'],
      default: 'WARNING',
      description: 'Global enforcement level - WARNING by default to avoid disrupting workflows'
    },

    fileTypes: {
      type: 'object',
      properties: {
        json: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            severity: { 
              type: 'string', 
              enum: ['error', 'warning', 'info'],
              default: 'warning'
            },
            autoFix: { type: 'boolean', default: true },
            files: {
              type: 'array',
              items: { type: 'string' },
              default: [
                'package.json',
                'tsconfig.json',
                '.eslintrc.json',
                'tsconfig.*.json'
              ]
            },
            excludePatterns: {
              type: 'array',
              items: { type: 'string' },
              default: [
                'node_modules/**',
                '**/node_modules/**',
                'dist/**',
                'build/**'
              ]
            },
            rules: {
              type: 'object',
              properties: {
                requireScripts: { 
                  type: 'boolean', 
                  default: true,
                  description: 'Require standard scripts in package.json'
                },
                formatJson: { 
                  type: 'boolean', 
                  default: true,
                  description: 'Auto-format JSON files with consistent spacing'
                },
                validatePackageFields: { 
                  type: 'boolean', 
                  default: true,
                  description: 'Validate required fields in package.json'
                }
              }
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
              default: 'warning'
            },
            autoFix: { type: 'boolean', default: false }, // More conservative for JS files
            files: {
              type: 'array',
              items: { type: 'string' },
              default: [
                'vite.config.js',
                'vite.config.ts',
                'webpack.config.js',
                'jest.config.js',
                'jest.config.ts'
              ]
            },
            excludePatterns: {
              type: 'array',
              items: { type: 'string' },
              default: [
                'node_modules/**',
                '**/node_modules/**',
                'dist/**',
                'build/**'
              ]
            },
            rules: {
              type: 'object',
              properties: {
                standardizeExports: { 
                  type: 'boolean', 
                  default: false, // Start conservative
                  description: 'Standardize export patterns in config files'
                },
                validateStructure: { 
                  type: 'boolean', 
                  default: true,
                  description: 'Validate config file structure'
                }
              }
            }
          }
        },

        environment: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            severity: { 
              type: 'string', 
              enum: ['error', 'warning', 'info'],
              default: 'warning'
            },
            autoFix: { type: 'boolean', default: true },
            files: {
              type: 'array',
              items: { type: 'string' },
              default: [
                '.env.example',
                '.gitignore',
                '.aiignore'
              ]
            },
            rules: {
              type: 'object',
              properties: {
                syncEnvExample: { 
                  type: 'boolean', 
                  default: false, // Requires .env file existence check
                  description: 'Sync .env.example with .env variables'
                },
                standardizeGitignore: { 
                  type: 'boolean', 
                  default: true,
                  description: 'Ensure standard gitignore patterns'
                },
                fixLineEndings: { 
                  type: 'boolean', 
                  default: true,
                  description: 'Fix line ending inconsistencies'
                }
              }
            }
          }
        },

        yaml: {
          type: 'object',
          properties: {
            enabled: { type: 'boolean', default: true },
            severity: { 
              type: 'string', 
              enum: ['error', 'warning', 'info'],
              default: 'warning'
            },
            autoFix: { type: 'boolean', default: true },
            files: {
              type: 'array',
              items: { type: 'string' },
              default: [
                '.github/workflows/*.yml',
                '.github/workflows/*.yaml',
                'docker-compose.yml',
                'docker-compose.yaml'
              ]
            },
            excludePatterns: {
              type: 'array',
              items: { type: 'string' },
              default: []
            },
            rules: {
              type: 'object',
              properties: {
                validateWorkflows: { 
                  type: 'boolean', 
                  default: true,
                  description: 'Validate GitHub Actions workflow structure'
                },
                formatYaml: { 
                  type: 'boolean', 
                  default: true,
                  description: 'Auto-format YAML files with consistent indentation'
                }
              }
            }
          }
        }
      }
    },

    crossFileValidation: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean', default: false }, // Advanced feature, start disabled
        validateScriptConsistency: { 
          type: 'boolean', 
          default: false,
          description: 'Check package.json scripts match available configs'
        },
        validateImportPaths: { 
          type: 'boolean', 
          default: false,
          description: 'Validate import paths against tsconfig paths'
        }
      }
    },

    backup: {
      type: 'object',
      properties: {
        enabled: { type: 'boolean', default: true },
        directory: { 
          type: 'string', 
          default: '.config-enforcer-backups',
          description: 'Directory to store backup files before auto-fixes'
        },
        retentionDays: { 
          type: 'number', 
          default: 7,
          description: 'Days to retain backup files'
        }
      }
    },

    performance: {
      type: 'object',
      properties: {
        cacheEnabled: { type: 'boolean', default: true },
        cacheDirectory: { 
          type: 'string', 
          default: '.config-enforcer-cache',
          description: 'Directory for validation cache'
        },
        maxCacheAge: { 
          type: 'number', 
          default: 300, // 5 minutes
          description: 'Maximum cache age in seconds'
        }
      }
    },

    integration: {
      type: 'object',
      properties: {
        respectExistingTools: { 
          type: 'boolean', 
          default: true,
          description: 'Integrate with rather than replace existing tools like ESLint/Prettier'
        },
        claudeHooks: { 
          type: 'boolean', 
          default: true,
          description: 'Enable Claude Code hooks integration'
        },
        preCommitHooks: { 
          type: 'boolean', 
          default: true,
          description: 'Enable pre-commit hook integration'
        }
      }
    }
  }
};

// Default configuration object
const defaultConfig = {
  enabled: true,
  enforcementLevel: 'WARNING',
  fileTypes: {
    json: {
      enabled: true,
      severity: 'warning',
      autoFix: true,
      files: [
        'package.json',
        'tsconfig.json',
        '.eslintrc.json',
        'tsconfig.*.json'
      ],
      excludePatterns: [
        'node_modules/**',
        '**/node_modules/**',
        'dist/**',
        'build/**'
      ],
      rules: {
        requireScripts: true,
        formatJson: true,
        validatePackageFields: true
      }
    },
    javascript: {
      enabled: true,
      severity: 'warning',
      autoFix: false,
      files: [
        'vite.config.js',
        'vite.config.ts',
        'webpack.config.js',
        'jest.config.js',
        'jest.config.ts'
      ],
      excludePatterns: [
        'node_modules/**',
        '**/node_modules/**',
        'dist/**',
        'build/**'
      ],
      rules: {
        standardizeExports: false,
        validateStructure: true
      }
    },
    environment: {
      enabled: true,
      severity: 'warning',
      autoFix: true,
      files: [
        '.env.example',
        '.gitignore',
        '.aiignore'
      ],
      excludePatterns: [],
      rules: {
        syncEnvExample: false,
        standardizeGitignore: true,
        fixLineEndings: true
      }
    },
    yaml: {
      enabled: true,
      severity: 'warning',
      autoFix: true,
      files: [
        '.github/workflows/*.yml',
        '.github/workflows/*.yaml',
        'docker-compose.yml',
        'docker-compose.yaml'
      ],
      excludePatterns: [],
      rules: {
        validateWorkflows: true,
        formatYaml: true
      }
    }
  },
  crossFileValidation: {
    enabled: false,
    validateScriptConsistency: false,
    validateImportPaths: false
  },
  backup: {
    enabled: true,
    directory: '.config-enforcer-backups',
    retentionDays: 7
  },
  performance: {
    cacheEnabled: true,
    cacheDirectory: '.config-enforcer-cache',
    maxCacheAge: 300
  },
  integration: {
    respectExistingTools: true,
    claudeHooks: true,
    preCommitHooks: true
  }
};

module.exports = {
  configSchema,
  defaultConfig
};