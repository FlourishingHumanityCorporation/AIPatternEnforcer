#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const crypto = require('crypto');
const { performance } = require('perf_hooks');

/**
 * Base validator interface that all file type validators must implement
 */
class BaseValidator {
  constructor(config) {
    this.config = config;
  }

  /**
   * Validate a single file
   * @param {string} filePath - Path to the file to validate
   * @returns {Promise<{isValid: boolean, violations: Array, fixes: Array}>}
   */
  async validate(filePath) {
    throw new Error('validate() must be implemented by subclass');
  }

  /**
   * Apply fixes to a file
   * @param {string} filePath - Path to the file to fix
   * @param {Array} fixes - Array of fix operations
   * @param {boolean} dryRun - Whether to only simulate fixes
   * @returns {Promise<{success: boolean, changes: Array, errors: Array}>}
   */
  async applyFixes(filePath, fixes, dryRun = false) {
    throw new Error('applyFixes() must be implemented by subclass');
  }

  /**
   * Get file type identifier
   * @returns {string}
   */
  getFileType() {
    throw new Error('getFileType() must be implemented by subclass');
  }
}

/**
 * Cache management for performance optimization
 */
class ValidationCache {
  constructor(cacheConfig) {
    this.enabled = cacheConfig.cacheEnabled;
    this.cacheDir = cacheConfig.cacheDirectory;
    this.maxAge = cacheConfig.maxCacheAge * 1000; // Convert to milliseconds
    
    if (this.enabled) {
      this.ensureCacheDirectory();
    }
  }

  ensureCacheDirectory() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  getCacheKey(filePath, configHash) {
    const content = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';
    const hash = crypto.createHash('md5');
    hash.update(filePath + content + configHash);
    return hash.digest('hex');
  }

  getCachedResult(cacheKey) {
    if (!this.enabled) return null;

    const cachePath = path.join(this.cacheDir, `${cacheKey}.json`);
    
    if (!fs.existsSync(cachePath)) return null;

    try {
      const cached = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      const age = Date.now() - cached.timestamp;
      
      if (age > this.maxAge) {
        fs.unlinkSync(cachePath);
        return null;
      }
      
      return cached.result;
    } catch (error) {
      return null;
    }
  }

  setCachedResult(cacheKey, result) {
    if (!this.enabled) return;

    const cachePath = path.join(this.cacheDir, `${cacheKey}.json`);
    const cacheData = {
      timestamp: Date.now(),
      result
    };

    try {
      fs.writeFileSync(cachePath, JSON.stringify(cacheData, null, 2));
    } catch (error) {
      // Silently fail cache writes
    }
  }

  clearCache() {
    if (!this.enabled || !fs.existsSync(this.cacheDir)) return;

    try {
      const files = fs.readdirSync(this.cacheDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(this.cacheDir, file));
      });
    } catch (error) {
      // Silently fail cache cleanup
    }
  }
}

/**
 * Backup management for auto-fixes
 */
class BackupManager {
  constructor(backupConfig) {
    this.enabled = backupConfig.enabled;
    this.backupDir = backupConfig.directory;
    this.retentionDays = backupConfig.retentionDays;
    
    if (this.enabled) {
      this.ensureBackupDirectory();
      this.cleanupOldBackups();
    }
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  createBackup(filePath) {
    if (!this.enabled || !fs.existsSync(filePath)) return null;

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const basename = path.basename(filePath);
      const backupName = `${basename}_${timestamp}.backup`;
      const backupPath = path.join(this.backupDir, backupName);
      
      fs.copyFileSync(filePath, backupPath);
      return backupPath;
    } catch (error) {
      console.warn(`Warning: Failed to create backup for ${filePath}: ${error.message}`);
      return null;
    }
  }

  restoreBackup(backupPath, originalPath) {
    if (!this.enabled || !fs.existsSync(backupPath)) return false;

    try {
      fs.copyFileSync(backupPath, originalPath);
      return true;
    } catch (error) {
      console.error(`Error restoring backup ${backupPath}: ${error.message}`);
      return false;
    }
  }

  cleanupOldBackups() {
    if (!this.enabled || !fs.existsSync(this.backupDir)) return;

    try {
      const cutoffTime = Date.now() - (this.retentionDays * 24 * 60 * 60 * 1000);
      const files = fs.readdirSync(this.backupDir);
      
      files.forEach(file => {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.mtime.getTime() < cutoffTime) {
          fs.unlinkSync(filePath);
        }
      });
    } catch (error) {
      // Silently fail cleanup
    }
  }
}

/**
 * Main Config Enforcer class
 */
class ConfigEnforcer {
  constructor(options = {}) {
    // Load default config inline to avoid circular dependency
    const { defaultConfig } = require('./config-schema');
    this.config = { ...defaultConfig, ...options.config };
    this.configHash = this.generateConfigHash();
    this.validators = new Map();
    this.cache = new ValidationCache(this.config.performance);
    this.backupManager = new BackupManager(this.config.backup);
    this.violations = [];
    this.stats = {
      filesAnalyzed: 0,
      filesSkipped: 0,
      violations: 0,
      fixes: 0,
      timeElapsed: 0,
      cacheHits: 0,
      backupsCreated: 0
    };
  }

  generateConfigHash() {
    const hash = crypto.createHash('md5');
    hash.update(JSON.stringify(this.config));
    return hash.digest('hex');
  }

  /**
   * Register a validator for a specific file type
   */
  registerValidator(fileType, validator) {
    if (!(validator instanceof BaseValidator)) {
      throw new Error('Validator must extend BaseValidator');
    }
    this.validators.set(fileType, validator);
  }

  /**
   * Find configuration files to validate
   */
  findConfigFiles() {
    const files = new Set();
    const excludePatterns = [
      '**/node_modules/**',
      '**/.git/**',
      '**/dist/**',
      '**/build/**',
      '**/.cache/**',
      '**/coverage/**'
    ];

    // Collect files for each enabled file type
    Object.entries(this.config.fileTypes).forEach(([fileType, typeConfig]) => {
      if (!typeConfig.enabled) return;

      typeConfig.files.forEach(pattern => {
        try {
          const matches = glob.sync(pattern, {
            ignore: [...excludePatterns, ...typeConfig.excludePatterns]
          });
          matches.forEach(file => files.add({ path: file, type: fileType }));
        } catch (error) {
          console.warn(`Warning: Pattern "${pattern}" failed: ${error.message}`);
        }
      });
    });

    return Array.from(files);
  }

  /**
   * Validate a single file
   */
  async validateFile(fileInfo) {
    const { path: filePath, type: fileType } = fileInfo;
    const validator = this.validators.get(fileType);
    
    if (!validator) {
      return {
        filePath,
        fileType,
        isValid: true,
        violations: [],
        fixes: [],
        skipped: true,
        reason: `No validator registered for ${fileType}`
      };
    }

    // Check cache first
    const cacheKey = this.cache.getCacheKey(filePath, this.configHash);
    const cachedResult = this.cache.getCachedResult(cacheKey);
    
    if (cachedResult) {
      this.stats.cacheHits++;
      return { ...cachedResult, filePath, fileType, fromCache: true };
    }

    try {
      const startTime = performance.now();
      const result = await validator.validate(filePath);
      const endTime = performance.now();

      const validationResult = {
        filePath,
        fileType,
        ...result,
        validationTime: endTime - startTime
      };

      // Cache the result (without file path to avoid cache key conflicts)
      this.cache.setCachedResult(cacheKey, {
        isValid: result.isValid,
        violations: result.violations,
        fixes: result.fixes,
        validationTime: validationResult.validationTime
      });

      return validationResult;
    } catch (error) {
      return {
        filePath,
        fileType,
        isValid: false,
        violations: [{
          type: 'validation_error',
          message: `Validation failed: ${error.message}`,
          severity: 'error'
        }],
        fixes: [],
        error: error.message
      };
    }
  }

  /**
   * Validate all configuration files
   */
  async validateAll() {
    if (!this.config.enabled) {
      return { success: true, message: 'Config enforcement disabled' };
    }

    const startTime = performance.now();
    this.violations = [];
    this.stats = {
      filesAnalyzed: 0,
      filesSkipped: 0,
      violations: 0,
      fixes: 0,
      timeElapsed: 0,
      cacheHits: 0,
      backupsCreated: 0
    };

    const configFiles = this.findConfigFiles();
    const results = [];

    for (const fileInfo of configFiles) {
      const result = await this.validateFile(fileInfo);
      results.push(result);

      if (result.skipped) {
        this.stats.filesSkipped++;
      } else {
        this.stats.filesAnalyzed++;
        if (!result.isValid) {
          this.violations.push(result);
          this.stats.violations += result.violations.length;
        }
      }
    }

    // Run cross-file validation if enabled
    if (this.config.crossFileValidation.enabled && this.validators.has('cross-file')) {
      const crossFileValidator = this.validators.get('cross-file');
      const crossFileResult = await crossFileValidator.validate();
      
      crossFileResult.fileType = 'cross-file';
      crossFileResult.filePath = 'project-wide';
      results.push(crossFileResult);
      
      this.stats.filesAnalyzed++;
      if (!crossFileResult.isValid) {
        this.violations.push(crossFileResult);
        this.stats.violations += crossFileResult.violations.length;
      }
    }

    const endTime = performance.now();
    this.stats.timeElapsed = endTime - startTime;

    return {
      success: this.violations.length === 0,
      results,
      violations: this.violations,
      stats: this.stats
    };
  }

  /**
   * Apply fixes to files with violations
   */
  async applyFixes(dryRun = false) {
    if (!this.config.enabled) {
      return { success: true, message: 'Config enforcement disabled' };
    }

    const fixResults = [];
    let totalChanges = 0;

    for (const violation of this.violations) {
      const { filePath, fileType, fixes } = violation;
      
      if (!fixes || fixes.length === 0) continue;

      const typeConfig = this.config.fileTypes[fileType];
      if (!typeConfig || !typeConfig.autoFix) continue;

      const validator = this.validators.get(fileType);
      if (!validator) continue;

      try {
        // Create backup before making changes
        let backupPath = null;
        if (!dryRun && this.config.backup.enabled) {
          backupPath = this.backupManager.createBackup(filePath);
          if (backupPath) {
            this.stats.backupsCreated++;
          }
        }

        const result = await validator.applyFixes(filePath, fixes, dryRun);
        
        fixResults.push({
          filePath,
          fileType,
          success: result.success,
          changes: result.changes,
          errors: result.errors,
          backupPath,
          dryRun
        });

        if (result.success) {
          totalChanges += result.changes.length;
          this.stats.fixes++;
        }
      } catch (error) {
        fixResults.push({
          filePath,
          fileType,
          success: false,
          errors: [error.message],
          dryRun
        });
      }
    }

    return {
      success: true,
      results: fixResults,
      totalChanges,
      dryRun
    };
  }

  /**
   * Get validation report
   */
  getReport() {
    const enforcementLevel = this.config.enforcementLevel;
    const shouldBlock = enforcementLevel === 'FULL' || 
                       (enforcementLevel === 'PARTIAL' && this.stats.violations > 0);

    return {
      enforcementLevel,
      shouldBlock,
      violations: this.violations,
      stats: this.stats,
      config: this.config
    };
  }
}

module.exports = {
  ConfigEnforcer,
  BaseValidator,
  ValidationCache,
  BackupManager
};