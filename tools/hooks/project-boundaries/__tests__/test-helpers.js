/**
 * Test helpers and utilities for hook testing
 *
 * Provides common mocks, fixtures, and utilities for testing
 * Claude Code hooks consistently across the test suite.
 */

const path = require("path");

/**
 * Claude Code hook input mocks
 */
class ClaudeCodeMocks {
  /**
   * Create a standard hook input object
   */
  static createHookInput(data = {}) {
    return {
      raw: {
        tool_name: data.tool_name || "Write",
        tool_input: data.tool_input || {},
        ...data,
      },
      filePath: data.tool_input?.file_path || data.filePath,
      content: data.tool_input?.content || data.content,
      toolResponse: data.toolResponse,
    };
  }

  /**
   * Create PostToolUse hook input
   */
  static createPostToolUseInput(toolResponse = {}) {
    return {
      filePath: toolResponse.file_path || toolResponse.filePath,
      toolResponse: {
        exitCode: 0,
        stdout: "",
        stderr: "",
        ...toolResponse,
      },
    };
  }

  /**
   * Create PreToolUse hook input
   */
  static createPreToolUseInput(params = {}) {
    return this.createHookInput({
      tool_name: params.tool_name || "Write",
      tool_input: params.tool_input || {},
    });
  }
}

/**
 * Common file paths for testing
 */
class PathFixtures {
  static LOCAL_PROJECT = "/Users/dev/my-ai-app";
  static PROJECT_ROOT = "/Users/dev/AIPatternEnforcer";

  // Valid paths
  static VALID_COMPONENT = "/project/src/components/Button.tsx";
  static VALID_TEST = "/project/tests/Button.test.js";
  static VALID_DOC = "/project/docs/guide.md";
  static VALID_CONFIG = "/project/config/app.json";

  // Invalid paths (root violations)
  static INVALID_ROOT_CODE = "component.tsx";
  static INVALID_ROOT_APP = "app.js";
  static INVALID_APP_DIR = "app/page.tsx";
  static INVALID_COMPONENTS_DIR = "components/Button.tsx";

  // Improved file patterns
  static IMPROVED_FILE = "/project/component_improved.tsx";
  static ENHANCED_FILE = "/project/utils_enhanced.js";
  static V2_FILE = "/project/helper_v2.ts";

  static getAllInvalidPaths() {
    return [
      this.INVALID_ROOT_CODE,
      this.INVALID_ROOT_APP,
      this.INVALID_APP_DIR,
      this.INVALID_COMPONENTS_DIR,
      this.IMPROVED_FILE,
      this.ENHANCED_FILE,
      this.V2_FILE,
    ];
  }

  static getAllValidPaths() {
    return [
      this.VALID_COMPONENT,
      this.VALID_TEST,
      this.VALID_DOC,
      this.VALID_CONFIG,
    ];
  }
}

/**
 * Common code content for testing
 */
class ContentFixtures {
  static SIMPLE_REACT_COMPONENT = `
import React from 'react';

function Button({ children, onClick }) {
  return (
    <button onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;
`;

  static SIMPLE_UTILITY = `
export function formatDate(date) {
  return date.toISOString().split('T')[0];
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
`;

  static CONSOLE_LOG_CODE = `
function debug() {
  console.log('Debug info');
  console.error('Error occurred');
  console.warn('Warning message');
}
`;

  static IMPROVED_PATTERNS = `
const component_improved = true;
const helper_enhanced = false;
const utils_v2 = 'new version';
`;

  static ENTERPRISE_PATTERNS = `
class AuthenticationManager {
  constructor() {
    this.users = new Map();
  }
}

class KubernetesDeployment {
  deploy() {
    // Deploy to k8s cluster
  }
}
`;

  static SECURITY_VIOLATIONS = `
const password = 'hardcoded123';
const apiKey = 'sk-1234567890abcdef';
eval('malicious code');
document.innerHTML = userInput;
`;

  static PRISMA_SCHEMA = `
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
`;

  static MALFORMED_IMPORTS = `
import from 'module';
import { } from './empty';
const missing = require('./not-found');
`;

  static HALLUCINATED_APIS = `
const data = useServerState();
form.autoSave();
console.table(data);
fetch('invalid-url');
`;
}

/**
 * Hook execution helper for consistent testing
 */
class HookExecutor {
  constructor(hookName) {
    this.hookName = hookName;
  }

  /**
   * Execute a hook function with input and return standardized result
   */
  async execute(hookFn, input) {
    try {
      const result = await hookFn(input);

      // Standardize result format
      if (result && typeof result === "object") {
        return {
          ...result,
          exitCode: result.block ? 2 : result.allow ? 0 : 1,
          isAllowed: result.allow === true,
          isBlocked: result.block === true,
          isWarning: !result.allow && !result.block,
        };
      }

      // Default to allowed if no clear result
      return {
        allow: true,
        exitCode: 0,
        isAllowed: true,
        isBlocked: false,
        isWarning: false,
      };
    } catch (error) {
      return {
        error,
        block: true,
        exitCode: 1,
        isAllowed: false,
        isBlocked: true,
        isWarning: false,
        message: error.message,
      };
    }
  }

  /**
   * Execute hook and expect it to be allowed
   */
  async expectAllowed(hookFn, input) {
    const result = await this.execute(hookFn, input);
    if (!result.isAllowed) {
      throw new Error(
        `Expected hook to allow operation, but it was blocked: ${result.message}`,
      );
    }
    return result;
  }

  /**
   * Execute hook and expect it to be blocked
   */
  async expectBlocked(hookFn, input) {
    const result = await this.execute(hookFn, input);
    if (!result.isBlocked) {
      throw new Error(`Expected hook to block operation, but it was allowed`);
    }
    return result;
  }
}

/**
 * Custom Jest matchers for hook testing
 */
const customMatchers = {
  toBeAllowed(received) {
    const pass =
      received.isAllowed === true ||
      received.allow === true ||
      received.exitCode === 0;
    return {
      message: () =>
        pass
          ? `Expected operation to be blocked, but it was allowed`
          : `Expected operation to be allowed, but it was blocked: ${received.message || "no message"}`,
      pass,
    };
  },

  toBeBlocked(received) {
    const pass =
      received.isBlocked === true ||
      received.block === true ||
      received.exitCode === 2;
    return {
      message: () =>
        pass
          ? `Expected operation to be allowed, but it was blocked: ${received.message || "no message"}`
          : `Expected operation to be blocked, but it was allowed`,
      pass,
    };
  },

  toBeWarning(received) {
    const pass =
      received.isWarning === true ||
      (received.exitCode === 1 && !received.block);
    return {
      message: () =>
        pass
          ? `Expected no warning, but operation generated warning: ${received.message}`
          : `Expected operation to generate warning, but it did not`,
      pass,
    };
  },

  toContainPattern(received, pattern) {
    const content = received.message || received.content || received;
    const pass =
      pattern instanceof RegExp
        ? pattern.test(content)
        : content.includes(pattern);

    return {
      message: () =>
        pass
          ? `Expected content not to contain pattern ${pattern}, but it did`
          : `Expected content to contain pattern ${pattern}, but it did not. Content: ${content}`,
      pass,
    };
  },
};

// Add custom matchers to Jest
if (global.expect) {
  expect.extend(customMatchers);
}

module.exports = {
  ClaudeCodeMocks,
  PathFixtures,
  ContentFixtures,
  HookExecutor,
  customMatchers,
};
