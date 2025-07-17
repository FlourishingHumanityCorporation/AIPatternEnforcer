// Jest setup file for AIPatternEnforcer
// This file is executed before running tests

// Mock console methods to avoid noisy output during tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = "test";
// Note: Hook tests will override these settings as needed
process.env.HOOKS_DISABLED = process.env.HOOKS_DISABLED || "true";
