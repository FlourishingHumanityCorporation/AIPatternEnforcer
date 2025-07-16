#!/usr/bin/env node

/**
 * Test script for learning system components
 */

const LearningDatabase = require("./LearningDatabase");
const ExecutionContext = require("./ExecutionContext");
const LearningHookRunner = require("./LearningHookRunner");

async function testLearningDatabase() {
  console.log("🧪 Testing Learning Database...");

  const db = new LearningDatabase();
  await db.initialize();

  // Test recording execution
  const executionData = {
    family: "test_family",
    priority: "medium",
    executionTime: 150,
    success: true,
    blocked: false,
    filePath: "/test/path/file.js",
    fileExtension: ".js",
    contentHash: "abc123",
    context: { test: "data" },
  };

  await db.recordExecution("test-hook", executionData);

  // Test retrieving execution history
  const history = await db.getExecutionHistory("test-hook", 10);
  console.log("✅ Execution history retrieved:", history.length, "records");

  // Test pattern updates
  await db.updatePattern(
    "test-hook",
    "file_pattern",
    "/test/path/file.js",
    true,
    false,
  );
  await db.updatePattern(
    "test-hook",
    "file_pattern",
    "/test/path/file.js",
    true,
    false,
  );
  await db.updatePattern(
    "test-hook",
    "file_pattern",
    "/test/path/file.js",
    false,
    true,
  );

  const patterns = await db.getPatterns("test-hook");
  console.log("✅ Patterns retrieved:", patterns.length, "patterns");

  // Test system metrics
  const metrics = await db.getSystemMetrics();
  console.log("✅ System metrics:", metrics.length, "metrics");

  // Test statistics
  const stats = await db.getStatistics();
  console.log("✅ Database statistics:", stats);

  await db.close();
  console.log("✅ Learning Database test completed\n");
}

async function testExecutionContext() {
  console.log("🧪 Testing Execution Context...");

  const mockHookData = {
    filePath: "/test/path/example.js",
    file_path: "/test/path/example.js",
    content: `
      import React from 'react';
      import { useState } from 'react';
      
      function TestComponent() {
        const [count, setCount] = useState(0);
        
        if (count > 10) {
          return <div>Count is high</div>;
        }
        
        return (
          <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>
              Increment
            </button>
          </div>
        );
      }
      
      export default TestComponent;
    `,
    tool: "Write",
  };

  const mockRunner = {
    name: "test-hook",
    family: "test_family",
    priority: "medium",
    executionId: "test-123",
  };

  const context = new ExecutionContext(mockHookData, mockRunner);
  const captured = await context.capture();

  console.log("✅ Context captured for:", captured.hookName);
  console.log("✅ File extension:", captured.fileExtension);
  console.log("✅ Content hash:", captured.contentHash);
  console.log("✅ Code complexity:", captured.codeComplexity);
  console.log("✅ Architectural patterns:", captured.architecturalPatterns);
  console.log("✅ Project type:", captured.projectType);
  console.log("✅ Frameworks:", captured.frameworks);

  const fingerprint = context.getFingerprint();
  console.log("✅ Context fingerprint:", fingerprint);

  console.log("✅ Execution Context test completed\n");
}

async function testLearningHookRunner() {
  console.log("🧪 Testing Learning Hook Runner...");

  // Create a simple test hook function
  const testHookFunction = async (hookData, runner) => {
    // Simple hook that blocks files with 'bad' in the name
    const filePath = hookData.filePath || hookData.file_path;

    if (filePath && filePath.includes("bad")) {
      return {
        block: true,
        message: '🚫 File contains "bad" in name',
      };
    }

    return {
      allow: true,
      message: "✅ File allowed",
    };
  };

  // Test with learning enabled
  const learningRunner = new LearningHookRunner("test-learning-hook", {
    learningEnabled: true,
    learningMode: "sync",
    timeout: 1000,
    verbose: true,
  });

  // Get learning statistics
  const stats = await learningRunner.getLearningStatistics();
  console.log("✅ Learning statistics:", stats);

  console.log("✅ Learning Hook Runner test completed\n");
}

async function runAllTests() {
  console.log("🚀 Starting Learning System Tests...\n");

  try {
    await testLearningDatabase();
    await testExecutionContext();
    await testLearningHookRunner();

    console.log("🎉 All learning system tests completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}
