const AnthropicClaudeValidator = require("../anthropic-claude-validator");
const fs = require("fs");

describe("AnthropicClaudeValidator", () => {
  let validator;
  let originalEnv;

  beforeEach(() => {
    validator = new AnthropicClaudeValidator();
    originalEnv = process.env;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("containsAnthropicPatterns", () => {
    it("should detect Anthropic import patterns", () => {
      const content = 'import Anthropic from "@anthropic-ai/sdk";';
      expect(validator.containsAnthropicPatterns(content)).toBe(true);
    });

    it("should detect Anthropic class usage", () => {
      const content = "const client = new Anthropic();";
      expect(validator.containsAnthropicPatterns(content)).toBe(true);
    });

    it("should detect Claude model references", () => {
      const content = 'model: "claude-3-sonnet-20240229"';
      expect(validator.containsAnthropicPatterns(content)).toBe(true);
    });

    it("should detect API key environment variable", () => {
      const content = "process.env.ANTHROPIC_API_KEY";
      expect(validator.containsAnthropicPatterns(content)).toBe(true);
    });

    it("should detect messages.create calls", () => {
      const content = "await anthropic.messages.create()";
      expect(validator.containsAnthropicPatterns(content)).toBe(true);
    });

    it("should return false for non-Anthropic content", () => {
      const content = 'console.log("hello world");';
      expect(validator.containsAnthropicPatterns(content)).toBe(false);
    });
  });

  describe("checkImportPatterns", () => {
    it("should flag default import suggestion", () => {
      const content = 'import Anthropic from "@anthropic-ai/sdk";';
      const issues = [];
      validator.checkImportPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Consider using named imports");
    });

    it("should flag CommonJS require", () => {
      const content = 'const Anthropic = require("@anthropic-ai/sdk");';
      const issues = [];
      validator.checkImportPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("CommonJS require detected");
    });

    it("should flag direct path imports", () => {
      const content = 'import Anthropic from "@anthropic-ai/sdk/lib/client";';
      const issues = [];
      validator.checkImportPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Direct path imports detected");
    });

    it("should not flag proper named imports", () => {
      const content = 'import { Anthropic } from "@anthropic-ai/sdk";';
      const issues = [];
      validator.checkImportPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkAPIKeyPatterns", () => {
    it("should flag hardcoded API key", () => {
      const content = 'apiKey: "sk-ant-abc123"';
      const issues = [];
      validator.checkAPIKeyPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Hardcoded API key detected");
    });

    it("should flag exposed API key", () => {
      const content = 'const key = "sk-ant-abc123def456ghi789";';
      const issues = [];
      validator.checkAPIKeyPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Exposed Anthropic API key in code");
    });

    it("should flag Anthropic client without configuration", () => {
      const content = "const client = new Anthropic();";
      const issues = [];
      validator.checkAPIKeyPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Anthropic client without configuration");
    });

    it("should flag missing API key fallback", () => {
      const content = "apiKey: process.env.ANTHROPIC_API_KEY";
      const issues = [];
      validator.checkAPIKeyPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("No fallback for missing API key");
    });

    it("should not flag proper environment variable usage", () => {
      const content = 'apiKey: process.env.ANTHROPIC_API_KEY || "fallback"';
      const issues = [];
      validator.checkAPIKeyPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkConfigurationPatterns", () => {
    it("should flag missing timeout configuration", () => {
      const content =
        "new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })";
      const issues = [];
      validator.checkConfigurationPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("without timeout or retry configuration");
    });

    it("should flag missing max_tokens", () => {
      const content =
        'await anthropic.messages.create({ model: "claude-3-sonnet-20240229" })';
      const issues = [];
      validator.checkConfigurationPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("without max_tokens");
    });

    it("should flag deprecated model", () => {
      const content = 'model: "claude-2.0"';
      const issues = [];
      validator.checkConfigurationPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Using deprecated Claude model");
    });

    it("should not flag proper configuration", () => {
      const content =
        "new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY, timeout: 30000, maxRetries: 3 })";
      const issues = [];
      validator.checkConfigurationPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkMessagePatterns", () => {
    it("should flag deprecated human role", () => {
      const content = 'messages: [{ role: "human", content: "Hello" }]';
      const issues = [];
      validator.checkMessagePatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain('Using deprecated "human" role');
    });

    it("should flag deprecated ai role", () => {
      const content = 'messages: [{ role: "ai", content: "Hello" }]';
      const issues = [];
      validator.checkMessagePatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain('Using deprecated "ai" role');
    });

    it("should flag string concatenation in messages", () => {
      const content = 'messages: [{ role: "user", content: "Hello\\nWorld" }]';
      const issues = [];
      validator.checkMessagePatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain(
        "Using string concatenation for multi-line messages",
      );
    });

    it("should flag deprecated system parameter", () => {
      const content = 'system: "You are a helpful assistant"';
      const issues = [];
      validator.checkMessagePatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Using deprecated system parameter");
    });

    it("should not flag proper message format", () => {
      const content = 'messages: [{ role: "user", content: "Hello" }]';
      const issues = [];
      validator.checkMessagePatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkErrorHandlingPatterns", () => {
    it("should flag missing error handling", () => {
      const content =
        'await anthropic.messages.create({ model: "claude-3-sonnet-20240229" })';
      const issues = [];
      validator.checkErrorHandlingPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("without error handling");
    });

    it("should flag console.log in error handling", () => {
      const content = "catch (error) { console.log(error); }";
      const issues = [];
      validator.checkErrorHandlingPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Error handling with console.log");
    });

    it("should flag re-throwing without context", () => {
      const content = "catch (error) { throw error; }";
      const issues = [];
      validator.checkErrorHandlingPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Re-throwing error without context");
    });

    it("should flag rate limit error detection", () => {
      const content = 'if (error.type === "rate_limit_exceeded") { }';
      const issues = [];
      validator.checkErrorHandlingPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Rate limit error detection");
    });

    it("should not flag proper error handling", () => {
      const content =
        'await anthropic.messages.create({ model: "claude-3-sonnet-20240229" }).catch(error => logger.error(error))';
      const issues = [];
      validator.checkErrorHandlingPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkStreamingPatterns", () => {
    it("should flag streaming without stream handling", () => {
      const content = "await anthropic.messages.create({ stream: true })";
      const issues = [];
      validator.checkStreamingPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain(
        "Streaming enabled but no stream handling found",
      );
    });

    it("should flag console.log in streaming", () => {
      const content =
        "for await (const message of stream) { console.log(message); }";
      const issues = [];
      validator.checkStreamingPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Streaming with console.log");
    });

    it("should flag stream event handler with console.log", () => {
      const content = 'stream.on("message", (message) => console.log(message))';
      const issues = [];
      validator.checkStreamingPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Stream event handler with console.log");
    });

    it("should not flag proper streaming handling", () => {
      const content =
        "const stream = await anthropic.messages.create({ stream: true }); for await (const message of stream) { handleMessage(message); }";
      const issues = [];
      validator.checkStreamingPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkRateLimitingPatterns", () => {
    it("should flag concurrent API calls", () => {
      const content =
        "Promise.all([anthropic.messages.create(), anthropic.messages.create()])";
      const issues = [];
      validator.checkRateLimitingPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Concurrent API calls without rate limiting");
    });

    it("should flag loop without delay", () => {
      const content =
        "for (let i = 0; i < 10; i++) { await anthropic.messages.create(); }";
      const issues = [];
      validator.checkRateLimitingPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Loop with API calls without delay");
    });

    it("should flag rate limit error without retry", () => {
      const content = 'if (error.type === "rate_limit_error") { throw error; }';
      const issues = [];
      validator.checkRateLimitingPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain(
        "Rate limit error handling without retry logic",
      );
    });

    it("should not flag proper rate limiting", () => {
      const content =
        'if (error.type === "rate_limit_error") { await delay(1000); retry(); }';
      const issues = [];
      validator.checkRateLimitingPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkTokenUsagePatterns", () => {
    it("should flag high token usage", () => {
      const content = "max_tokens: 8192";
      const issues = [];
      validator.checkTokenUsagePatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Using high token limit");
    });

    it("should flag missing token usage tracking", () => {
      const content =
        'await anthropic.messages.create({ model: "claude-3-sonnet-20240229" })';
      const issues = [];
      validator.checkTokenUsagePatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("No token usage tracking");
    });

    it("should not flag proper token usage tracking", () => {
      const content =
        'const response = await anthropic.messages.create({ model: "claude-3-sonnet-20240229" }); console.log(response.usage);';
      const issues = [];
      validator.checkTokenUsagePatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkModelSelectionPatterns", () => {
    it("should flag deprecated model", () => {
      const content = 'model: "claude-2.0"';
      const issues = [];
      validator.checkModelSelectionPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Using deprecated Claude model");
    });

    it("should flag Claude 3 Opus without date suffix", () => {
      const content = 'model: "claude-3-opus"';
      const issues = [];
      validator.checkModelSelectionPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Using Claude 3 Opus without date suffix");
    });

    it("should flag environment variable model selection", () => {
      const content = "model: process.env.ANTHROPIC_MODEL";
      const issues = [];
      validator.checkModelSelectionPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Model selection via environment variable");
    });

    it("should not flag current models", () => {
      const content = 'model: "claude-3-sonnet-20240229"';
      const issues = [];
      validator.checkModelSelectionPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkSystemPromptPatterns", () => {
    it("should flag deprecated system parameter", () => {
      const content = 'system: "You are a helpful assistant"';
      const issues = [];
      validator.checkSystemPromptPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Using deprecated system parameter");
    });

    it("should flag multiple system messages", () => {
      const content =
        'messages: [{ role: "system", content: "First" }, { role: "system", content: "Second" }]';
      const issues = [];
      validator.checkSystemPromptPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Multiple system messages detected");
    });

    it("should flag system prompt with string concatenation", () => {
      const content = '{ role: "system", content: "Hello\\nWorld" }';
      const issues = [];
      validator.checkSystemPromptPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("System prompt with string concatenation");
    });

    it("should not flag proper system message", () => {
      const content =
        'messages: [{ role: "system", content: "You are helpful" }]';
      const issues = [];
      validator.checkSystemPromptPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("validateContent", () => {
    it("should pass for non-code files", async () => {
      const result = await validator.validateContent(
        "some content",
        "file.txt",
      );
      expect(result.allow).toBe(true);
    });

    it("should pass for code without Anthropic patterns", async () => {
      const result = await validator.validateContent(
        'console.log("hello");',
        "file.js",
      );
      expect(result.allow).toBe(true);
    });

    it("should fail for code with Anthropic issues", async () => {
      const content =
        'import Anthropic from "@anthropic-ai/sdk"; const client = new Anthropic(); await client.messages.create({ model: "claude-2.0" });';
      const result = await validator.validateContent(content, "file.js");
      expect(result.allow).toBe(false);
      expect(result.message).toBeDefined();
    });

    it("should pass for properly configured Anthropic code", async () => {
      const content = `
        import { Anthropic } from "@anthropic-ai/sdk";
        const client = new Anthropic({ 
          apiKey: process.env.ANTHROPIC_API_KEY || "fallback",
          timeout: 30000,
          maxRetries: 3
        });
        try {
          const response = await client.messages.create({ 
            model: "claude-3-sonnet-20240229",
            max_tokens: 4096,
            messages: [{ role: "user", content: "Hello" }]
          });
          console.log(response.usage);
        } catch (error) {
          logger.error("Anthropic API error:", error);
        }
      `;
      const result = await validator.validateContent(content, "file.js");
      expect(result.allow).toBe(true);
    });
  });

  describe("integration tests", () => {
    it("should handle TypeScript files", async () => {
      const content = `
        import { Anthropic } from "@anthropic-ai/sdk";
        interface AnthropicConfig {
          apiKey: string;
          timeout: number;
        }
        const config: AnthropicConfig = {
          apiKey: process.env.ANTHROPIC_API_KEY || "fallback",
          timeout: 30000
        };
      `;
      const result = await validator.validateContent(content, "file.ts");
      expect(result.allow).toBe(true);
    });

    it("should handle React components with Anthropic", async () => {
      const content = `
        import React from "react";
        import { Anthropic } from "@anthropic-ai/sdk";
        
        const ChatComponent = () => {
          const client = new Anthropic({ 
            apiKey: process.env.ANTHROPIC_API_KEY || "fallback",
            timeout: 30000
          });
          
          const handleChat = async () => {
            try {
              const response = await client.messages.create({
                model: "claude-3-sonnet-20240229",
                max_tokens: 4096,
                messages: [{ role: "user", content: "Hello" }]
              });
              console.log(response.usage);
            } catch (error) {
              logger.error("Chat error:", error);
            }
          };
          
          return <div onClick={handleChat}>Chat</div>;
        };
      `;
      const result = await validator.validateContent(content, "component.tsx");
      expect(result.allow).toBe(true);
    });
  });

  describe("environment-based bypass", () => {
    it("should bypass when HOOK_AI is false", async () => {
      process.env.HOOK_AI = "false";
      const content =
        'import Anthropic from "@anthropic-ai/sdk"; const client = new Anthropic();';
      const result = await validator.validateContent(content, "file.js");
      expect(result.allow).toBe(true);
      expect(result.bypass).toBe(true);
    });

    it("should run when HOOK_AI is true", async () => {
      process.env.HOOK_AI = "true";
      const content =
        'import Anthropic from "@anthropic-ai/sdk"; const client = new Anthropic();';
      const result = await validator.validateContent(content, "file.js");
      expect(result.allow).toBe(false);
      expect(result.bypass).toBeUndefined();
    });
  });
});
