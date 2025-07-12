#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Performance cache for log enforcer
 */
class LogEnforcerCache {
  constructor(options = {}) {
    this.cacheDir = options.cacheDir || path.join(process.cwd(), '.log-enforcer-cache');
    this.enabled = options.enabled !== false;
    this.ttl = options.ttl || 24 * 60 * 60 * 1000; // 24 hours default
    
    if (this.enabled) {
      this.ensureCacheDir();
      this.loadIndex();
    }
  }

  /**
   * Ensure cache directory exists
   */
  ensureCacheDir() {
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Load cache index
   */
  loadIndex() {
    const indexPath = path.join(this.cacheDir, 'index.json');
    
    if (fs.existsSync(indexPath)) {
      try {
        const data = fs.readFileSync(indexPath, 'utf8');
        this.index = JSON.parse(data);
        this.cleanExpiredEntries();
      } catch (error) {
        this.index = {};
      }
    } else {
      this.index = {};
    }
  }

  /**
   * Save cache index
   */
  saveIndex() {
    if (!this.enabled) return;
    
    const indexPath = path.join(this.cacheDir, 'index.json');
    fs.writeFileSync(indexPath, JSON.stringify(this.index, null, 2));
  }

  /**
   * Clean expired entries
   */
  cleanExpiredEntries() {
    const now = Date.now();
    let cleaned = false;
    
    Object.keys(this.index).forEach(key => {
      if (now - this.index[key].timestamp > this.ttl) {
        delete this.index[key];
        cleaned = true;
        
        // Remove cache file
        const cachePath = path.join(this.cacheDir, this.index[key].file);
        if (fs.existsSync(cachePath)) {
          fs.unlinkSync(cachePath);
        }
      }
    });
    
    if (cleaned) {
      this.saveIndex();
    }
  }

  /**
   * Generate cache key for a file
   */
  generateKey(filepath, mtime, config) {
    const data = JSON.stringify({
      filepath,
      mtime,
      config
    });
    
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Get cached result
   */
  get(filepath, mtime, config) {
    if (!this.enabled) return null;
    
    const key = this.generateKey(filepath, mtime, config);
    const entry = this.index[key];
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      delete this.index[key];
      this.saveIndex();
      return null;
    }
    
    // Load cached data
    const cachePath = path.join(this.cacheDir, entry.file);
    
    if (!fs.existsSync(cachePath)) {
      delete this.index[key];
      this.saveIndex();
      return null;
    }
    
    try {
      const data = fs.readFileSync(cachePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // Cache corrupted, remove it
      delete this.index[key];
      this.saveIndex();
      return null;
    }
  }

  /**
   * Set cached result
   */
  set(filepath, mtime, config, result) {
    if (!this.enabled) return;
    
    const key = this.generateKey(filepath, mtime, config);
    const cacheFile = `${key}.json`;
    const cachePath = path.join(this.cacheDir, cacheFile);
    
    // Save result to file
    fs.writeFileSync(cachePath, JSON.stringify(result));
    
    // Update index
    this.index[key] = {
      file: cacheFile,
      filepath,
      timestamp: Date.now()
    };
    
    this.saveIndex();
  }

  /**
   * Clear all cache
   */
  clear() {
    if (!this.enabled) return;
    
    // Remove all cache files
    Object.values(this.index).forEach(entry => {
      const cachePath = path.join(this.cacheDir, entry.file);
      if (fs.existsSync(cachePath)) {
        fs.unlinkSync(cachePath);
      }
    });
    
    // Clear index
    this.index = {};
    this.saveIndex();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const entries = Object.keys(this.index).length;
    const size = Object.values(this.index).reduce((total, entry) => {
      const cachePath = path.join(this.cacheDir, entry.file);
      if (fs.existsSync(cachePath)) {
        const stats = fs.statSync(cachePath);
        return total + stats.size;
      }
      return total;
    }, 0);
    
    return {
      entries,
      size,
      humanSize: this.formatBytes(size)
    };
  }

  /**
   * Format bytes to human readable
   */
  formatBytes(bytes) {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(2)} ${units[unitIndex]}`;
  }
}

module.exports = LogEnforcerCache;