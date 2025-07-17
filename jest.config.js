module.exports = {
  // Meta-project tests only (Node.js environment)
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/tools/generators/**/*.test.js",
    "<rootDir>/tools/hooks/**/*.test.js",
    "<rootDir>/scripts/**/*.test.js",
    "<rootDir>/meta/**/*.test.js",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  collectCoverageFrom: [
    "tools/generators/**/*.js",
    "tools/hooks/lib/**/*.js",
    "scripts/**/*.js",
    "meta/**/*.js",
    "!**/*.test.js",
    "!**/node_modules/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  forceExit: true,
};
