import { NextRequest, NextResponse } from "next/server";
import { chat } from "@/lib/ai";
import { createLogger } from "@/lib/logger";
import { z } from "zod";

const logger = createLogger("api/chat");

// Request validation schema
const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system"]),
      content: z.string(),
    }),
  ),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
  stream: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = chatRequestSchema.parse(body);

    logger.info("Chat request", {
      model: validatedData.model,
      messageCount: validatedData.messages.length,
    });

    // Handle streaming response
    if (validatedData.stream) {
      // For now, we'll return a simple non-streaming response
      // Streaming implementation would require more complex setup
      logger.warn(
        "Streaming requested but not implemented, falling back to regular response",
      );
    }

    // Get chat completion
    const response = await chat(validatedData.messages, {
      model: validatedData.model,
      temperature: validatedData.temperature,
      maxTokens: validatedData.maxTokens,
      stream: false, // Force non-streaming for now
    });

    return NextResponse.json({
      success: true,
      data: {
        content: response,
        model: validatedData.model || "gpt-3.5-turbo",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error("Chat API error", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid request data",
            details: error.errors,
          },
        },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CHAT_ERROR",
            message: error.message,
          },
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: "UNKNOWN_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 },
    );
  }
}
