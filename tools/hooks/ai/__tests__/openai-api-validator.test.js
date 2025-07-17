const OpenAIAPIValidator = require("../openai-api-validator");
const fs = require("fs");

describe("OpenAIAPIValidator", () => {
  let validator;
  let originalEnv;

  beforeEach(() => {
    validator = new OpenAIAPIValidator();
    originalEnv = process.env;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("containsOpenAIPatterns", () => {
    it("should detect OpenAI import patterns", () => {
      const content = 'import OpenAI from "openai";';
      expect(validator.containsOpenAIPatterns(content)).toBe(true);
    });

    it("should detect OpenAI class usage", () => {
      const content = "const client = new OpenAI();";
      expect(validator.containsOpenAIPatterns(content)).toBe(true);
    });

    it("should detect GPT model references", () => {
      const content = 'model: "gpt-4"';
      expect(validator.containsOpenAIPatterns(content)).toBe(true);
    });

    it("should detect API key environment variable", () => {
      const content = "process.env.OPENAI_API_KEY";
      expect(validator.containsOpenAIPatterns(content)).toBe(true);
    });

    it("should return false for non-OpenAI content", () => {
      const content = 'console.log("hello world");';
      expect(validator.containsOpenAIPatterns(content)).toBe(false);
    });
  });

  describe("checkImportPatterns", () => {
    it("should flag default import suggestion", () => {
      const content = 'import OpenAI from "openai";';
      const issues = [];
      validator.checkImportPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Consider using named imports");
    });

    it("should flag CommonJS require", () => {
      const content = 'const OpenAI = require("openai");';
      const issues = [];
      validator.checkImportPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("CommonJS require detected");
    });

    it("should flag direct path imports", () => {
      const content = 'import OpenAI from "openai/lib/client";';
      const issues = [];
      validator.checkImportPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Direct path imports detected");
    });

    it("should not flag proper named imports", () => {
      const content = 'import { OpenAI } from "openai";';
      const issues = [];
      validator.checkImportPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkAPIKeyPatterns", () => {
    it("should flag hardcoded API key", () => {
      const content = 'apiKey: "sk-abc123"';
      const issues = [];
      validator.checkAPIKeyPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Hardcoded API key detected");
    });

    it("should flag exposed API key", () => {
      const content = 'const key = "sk-abc123def456ghi789jkl012mno345pqr678";';
      const issues = [];
      validator.checkAPIKeyPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Exposed API key in code");
    });

    it("should flag OpenAI client without configuration", () => {
      const content = "const client = new OpenAI();";
      const issues = [];
      validator.checkAPIKeyPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("OpenAI client without configuration");
    });

    it("should flag missing API key fallback", () => {
      const content = "apiKey: process.env.OPENAI_API_KEY";
      const issues = [];
      validator.checkAPIKeyPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("No fallback for missing API key");
    });

    it("should not flag proper environment variable usage", () => {
      const content = 'apiKey: process.env.OPENAI_API_KEY || "fallback"';
      const issues = [];
      validator.checkAPIKeyPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkConfigurationPatterns", () => {
    it("should flag missing timeout configuration", () => {
      const content = "new OpenAI({ apiKey: process.env.OPENAI_API_KEY })";
      const issues = [];
      validator.checkConfigurationPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("without timeout or retry configuration");
    });

    it("should flag missing temperature/max_tokens", () => {
      const content =
        'await openai.chat.completions.create({ model: "gpt-3.5-turbo" })';
      const issues = [];
      validator.checkConfigurationPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("without temperature or max_tokens");
    });

    it("should flag expensive GPT-4 model", () => {
      const content = 'model: "gpt-4"';
      const issues = [];
      validator.checkConfigurationPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Using expensive GPT-4 model");
    });

    it("should not flag proper configuration", () => {
      const content =
        "new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 30000, maxRetries: 3 })";
      const issues = [];
      validator.checkConfigurationPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkErrorHandlingPatterns", () => {
    it("should flag missing error handling", () => {
      const content =
        'await openai.chat.completions.create({ model: "gpt-4" })';
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

    it("should not flag proper error handling", () => {
      const content =
        'await openai.chat.completions.create({ model: "gpt-4" }).catch(error => logger.error(error))';
      const issues = [];
      validator.checkErrorHandlingPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkStreamingPatterns", () => {
    it("should flag streaming without stream handling", () => {
      const content = "await openai.chat.completions.create({ stream: true })";
      const issues = [];
      validator.checkStreamingPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain(
        "Streaming enabled but no stream handling found",
      );
    });

    it("should flag console.log in streaming", () => {
      const content =
        "for await (const chunk of stream) { console.log(chunk); }";
      const issues = [];
      validator.checkStreamingPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Streaming with console.log");
    });

    it("should not flag proper streaming handling", () => {
      const content =
        "const stream = await openai.chat.completions.create({ stream: true }); for await (const chunk of stream) { handleChunk(chunk); }";
      const issues = [];
      validator.checkStreamingPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkRateLimitingPatterns", () => {
    it("should flag concurrent API calls", () => {
      const content =
        "Promise.all([openai.chat.completions.create({}), openai.chat.completions.create({})])";
      const issues = [];
      validator.checkRateLimitingPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Concurrent API calls without rate limiting");
    });

    it("should flag loop without delay", () => {
      const content =
        "for (let i = 0; i < 10; i++) { await openai.chat.completions.create(); }";
      const issues = [];
      validator.checkRateLimitingPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Loop with API calls without delay");
    });

    it("should flag rate limit error without retry", () => {
      const content =
        'if (error.type === "rate_limit_exceeded") { throw error; }';
      const issues = [];
      validator.checkRateLimitingPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain(
        "Rate limit error handling without retry logic",
      );
    });

    it("should not flag proper rate limiting", () => {
      const content =
        'if (error.type === "rate_limit_exceeded") { await delay(1000); retry(); }';
      const issues = [];
      validator.checkRateLimitingPatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkTokenUsagePatterns", () => {
    it("should flag maximum token usage", () => {
      const content = "max_tokens: 4096";
      const issues = [];
      validator.checkTokenUsagePatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Using maximum token limit");
    });

    it("should flag missing token usage tracking", () => {
      const content =
        'await openai.chat.completions.create({ model: "gpt-4" })';
      const issues = [];
      validator.checkTokenUsagePatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("No token usage tracking");
    });

    it("should not flag proper token usage tracking", () => {
      const content =
        'const response = await openai.chat.completions.create({ model: "gpt-4" }); console.log(response.usage);';
      const issues = [];
      validator.checkTokenUsagePatterns(content, issues);
      expect(issues).toHaveLength(0);
    });
  });

  describe("checkModelSelectionPatterns", () => {
    it("should flag deprecated legacy models", () => {
      const content = 'model: "text-davinci-003"';
      const issues = [];
      validator.checkModelSelectionPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Using deprecated legacy model");
    });

    it("should flag deprecated model versions", () => {
      const content = 'model: "gpt-4-0314"';
      const issues = [];
      validator.checkModelSelectionPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Using deprecated model version");
    });

    it("should flag environment variable model selection", () => {
      const content = "model: process.env.OPENAI_MODEL";
      const issues = [];
      validator.checkModelSelectionPatterns(content, issues);
      expect(issues).toHaveLength(1);
      expect(issues[0]).toContain("Model selection via environment variable");
    });

    it("should not flag current models", () => {
      const content = 'model: "gpt-4-turbo"';
      const issues = [];
      validator.checkModelSelectionPatterns(content, issues);
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

    it("should pass for code without OpenAI patterns", async () => {
      const result = await validator.validateContent(
        'console.log("hello");',
        "file.js",
      );
      expect(result.allow).toBe(true);
    });

    it("should fail for code with OpenAI issues", async () => {
      const content =
        'import OpenAI from "openai"; const client = new OpenAI(); await client.chat.completions.create({ model: "gpt-4" });';
      const result = await validator.validateContent(content, "file.js");
      expect(result.block).toBe(true);
      expect(result.message).toBeDefined();
    });

    it("should pass for properly configured OpenAI code", async () => {
      const content = `
        import { OpenAI } from "openai";
        const client = new OpenAI({ 
          apiKey: process.env.OPENAI_API_KEY || "fallback",
          timeout: 30000,
          maxRetries: 3
        });
        try {
          const response = await client.chat.completions.create({ 
            model: "gpt-4-turbo",
            temperature: 0.7,
            max_tokens: 1000
          });
          console.log(response.usage);
        } catch (error) {
          logger.error("OpenAI API error:", error);
        }
      `;
      const result = await validator.validateContent(content, "file.js");
      expect(result.allow).toBe(true);
    });
  });

  describe("integration tests", () => {
    it("should handle TypeScript files", async () => {
      const content = `
        import { OpenAI } from "openai";
        interface OpenAIConfig {
          apiKey: string;
          timeout: number;
        }
        const config: OpenAIConfig = {
          apiKey: process.env.OPENAI_API_KEY || "fallback",
          timeout: 30000
        };
      `;
      const result = await validator.validateContent(content, "file.ts");
      expect(result.allow).toBe(true);
    });

    it("should handle React components with OpenAI", async () => {
      const content = `
        import React from "react";
        import { OpenAI } from "openai";
        
        const ChatComponent = () => {
          const client = new OpenAI({ 
            apiKey: process.env.OPENAI_API_KEY || "fallback",
            timeout: 30000
          });
          
          const handleChat = async () => {
            try {
              const response = await client.chat.completions.create({
                model: "gpt-4-turbo",
                messages: [{ role: "user", content: "Hello" }],
                temperature: 0.7,
                max_tokens: 1000
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
        'import OpenAI from "openai"; const client = new OpenAI();';
      const result = await validator.validateContent(content, "file.js");
      expect(result.allow).toBe(true);
      expect(result.bypass).toBe(true);
    });

    it("should run when HOOK_AI is true", async () => {
      process.env.HOOK_AI = "true";
      const content =
        'import OpenAI from "openai"; const client = new OpenAI();';
      const result = await validator.validateContent(content, "file.js");
      expect(result.allow).toBe(false);
      expect(result.bypass).toBeUndefined();
    });
  });
});
