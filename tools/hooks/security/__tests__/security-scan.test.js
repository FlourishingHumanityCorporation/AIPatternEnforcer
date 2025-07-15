#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

const HOOK_PATH = path.join(__dirname, "..", "security-scan.js");

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
  console.log("🧪 Testing security-scan.js hook\n");

  const xssTest = {
    input: {
      tool_name: "Write",
      tool_input: {
        file_path: "component.jsx",
        content: 'element.innerHTML = userInput + "<div>content</div>";',
      },
    },
    description: "Block XSS vulnerability",
    shouldBlock: true,
  };

  const safeTest = {
    input: {
      tool_name: "Write",
      tool_input: {
        file_path: "component.jsx",
        content: "const text = sanitize(userInput);",
      },
    },
    description: "Allow safe code",
    shouldBlock: false,
  };

  const tests = [xssTest, safeTest];
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

runTests().catch(console.error);
