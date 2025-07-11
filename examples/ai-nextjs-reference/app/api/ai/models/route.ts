import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const models = {
      local: [] as any[],
      openai: [] as any[],
      anthropic: [] as any[],
    };

    // Check Ollama models
    try {
      const ollamaResponse = await fetch(
        `${process.env.OLLAMA_BASE_URL || "http://localhost:11434"}/api/tags`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (ollamaResponse.ok) {
        const ollamaData = await ollamaResponse.json();
        models.local =
          ollamaData.models?.map((model: any) => ({
            id: model.name,
            name: model.name,
            size: model.size,
            modified: model.modified_at,
            provider: "ollama",
          })) || [];
      }
    } catch (error) {
      console.error("Error fetching Ollama models:", error);
    }

    // Add OpenAI models if API key is available
    if (process.env.OPENAI_API_KEY) {
      models.openai = [
        { id: "gpt-4", name: "GPT-4", provider: "openai", context: 8192 },
        {
          id: "gpt-4-turbo",
          name: "GPT-4 Turbo",
          provider: "openai",
          context: 128000,
        },
        {
          id: "gpt-3.5-turbo",
          name: "GPT-3.5 Turbo",
          provider: "openai",
          context: 16384,
        },
        {
          id: "gpt-3.5-turbo-16k",
          name: "GPT-3.5 Turbo 16K",
          provider: "openai",
          context: 16384,
        },
      ];
    }

    // Add Anthropic models if API key is available
    if (process.env.ANTHROPIC_API_KEY) {
      models.anthropic = [
        {
          id: "claude-3-opus-20240229",
          name: "Claude 3 Opus",
          provider: "anthropic",
          context: 200000,
        },
        {
          id: "claude-3-sonnet-20240229",
          name: "Claude 3 Sonnet",
          provider: "anthropic",
          context: 200000,
        },
        {
          id: "claude-3-haiku-20240307",
          name: "Claude 3 Haiku",
          provider: "anthropic",
          context: 200000,
        },
      ];
    }

    // Calculate availability status
    const status = {
      local: models.local.length > 0,
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
    };

    return new Response(
      JSON.stringify({
        models,
        status,
        recommended: {
          local: models.local.length > 0 ? models.local[0].id : null,
          openai: "gpt-3.5-turbo",
          anthropic: "claude-3-sonnet-20240229",
        },
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Models API error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "Failed to fetch models",
        models: { local: [], openai: [], anthropic: [] },
        status: { local: false, openai: false, anthropic: false },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
