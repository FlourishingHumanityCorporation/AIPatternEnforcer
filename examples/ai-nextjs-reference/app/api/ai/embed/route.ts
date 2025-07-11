import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const { text, preferLocal = true } = await req.json();

    if (!text || typeof text !== "string") {
      return new Response(JSON.stringify({ error: "No text provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Validate text length (reasonable limit)
    if (text.length > 8000) {
      return new Response(
        JSON.stringify({ error: "Text too long (max 8000 characters)" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    let embeddings: number[] = [];
    let provider = "LOCAL";
    let model = "";

    // Try local embedding model first if preferred
    if (preferLocal) {
      try {
        const response = await fetch(
          `${process.env.OLLAMA_BASE_URL || "http://localhost:11434"}/api/embeddings`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "nomic-embed-text", // Common embedding model in Ollama
              prompt: text,
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          embeddings = data.embedding;
          provider = "LOCAL";
          model = "nomic-embed-text";
        } else {
          throw new Error("Local embedding model not available");
        }
      } catch (error) {
        console.error("Local embedding model error:", error);

        // Fallback to OpenAI embeddings
        if (process.env.OPENAI_API_KEY) {
          try {
            const openaiResponse = await fetch(
              "https://api.openai.com/v1/embeddings",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                  model: "text-embedding-3-small",
                  input: text,
                }),
              },
            );

            if (openaiResponse.ok) {
              const data = await openaiResponse.json();
              embeddings = data.data[0].embedding;
              provider = "OPENAI";
              model = "text-embedding-3-small";
            } else {
              throw new Error("OpenAI embeddings API failed");
            }
          } catch (openaiError) {
            console.error("OpenAI embeddings error:", openaiError);
            throw new Error("Embedding generation failed");
          }
        } else {
          throw new Error("No embedding API available");
        }
      }
    } else {
      // Use OpenAI embeddings directly
      if (process.env.OPENAI_API_KEY) {
        try {
          const openaiResponse = await fetch(
            "https://api.openai.com/v1/embeddings",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              },
              body: JSON.stringify({
                model: "text-embedding-3-small",
                input: text,
              }),
            },
          );

          if (openaiResponse.ok) {
            const data = await openaiResponse.json();
            embeddings = data.data[0].embedding;
            provider = "OPENAI";
            model = "text-embedding-3-small";
          } else {
            throw new Error("OpenAI embeddings API failed");
          }
        } catch (error) {
          console.error("OpenAI embeddings error:", error);
          throw new Error("Embedding generation failed");
        }
      } else {
        throw new Error("No OpenAI API key configured");
      }
    }

    return new Response(
      JSON.stringify({
        embeddings,
        model,
        provider,
        dimensions: embeddings.length,
        textLength: text.length,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Embed API error:", error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Embedding generation failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
