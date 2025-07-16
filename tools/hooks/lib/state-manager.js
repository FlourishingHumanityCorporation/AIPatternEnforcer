#!/usr/bin/env node

/**
 * Simple JSON State Manager
 *
 * KISS principle - no databases, just JSON files
 * For the "super lazy developer" who needs automatic correction
 */

const fs = require("fs");
const path = require("path");

// State directory location
const STATE_DIR = path.join(process.cwd(), ".aipattern");
const STATE_FILE = path.join(STATE_DIR, "state.json");
const CONTEXT_CACHE_FILE = path.join(STATE_DIR, "context-cache.json");
const PREFERENCES_FILE = path.join(STATE_DIR, "preferences.json");

// Default state structure
const DEFAULT_STATE = {
  contextScore: 0,
  lastContextUpdate: Date.now(),
  recentFiles: [],
  sessionStart: Date.now(),
  messageCount: 0,
  changedFiles: [],
};

// Default preferences
const DEFAULT_PREFERENCES = {
  contextThreshold: {
    Write: 60,
    Edit: 50,
    MultiEdit: 70,
  },
  maxPRFiles: 15,
  idleTimeMinutes: 30,
};

/**
 * Ensure state directory exists
 */
function ensureStateDirectory() {
  if (!fs.existsSync(STATE_DIR)) {
    fs.mkdirSync(STATE_DIR, { recursive: true });
  }
}

/**
 * Read state from JSON file
 */
function readState() {
  try {
    ensureStateDirectory();

    if (!fs.existsSync(STATE_FILE)) {
      // Initialize with default state
      writeState(DEFAULT_STATE);
      return DEFAULT_STATE;
    }

    const content = fs.readFileSync(STATE_FILE, "utf8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to read state:", error.message);
    return DEFAULT_STATE;
  }
}

/**
 * Write state to JSON file
 */
function writeState(state) {
  try {
    ensureStateDirectory();
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (error) {
    console.error("Failed to write state:", error.message);
  }
}

/**
 * Update specific state properties
 */
function updateState(updates) {
  const currentState = readState();
  const newState = { ...currentState, ...updates };
  writeState(newState);
  return newState;
}

/**
 * Read context cache
 */
function readContextCache() {
  try {
    ensureStateDirectory();

    if (!fs.existsSync(CONTEXT_CACHE_FILE)) {
      return {};
    }

    const content = fs.readFileSync(CONTEXT_CACHE_FILE, "utf8");
    const cache = JSON.parse(content);

    // Clean expired entries (5 minute TTL)
    const now = Date.now();
    const TTL = 5 * 60 * 1000;

    Object.keys(cache).forEach((key) => {
      if (now - cache[key].timestamp > TTL) {
        delete cache[key];
      }
    });

    return cache;
  } catch (error) {
    return {};
  }
}

/**
 * Write context cache
 */
function writeContextCache(cache) {
  try {
    ensureStateDirectory();
    fs.writeFileSync(CONTEXT_CACHE_FILE, JSON.stringify(cache, null, 2));
  } catch (error) {
    // Fail silently - cache is not critical
  }
}

/**
 * Get cached value
 */
function getCached(key) {
  const cache = readContextCache();
  const entry = cache[key];

  if (!entry) return null;

  const TTL = 5 * 60 * 1000;
  if (Date.now() - entry.timestamp > TTL) {
    return null;
  }

  return entry.value;
}

/**
 * Set cached value
 */
function setCached(key, value) {
  const cache = readContextCache();
  cache[key] = {
    value,
    timestamp: Date.now(),
  };
  writeContextCache(cache);
}

/**
 * Read preferences
 */
function readPreferences() {
  try {
    ensureStateDirectory();

    if (!fs.existsSync(PREFERENCES_FILE)) {
      writePreferences(DEFAULT_PREFERENCES);
      return DEFAULT_PREFERENCES;
    }

    const content = fs.readFileSync(PREFERENCES_FILE, "utf8");
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(content) };
  } catch (error) {
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Write preferences
 */
function writePreferences(preferences) {
  try {
    ensureStateDirectory();
    fs.writeFileSync(PREFERENCES_FILE, JSON.stringify(preferences, null, 2));
  } catch (error) {
    // Fail silently
  }
}

/**
 * Track file change
 */
function trackFileChange(filePath) {
  const state = readState();

  // Keep last 100 changed files
  const changedFiles = state.changedFiles || [];
  changedFiles.unshift({
    path: filePath,
    timestamp: Date.now(),
  });

  if (changedFiles.length > 100) {
    changedFiles.pop();
  }

  updateState({ changedFiles });
}

/**
 * Get recent file changes
 */
function getRecentFileChanges(minutes = 30) {
  const state = readState();
  const cutoff = Date.now() - minutes * 60 * 1000;

  return (state.changedFiles || [])
    .filter((f) => f.timestamp > cutoff)
    .map((f) => f.path);
}

/**
 * Increment message count
 */
function incrementMessageCount() {
  const state = readState();
  updateState({ messageCount: (state.messageCount || 0) + 1 });
}

/**
 * Reset session
 */
function resetSession() {
  writeState({
    ...DEFAULT_STATE,
    sessionStart: Date.now(),
  });
}

/**
 * Get session duration in minutes
 */
function getSessionDuration() {
  const state = readState();
  const duration = Date.now() - (state.sessionStart || Date.now());
  return Math.floor(duration / 60000);
}

/**
 * Simple cleanup - remove state files older than 7 days
 */
function cleanup() {
  try {
    // For now, just log - could implement actual cleanup later
    console.log("State cleanup would run here");
  } catch (error) {
    // Fail silently
  }
}

module.exports = {
  // Core functions
  readState,
  writeState,
  updateState,

  // Cache functions
  getCached,
  setCached,

  // Preference functions
  readPreferences,
  writePreferences,

  // Utility functions
  trackFileChange,
  getRecentFileChanges,
  incrementMessageCount,
  resetSession,
  getSessionDuration,
  cleanup,

  // Constants
  STATE_DIR,
  DEFAULT_STATE,
  DEFAULT_PREFERENCES,
};
