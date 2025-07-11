import { OpenAI } from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { AIProvider } from "@prisma/client";
import { env } from "@/lib/env";

export interface AIServiceConfig {
  preferLocal?: boolean;
  fallbackToAPI?: boolean;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: AIProvider;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  cost?: number;
  cached?: boolean;
}

export class AIService {
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private ollamaBaseUrl: string;
  private localAIBaseUrl: string;

  constructor() {
    // Initialize API clients if keys are provided
    if (env.OPENAI_API_KEY) {
      this.openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    }
    if (env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
    }

    // Local model endpoints
    this.ollamaBaseUrl = env.OLLAMA_BASE_URL || "http://localhost:11434";
    this.localAIBaseUrl = env.LOCALAI_BASE_URL || "http://localhost:8080";
  }

  /**
   * Check if local models are available
   */
  async checkLocalModels(): Promise<{ ollama: boolean; localai: boolean }> {
    const checkOllama = async () => {
      try {
        const response = await fetch(`${this.ollamaBaseUrl}/api/tags`);
        return response.ok;
      } catch {
        return false;
      }
    };

    const checkLocalAI = async () => {
      try {
        const response = await fetch(`${this.localAIBaseUrl}/models`);
        return response.ok;
      } catch {
        return false;
      }
    };

    const [ollama, localai] = await Promise.all([
      checkOllama(),
      checkLocalAI(),
    ]);
    return { ollama, localai };
  }

  /**
   * List available models
   */
  async listModels(): Promise<{ local: string[]; api: string[] }> {
    const local: string[] = [];
    const api: string[] = [];

    // Get Ollama models
    try {
      const response = await fetch(`${this.ollamaBaseUrl}/api/tags`);
      if (response.ok) {
        const data = await response.json();
        local.push(...data.models.map((m: any) => `ollama:${m.name}`));
      }
    } catch {}

    // Add API models if available
    if (this.openai) {
      api.push("gpt-4-turbo-preview", "gpt-4", "gpt-3.5-turbo");
    }
    if (this.anthropic) {
      api.push("claude-3-opus", "claude-3-sonnet", "claude-3-haiku");
    }

    return { local, api };
  }

  /**
   * Generate chat completion
   */
  async chat(
    messages: { role: string; content: string }[],
    config: AIServiceConfig = {},
  ): Promise<AIResponse> {
    const {
      preferLocal = true,
      fallbackToAPI = true,
      model,
      temperature = 0.7,
      maxTokens = 2048,
      stream = false,
    } = config;

    // Try local models first if preferred
    if (preferLocal) {
      const localResponse = await this.tryLocalChat(messages, {
        model,
        temperature,
        maxTokens,
        stream,
      });
      if (localResponse) return localResponse;
    }

    // Fallback to API if allowed
    if (fallbackToAPI && (this.openai || this.anthropic)) {
      return this.tryAPIChat(messages, {
        model,
        temperature,
        maxTokens,
        stream,
      });
    }

    throw new Error("No AI models available");
  }

  /**
   * Try local model chat
   */
  private async tryLocalChat(
    messages: { role: string; content: string }[],
    config: any,
  ): Promise<AIResponse | null> {
    try {
      const response = await fetch(`${this.ollamaBaseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: config.model || "llama2",
          messages,
          stream: false,
          options: {
            temperature: config.temperature,
            num_predict: config.maxTokens,
          },
        }),
      });

      if (!response.ok) return null;

      const data = await response.json();
      return {
        content: data.message.content,
        model: data.model,
        provider: AIProvider.LOCAL,
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
        cost: 0, // Local models are free
      };
    } catch (error) {
      console.error("Local chat error:", error);
      return null;
    }
  }

  /**
   * Try API chat (OpenAI/Anthropic)
   */
  private async tryAPIChat(
    messages: { role: string; content: string }[],
    config: any,
  ): Promise<AIResponse> {
    // Try OpenAI first
    if (this.openai) {
      try {
        const completion = await this.openai.chat.completions.create({
          model: config.model || "gpt-3.5-turbo",
          messages: messages as any,
          temperature: config.temperature,
          max_tokens: config.maxTokens,
          stream: config.stream,
        });

        if (!config.stream) {
          const response = completion as any;
          return {
            content: response.choices[0].message.content,
            model: response.model,
            provider: AIProvider.OPENAI,
            usage: {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            },
            cost: this.calculateOpenAICost(
              response.model,
              response.usage.prompt_tokens,
              response.usage.completion_tokens,
            ),
          };
        }
      } catch (error) {
        console.error("OpenAI error:", error);
      }
    }

    // Try Anthropic
    if (this.anthropic) {
      const completion = await this.anthropic.messages.create({
        model: config.model || "claude-3-haiku-20240307",
        messages: messages as any,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
      });

      return {
        content:
          completion.content[0].type === "text"
            ? completion.content[0].text
            : "",
        model: completion.model,
        provider: AIProvider.ANTHROPIC,
        usage: {
          promptTokens: completion.usage.input_tokens,
          completionTokens: completion.usage.output_tokens,
          totalTokens:
            completion.usage.input_tokens + completion.usage.output_tokens,
        },
        cost: this.calculateAnthropicCost(
          completion.model,
          completion.usage.input_tokens,
          completion.usage.output_tokens,
        ),
      };
    }

    throw new Error("No API models available");
  }

  /**
   * Generate embeddings
   */
  async embed(text: string, config: AIServiceConfig = {}): Promise<number[]> {
    const { preferLocal = true, fallbackToAPI = true } = config;

    // Try local embedding model first
    if (preferLocal) {
      try {
        const response = await fetch(`${this.ollamaBaseUrl}/api/embeddings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "nomic-embed-text",
            prompt: text,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return data.embedding;
        }
      } catch {}
    }

    // Fallback to OpenAI
    if (fallbackToAPI && this.openai) {
      const response = await this.openai.embeddings.create({
        model: "text-embedding-3-small",
        input: text,
      });
      return response.data[0].embedding;
    }

    throw new Error("No embedding models available");
  }

  /**
   * Vision analysis
   */
  async analyzeImage(
    imageBase64: string,
    prompt: string,
    config: AIServiceConfig = {},
  ): Promise<AIResponse> {
    const { preferLocal = true, fallbackToAPI = true } = config;

    // Try local vision model (LLaVA via Ollama)
    if (preferLocal) {
      try {
        const response = await fetch(`${this.ollamaBaseUrl}/api/generate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llava",
            prompt,
            images: [imageBase64],
            stream: false,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          return {
            content: data.response,
            model: "llava",
            provider: AIProvider.LOCAL,
            usage: {
              promptTokens: 0,
              completionTokens: 0,
              totalTokens: 0,
            },
            cost: 0,
          };
        }
      } catch {}
    }

    // Fallback to GPT-4 Vision
    if (fallbackToAPI && this.openai) {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4-vision-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` },
              },
            ],
          },
        ],
        max_tokens: config.maxTokens || 1000,
      });

      return {
        content: response.choices[0].message.content || "",
        model: response.model,
        provider: AIProvider.OPENAI,
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        cost: this.calculateOpenAICost(
          response.model,
          response.usage?.prompt_tokens || 0,
          response.usage?.completion_tokens || 0,
        ),
      };
    }

    throw new Error("No vision models available");
  }

  /**
   * Calculate costs for API usage
   */
  private calculateOpenAICost(
    model: string,
    promptTokens: number,
    completionTokens: number,
  ): number {
    const costs: Record<string, { prompt: number; completion: number }> = {
      "gpt-4-turbo-preview": { prompt: 0.01, completion: 0.03 },
      "gpt-4": { prompt: 0.03, completion: 0.06 },
      "gpt-3.5-turbo": { prompt: 0.0005, completion: 0.0015 },
      "gpt-4-vision-preview": { prompt: 0.01, completion: 0.03 },
    };

    const modelCost = costs[model] || costs["gpt-3.5-turbo"];
    return (
      (promptTokens * modelCost.prompt +
        completionTokens * modelCost.completion) /
      1000
    );
  }

  private calculateAnthropicCost(
    model: string,
    inputTokens: number,
    outputTokens: number,
  ): number {
    const costs: Record<string, { input: number; output: number }> = {
      "claude-3-opus": { input: 0.015, output: 0.075 },
      "claude-3-sonnet": { input: 0.003, output: 0.015 },
      "claude-3-haiku": { input: 0.00025, output: 0.00125 },
    };

    const modelCost = costs[model] || costs["claude-3-haiku"];
    return (
      (inputTokens * modelCost.input + outputTokens * modelCost.output) / 1000
    );
  }
}

// Export singleton instance
export const aiService = new AIService();
