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
const readline = require("readline");

class RuntimeProtectionValidator {
  constructor() {
    this.projectRoot = process.cwd();
    this.envPath = path.join(this.projectRoot, ".env");
    this.envExamplePath = path.join(this.projectRoot, ".env.example");
    this.autoFix = process.argv.includes("--auto-fix");
    // Detect if we're in an interactive terminal
    this.isInteractive = process.stdin.isTTY && !process.env.CI;
  }

  async promptUser(question) {
    if (this.autoFix) return true;
    
    // In non-interactive environments, don't prompt
    if (!this.isInteractive) {
      console.log("\n⚠️  Running in non-interactive mode");
      console.log("💡 Use 'npm run fix:hooks' to automatically fix issues");
      return false;
    }
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    return new Promise((resolve) => {
      rl.question(question + " (y/N): ", (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === "y");
      });
    });
  }

  async fixEnvironment() {
    const envContent = fs.readFileSync(this.envPath, "utf8");
    let updated = envContent;
    
    // Fix hooks disabled
    if (envContent.includes("HOOKS_DISABLED=true")) {
      updated = updated.replace(/HOOKS_DISABLED=true/g, "HOOKS_DISABLED=false");
    }
    
    // Ensure HOOKS_DISABLED variable exists
    if (!updated.includes("HOOKS_DISABLED=")) {
      updated = updated.replace(/# Hook Debugging/, "HOOKS_DISABLED=false\n\n# Hook Debugging");
    }
    
    if (updated !== envContent) {
      fs.writeFileSync(this.envPath, updated);
      console.log("✅ Updated .env file to enable hooks");
      return true;
    }
    
    return false;
  }

  async checkEnvironment() {
    if (!fs.existsSync(this.envPath)) {
      console.log("❌ .env file not found");
      return false;
    }

    const envContent = fs.readFileSync(this.envPath, "utf8");
    const isHooksDisabled = envContent.includes("HOOKS_DISABLED=true");

    if (isHooksDisabled) {
      console.log("❌ Hooks are DISABLED in .env file");
      console.log("💡 Set HOOKS_DISABLED=false");
      
      const shouldFix = await this.promptUser(
        "Would you like to automatically enable hooks?"
      );
      
      if (shouldFix) {
        await this.fixEnvironment();
        return true;
      }
      
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
    console.log("🛡️  Validating runtime protection...\n");

    const envCheck = await this.checkEnvironment();
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
