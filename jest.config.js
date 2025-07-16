module.exports = {
  projects: [
    // Node.js tests for tools and scripts
    {
      displayName: "node",
      testEnvironment: "node",
      testMatch: [
        "<rootDir>/tools/generators/**/*.test.js",
        "<rootDir>/tools/hooks/**/*.test.js",
        "<rootDir>/scripts/**/*.test.js",
      ],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    },
    // React component tests (using working Next.js config)
    {
      displayName: "react",
      testEnvironment: "jsdom",
      testMatch: [
        "<rootDir>/components/**/*.test.tsx",
        "<rootDir>/components/**/*.test.ts",
      ],
      setupFilesAfterEnv: [
        "<rootDir>/jest.setup.js",
        "@testing-library/jest-dom",
      ],
      moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
      },
      transform: {
        "^.+\\.(js|jsx|ts|tsx)$": ["babel-jest", { presets: ["next/babel"] }],
      },
      moduleFileExtensions: ["ts", "tsx", "js", "jsx"],
    },
  ],
  collectCoverageFrom: [
    "tools/generators/**/*.js",
    "tools/hooks/lib/**/*.js",
    "scripts/**/*.js",
    "components/**/*.{ts,tsx}",
    "!**/*.test.{js,ts,tsx}",
    "!**/node_modules/**",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
  forceExit: true,
};
