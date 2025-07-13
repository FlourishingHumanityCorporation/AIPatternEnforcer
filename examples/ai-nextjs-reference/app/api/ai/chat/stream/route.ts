import { NextRequest } from "next/server";
import { aiService } from "@/lib/ai";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs"; // Required for streaming

export async function POST(req: NextRequest) {
  try {
    // Get user session (optional - remove if not using auth)
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    const {
      messages,
      model,
      preferLocal = true,
      fallbackToAPI = true
    } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response("Invalid messages format", { status: 400 });
    }

    // Create a TransformStream for SSE
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Function to write SSE data
    const writeSSE = (data: any) => {
      writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
    };

    // Start streaming in background
    (async () => {
      try {
        let totalTokens = 0;
        let responseContent = "";
        let actualModel = model;
        let provider = "LOCAL";

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
                  stream: true
                })
              }
            );

            if (response.ok && response.body) {
              const reader = response.body.getReader();
              const decoder = new TextDecoder();

              while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");

                for (const line of lines) {
                  if (line.trim()) {
                    try {
                      const data = JSON.parse(line);
                      if (data.message?.content) {
                        responseContent += data.message.content;
                        writeSSE({ content: data.message.content });
                      }
                    } catch (e) {
                      logger.error("Failed to parse Ollama response:", e);
                    }
                  }
                }
              }

              actualModel = model || "llama2";
              provider = "LOCAL";
            } else {
              throw new Error("Local model not available");
            }
          } catch (error) {
            logger.error("Local model error:", error);

            // Fallback to API if enabled
            if (!fallbackToAPI) {
              throw error;
            }

            // Use OpenAI as fallback
            if (process.env.OPENAI_API_KEY) {
              const openaiResponse = await fetch(
                "https://api.openai.com/v1/chat/completions",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
                  },
                  body: JSON.stringify({
                    model: model || "gpt-3.5-turbo",
                    messages,
                    stream: true
                  })
                }
              );

              if (openaiResponse.ok && openaiResponse.body) {
                const reader = openaiResponse.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;

                  const chunk = decoder.decode(value);
                  const lines = chunk.split("\n");

                  for (const line of lines) {
                    if (line.startsWith("data: ")) {
                      const data = line.slice(6);
                      if (data === "[DONE]") continue;

                      try {
                        const parsed = JSON.parse(data);
                        const content = parsed.choices?.[0]?.delta?.content;
                        if (content) {
                          responseContent += content;
                          writeSSE({ content });
                        }
                      } catch (e) {
                        logger.error("Failed to parse OpenAI response:", e);
                      }
                    }
                  }
                }

                actualModel = model || "gpt-3.5-turbo";
                provider = "OPENAI";
              }
            }
          }
        }

        // Send completion signal
        writeSSE({ done: true });
        writer.write(encoder.encode("data: [DONE]\n\n"));

        // Save to database if user is logged in
        if (userId && responseContent) {
          const promptText = messages.
          map((m: any) => `${m.role}: ${m.content}`).
          join("\n");

          await prisma.aIResponse.create({
            data: {
              prompt: promptText,
              promptHash: Buffer.from(promptText).
              toString("base64").
              slice(0, 32),
              response: responseContent,
              model: actualModel,
              provider: provider as any,
              promptTokens: Math.ceil(promptText.length / 4), // Rough estimate
              responseTokens: Math.ceil(responseContent.length / 4),
              totalTokens: Math.ceil(
                (promptText.length + responseContent.length) / 4
              ),
              latencyMs: 0, // Would need to track this properly
              userId
            }
          });
        }
      } catch (error) {
        logger.error("Streaming error:", error);
        writeSSE({ error: "Streaming failed" });
      } finally {
        writer.close();
      }
    })();

    // Return the stream as response
    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive"
      }
    });
  } catch (error) {
    logger.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}