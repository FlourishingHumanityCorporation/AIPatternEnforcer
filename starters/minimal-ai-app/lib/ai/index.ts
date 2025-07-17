import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { createLogger } from "../logger";

const logger = createLogger("ai");

// Initialize AI clients based on environment variables
const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  : null;

// Helper to check if AI services are configured
export function hasAIService(): boolean {
  return !!(openai || anthropic);
}

// Generic chat completion function
export async function chat(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    stream?: boolean;
  } = {},
) {
  const {
    model = "gpt-3.5-turbo",
    temperature = 0.7,
    maxTokens = 1000,
    stream = false,
  } = options;

  if (!hasAIService()) {
    throw new Error(
      "No AI service configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY in your .env file",
    );
  }

  try {
    // Use OpenAI if available and model starts with 'gpt'
    if (openai && model.startsWith("gpt")) {
      logger.debug("Using OpenAI", { model });

      const response = await openai.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream,
      });

      return stream
        ? response
        : (response as any).choices[0]?.message?.content || "";
    }

    // Use Anthropic if available and model starts with 'claude'
    if (anthropic && model.startsWith("claude")) {
      logger.debug("Using Anthropic", { model });

      // Convert messages to Anthropic format
      const systemMessage =
        messages.find((m) => m.role === "system")?.content || "";
      const userMessages = messages.filter((m) => m.role !== "system");

      const response = await anthropic.messages.create({
        model,
        system: systemMessage,
        messages: userMessages as any,
        temperature,
        max_tokens: maxTokens,
      });

      return response.content[0]?.text || "";
    }

    throw new Error(`No AI service available for model: ${model}`);
  } catch (error) {
    logger.error("AI chat error", error);
    throw error;
  }
}

// Text embedding function
export async function embed(text: string, options: { model?: string } = {}) {
  const { model = "text-embedding-ada-002" } = options;

  if (!openai) {
    throw new Error("OpenAI API key required for embeddings");
  }

  try {
    const response = await openai.embeddings.create({
      model,
      input: text,
    });

    return response.data[0]?.embedding || [];
  } catch (error) {
    logger.error("Embedding error", error);
    throw error;
  }
}

// Export clients for direct use if needed
export { openai, anthropic };
