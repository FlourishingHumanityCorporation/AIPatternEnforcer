-- Migration 002: Adaptive Learning Tables
-- Adds support for Phase 2 individual hook learning features

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