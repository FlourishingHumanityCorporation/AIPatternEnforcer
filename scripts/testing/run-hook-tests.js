#!/usr/bin/env node

/**
 * Simple hook test runner
 * Runs all test files in tools/hooks/__tests__/
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const HOOKS_TEST_DIR = path.join(__dirname, "../../tools/hooks/__tests__");

// Colors for output
const RED = "\x1b[0;31m";
const GREEN = "\x1b[0;32m";
const YELLOW = "\x1b[1;33m";
const BLUE = "\x1b[0;34m";
const CYAN = "\x1b[0;36m";
const NC = "\x1b[0m"; // No Color

async function runTest(testFile) {
  return new Promise((resolve) => {
    const testName = path.basename(testFile, ".test.js");
    console.log(`\n${BLUE}Running test: ${testName}${NC}`);

    const child = spawn("node", [testFile], {
      stdio: "inherit",
    });

    child.on("close", (code) => {
      resolve({
        name: testName,
        passed: code === 0,
        exitCode: code,
      });
    });

    child.on("error", (error) => {
      console.error(`${RED}Error running ${testName}: ${error.message}${NC}`);
      resolve({
        name: testName,
        passed: false,
        error: error.message,
      });
    });
  });
}

async function main() {
  console.log(`${CYAN}🧪 Running Hook Tests${NC}`);
  console.log(`${CYAN}===================${NC}`);

  // Find all test files
  const testFiles = fs
    .readdirSync(HOOKS_TEST_DIR)
    .filter((file) => file.endsWith(".test.js") && file !== "test-helpers.js")
    .map((file) => path.join(HOOKS_TEST_DIR, file));

  if (testFiles.length === 0) {
    console.error(`${RED}No test files found in ${HOOKS_TEST_DIR}${NC}`);
    process.exit(1);
  }

  console.log(`Found ${testFiles.length} test files`);

  // Run all tests
  const results = [];
  for (const testFile of testFiles) {
    const result = await runTest(testFile);
    results.push(result);
  }

  // Summary
  console.log(`\n${CYAN}📊 Test Summary${NC}`);
  console.log(`${CYAN}===============${NC}`);

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total: ${results.length}`);
  console.log(`${GREEN}Passed: ${passed}${NC}`);
  console.log(`${RED}Failed: ${failed}${NC}`);

  if (failed > 0) {
    console.log(`\n${RED}Failed Tests:${NC}`);
    results
      .filter((r) => !r.passed)
      .forEach((r) => {
        console.log(`  ${RED}❌ ${r.name}${NC}`);
      });
  } else {
    console.log(`\n${GREEN}✅ All tests passed!${NC}`);
  }

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error(`${RED}Fatal error: ${error.message}${NC}`);
    process.exit(1);
  });
}
