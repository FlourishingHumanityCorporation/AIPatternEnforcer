module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tools/hooks/__tests__/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  collectCoverageFrom: [
    "tools/hooks/**/*.js",
    "!tools/hooks/__tests__/**",
    "!tools/hooks/lib/**",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  forceExit: true,
};
