const { spawn } = require('child_process');
const path = require('path');

describe('New Hooks Integration', () => {
  function testHook(hookName, input) {
    return new Promise((resolve, reject) => {
      const hookPath = path.join(__dirname, '..', hookName);
      const child = spawn('node', [hookPath], { stdio: ['pipe', 'pipe', 'pipe'] });
      
      let stdout = '';
      let stderr = '';
      
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      child.on('close', (code) => {
        resolve({ code, stdout, stderr });
      });
      
      child.on('error', (error) => {
        reject(error);
      });
      
      child.stdin.write(JSON.stringify(input));
      child.stdin.end();
    });
  }

  describe('import-janitor.js', () => {
    test('should allow files without imports', async () => {
      const result = await testHook('import-janitor.js', {
        tool_input: {
          file_path: '/test.js',
          content: 'function test() { return 1; }'
        }
      });
      
      expect(result.code).toBe(0);
    });

    test('should process TypeScript files', async () => {
      const result = await testHook('import-janitor.js', {
        tool_input: {
          file_path: '/test.tsx',
          content: 'import React from "react";\nfunction Component() { return React.createElement("div"); }'
        }
      });
      
      expect(result.code).toBe(0);
    });

    test('should skip non-JavaScript files', async () => {
      const result = await testHook('import-janitor.js', {
        tool_input: {
          file_path: '/test.txt',
          content: 'import something from somewhere;'
        }
      });
      
      expect(result.code).toBe(0);
    });
  });

  describe('vector-db-hygiene.js', () => {
    test('should allow non-vector files', async () => {
      const result = await testHook('vector-db-hygiene.js', {
        tool_input: {
          file_path: '/utils.js',
          content: 'function add(a, b) { return a + b; }'
        }
      });
      
      expect(result.code).toBe(0);
    });

    test('should detect vector operations', async () => {
      const result = await testHook('vector-db-hygiene.js', {
        tool_input: {
          file_path: '/schema.sql',
          content: 'CREATE TABLE docs (embedding vector[1536]);'
        }
      });
      
      expect(result.code).toBe(0);
    });

    test('should flag non-standard dimensions', async () => {
      const result = await testHook('vector-db-hygiene.js', {
        tool_input: {
          file_path: '/bad-schema.sql',
          content: 'CREATE TABLE docs (embedding vector[512]);'
        }
      });
      
      expect(result.code).toBe(2);
      expect(result.stderr).toContain('Vector DB Hygiene');
    });
  });

  describe('token-economics-guardian.js', () => {
    test('should allow non-AI files', async () => {
      const result = await testHook('token-economics-guardian.js', {
        tool_input: {
          file_path: '/utils.js',
          content: 'function add(a, b) { return a + b; }'
        }
      });
      
      expect(result.code).toBe(0);
    });

    test('should warn about expensive patterns', async () => {
      const result = await testHook('token-economics-guardian.js', {
        tool_input: {
          file_path: '/ai-service.js',
          content: 'for (const item of items) {\n  const response = await openai.chat.completions.create({\n    model: "gpt-4",\n    messages: []\n  });\n}'
        }
      });
      
      expect(result.code).toBe(0);
      expect(result.stderr).toContain('Token Economics Warning');
    });

    test('should allow cheap models', async () => {
      const result = await testHook('token-economics-guardian.js', {
        tool_input: {
          file_path: '/ai-service.js',
          content: 'const response = await openai.chat.completions.create({\n  model: "gpt-4o",\n  messages: []\n});'
        }
      });
      
      expect(result.code).toBe(0);
    });
  });

  describe('Hook error handling', () => {
    test('should handle malformed input gracefully', async () => {
      const result = await testHook('import-janitor.js', {
        invalid: 'json structure'
      });
      
      expect(result.code).toBe(0); // Should fail-open
    });

    test('should handle missing file paths', async () => {
      const result = await testHook('vector-db-hygiene.js', {
        tool_input: {
          content: 'some content without file path'
        }
      });
      
      expect(result.code).toBe(0);
    });

    test('should handle empty content', async () => {
      const result = await testHook('token-economics-guardian.js', {
        tool_input: {
          file_path: '/test.js',
          content: ''
        }
      });
      
      expect(result.code).toBe(0);
    });
  });
});