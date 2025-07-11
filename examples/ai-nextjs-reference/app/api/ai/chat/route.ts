import { NextRequest } from "next/server";
import { aiService } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Get user session (optional - remove if not using auth)
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const {
      messages,
      model,
      preferLocal = true,
      fallbackToAPI = true,
    } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    let responseContent = "";
    let actualModel = model;
    let provider = "LOCAL";
    const startTime = Date.now();

    // Try local model first if preferred
    if (preferLocal) {
      try {
        const response = await fetch(
          `${process.env.OLLAMA_BASE_URL || "http://localhost:11434"}/api/chat`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              model: model || "llama2",
              messages,
              stream: false,
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          responseContent = data.message?.content || "";
          actualModel = model || "llama2";
          provider = "LOCAL";
        } else {
          throw new Error("Local model not available");
        }
      } catch (error) {
        console.error("Local model error:", error);

        // Fallback to API if enabled
        if (!fallbackToAPI) {
          return new Response(
            JSON.stringify({
              error: "Local model unavailable and fallback disabled",
            }),
            {
              status: 503,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        // Use OpenAI as fallback
        if (process.env.OPENAI_API_KEY) {
          try {
            const openaiResponse = await fetch(
              "https://api.openai.com/v1/chat/completions",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
                body: JSON.stringify({
                  model: model || "gpt-3.5-turbo",
                  messages,
                  stream: false,
                }),
              },
            );

            if (openaiResponse.ok) {
              const data = await openaiResponse.json();
              responseContent = data.choices?.[0]?.message?.content || "";
              actualModel = model || "gpt-3.5-turbo";
              provider = "OPENAI";
            } else {
              throw new Error("OpenAI API failed");
            }
          } catch (openaiError) {
            console.error("OpenAI fallback error:", openaiError);

            // Try Anthropic as final fallback
            if (process.env.ANTHROPIC_API_KEY) {
              try {
                const anthropicResponse = await fetch(
                  "https://api.anthropic.com/v1/messages",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "X-API-Key": process.env.ANTHROPIC_API_KEY,
                      "anthropic-version": "2023-06-01",
                    },
                    body: JSON.stringify({
                      model: model || "claude-3-sonnet-20240229",
                      max_tokens: 1024,
                      messages: messages.filter(
                        (m: any) => m.role !== "system",
                      ),
                      system: messages.find((m: any) => m.role === "system")
                        ?.content,
                    }),
                  },
                );

                if (anthropicResponse.ok) {
                  const data = await anthropicResponse.json();
                  responseContent = data.content?.[0]?.text || "";
                  actualModel = model || "claude-3-sonnet-20240229";
                  provider = "ANTHROPIC";
                } else {
                  throw new Error("Anthropic API failed");
                }
              } catch (anthropicError) {
                console.error("Anthropic fallback error:", anthropicError);
                throw new Error("All AI providers failed");
              }
            } else {
              throw new Error("OpenAI failed and no Anthropic key provided");
            }
          }
        } else {
          throw new Error("Local model failed and no OpenAI key provided");
        }
      }
    } else {
      // Direct API call without local preference
      if (process.env.OPENAI_API_KEY) {
        const openaiResponse = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
              model: model || "gpt-3.5-turbo",
              messages,
              stream: false,
            }),
          },
        );

        if (openaiResponse.ok) {
          const data = await openaiResponse.json();
          responseContent = data.choices?.[0]?.message?.content || "";
          actualModel = model || "gpt-3.5-turbo";
          provider = "OPENAI";
        } else {
          throw new Error("OpenAI API failed");
        }
      } else {
        throw new Error("No API keys configured");
      }
    }

    const endTime = Date.now();
    const latencyMs = endTime - startTime;

    // Save to database if user is logged in
    if (userId && responseContent) {
      const promptText = messages
        .map((m: any) => `${m.role}: ${m.content}`)
        .join("\n");

      try {
        await prisma.aIResponse.create({
          data: {
            prompt: promptText,
            promptHash: Buffer.from(promptText).toString("base64").slice(0, 32),
            response: responseContent,
            model: actualModel,
            provider: provider as any,
            promptTokens: Math.ceil(promptText.length / 4), // Rough estimate
            responseTokens: Math.ceil(responseContent.length / 4),
            totalTokens: Math.ceil(
              (promptText.length + responseContent.length) / 4,
            ),
            latencyMs,
            userId,
          },
        });
      } catch (dbError) {
        console.error("Database save error:", dbError);
        // Don't fail the request if database save fails
      }
    }

    return new Response(
      JSON.stringify({
        content: responseContent,
        model: actualModel,
        provider,
        latencyMs,
      }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
