#!/usr/bin/env node

/**
 * Test script to verify parallel hook execution works correctly
 */

const { spawn } = require("child_process");
const path = require("path");

// Test data that simulates what Claude Code would send
const testCases = [
  {
    name: "Write operation test",
    hookScript: "tools/hooks/pre-tool-use-parallel.js",
    input: {
      tool_name: "Write",
      tool_input: {
        file_path: "/test/example.js",
        content: 'console.log("Hello world");',
      },
    },
  },
  {
    name: "Edit operation test",
    hookScript: "tools/hooks/pre-tool-use-parallel.js",
    input: {
      tool_name: "Edit",
      tool_input: {
        file_path: "/test/example.js",
        old_string: 'console.log("Hello world");',
        new_string: 'console.log("Hello universe");',
      },
    },
  },
  {
    name: "Write-only hooks test",
    hookScript: "tools/hooks/pre-tool-use-write-parallel.js",
    input: {
      tool_name: "Write",
      tool_input: {
        file_path: "/test/example.js",
        content: 'console.log("Hello world");',
      },
    },
  },
  {
    name: "PostToolUse test",
    hookScript: "tools/hooks/post-tool-use-parallel.js",
    input: {
      tool_name: "Write",
      tool_input: {
        file_path: "/test/example.js",
        content: 'console.log("Hello world");',
      },
    },
  },
];

async function runTest(testCase) {
  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`📄 Script: ${testCase.hookScript}`);

  const startTime = Date.now();

  return new Promise((resolve) => {
    const child = spawn("node", [testCase.hookScript], {
      stdio: ["pipe", "pipe", "pipe"],
      cwd: process.cwd(),
      env: { ...process.env, HOOK_VERBOSE: "true" },
    });

    let stdout = "";
    let stderr = "";

    // Send input to the hook
    child.stdin.write(JSON.stringify(testCase.input));
    child.stdin.end();

    child.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    child.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    child.on("close", (code) => {
      const duration = Date.now() - startTime;

      console.log(`⏱️  Duration: ${duration}ms`);
      console.log(`🚪 Exit code: ${code}`);

      if (stdout.trim()) {
        console.log(`📤 Stdout: ${stdout.trim()}`);
      }

      if (stderr.trim()) {
        console.log(`📤 Stderr: ${stderr.trim()}`);
      }

      const success = code === 0;
      console.log(
        `${success ? "✅" : "❌"} Result: ${success ? "PASSED" : "FAILED"}`,
      );

      resolve({
        name: testCase.name,
        success,
        duration,
        exitCode: code,
        stdout,
        stderr,
      });
    });

    child.on("error", (error) => {
      const duration = Date.now() - startTime;
      console.log(`💥 Error: ${error.message}`);
      console.log(`❌ Result: FAILED`);

      resolve({
        name: testCase.name,
        success: false,
        duration,
        error: error.message,
      });
    });
  });
}

async function runAllTests() {
  console.log("🚀 Starting parallel hook execution tests...");
  console.log("🎯 This will test the new parallel execution system");

  const results = [];

  for (const testCase of testCases) {
    try {
      const result = await runTest(testCase);
      results.push(result);
    } catch (error) {
      console.log(`💥 Test failed: ${error.message}`);
      results.push({
        name: testCase.name,
        success: false,
        error: error.message,
      });
    }
  }

  // Summary
  console.log("\n📊 Test Results Summary:");
  console.log("========================");

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const totalDuration = results.reduce((sum, r) => sum + (r.duration || 0), 0);
  const avgDuration = totalDuration / results.length;

  console.log(`✅ Passed: ${passed}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  console.log(`⏱️  Total time: ${totalDuration}ms`);
  console.log(`📊 Average time: ${Math.round(avgDuration)}ms`);

  if (failed > 0) {
    console.log("\n❌ Failed tests:");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - ${r.name}: ${r.error || "Unknown error"}`);
      });
  }

  // Performance analysis
  console.log("\n⚡ Performance Analysis:");
  console.log("========================");

  const maxExpectedTime = 5000; // 5 seconds target
  const performanceTarget = totalDuration < maxExpectedTime;

  console.log(`🎯 Performance target: < ${maxExpectedTime}ms`);
  console.log(`📏 Actual total time: ${totalDuration}ms`);
  console.log(
    `${performanceTarget ? "✅" : "❌"} Performance: ${performanceTarget ? "PASSED" : "FAILED"}`,
  );

  if (performanceTarget) {
    const improvement = (((30000 - totalDuration) / 30000) * 100).toFixed(1);
    console.log(`🚀 Improvement: ${improvement}% faster than 30s baseline`);
  }

  return {
    totalTests: results.length,
    passed,
    failed,
    totalDuration,
    avgDuration,
    performanceTarget,
    results,
  };
}

// Run tests
if (require.main === module) {
  runAllTests()
    .then((summary) => {
      console.log("\n🏁 Testing complete!");

      if (summary.failed > 0 || !summary.performanceTarget) {
        console.log("❌ Some tests failed or performance target not met");
        process.exit(1);
      } else {
        console.log("✅ All tests passed and performance target met!");
        process.exit(0);
      }
    })
    .catch((error) => {
      console.error("💥 Test suite failed:", error);
      process.exit(1);
    });
}

module.exports = { runAllTests };
