#!/usr/bin/env node

/**
 * Learning Database for Hook System
 * Manages SQLite database for storing execution data, patterns, and learning insights
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

class LearningDatabase {
  constructor(dbPath = path.join(__dirname, "../data/learning.db")) {
    this.dbPath = dbPath;
    this.db = null;
    this.initialized = false;
  }

  /**
   * Initialize database connection and create tables
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Ensure data directory exists
      const dataDir = path.dirname(this.dbPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Create database connection
      this.db = new sqlite3.Database(this.dbPath);

      // Create tables
      await this.createTables();
      await this.createIndexes();

      this.initialized = true;

      if (process.env.HOOK_VERBOSE === "true") {
        console.log(`Learning database initialized at ${this.dbPath}`);
      }
    } catch (error) {
      console.error("Failed to initialize learning database:", error);
      throw error;
    }
  }

  /**
   * Create database tables
   */
  async createTables() {
    const tables = [
      // Core execution data
      `CREATE TABLE IF NOT EXISTS hook_executions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hook_name TEXT NOT NULL,
        hook_family TEXT NOT NULL,
        hook_priority TEXT NOT NULL,
        execution_time INTEGER NOT NULL,
        success BOOLEAN NOT NULL,
        blocked BOOLEAN NOT NULL,
        file_path TEXT,
        file_extension TEXT,
        content_hash TEXT,
        context_data TEXT,
        error_message TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Pattern storage
      `CREATE TABLE IF NOT EXISTS hook_patterns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hook_name TEXT NOT NULL,
        pattern_type TEXT NOT NULL,
        pattern_data TEXT NOT NULL,
        success_count INTEGER DEFAULT 0,
        failure_count INTEGER DEFAULT 0,
        total_count INTEGER DEFAULT 0,
        success_rate REAL DEFAULT 0,
        confidence REAL DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // System-wide metrics
      `CREATE TABLE IF NOT EXISTS system_metrics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        metric_name TEXT NOT NULL,
        metric_value REAL NOT NULL,
        metric_type TEXT NOT NULL,
        context TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Learning insights
      `CREATE TABLE IF NOT EXISTS learning_insights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hook_name TEXT NOT NULL,
        insight_type TEXT NOT NULL,
        insight_data TEXT NOT NULL,
        confidence REAL NOT NULL,
        applied BOOLEAN DEFAULT FALSE,
        effectiveness REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Parameter changes tracking
      `CREATE TABLE IF NOT EXISTS parameter_changes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hook_name TEXT NOT NULL,
        parameter_name TEXT NOT NULL,
        old_value TEXT,
        new_value TEXT NOT NULL,
        change_reason TEXT,
        confidence REAL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
    ];

    for (const tableSQL of tables) {
      await this.runQuery(tableSQL);
    }
  }

  /**
   * Create database indexes for performance
   */
  async createIndexes() {
    const indexes = [
      "CREATE INDEX IF NOT EXISTS idx_executions_hook_name ON hook_executions(hook_name)",
      "CREATE INDEX IF NOT EXISTS idx_executions_timestamp ON hook_executions(timestamp)",
      "CREATE INDEX IF NOT EXISTS idx_executions_family ON hook_executions(hook_family)",
      "CREATE INDEX IF NOT EXISTS idx_patterns_hook_name ON hook_patterns(hook_name)",
      "CREATE INDEX IF NOT EXISTS idx_patterns_type ON hook_patterns(pattern_type)",
      "CREATE INDEX IF NOT EXISTS idx_metrics_name ON system_metrics(metric_name)",
      "CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON system_metrics(timestamp)",
      "CREATE INDEX IF NOT EXISTS idx_insights_hook_name ON learning_insights(hook_name)",
      "CREATE INDEX IF NOT EXISTS idx_parameter_changes_hook_name ON parameter_changes(hook_name)",
    ];

    for (const indexSQL of indexes) {
      await this.runQuery(indexSQL);
    }
  }

  /**
   * Record hook execution data
   */
  async recordExecution(hookName, executionData) {
    await this.ensureInitialized();

    const sql = `
      INSERT INTO hook_executions 
      (hook_name, hook_family, hook_priority, execution_time, success, blocked, 
       file_path, file_extension, content_hash, context_data, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      hookName,
      executionData.family || "unknown",
      executionData.priority || "medium",
      executionData.executionTime || 0,
      executionData.success ? 1 : 0,
      executionData.blocked ? 1 : 0,
      executionData.filePath || null,
      executionData.fileExtension || null,
      executionData.contentHash || null,
      executionData.context ? JSON.stringify(executionData.context) : null,
      executionData.errorMessage || null,
    ];

    return await this.runQuery(sql, params);
  }

  /**
   * Get execution history for a hook
   */
  async getExecutionHistory(hookName, limit = 1000) {
    await this.ensureInitialized();

    const sql = `
      SELECT * FROM hook_executions 
      WHERE hook_name = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `;

    return await this.getAllRows(sql, [hookName, limit]);
  }

  /**
   * Get recent executions across all hooks
   */
  async getRecentExecutions(hookName, limit = 100) {
    await this.ensureInitialized();

    const sql = `
      SELECT * FROM hook_executions 
      WHERE hook_name = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `;

    return await this.getAllRows(sql, [hookName, limit]);
  }

  /**
   * Get system metrics
   */
  async getSystemMetrics(timeRange = 7) {
    await this.ensureInitialized();

    const sql = `
      SELECT 
        hook_name,
        hook_family,
        COUNT(*) as total_executions,
        AVG(execution_time) as avg_execution_time,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate,
        SUM(CASE WHEN blocked = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as block_rate
      FROM hook_executions 
      WHERE timestamp > datetime('now', '-' || ? || ' days')
      GROUP BY hook_name, hook_family
      ORDER BY total_executions DESC
    `;

    return await this.getAllRows(sql, [timeRange]);
  }

  /**
   * Update or create pattern data
   */
  async updatePattern(hookName, patternType, patternData, success, blocked) {
    await this.ensureInitialized();

    const patternDataStr =
      typeof patternData === "string"
        ? patternData
        : JSON.stringify(patternData);

    // Check if pattern exists
    const existingPattern = await this.getRow(
      "SELECT * FROM hook_patterns WHERE hook_name = ? AND pattern_type = ? AND pattern_data = ?",
      [hookName, patternType, patternDataStr],
    );

    if (existingPattern) {
      // Update existing pattern
      const newSuccessCount = existingPattern.success_count + (success ? 1 : 0);
      const newFailureCount = existingPattern.failure_count + (success ? 0 : 1);
      const newTotalCount = existingPattern.total_count + 1;
      const newSuccessRate = newSuccessCount / newTotalCount;
      const newConfidence = Math.min(newTotalCount / 50, 1); // Confidence based on sample size

      const sql = `
        UPDATE hook_patterns 
        SET success_count = ?, failure_count = ?, total_count = ?, 
            success_rate = ?, confidence = ?, last_updated = CURRENT_TIMESTAMP
        WHERE id = ?
      `;

      await this.runQuery(sql, [
        newSuccessCount,
        newFailureCount,
        newTotalCount,
        newSuccessRate,
        newConfidence,
        existingPattern.id,
      ]);
    } else {
      // Create new pattern
      const sql = `
        INSERT INTO hook_patterns 
        (hook_name, pattern_type, pattern_data, success_count, failure_count, 
         total_count, success_rate, confidence)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await this.runQuery(sql, [
        hookName,
        patternType,
        patternDataStr,
        success ? 1 : 0,
        success ? 0 : 1,
        1,
        success ? 1 : 0,
        0.02, // Low initial confidence
      ]);
    }
  }

  /**
   * Get patterns for a hook
   */
  async getPatterns(hookName) {
    await this.ensureInitialized();

    const sql = `
      SELECT * FROM hook_patterns 
      WHERE hook_name = ? 
      ORDER BY confidence DESC, total_count DESC
    `;

    return await this.getAllRows(sql, [hookName]);
  }

  /**
   * Record system metric
   */
  async recordSystemMetric(
    metricName,
    metricValue,
    metricType = "gauge",
    context = null,
  ) {
    await this.ensureInitialized();

    const sql = `
      INSERT INTO system_metrics (metric_name, metric_value, metric_type, context)
      VALUES (?, ?, ?, ?)
    `;

    return await this.runQuery(sql, [
      metricName,
      metricValue,
      metricType,
      context ? JSON.stringify(context) : null,
    ]);
  }

  /**
   * Record learning insight
   */
  async recordLearningInsight(hookName, insightType, insightData, confidence) {
    await this.ensureInitialized();

    const sql = `
      INSERT INTO learning_insights (hook_name, insight_type, insight_data, confidence)
      VALUES (?, ?, ?, ?)
    `;

    return await this.runQuery(sql, [
      hookName,
      insightType,
      typeof insightData === "string"
        ? insightData
        : JSON.stringify(insightData),
      confidence,
    ]);
  }

  /**
   * Record parameter change
   */
  async recordParameterChange(
    hookName,
    parameterName,
    oldValue,
    newValue,
    metadata = {},
  ) {
    await this.ensureInitialized();

    const sql = `
      INSERT INTO parameter_changes 
      (hook_name, parameter_name, old_value, new_value, change_reason, confidence)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    return await this.runQuery(sql, [
      hookName,
      parameterName,
      oldValue ? oldValue.toString() : null,
      newValue.toString(),
      metadata.reason || "unknown",
      metadata.confidence || 0.5,
    ]);
  }

  /**
   * Get all executions (for system-wide analysis)
   */
  async getAllExecutions(limit = 10000) {
    await this.ensureInitialized();

    const sql = `
      SELECT * FROM hook_executions 
      ORDER BY timestamp DESC 
      LIMIT ?
    `;

    return await this.getAllRows(sql, [limit]);
  }

  /**
   * Clean up old data
   */
  async cleanupOldData(retentionDays = 30) {
    await this.ensureInitialized();

    const tables = [
      "hook_executions",
      "system_metrics",
      "learning_insights",
      "parameter_changes",
    ];

    for (const table of tables) {
      const sql = `DELETE FROM ${table} WHERE timestamp < datetime('now', '-' || ? || ' days')`;
      await this.runQuery(sql, [retentionDays]);
    }
  }

  /**
   * Get database statistics
   */
  async getStatistics() {
    await this.ensureInitialized();

    const stats = {};

    // Table counts
    const tables = [
      "hook_executions",
      "hook_patterns",
      "system_metrics",
      "learning_insights",
      "parameter_changes",
    ];
    for (const table of tables) {
      const result = await this.getRow(
        `SELECT COUNT(*) as count FROM ${table}`,
      );
      stats[table] = result.count;
    }

    // Database size
    const dbSizeResult = await this.getRow(
      "SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()",
    );
    stats.database_size_bytes = dbSizeResult.size;

    // Recent activity
    const recentResult = await this.getRow(`
      SELECT COUNT(*) as recent_executions 
      FROM hook_executions 
      WHERE timestamp > datetime('now', '-1 day')
    `);
    stats.recent_executions = recentResult.recent_executions;

    return stats;
  }

  /**
   * Ensure database is initialized
   */
  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Run a query with parameters
   */
  async runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  /**
   * Get a single row
   */
  async getRow(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  /**
   * Get all rows
   */
  async getAllRows(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  /**
   * Close database connection
   */
  async close() {
    if (this.db) {
      return new Promise((resolve, reject) => {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            this.initialized = false;
            resolve();
          }
        });
      });
    }
  }
}

module.exports = LearningDatabase;

// CLI usage support
if (require.main === module) {
  async function main() {
    const command = process.argv[2];
    const db = new LearningDatabase();

    try {
      await db.initialize();

      switch (command) {
        case "stats":
          const stats = await db.getStatistics();
          console.log(JSON.stringify(stats, null, 2));
          break;

        case "metrics":
          const metrics = await db.getSystemMetrics();
          console.log(JSON.stringify(metrics, null, 2));
          break;

        case "cleanup":
          const days = parseInt(process.argv[3]) || 30;
          await db.cleanupOldData(days);
          console.log(`Cleaned up data older than ${days} days`);
          break;

        case "init":
          console.log("Database initialized successfully");
          break;

        default:
          console.log("Usage: node LearningDatabase.js <command>");
          console.log("Commands:");
          console.log("  init    - Initialize database");
          console.log("  stats   - Show database statistics");
          console.log("  metrics - Show system metrics");
          console.log(
            "  cleanup [days] - Clean up old data (default: 30 days)",
          );
          process.exit(1);
      }
    } catch (error) {
      console.error("Database operation failed:", error);
      process.exit(1);
    } finally {
      await db.close();
    }
  }

  main();
}
