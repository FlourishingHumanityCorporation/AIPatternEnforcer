#!/usr/bin/env node

/**
 * Runtime Protection Validator
 *
 * Single focused component that validates hook protection is working.
 * Per CLAUDE.md: For LOCAL one-person AI projects only.
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

class RuntimeProtectionValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.envPath = path.join(this.projectRoot, ".env");
  }

  checkEnvironment() {
    if (!fs.existsSync(this.envPath)) {
      console.log("❌ .env file not found");
      return false;
    }

    const envContent = fs.readFileSync(this.envPath, "utf8");
    const isDevelopmentMode = envContent.includes("HOOK_DEVELOPMENT=true");
    const isTestingMode = envContent.includes("HOOK_TESTING=true");

    if (isDevelopmentMode || isTestingMode) {
      console.log("❌ Hooks are DISABLED in .env file");
      console.log("💡 Set HOOK_DEVELOPMENT=false and HOOK_TESTING=false");
      return false;
    }

    console.log("✅ Environment configuration looks good");
    return true;
  }

  async testHookProtection() {
    const testInput = {
      tool_name: "Write",
      tool_input: {
        file_path: "test_improved.js",
        content: "test",
      },
    };

    const hookPath = path.join(
      this.projectRoot,
      "tools/hooks/ai-patterns/prevent-improved-files.js",
    );

    if (!fs.existsSync(hookPath)) {
      console.log("❌ Hook file not found");
      return false;
    }

    return new Promise((resolve) => {
      const child = spawn("node", [hookPath], {
        stdio: ["pipe", "pipe", "pipe"],
        env: process.env,
      });

      child.stdin.write(JSON.stringify(testInput));
      child.stdin.end();

      child.on("close", (code) => {
        if (code === 2) {
          console.log("✅ Hook protection is working");
          resolve(true);
        } else {
          console.log("❌ Hook protection is not working");
          resolve(false);
        }
      });
    });
  }

  async validate() {
    console.log("🛡️  Validating runtime protection...");

    const envCheck = this.checkEnvironment();
    if (!envCheck) {
      return false;
    }

    const protectionCheck = await this.testHookProtection();

    if (envCheck && protectionCheck) {
      console.log("🎉 Runtime protection validation successful!");
      return true;
    } else {
      console.log("❌ Runtime protection validation failed!");
      return false;
    }
  }
}

// CLI execution
if (require.main === module) {
  const validator = new RuntimeProtectionValidator();
  validator
    .validate()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error("❌ Validation error:", error.message);
      process.exit(1);
    });
}

module.exports = RuntimeProtectionValidator;
