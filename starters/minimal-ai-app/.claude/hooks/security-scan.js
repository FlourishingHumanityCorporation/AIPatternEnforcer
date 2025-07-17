#!/usr/bin/env node

/**
 * Simplified Claude Code Hook: Basic Security Scan
 *
 * Detects common security anti-patterns in AI-generated code.
 * Provides basic protection for AI app development.
 */

// Security patterns to detect
const SECURITY_PATTERNS = [
  // API Keys and secrets
  {
    pattern:
      /(?:api[_-]?key|secret|token|password)\s*[:=]\s*["'][^"']{10,}["']/i,
    severity: "HIGH",
    message: "Hardcoded API key or secret detected",
  },
  {
    pattern: /sk-[a-zA-Z0-9]{32,}/,
    severity: "HIGH",
    message: "OpenAI API key format detected",
  },
  {
    pattern: /sk-ant-[a-zA-Z0-9_-]{95,}/,
    severity: "HIGH",
    message: "Anthropic API key format detected",
  },

  // SQL injection patterns
  {
    pattern: /query\s*\+\s*["']|["']\s*\+\s*\w+\s*\+\s*["']/i,
    severity: "MEDIUM",
    message: "Potential SQL injection via string concatenation",
  },

  // eval() usage
  {
    pattern: /\beval\s*\(/i,
    severity: "HIGH",
    message: "Use of eval() detected - security risk",
  },

  // innerHTML with user input
  {
    pattern: /\.innerHTML\s*=\s*[^"']*\+/i,
    severity: "MEDIUM",
    message: "Potential XSS via innerHTML with concatenation",
  },

  // Unsafe HTTP requests
  {
    pattern: /fetch\s*\(\s*["']http:\/\//i,
    severity: "LOW",
    message: "HTTP request instead of HTTPS detected",
  },
];

async function main() {
  try {
    const input = await readStdin();
    let parsedInput;

    try {
      parsedInput = input ? JSON.parse(input) : {};
    } catch (e) {
      process.exit(0);
    }

    if (process.env.HOOKS_DISABLED === "true") {
      process.exit(0);
    }

    // Get file content if available
    const content =
      parsedInput.tool_input?.content || parsedInput.content || "";

    if (!content || typeof content !== "string") {
      process.exit(0);
    }

    // Scan for security patterns
    const findings = [];

    for (const securityPattern of SECURITY_PATTERNS) {
      const matches = content.match(securityPattern.pattern);
      if (matches) {
        findings.push({
          severity: securityPattern.severity,
          message: securityPattern.message,
          match: matches[0].substring(0, 50), // First 50 chars
        });
      }
    }

    if (findings.length > 0) {
      const highSeverityFindings = findings.filter(
        (f) => f.severity === "HIGH",
      );

      if (highSeverityFindings.length > 0) {
        const errorMessage = [
          "🔒 Security Issues Detected",
          "",
          ...highSeverityFindings.map((f) => `❌ ${f.message}: ${f.match}...`),
          "",
          "💡 Security recommendations:",
          "✅ Store API keys in .env files (never in code)",
          "✅ Use environment variables for secrets",
          "✅ Use parameterized queries for databases",
          "✅ Validate and sanitize all user inputs",
          "",
          "These patterns pose security risks in production.",
        ].join("\n");

        process.stderr.write(errorMessage + "\n");
        process.exit(1); // Block high severity issues
      } else {
        // Medium/Low severity - warn but don't block
        const warningMessage = [
          "⚠️  Security Warning",
          "",
          ...findings.map((f) => `${f.severity}: ${f.message}`),
          "",
          "Consider reviewing these patterns for production use.",
        ].join("\n");

        process.stderr.write(warningMessage + "\n");
        process.exit(0);
      }
    }

    process.exit(0);
  } catch (error) {
    process.exit(0);
  }
}

function readStdin() {
  return new Promise((resolve) => {
    let data = "";

    process.stdin.on("data", (chunk) => {
      data += chunk;
    });

    process.stdin.on("end", () => {
      resolve(data);
    });

    setTimeout(() => {
      resolve(data);
    }, 1000);
  });
}

main();
