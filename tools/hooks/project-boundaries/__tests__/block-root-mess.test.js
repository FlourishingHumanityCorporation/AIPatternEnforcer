#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

const HOOK_PATH = path.join(__dirname, "..", "block-root-mess.js");

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
      resolve({ description, exitCode: code, passed: null });
    });

    child.stdin.write(JSON.stringify(input));
    child.stdin.end();
  });
}

async function runTests() {
  console.log("🧪 Testing block-root-mess.js hook\n");

  const blockAppTest = {
    input: {
      tool_name: "Write",
      tool_input: { file_path: "app/page.tsx", content: "test" },
    },
    description: "Block app/ directory",
    shouldBlock: true,
  };

  const allowDocsTest = {
    input: {
      tool_name: "Write",
      tool_input: { file_path: "docs/guide.md", content: "test" },
    },
    description: "Allow docs/ directory",
    shouldBlock: false,
  };

  const tests = [blockAppTest, allowDocsTest];
  const results = [];

  for (const test of tests) {
    const result = await testHook(test.input, test.description);
    result.passed = test.shouldBlock
      ? result.exitCode === 2
      : result.exitCode === 0;
    results.push(result);

    const status = result.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${status} ${result.description}`);
  }

  const passed = results.filter((r) => r.passed).length;
  console.log(`\n📊 ${passed}/${results.length} tests passed`);
  process.exit(passed === results.length ? 0 : 1);
}

// Run the original test runner for standalone execution
if (require.main === module) {
  runTests().catch(console.error);
}
