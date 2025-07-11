# Local AI Model Setup Guide

This guide covers setting up and integrating local AI models for development, eliminating dependency on cloud APIs and enabling offline AI-assisted development.

## Why Local Models?

- **Privacy**: Keep your code and data on your machine
- **Cost**: No API fees or usage limits
- **Speed**: No network latency for model calls
- **Offline**: Work without internet connection
- **Control**: Choose and customize models for your needs

## Recommended Local Model Solutions

### 1. Ollama (Recommended for Most Users)

**Best for**: General development tasks, code completion, documentation
**Models**: Llama 3, CodeLlama, Mistral, Mixtral

#### Installation

```bash
# macOS
brew install ollama

# Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download/windows
```

#### Setup Models

```bash
# Pull recommended models for development
ollama pull llama3:8b          # General purpose, 8B parameters
ollama pull codellama:13b       # Code-specific, 13B parameters
ollama pull mistral:7b          # Fast, efficient for quick tasks
ollama pull mixtral:8x7b        # Powerful but resource-intensive

# List installed models
ollama list

# Test a model
ollama run llama3:8b "Explain async/await in JavaScript"
```

#### Memory Requirements

- 7B models: ~8GB RAM
- 13B models: ~16GB RAM
- 30B+ models: ~32GB RAM
- GPU acceleration: Significantly faster with 8GB+ VRAM

### 2. LocalAI

**Best for**: OpenAI API compatibility, multiple model formats
**Models**: Any GGML/GGUF format models

#### Installation

```bash
# Using Docker (recommended)
docker run -p 8080:8080 -v $PWD/models:/models localai/localai

# Binary installation
wget https://github.com/mudler/LocalAI/releases/latest/download/local-ai-Linux-x86_64
chmod +x local-ai-Linux-x86_64
./local-ai-Linux-x86_64
```

#### Configuration

```yaml
# models/llama3.yaml
name: llama3
backend: llama
parameters:
  model: llama-3-8b.gguf
  context_size: 4096
  threads: 8
  gpu_layers: 35 # Offload to GPU if available
```

### 3. LM Studio

**Best for**: GUI interface, easy model management
**Platform**: macOS, Windows, Linux

- Download from [lmstudio.ai](https://lmstudio.ai)
- Browse and download models directly in UI
- Automatic optimization for your hardware
- Built-in API server compatible with OpenAI format

## Integration Patterns

### 1. Direct Integration with Ollama

```typescript
// lib/ai/ollama-client.ts
import { Ollama } from "ollama-js";

const ollama = new Ollama({
  host: "http://localhost:11434",
});

export async function generateCode(prompt: string, model = "codellama:13b") {
  try {
    const response = await ollama.generate({
      model,
      prompt,
      options: {
        temperature: 0.7,
        top_p: 0.9,
        max_tokens: 2048,
      },
    });

    return response.response;
  } catch (error) {
    console.error("Ollama generation failed:", error);
    return null;
  }
}

// Usage example
const code = await generateCode(`
  Create a TypeScript function that validates email addresses
  using a robust regex pattern and returns detailed error messages.
`);
```

### 2. OpenAI-Compatible API (LocalAI/LM Studio)

```typescript
// lib/ai/local-openai.ts
import OpenAI from "openai";

// Point to local server instead of OpenAI
const openai = new OpenAI({
  baseURL: "http://localhost:8080/v1", // LocalAI
  // baseURL: 'http://localhost:1234/v1', // LM Studio
  apiKey: "not-needed-for-local",
});

export async function generateWithLocal(prompt: string, model = "llama3") {
  const completion = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    max_tokens: 2048,
  });

  return completion.choices[0]?.message?.content || "";
}
```

### 3. Fallback Pattern

```typescript
// lib/ai/ai-service.ts
import { generateCode as ollamaGenerate } from "./ollama-client";
import { generateWithLocal } from "./local-openai";
import { generateWithClaude } from "./claude-client";

export async function generateCode(
  prompt: string,
  options: { preferLocal?: boolean } = {},
) {
  // Try local models first if preferred
  if (options.preferLocal) {
    try {
      const localResult = await ollamaGenerate(prompt);
      if (localResult) return localResult;
    } catch (error) {
      console.warn("Local model failed, trying alternatives");
    }
  }

  // Fallback chain
  const generators = [
    () => ollamaGenerate(prompt),
    () => generateWithLocal(prompt),
    () => generateWithClaude(prompt), // Cloud fallback
  ];

  for (const generate of generators) {
    try {
      const result = await generate();
      if (result) return result;
    } catch (error) {
      continue;
    }
  }

  throw new Error("All AI generators failed");
}
```

## Model Selection Guide

### By Task Type

| Task                | Recommended Model | Size | Speed     |
| ------------------- | ----------------- | ---- | --------- |
| Code completion     | CodeLlama 13B     | 13GB | Fast      |
| Code explanation    | Llama 3 8B        | 8GB  | Fast      |
| Documentation       | Mistral 7B        | 7GB  | Very Fast |
| Complex refactoring | Mixtral 8x7B      | 47GB | Slower    |
| Quick fixes         | Llama 3 7B        | 7GB  | Very Fast |

### By Hardware

**8GB RAM / No GPU**:

- Llama 3 7B (Q4 quantization)
- Mistral 7B (Q4 quantization)

**16GB RAM / 8GB GPU**:

- CodeLlama 13B
- Llama 3 13B
- Multiple 7B models

**32GB+ RAM / 16GB+ GPU**:

- Mixtral 8x7B
- Llama 3 30B
- Multiple specialized models

## Performance Optimization

### 1. Model Quantization

```bash
# Use quantized models for better performance
ollama pull llama3:8b-q4_0    # 4-bit quantization, smaller/faster
ollama pull codellama:13b-q5_1 # 5-bit quantization, good balance
```

### 2. Context Window Management

```typescript
// lib/ai/context-manager.ts
export class ContextManager {
  private maxTokens = 4096;
  private tokenBuffer = 512; // Reserve for response

  truncateContext(context: string): string {
    const available = this.maxTokens - this.tokenBuffer;
    // Simple truncation - in practice, use a tokenizer
    if (context.length > available) {
      return "..." + context.slice(-available);
    }
    return context;
  }
}
```

### 3. Response Caching

```typescript
// lib/ai/cache.ts
import { LRUCache } from "lru-cache";
import crypto from "crypto";

const cache = new LRUCache<string, string>({
  max: 100,
  ttl: 1000 * 60 * 60, // 1 hour
});

export function withCache(generator: (prompt: string) => Promise<string>) {
  return async (prompt: string): Promise<string> => {
    const hash = crypto.createHash("sha256").update(prompt).digest("hex");

    const cached = cache.get(hash);
    if (cached) return cached;

    const result = await generator(prompt);
    cache.set(hash, result);
    return result;
  };
}
```

## IDE Integration

### VS Code / Cursor Settings

```json
{
  "ai.localModel.enabled": true,
  "ai.localModel.endpoint": "http://localhost:11434",
  "ai.localModel.model": "codellama:13b",
  "ai.preferLocalModels": true,
  "ai.fallbackToCloud": false
}
```

### Custom Prompts for Local Models

```typescript
// ai/prompts/local-models/code-review.md
export const codeReviewPrompt = `
You are reviewing TypeScript code. Be concise due to context limits.

Code to review:
{code}

Focus on:
1. Critical bugs or security issues
2. Performance problems
3. Type safety violations

Provide maximum 3 specific improvements.
`;
```

## Monitoring & Debugging

### Performance Tracking

```bash
#!/bin/bash
# scripts/dev/monitor-local-ai.sh

echo "=== Local AI Model Status ==="

# Check Ollama
if command -v ollama &> /dev/null; then
    echo "Ollama: $(ollama list | wc -l) models installed"
    echo "Ollama API: $(curl -s http://localhost:11434/api/tags | jq -r '.models[].name' 2>/dev/null | head -3 || echo "Not running")"
fi

# Check GPU usage
if command -v nvidia-smi &> /dev/null; then
    echo -e "\nGPU Status:"
    nvidia-smi --query-gpu=name,memory.used,memory.total --format=csv
fi

# Check memory
echo -e "\nMemory Usage:"
free -h | grep Mem

# Response time test
echo -e "\nResponse Time Test:"
time curl -s -X POST http://localhost:11434/api/generate \
  -d '{"model": "llama3", "prompt": "Hello", "stream": false}' \
  > /dev/null 2>&1 || echo "Model not responding"
```

## Best Practices

1. **Start Small**: Begin with 7B models and scale up as needed
2. **Quantize When Possible**: Use Q4/Q5 quantization for better performance
3. **Cache Responses**: Implement caching for repeated queries
4. **Monitor Resources**: Track CPU/GPU/memory usage
5. **Set Timeouts**: Implement timeouts for model calls
6. **Provide Fallbacks**: Always have a fallback when models fail
7. **Test Offline**: Regularly test with internet disabled

## Troubleshooting

### Common Issues

**Model not responding**:

```bash
# Restart Ollama service
sudo systemctl restart ollama
# or
ollama serve
```

**Out of memory**:

- Use smaller models or quantized versions
- Reduce context window size
- Enable GPU offloading
- Close other applications

**Slow generation**:

- Check CPU/GPU utilization
- Use smaller models for quick tasks
- Implement streaming responses
- Consider model quantization

## Example: Complete Integration

```typescript
// lib/ai/local-development.ts
import { Ollama } from "ollama-js";
import { withCache } from "./cache";
import { ContextManager } from "./context-manager";

class LocalAIDevelopment {
  private ollama: Ollama;
  private contextManager: ContextManager;

  constructor() {
    this.ollama = new Ollama({ host: "http://localhost:11434" });
    this.contextManager = new ContextManager();
  }

  async explainCode(code: string) {
    const prompt = `Explain this code concisely:\n\n${code}`;
    return this.generate(prompt, "llama3:8b");
  }

  async generateTests(code: string) {
    const prompt = `Generate comprehensive tests for:\n\n${code}`;
    return this.generate(prompt, "codellama:13b");
  }

  async refactorCode(code: string, instruction: string) {
    const prompt = `Refactor this code: ${instruction}\n\n${code}`;
    return this.generate(prompt, "codellama:13b");
  }

  private generate = withCache(async (prompt: string, model: string) => {
    const truncated = this.contextManager.truncateContext(prompt);

    const response = await this.ollama.generate({
      model,
      prompt: truncated,
      options: {
        temperature: 0.7,
        top_p: 0.9,
      },
    });

    return response.response;
  });
}

export const localAI = new LocalAIDevelopment();
```

## Next Steps

1. Install Ollama and pull your first model
2. Test generation with simple prompts
3. Integrate into your development workflow
4. Experiment with different models for different tasks
5. Set up monitoring and performance tracking
6. Share successful patterns with your team

## See Also

- [AI Configuration](../../../ai/config/README.md) - Centralized AI tool configurations
- [Context Optimizer](../../../scripts/dev/context-optimizer.sh) - Manage context for local models
- [Working with Cursor](working-with-cursor.md) - Cursor IDE integration guide
- [Prompt Engineering](prompt-engineering.md) - Optimize prompts for local models
- [Performance Optimization](../performance/optimization-playbook.md) - Speed up local inference
- [FRICTION-MAPPING.md](../../../FRICTION-MAPPING.md) - Common AI development friction points
