module.exports = {
  testEnvironment: "node",
  testMatch: [
    // Focus on core functionality - disable component tests for now
    // Component tests are handled by individual templates with their own Jest config
    "**/tools/generators/**/*.test.js",
    "**/scripts/**/*.test.js",
  ],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  collectCoverageFrom: [
    "tools/generators/**/*.js",
    "scripts/**/*.js",
    "!**/*.test.js",
    "!**/node_modules/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  forceExit: true,
};
