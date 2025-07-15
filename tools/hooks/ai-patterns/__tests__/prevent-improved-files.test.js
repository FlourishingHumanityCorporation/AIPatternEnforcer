#!/usr/bin/env node

/**
 * Tests for prevent-improved-files.js hook
 */

const { spawn } = require("child_process");
const path = require("path");

const HOOK_PATH = path.join(__dirname, "..", "prevent-improved-files.js");

function testHook(input, description) {
  return new Promise((resolve) => {
    const child = spawn("node", [HOOK_PATH], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      resolve({
        description,
        input,
        exitCode: code,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
        passed: null, // Will be set by test logic
      });
    });

    child.stdin.write(JSON.stringify(input));
    child.stdin.end();
  });
}

async function runTests() {
  console.log("🧪 Testing prevent-improved-files.js hook\n");

  const tests = [
    // Should block: _improved files
    {
      input: {
        tool_name: "Write",
        tool_input: {
          file_path: "component_improved.tsx",
          content: "test",
        },
      },
      description: "Block _improved files",
      shouldBlock: true,
    },
    // Should block: _v2 files
    {
      input: {
        tool_name: "Write",
        tool_input: {
          file_path: "utils_v2.js",
          content: "test",
        },
      },
      description: "Block _v2 files",
      shouldBlock: true,
    },
    // Should block: _enhanced files
    {
      input: {
        tool_name: "Edit",
        tool_input: {
          file_path: "service_enhanced.ts",
          old_string: "old",
          new_string: "new",
        },
      },
      description: "Block _enhanced files",
      shouldBlock: true,
    },
    // Should allow: normal files
    {
      input: {
        tool_name: "Write",
        tool_input: {
          file_path: "component.tsx",
          content: "test",
        },
      },
      description: "Allow normal files",
      shouldBlock: false,
    },
    // Should allow: no file path
    {
      input: {
        tool_name: "Write",
        tool_input: {
          content: "test",
        },
      },
      description: "Allow operations without file paths",
      shouldBlock: false,
    },
  ];

  const results = [];
  for (const test of tests) {
    const result = await testHook(test.input, test.description);
    result.passed = test.shouldBlock
      ? result.exitCode === 2
      : result.exitCode === 0;
    results.push(result);

    const status = result.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${status} ${result.description}`);
    if (!result.passed) {
      console.log(
        `  Expected: ${test.shouldBlock ? "block (exit 2)" : "allow (exit 0)"}`,
      );
      console.log(`  Got: exit ${result.exitCode}`);
      if (result.stderr) {
        console.log(`  Error: ${result.stderr.substring(0, 100)}`);
      }
    }
  }

  console.log("\n📊 Test Summary:");
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`${passed}/${total} tests passed`);

  if (passed === total) {
    console.log("🎉 All tests passed!");
    process.exit(0);
  } else {
    console.log("💥 Some tests failed!");
    process.exit(1);
  }
}

runTests().catch(console.error);
