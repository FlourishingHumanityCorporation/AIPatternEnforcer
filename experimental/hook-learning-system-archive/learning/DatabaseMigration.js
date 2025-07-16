#!/usr/bin/env node

/**
 * Database Migration System for Learning Database
 * Manages schema versions and migrations
 */

const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

class DatabaseMigration {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.db = null;
    this.migrations = this.loadMigrations();
  }

  /**
   * Load all available migrations
   * @returns {Array} Array of migration objects
   */
  loadMigrations() {
    return [
      {
        version: 1,
        name: "initial_schema",
        up: `
          -- Create hook_executions table
          CREATE TABLE IF NOT EXISTS hook_executions (
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
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            exit_code INTEGER,
            stdout TEXT,
            stderr TEXT,
            error_message TEXT,
            system_load TEXT,
            parallel_execution BOOLEAN DEFAULT FALSE,
            execution_context TEXT
          );

          -- Create hook_patterns table
          CREATE TABLE IF NOT EXISTS hook_patterns (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hook_name TEXT NOT NULL,
            pattern_type TEXT NOT NULL,
            pattern_data TEXT NOT NULL,
            success_rate REAL NOT NULL,
            confidence REAL NOT NULL,
            total_count INTEGER DEFAULT 0,
            success_count INTEGER DEFAULT 0,
            failure_count INTEGER DEFAULT 0,
            block_count INTEGER DEFAULT 0,
            last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
            first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            false_positive_count INTEGER DEFAULT 0,
            false_negative_count INTEGER DEFAULT 0,
            avg_execution_time REAL DEFAULT 0,
            std_dev_execution_time REAL DEFAULT 0,
            adaptation_history TEXT,
            related_patterns TEXT,
            metadata TEXT
          );

          -- Create system_metrics table
          CREATE TABLE IF NOT EXISTS system_metrics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            metric_name TEXT NOT NULL,
            metric_value REAL NOT NULL,
            metric_type TEXT DEFAULT 'gauge',
            context TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            source TEXT DEFAULT 'system',
            aggregation_period TEXT,
            unit TEXT,
            tags TEXT,
            dimensions TEXT,
            metadata TEXT,
            min REAL,
            max REAL,
            avg REAL,
            std_dev REAL,
            count INTEGER,
            sum REAL,
            p50 REAL,
            p75 REAL,
            p90 REAL,
            p95 REAL,
            p99 REAL
          );

          -- Create learning_insights table
          CREATE TABLE IF NOT EXISTS learning_insights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            insight_type TEXT NOT NULL,
            insight_data TEXT NOT NULL,
            confidence REAL NOT NULL,
            applied BOOLEAN DEFAULT FALSE,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            hook_name TEXT,
            hook_family TEXT,
            source TEXT DEFAULT 'analysis',
            priority TEXT DEFAULT 'medium',
            category TEXT DEFAULT 'general',
            estimated_impact REAL DEFAULT 0,
            actual_impact REAL,
            affected_hooks TEXT,
            related_patterns TEXT,
            applied_at DATETIME,
            applied_by TEXT,
            rollback_at DATETIME,
            rollback_reason TEXT,
            validation_results TEXT,
            user_feedback TEXT,
            automatic_actions TEXT,
            expires_at DATETIME,
            status TEXT DEFAULT 'pending'
          );

          -- Create parameter_changes table
          CREATE TABLE IF NOT EXISTS parameter_changes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hook_name TEXT NOT NULL,
            parameter_name TEXT NOT NULL,
            old_value TEXT,
            new_value TEXT,
            change_reason TEXT,
            confidence REAL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            applied BOOLEAN DEFAULT TRUE,
            rolled_back BOOLEAN DEFAULT FALSE,
            rollback_reason TEXT,
            effectiveness REAL,
            metadata TEXT
          );

          -- Create migration_history table
          CREATE TABLE IF NOT EXISTS migration_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            version INTEGER NOT NULL UNIQUE,
            name TEXT NOT NULL,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            execution_time INTEGER,
            success BOOLEAN DEFAULT TRUE,
            error_message TEXT
          );
        `,
        down: `
          DROP TABLE IF EXISTS hook_executions;
          DROP TABLE IF EXISTS hook_patterns;
          DROP TABLE IF EXISTS system_metrics;
          DROP TABLE IF EXISTS learning_insights;
          DROP TABLE IF EXISTS parameter_changes;
          DROP TABLE IF EXISTS migration_history;
        `,
      },
      {
        version: 2,
        name: "add_indexes",
        up: `
          -- Indexes for hook_executions
          CREATE INDEX IF NOT EXISTS idx_hook_executions_name ON hook_executions(hook_name);
          CREATE INDEX IF NOT EXISTS idx_hook_executions_timestamp ON hook_executions(timestamp);
          CREATE INDEX IF NOT EXISTS idx_hook_executions_family ON hook_executions(hook_family);
          CREATE INDEX IF NOT EXISTS idx_hook_executions_success ON hook_executions(success);

          -- Indexes for hook_patterns
          CREATE INDEX IF NOT EXISTS idx_hook_patterns_name ON hook_patterns(hook_name);
          CREATE INDEX IF NOT EXISTS idx_hook_patterns_type ON hook_patterns(pattern_type);
          CREATE UNIQUE INDEX IF NOT EXISTS idx_hook_patterns_unique ON hook_patterns(hook_name, pattern_type, pattern_data);

          -- Indexes for system_metrics
          CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name);
          CREATE INDEX IF NOT EXISTS idx_system_metrics_timestamp ON system_metrics(timestamp);
          CREATE INDEX IF NOT EXISTS idx_system_metrics_type ON system_metrics(metric_type);

          -- Indexes for learning_insights
          CREATE INDEX IF NOT EXISTS idx_learning_insights_type ON learning_insights(insight_type);
          CREATE INDEX IF NOT EXISTS idx_learning_insights_hook ON learning_insights(hook_name);
          CREATE INDEX IF NOT EXISTS idx_learning_insights_applied ON learning_insights(applied);
          CREATE INDEX IF NOT EXISTS idx_learning_insights_timestamp ON learning_insights(timestamp);

          -- Indexes for parameter_changes
          CREATE INDEX IF NOT EXISTS idx_parameter_changes_hook ON parameter_changes(hook_name);
          CREATE INDEX IF NOT EXISTS idx_parameter_changes_parameter ON parameter_changes(parameter_name);
          CREATE INDEX IF NOT EXISTS idx_parameter_changes_timestamp ON parameter_changes(timestamp);
        `,
        down: `
          DROP INDEX IF EXISTS idx_hook_executions_name;
          DROP INDEX IF EXISTS idx_hook_executions_timestamp;
          DROP INDEX IF EXISTS idx_hook_executions_family;
          DROP INDEX IF EXISTS idx_hook_executions_success;
          DROP INDEX IF EXISTS idx_hook_patterns_name;
          DROP INDEX IF EXISTS idx_hook_patterns_type;
          DROP INDEX IF EXISTS idx_hook_patterns_unique;
          DROP INDEX IF EXISTS idx_system_metrics_name;
          DROP INDEX IF EXISTS idx_system_metrics_timestamp;
          DROP INDEX IF EXISTS idx_system_metrics_type;
          DROP INDEX IF EXISTS idx_learning_insights_type;
          DROP INDEX IF EXISTS idx_learning_insights_hook;
          DROP INDEX IF EXISTS idx_learning_insights_applied;
          DROP INDEX IF EXISTS idx_learning_insights_timestamp;
          DROP INDEX IF EXISTS idx_parameter_changes_hook;
          DROP INDEX IF EXISTS idx_parameter_changes_parameter;
          DROP INDEX IF EXISTS idx_parameter_changes_timestamp;
        `,
      },
      {
        version: 3,
        name: "add_context_profiles",
        up: `
          -- Create context_profiles table
          CREATE TABLE IF NOT EXISTS context_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            context_id TEXT NOT NULL UNIQUE,
            context_data TEXT NOT NULL,
            adaptations TEXT,
            performance_metrics TEXT,
            learning_history TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          -- Add context_id to hook_executions
          ALTER TABLE hook_executions ADD COLUMN context_id TEXT;

          -- Create index for context lookups
          CREATE INDEX IF NOT EXISTS idx_hook_executions_context ON hook_executions(context_id);
          CREATE INDEX IF NOT EXISTS idx_context_profiles_id ON context_profiles(context_id);
        `,
        down: `
          DROP TABLE IF EXISTS context_profiles;
          -- Note: SQLite doesn't support dropping columns, would need to recreate table
        `,
      },
      {
        version: 4,
        name: "phase2_adaptive_learning",
        up: `
          -- Phase 2: Adaptive Learning Tables
          
          -- Learning state per hook
          CREATE TABLE IF NOT EXISTS learning_state (
            hook_name TEXT PRIMARY KEY,
            state_data TEXT NOT NULL, -- JSON containing full learning state
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          -- Adaptive parameters for each hook
          CREATE TABLE IF NOT EXISTS adaptive_parameters (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hook_name TEXT NOT NULL,
            parameter_name TEXT NOT NULL,
            parameter_value TEXT NOT NULL, -- JSON value
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(hook_name, parameter_name)
          );

          -- Parameter change history for rollback and analysis
          CREATE TABLE IF NOT EXISTS parameter_changes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hook_name TEXT NOT NULL,
            parameter_name TEXT NOT NULL,
            old_value TEXT, -- JSON
            new_value TEXT, -- JSON
            metadata TEXT, -- JSON with confidence, reason, etc.
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          -- Optimization results tracking
          CREATE TABLE IF NOT EXISTS optimization_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hook_name TEXT NOT NULL,
            optimization_type TEXT NOT NULL,
            applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            success_rate_before REAL,
            success_rate_after REAL,
            performance_impact REAL,
            rolled_back BOOLEAN DEFAULT FALSE,
            rollback_reason TEXT
          );

          -- Pattern effectiveness tracking
          CREATE TABLE IF NOT EXISTS pattern_effectiveness (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hook_name TEXT NOT NULL,
            pattern_type TEXT NOT NULL,
            pattern_key TEXT NOT NULL,
            true_positives INTEGER DEFAULT 0,
            false_positives INTEGER DEFAULT 0,
            true_negatives INTEGER DEFAULT 0,
            false_negatives INTEGER DEFAULT 0,
            last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(hook_name, pattern_type, pattern_key)
          );

          -- Create indexes for performance
          CREATE INDEX IF NOT EXISTS idx_adaptive_params_hook ON adaptive_parameters(hook_name);
          CREATE INDEX IF NOT EXISTS idx_param_changes_hook_time ON parameter_changes(hook_name, timestamp);
          CREATE INDEX IF NOT EXISTS idx_optimization_results_hook ON optimization_results(hook_name);
          CREATE INDEX IF NOT EXISTS idx_pattern_effectiveness_hook ON pattern_effectiveness(hook_name);
        `,
        down: `
          DROP TABLE IF EXISTS learning_state;
          DROP TABLE IF EXISTS adaptive_parameters;
          DROP TABLE IF EXISTS parameter_changes;
          DROP TABLE IF EXISTS optimization_results;
          DROP TABLE IF EXISTS pattern_effectiveness;
          DROP INDEX IF EXISTS idx_adaptive_params_hook;
          DROP INDEX IF EXISTS idx_param_changes_hook_time;
          DROP INDEX IF EXISTS idx_optimization_results_hook;
          DROP INDEX IF EXISTS idx_pattern_effectiveness_hook;
        `,
      },
    ];
  }

  /**
   * Connect to database
   */
  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(err);
        } else {
          // Enable foreign keys
          this.db.run("PRAGMA foreign_keys = ON");
          resolve();
        }
      });
    });
  }

  /**
   * Get current database version
   * @returns {number} Current version number
   */
  async getCurrentVersion() {
    return new Promise((resolve, reject) => {
      // First check if migration_history table exists
      this.db.get(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='migration_history'",
        (err, row) => {
          if (err) {
            reject(err);
          } else if (!row) {
            // No migration history table, so version is 0
            resolve(0);
          } else {
            // Get the highest version from migration history
            this.db.get(
              "SELECT MAX(version) as version FROM migration_history WHERE success = 1",
              (err, row) => {
                if (err) {
                  reject(err);
                } else {
                  resolve(row && row.version ? row.version : 0);
                }
              },
            );
          }
        },
      );
    });
  }

  /**
   * Run a single migration
   * @param {Object} migration Migration object
   * @returns {Object} Migration result
   */
  async runMigration(migration) {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run("BEGIN TRANSACTION");

        this.db.exec(migration.up, (err) => {
          if (err) {
            this.db.run("ROLLBACK", () => {
              reject({
                success: false,
                version: migration.version,
                name: migration.name,
                error: err.message,
              });
            });
          } else {
            // Record successful migration
            const executionTime = Date.now() - startTime;
            this.db.run(
              `INSERT INTO migration_history (version, name, execution_time, success)
               VALUES (?, ?, ?, ?)`,
              [migration.version, migration.name, executionTime, 1],
              (err) => {
                if (err) {
                  this.db.run("ROLLBACK", () => {
                    reject({
                      success: false,
                      version: migration.version,
                      name: migration.name,
                      error: err.message,
                    });
                  });
                } else {
                  this.db.run("COMMIT", () => {
                    resolve({
                      success: true,
                      version: migration.version,
                      name: migration.name,
                      executionTime,
                    });
                  });
                }
              },
            );
          }
        });
      });
    });
  }

  /**
   * Run all pending migrations
   * @returns {Array} Results of all migrations
   */
  async migrate() {
    await this.connect();

    const currentVersion = await this.getCurrentVersion();
    const pendingMigrations = this.migrations.filter(
      (m) => m.version > currentVersion,
    );

    if (pendingMigrations.length === 0) {
      console.log("Database is up to date. Current version:", currentVersion);
      return [];
    }

    console.log(`Current version: ${currentVersion}`);
    console.log(`${pendingMigrations.length} migrations to run`);

    const results = [];

    for (const migration of pendingMigrations) {
      console.log(`Running migration ${migration.version}: ${migration.name}`);

      try {
        const result = await this.runMigration(migration);
        console.log(
          `✓ Migration ${migration.version} completed in ${result.executionTime}ms`,
        );
        results.push(result);
      } catch (error) {
        console.error(`✗ Migration ${migration.version} failed:`, error.error);
        results.push(error);

        // Stop on first error
        break;
      }
    }

    return results;
  }

  /**
   * Rollback to a specific version
   * @param {number} targetVersion Version to rollback to
   * @returns {Array} Results of rollback operations
   */
  async rollback(targetVersion) {
    await this.connect();

    const currentVersion = await this.getCurrentVersion();

    if (targetVersion >= currentVersion) {
      console.log("Target version must be less than current version");
      return [];
    }

    const rollbackMigrations = this.migrations
      .filter((m) => m.version > targetVersion && m.version <= currentVersion)
      .reverse();

    console.log(`Rolling back ${rollbackMigrations.length} migrations`);

    const results = [];

    for (const migration of rollbackMigrations) {
      console.log(
        `Rolling back migration ${migration.version}: ${migration.name}`,
      );

      try {
        await new Promise((resolve, reject) => {
          this.db.serialize(() => {
            this.db.run("BEGIN TRANSACTION");

            this.db.exec(migration.down, (err) => {
              if (err) {
                this.db.run("ROLLBACK", () => {
                  reject(err);
                });
              } else {
                // Remove from migration history
                this.db.run(
                  "DELETE FROM migration_history WHERE version = ?",
                  [migration.version],
                  (err) => {
                    if (err) {
                      this.db.run("ROLLBACK", () => {
                        reject(err);
                      });
                    } else {
                      this.db.run("COMMIT", () => {
                        resolve();
                      });
                    }
                  },
                );
              }
            });
          });
        });

        console.log(`✓ Rolled back migration ${migration.version}`);
        results.push({
          success: true,
          version: migration.version,
          action: "rollback",
        });
      } catch (error) {
        console.error(
          `✗ Failed to rollback migration ${migration.version}:`,
          error.message,
        );
        results.push({
          success: false,
          version: migration.version,
          action: "rollback",
          error: error.message,
        });

        // Stop on first error
        break;
      }
    }

    return results;
  }

  /**
   * Get migration status
   * @returns {Object} Migration status information
   */
  async getStatus() {
    await this.connect();

    const currentVersion = await this.getCurrentVersion();
    const latestVersion = Math.max(...this.migrations.map((m) => m.version));

    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT * FROM migration_history ORDER BY version",
        (err, rows) => {
          if (err && err.message.includes("no such table")) {
            // No migration history yet
            resolve({
              currentVersion: 0,
              latestVersion,
              isUpToDate: false,
              appliedMigrations: [],
              pendingMigrations: this.migrations.map((m) => ({
                version: m.version,
                name: m.name,
              })),
            });
          } else if (err) {
            reject(err);
          } else {
            const pendingMigrations = this.migrations
              .filter((m) => m.version > currentVersion)
              .map((m) => ({ version: m.version, name: m.name }));

            resolve({
              currentVersion,
              latestVersion,
              isUpToDate: currentVersion === latestVersion,
              appliedMigrations: rows || [],
              pendingMigrations,
            });
          }
        },
      );
    });
  }

  /**
   * Close database connection
   */
  close() {
    if (this.db) {
      this.db.close();
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  const dbPath = path.join(__dirname, "../data/learning.db");
  const migration = new DatabaseMigration(dbPath);

  const runCommand = async () => {
    try {
      switch (command) {
        case "migrate":
          await migration.migrate();
          break;

        case "rollback":
          const targetVersion = parseInt(args[1]) || 0;
          await migration.rollback(targetVersion);
          break;

        case "status":
          const status = await migration.getStatus();
          console.log("Migration Status:");
          console.log("Current version:", status.currentVersion);
          console.log("Latest version:", status.latestVersion);
          console.log("Up to date:", status.isUpToDate);
          console.log("\nApplied migrations:");
          status.appliedMigrations.forEach((m) => {
            console.log(`  v${m.version}: ${m.name} (${m.applied_at})`);
          });
          console.log("\nPending migrations:");
          status.pendingMigrations.forEach((m) => {
            console.log(`  v${m.version}: ${m.name}`);
          });
          break;

        default:
          console.log("Usage: node DatabaseMigration.js [command]");
          console.log("Commands:");
          console.log("  migrate       Run all pending migrations");
          console.log("  rollback [v]  Rollback to version v");
          console.log("  status        Show migration status");
      }
    } catch (error) {
      console.error("Error:", error.message);
      process.exit(1);
    } finally {
      migration.close();
    }
  };

  runCommand();
}

module.exports = DatabaseMigration;
